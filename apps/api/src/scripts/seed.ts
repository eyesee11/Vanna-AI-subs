import prisma from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

interface ExtractedInvoice {
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
          deliveryDate?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
          vendorAddress?: { value?: string };
          vendorTaxId?: { value?: string };
        };
      };
      payment?: {
        value?: {
          dueDate?: { value?: string };
          paymentTerms?: { value?: string };
        };
      };
      lineItems?: {
        value?: Array<{
          description?: { value?: string };
          quantity?: { value?: number };
          unitPrice?: { value?: number };
          totalAmount?: { value?: number };
        }>;
      };
      totals?: {
        value?: {
          subtotal?: { value?: number };
          taxAmount?: { value?: number };
          totalAmount?: { value?: number };
          currency?: { value?: string };
        };
      };
    };
  };
  status?: string;
}

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Read JSON file
    const jsonPath = path.join(
      __dirname,
      "../../../public/Analytics_Test_Data.json"
    );

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ File not found: ${jsonPath}`);
      console.log(
        "Please ensure Analytics_Test_Data.json exists in the public directory"
      );
      process.exit(1);
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const documents: ExtractedInvoice[] = Array.isArray(jsonData)
      ? jsonData
      : [];

    console.log(`📄 Found ${documents.length} documents to process`);

    // Clear existing data
    console.log("🧹 Cleaning existing data...");
    await prisma.payment.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.customer.deleteMany();

    // Track created vendors and customers to avoid duplicates
    const vendorMap = new Map<string, string>();
    let successCount = 0;
    let skipCount = 0;

    // Process documents
    for (const [index, doc] of documents.entries()) {
      try {
        const llmData = doc.extractedData?.llmData;
        if (!llmData) {
          skipCount++;
          continue;
        }

        const invoiceData = llmData.invoice?.value;
        const vendorData = llmData.vendor?.value;
        const paymentData = llmData.payment?.value;
        const totalsData = llmData.totals?.value;
        const lineItemsData = llmData.lineItems?.value || [];

        // Extract invoice number - make unique by adding document index
        const baseInvoiceNumber =
          invoiceData?.invoiceId?.value || `INV-${index + 1}`;
        const invoiceNumber = `${baseInvoiceNumber}-${index + 1}`;

        // Extract dates
        const invoiceDate = invoiceData?.invoiceDate?.value;
        const dueDate = paymentData?.dueDate?.value;

        if (!invoiceDate) {
          console.log(`⏭️  Skipping invoice ${index + 1}: No invoice date`);
          skipCount++;
          continue;
        }

        console.log(
          `Processing ${index + 1}/${documents.length}: ${invoiceNumber}`
        );

        // Create or get vendor
        const vendorName = vendorData?.vendorName?.value || "Unknown Vendor";
        let vendorId = vendorMap.get(vendorName);

        if (!vendorId) {
          const vendor = await prisma.vendor.create({
            data: {
              name: vendorName,
              address: vendorData?.vendorAddress?.value || null,
              taxId: vendorData?.vendorTaxId?.value || null,
            },
          });
          vendorId = vendor.id;
          vendorMap.set(vendor.name, vendor.id);
        }

        // Extract amounts
        const subtotal = totalsData?.subtotal?.value || 0;
        const taxAmount = totalsData?.taxAmount?.value || 0;
        const totalAmount =
          totalsData?.totalAmount?.value || subtotal + taxAmount;
        const currency = totalsData?.currency?.value || "EUR";

        // Create invoice
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            vendorId,
            customerId: null,
            invoiceDate: new Date(invoiceDate),
            dueDate: dueDate ? new Date(dueDate) : null,
            subtotal,
            taxAmount,
            totalAmount,
            status: doc.status === "processed" ? "paid" : "pending",
            currency,
            paymentTerms: paymentData?.paymentTerms?.value || null,
            category: null,
            description: null,
          },
        });

        // Create line items if available
        if (
          lineItemsData &&
          Array.isArray(lineItemsData) &&
          lineItemsData.length > 0
        ) {
          for (const item of lineItemsData) {
            if (item.description?.value) {
              await prisma.lineItem.create({
                data: {
                  invoiceId: invoice.id,
                  description: item.description.value,
                  quantity: item.quantity?.value || 1,
                  unitPrice: item.unitPrice?.value || 0,
                  amount: item.totalAmount?.value || 0,
                  taxRate: null,
                },
              });
            }
          }
        }

        successCount++;
      } catch (error) {
        console.error(`❌ Error processing document ${index + 1}:`, error);
        skipCount++;
      }
    }

    console.log(`\n✅ Seed completed!`);
    console.log(`📊 Successfully created: ${successCount} invoices`);
    console.log(`⏭️  Skipped: ${skipCount} documents`);
    console.log(`👥 Created: ${vendorMap.size} unique vendors`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

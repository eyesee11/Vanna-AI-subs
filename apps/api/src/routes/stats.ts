import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /stats - Returns overview statistics
router.get("/", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Spend YTD
    const totalSpendYTD = await prisma.invoice.aggregate({
      where: {
        invoiceDate: { gte: yearStart },
      },
      _sum: { totalAmount: true },
    });

    const lastYearSpend = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: new Date(now.getFullYear() - 1, 0, 1),
          lt: yearStart,
        },
      },
      _sum: { totalAmount: true },
    });

    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count();
    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lt: monthStart,
        },
      },
    });

    // Documents Uploaded This Month
    const documentsThisMonth = await prisma.invoice.count({
      where: {
        invoiceDate: { gte: monthStart },
      },
    });

    const documentsLastMonth = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lt: monthStart,
        },
      },
    });

    // Average Invoice Value
    const avgInvoice = await prisma.invoice.aggregate({
      _avg: { totalAmount: true },
    });

    const lastMonthAvg = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: lastMonthStart,
          lt: monthStart,
        },
      },
      _avg: { totalAmount: true },
    });

    // Calculate percentage changes
    const spendChange = lastYearSpend._sum.totalAmount
      ? (((totalSpendYTD._sum.totalAmount || 0) -
          lastYearSpend._sum.totalAmount) /
          lastYearSpend._sum.totalAmount) *
        100
      : 0;

    const invoiceChange = lastMonthInvoices
      ? ((totalInvoices - lastMonthInvoices) / lastMonthInvoices) * 100
      : 0;

    const documentsChange = documentsLastMonth
      ? ((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100
      : 0;

    const avgChange = lastMonthAvg._avg.totalAmount
      ? (((avgInvoice._avg.totalAmount || 0) - lastMonthAvg._avg.totalAmount) /
          lastMonthAvg._avg.totalAmount) *
        100
      : 0;

    res.json({
      totalSpend: {
        value: totalSpendYTD._sum.totalAmount || 0,
        change: spendChange,
        label: "YTD",
      },
      totalInvoices: {
        value: totalInvoices,
        change: invoiceChange,
      },
      documentsUploaded: {
        value: documentsThisMonth,
        change: documentsChange,
        label: "This Month",
      },
      averageInvoiceValue: {
        value: avgInvoice._avg.totalAmount || 0,
        change: avgChange,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;

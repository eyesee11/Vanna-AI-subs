import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /vendors/top10 - Returns top 10 vendors by spend
router.get("/top10", async (req: Request, res: Response) => {
  try {
    const topVendors = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
      take: 10,
    });

    const vendorsWithDetails = await Promise.all(
      topVendors.map(async (item) => {
        const vendor = await prisma.vendor.findUnique({
          where: { id: item.vendorId },
        });

        // Count invoices for this vendor
        const invoiceCount = await prisma.invoice.count({
          where: { vendorId: item.vendorId },
        });

        return {
          vendorName: vendor?.name || "Unknown",
          totalSpend: item._sum.totalAmount || 0,
          invoiceCount: invoiceCount,
        };
      })
    );

    res.json(vendorsWithDetails);
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

export default router;

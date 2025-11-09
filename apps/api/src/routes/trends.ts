import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /invoice-trends - Returns monthly invoice trends
router.get("/", async (req: Request, res: Response) => {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();
    const trends = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const invoiceCount = await prisma.invoice.count({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalSpend = await prisma.invoice.aggregate({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      trends.push({
        month: months[month],
        invoiceCount: invoiceCount,
        totalSpend: totalSpend._sum.totalAmount || 0,
      });
    }

    res.json(trends);
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /category-spend - Returns spend grouped by category
router.get("/", async (req: Request, res: Response) => {
  try {
    const categorySpend = await prisma.invoice.groupBy({
      by: ["category"],
      _sum: {
        totalAmount: true,
      },
      where: {
        category: {
          not: null,
        },
      },
    });

    const result = categorySpend.map((item: any) => ({
      name: item.category || "Uncategorized",
      value: item._sum.totalAmount || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export default router;

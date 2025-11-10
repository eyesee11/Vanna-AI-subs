import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /cash-outflow - Returns cash outflow forecast by due date ranges
router.get("/", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const ranges = [
      {
        label: "0-7 days",
        start: now,
        end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        label: "8-30 days",
        start: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        label: "31-60 days",
        start: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        label: "60+ days",
        start: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        end: null,
      },
    ];

    const cashflowData = await Promise.all(
      ranges.map(async (range: any) => {
        const where: any = {
          status: { in: ["pending", "overdue"] },
          dueDate: {
            gte: range.start,
          },
        };

        if (range.end) {
          where.dueDate.lte = range.end;
        }

        const result = await prisma.invoice.aggregate({
          where,
          _sum: {
            totalAmount: true,
          },
        });

        return {
          month: range.label,
          outflow: result._sum.totalAmount || 0,
        };
      })
    );

    res.json(cashflowData);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow forecast" });
  }
});

export default router;

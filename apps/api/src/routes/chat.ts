import { Router, Request, Response } from "express";

const router = Router();

// POST /chat-with-data - Proxy to Vanna AI
router.post("/", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const vannaUrl = process.env.VANNA_API_BASE_URL || "http://localhost:8000";

    // Forward request to Vanna AI
    const response = await fetch(`${vannaUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: query }),
    });

    if (!response.ok) {
      throw new Error(`Vanna AI responded with status: ${response.status}`);
    }

    const data = (await response.json()) as {
      sql?: string;
      results?: any[];
      explanation?: string;
    };

    res.json({
      query: query,
      sql: data.sql || "",
      results: data.results || [],
      explanation: data.explanation || "",
    });
  } catch (error) {
    console.error("Error querying Vanna AI:", error);
    res.status(500).json({
      error: "Failed to process query",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

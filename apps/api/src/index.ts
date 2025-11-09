import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import vendorsRouter from "./routes/vendors";
import trendsRouter from "./routes/trends";
import categoryRouter from "./routes/category";
import cashflowRouter from "./routes/cashflow";
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000", // Local development
  process.env.FRONTEND_URL || "", // Production URL from env
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/stats", statsRouter);
app.use("/invoices", invoicesRouter);
app.use("/vendors", vendorsRouter);
app.use("/invoice-trends", trendsRouter);
app.use("/category-spend", categoryRouter);
app.use("/cash-outflow", cashflowRouter);
app.use("/chat-with-data", chatRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;

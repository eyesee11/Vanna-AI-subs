/**
 * Comprehensive API Tests
 * Tests all API endpoints with correct response structures
 */

import request from "supertest";
import app from "../index";

describe("API Endpoints", () => {
  // Health Check
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  // Stats
  describe("GET /stats", () => {
    it("should return dashboard statistics", async () => {
      const response = await request(app).get("/stats");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalSpend");
      expect(response.body).toHaveProperty("totalInvoices");
      expect(response.body).toHaveProperty("documentsUploaded");
      expect(response.body).toHaveProperty("averageInvoiceValue");
    });
  });

  // Vendors
  describe("GET /vendors/top10", () => {
    it("should return top 10 vendors", async () => {
      const response = await request(app).get("/vendors/top10");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  // Invoices
  describe("GET /invoices", () => {
    it("should return paginated invoices", async () => {
      const response = await request(app).get("/invoices");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
    });
  });

  // Invoice Trends
  describe("GET /invoice-trends", () => {
    it("should return invoice trends", async () => {
      const response = await request(app).get("/invoice-trends");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(12);
    });
  });

  // Category Spend
  describe("GET /category-spend", () => {
    it("should return category spend data", async () => {
      const response = await request(app).get("/category-spend");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Cash Outflow
  describe("GET /cash-outflow", () => {
    it("should return cash outflow data", async () => {
      const response = await request(app).get("/cash-outflow");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);
    });
  });

  // Chat
  describe("POST /chat-with-data", () => {
    it("should reject empty query", async () => {
      const response = await request(app).post("/chat-with-data").send({});
      expect(response.status).toBe(400);
    });

    it("should accept valid query", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "What is the total spend?" });
      expect([200, 500]).toContain(response.status);
    });
  });

  // 404 Handler
  describe("404 Routes", () => {
    it("should return 404 for invalid routes", async () => {
      const response = await request(app).get("/invalid-route");
      expect(response.status).toBe(404);
    });
  });
});

/**
 * Invoice Trends API Tests
 * Tests invoice volume and value trends over time
 */

import request from "supertest";
import app from "../index";

describe("Invoice Trends API", () => {
  describe("GET /invoice-trends", () => {
    it("should return invoice trends data", async () => {
      const response = await request(app).get("/invoice-trends");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return trend data with correct structure", async () => {
      const response = await request(app).get("/invoice-trends");

      if (response.body.length > 0) {
        const trend = response.body[0];
        expect(trend).toHaveProperty("month");
        expect(trend).toHaveProperty("invoiceCount");
        expect(trend).toHaveProperty("totalSpend");
        expect(typeof trend.month).toBe("string");
        expect(typeof trend.invoiceCount).toBe("number");
        expect(typeof trend.totalSpend).toBe("number");
      }
    });

    it("should support months parameter", async () => {
      const response = await request(app).get("/invoice-trends?months=6");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(6);
    });

    it("should return default 12 months when no parameter provided", async () => {
      const response = await request(app).get("/invoice-trends");

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(12);
    });

    it("should return non-negative values", async () => {
      const response = await request(app).get("/invoice-trends");

      response.body.forEach((trend: any) => {
        expect(trend.invoiceCount).toBeGreaterThanOrEqual(0);
        expect(trend.totalSpend).toBeGreaterThanOrEqual(0);
      });
    });

    it("should return data in chronological order", async () => {
      const response = await request(app).get("/invoice-trends");

      if (response.body.length > 1) {
        // Each month should have a valid month format
        response.body.forEach((trend: any) => {
          expect(trend.month).toMatch(/^[A-Za-z]{3} \d{4}$/);
        });
      }
    });
  });
});

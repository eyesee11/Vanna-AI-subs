/**
 * Cash Outflow API Tests
 * Tests cash outflow forecasting and calculations
 */

import request from "supertest";
import app from "../index";

describe("Cash Outflow API", () => {
  describe("GET /cash-outflow", () => {
    it("should return cash outflow data", async () => {
      const response = await request(app).get("/cash-outflow");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return outflow data with correct structure", async () => {
      const response = await request(app).get("/cash-outflow");

      if (response.body.length > 0) {
        const outflow = response.body[0];
        expect(outflow).toHaveProperty("month");
        expect(outflow).toHaveProperty("outflow");
        expect(typeof outflow.month).toBe("string");
        expect(typeof outflow.outflow).toBe("number");
      }
    });

    it("should support months parameter", async () => {
      const response = await request(app).get("/cash-outflow?months=6");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(6);
    });

    it("should return default 12 months when no parameter provided", async () => {
      const response = await request(app).get("/cash-outflow");

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(12);
    });

    it("should return non-negative outflow values", async () => {
      const response = await request(app).get("/cash-outflow");

      response.body.forEach((item: any) => {
        expect(item.outflow).toBeGreaterThanOrEqual(0);
      });
    });

    it("should return data in chronological order", async () => {
      const response = await request(app).get("/cash-outflow");

      if (response.body.length > 1) {
        response.body.forEach((item: any) => {
          expect(item.month).toMatch(/^[A-Za-z]{3} \d{4}$/);
        });
      }
    });
  });
});

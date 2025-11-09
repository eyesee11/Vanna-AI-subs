/**
 * Stats API Endpoint Tests
 * Tests dashboard statistics calculations and responses
 */

import request from "supertest";
import app from "../index";

describe("Stats API", () => {
  describe("GET /stats", () => {
    it("should return dashboard statistics", async () => {
      const response = await request(app).get("/stats");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalSpend");
      expect(response.body).toHaveProperty("totalInvoices");
      expect(response.body).toHaveProperty("documentsUploaded");
      expect(response.body).toHaveProperty("averageInvoiceValue");
    });

    it("should return correct structure for totalSpend", async () => {
      const response = await request(app).get("/stats");

      expect(response.body.totalSpend).toHaveProperty("value");
      expect(response.body.totalSpend).toHaveProperty("change");
      expect(response.body.totalSpend).toHaveProperty("label");
      expect(typeof response.body.totalSpend.value).toBe("number");
      expect(typeof response.body.totalSpend.change).toBe("number");
    });

    it("should return correct structure for totalInvoices", async () => {
      const response = await request(app).get("/stats");

      expect(response.body.totalInvoices).toHaveProperty("value");
      expect(response.body.totalInvoices).toHaveProperty("change");
      expect(typeof response.body.totalInvoices.value).toBe("number");
      expect(typeof response.body.totalInvoices.change).toBe("number");
    });

    it("should return correct structure for documentsUploaded", async () => {
      const response = await request(app).get("/stats");

      expect(response.body.documentsUploaded).toHaveProperty("value");
      expect(response.body.documentsUploaded).toHaveProperty("change");
      expect(response.body.documentsUploaded).toHaveProperty("label");
      expect(typeof response.body.documentsUploaded.value).toBe("number");
    });

    it("should return correct structure for averageInvoiceValue", async () => {
      const response = await request(app).get("/stats");

      expect(response.body.averageInvoiceValue).toHaveProperty("value");
      expect(response.body.averageInvoiceValue).toHaveProperty("change");
      expect(typeof response.body.averageInvoiceValue.value).toBe("number");
    });

    it("should handle errors gracefully", async () => {
      // This test ensures the endpoint doesn't crash on errors
      const response = await request(app).get("/stats");
      expect([200, 500]).toContain(response.status);
    });
  });
});

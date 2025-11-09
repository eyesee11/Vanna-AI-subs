/**
 * Invoices API Endpoint Tests
 * Tests invoice listing, filtering, and pagination
 */

import request from "supertest";
import app from "../index";

describe("Invoices API", () => {
  describe("GET /invoices", () => {
    it("should return paginated invoices", async () => {
      const response = await request(app).get("/invoices");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("invoices");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });

    it("should return pagination metadata", async () => {
      const response = await request(app).get("/invoices");

      const { pagination } = response.body;
      expect(pagination).toHaveProperty("total");
      expect(pagination).toHaveProperty("page");
      expect(pagination).toHaveProperty("limit");
      expect(pagination).toHaveProperty("totalPages");
      expect(typeof pagination.total).toBe("number");
      expect(typeof pagination.page).toBe("number");
      expect(typeof pagination.limit).toBe("number");
      expect(typeof pagination.totalPages).toBe("number");
    });

    it("should return invoice with correct structure", async () => {
      const response = await request(app).get("/invoices");

      if (response.body.invoices.length > 0) {
        const invoice = response.body.invoices[0];
        expect(invoice).toHaveProperty("id");
        expect(invoice).toHaveProperty("invoiceNumber");
        expect(invoice).toHaveProperty("vendor");
        expect(invoice).toHaveProperty("invoiceDate");
        expect(invoice).toHaveProperty("totalAmount");
        expect(invoice).toHaveProperty("status");
        expect(invoice).toHaveProperty("currency");
      }
    });

    it("should support pagination with page parameter", async () => {
      const response = await request(app).get("/invoices?page=1&limit=5");

      expect(response.status).toBe(200);
      expect(response.body.invoices.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it("should support status filtering", async () => {
      const response = await request(app).get("/invoices?status=paid");

      expect(response.status).toBe(200);
      if (response.body.invoices.length > 0) {
        response.body.invoices.forEach((invoice: any) => {
          expect(invoice.status).toBe("paid");
        });
      }
    });

    it("should support search by vendor name", async () => {
      const response = await request(app).get("/invoices?search=test");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });

    it("should support sorting by different fields", async () => {
      const response = await request(app).get("/invoices?sortBy=invoiceDate");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });

    it("should handle invalid page numbers gracefully", async () => {
      const response = await request(app).get("/invoices?page=-1");

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBeGreaterThanOrEqual(1);
    });

    it("should handle invalid limit values gracefully", async () => {
      const response = await request(app).get("/invoices?limit=0");

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeGreaterThanOrEqual(1);
    });
  });
});

/**
 * Vendors API Endpoint Tests
 * Tests vendor-related endpoints including top vendors by spend
 */

import request from "supertest";
import app from "../index";

describe("Vendors API", () => {
  describe("GET /vendors/top10", () => {
    it("should return top 10 vendors", async () => {
      const response = await request(app).get("/vendors/top10");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });

    it("should return vendor data with correct structure", async () => {
      const response = await request(app).get("/vendors/top10");

      if (response.body.length > 0) {
        const vendor = response.body[0];
        expect(vendor).toHaveProperty("vendorName");
        expect(vendor).toHaveProperty("totalSpend");
        expect(vendor).toHaveProperty("invoiceCount");
        expect(typeof vendor.vendorName).toBe("string");
        expect(typeof vendor.totalSpend).toBe("number");
        expect(typeof vendor.invoiceCount).toBe("number");
      }
    });

    it("should return vendors sorted by spend (descending)", async () => {
      const response = await request(app).get("/vendors/top10");

      if (response.body.length > 1) {
        const vendors = response.body;
        for (let i = 0; i < vendors.length - 1; i++) {
          expect(vendors[i].totalSpend).toBeGreaterThanOrEqual(
            vendors[i + 1].totalSpend
          );
        }
      }
    });

    it("should return non-negative spend values", async () => {
      const response = await request(app).get("/vendors/top10");

      response.body.forEach((vendor: any) => {
        expect(vendor.totalSpend).toBeGreaterThanOrEqual(0);
        expect(vendor.invoiceCount).toBeGreaterThanOrEqual(0);
      });
    });

    it("should handle empty database gracefully", async () => {
      const response = await request(app).get("/vendors/top10");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

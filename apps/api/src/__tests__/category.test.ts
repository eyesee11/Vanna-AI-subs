/**
 * Category Spend API Tests
 * Tests spend distribution across categories
 */

import request from "supertest";
import app from "../index";

describe("Category Spend API", () => {
  describe("GET /category-spend", () => {
    it("should return category spend data", async () => {
      const response = await request(app).get("/category-spend");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return category data with correct structure", async () => {
      const response = await request(app).get("/category-spend");

      if (response.body.length > 0) {
        const category = response.body[0];
        expect(category).toHaveProperty("category");
        expect(category).toHaveProperty("totalSpend");
        expect(category).toHaveProperty("percentage");
        expect(typeof category.category).toBe("string");
        expect(typeof category.totalSpend).toBe("number");
        expect(typeof category.percentage).toBe("number");
      }
    });

    it("should return non-negative spend values", async () => {
      const response = await request(app).get("/category-spend");

      response.body.forEach((category: any) => {
        expect(category.totalSpend).toBeGreaterThanOrEqual(0);
        expect(category.percentage).toBeGreaterThanOrEqual(0);
        expect(category.percentage).toBeLessThanOrEqual(100);
      });
    });

    it("should have percentages sum to approximately 100", async () => {
      const response = await request(app).get("/category-spend");

      if (response.body.length > 0) {
        const totalPercentage = response.body.reduce(
          (sum: number, cat: any) => sum + cat.percentage,
          0
        );
        expect(totalPercentage).toBeCloseTo(100, 1);
      }
    });

    it("should return categories sorted by spend", async () => {
      const response = await request(app).get("/category-spend");

      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].totalSpend).toBeGreaterThanOrEqual(
            response.body[i + 1].totalSpend
          );
        }
      }
    });
  });
});

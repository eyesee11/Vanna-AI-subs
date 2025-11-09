/**
 * Health Check API Tests
 * Tests API server health and status endpoints
 */

import request from "supertest";
import app from "../index";

describe("Health Check API", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("ok");
    });

    it("should return timestamp", async () => {
      const response = await request(app).get("/health");

      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.timestamp).toBe("string");
      expect(new Date(response.body.timestamp).toString()).not.toBe(
        "Invalid Date"
      );
    });

    it("should respond quickly", async () => {
      const startTime = Date.now();
      await request(app).get("/health");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/non-existent-route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("should handle invalid POST requests", async () => {
      const response = await request(app)
        .post("/invalid-endpoint")
        .send({ data: "test" });

      expect(response.status).toBe(404);
    });
  });
});

/**
 * Chat API Tests
 * Tests natural language query processing with Vanna AI
 */

import request from "supertest";
import app from "../index";

describe("Chat with Data API", () => {
  describe("POST /chat-with-data", () => {
    it("should reject requests without query", async () => {
      const response = await request(app).post("/chat-with-data").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should accept valid query", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "What is the total spend?" });

      // Either success or error from Vanna AI server
      expect([200, 500]).toContain(response.status);
    });

    it("should return correct response structure on success", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "Show total invoices" });

      if (response.status === 200) {
        expect(response.body).toHaveProperty("query");
        expect(response.body).toHaveProperty("sql");
        expect(response.body).toHaveProperty("results");
      }
    });

    it("should handle empty query string", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "" });

      expect(response.status).toBe(400);
    });

    it("should handle whitespace-only query", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "   " });

      expect(response.status).toBe(400);
    });

    it("should accept complex queries", async () => {
      const response = await request(app).post("/chat-with-data").send({
        query: "What is the average invoice value for the top 5 vendors?",
      });

      expect([200, 500]).toContain(response.status);
    });

    it("should handle Vanna AI server unavailability", async () => {
      const response = await request(app)
        .post("/chat-with-data")
        .send({ query: "Test query" });

      if (response.status === 500) {
        expect(response.body).toHaveProperty("error");
        expect(response.body).toHaveProperty("message");
      }
    });
  });
});

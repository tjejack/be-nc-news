const request = require("supertest");
const db = require("../db/connection.js");
const data = require("../db/data/test-data/index.js");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");

afterAll(() => {
  return db.end();
});
beforeEach(() => {
  return seed(data);
});

describe("app", () => {
  describe("/api", () => {
    describe("invalid endpoint", () => {
      test("status code 404", () => {
        return request(app).get("/api/nonsense").expect(404);
      });
      test("404: returns message endpoint not found", () => {
        return request(app).get("/api/nonsense").then(({body})=> {
            expect(body.msg).toBe('Endpoint Not Found')
        });
      });
    });
    describe("GET /topics", () => {
      test("status code 200", () => {
        return request(app).get("/api/topics").expect(200);
      });
      test("200: returns an object containing an array", () => {
        return request(app)
          .get("/api/topics")
          .then(({ body }) => {
            expect(typeof body).toBe("object");
            expect(Array.isArray(body)).toBe(false);
            expect(Array.isArray(body.topics)).toBe(true);
          });
      });
      test("200: returns the array of topics, each with slug and description properties", () => {
        return request(app)
          .get("/api/topics")
          .then(({ body }) => {
            body.topics.forEach((topic) => {
              expect(topic.hasOwnProperty("slug")).toBe(true);
              expect(topic.hasOwnProperty("description")).toBe(true);
            });
          });
      });
    });
  });
});

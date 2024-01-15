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
      test("404: returns message endpoint not found", () => {
        return request(app)
          .get("/api/nonsense")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Endpoint Not Found");
          });
      });
    });
    describe("GET /api", () => {
      test("200: returns an object containing a description of all available endpoints", () => {
        return request(app)
          .get("/api")
          .then(({ body }) => {
            for (const key in body.endpoints) {
              expect(body.endpoints[key].hasOwnProperty("description")).toBe(
                true
              );
              expect(body.endpoints[key].hasOwnProperty("queries")).toBe(true);
              expect(
                body.endpoints[key].hasOwnProperty("exampleResponse")
              ).toBe(true);
            }
          });
      });
    });
    describe("GET /topics", () => {
      test("200: returns an object containing an array", () => {
        return request(app)
          .get("/api/topics")
          .expect(200)
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
            expect(body.topics.length).toBeGreaterThan(0);
            body.topics.forEach((topic) => {
              expect(topic.hasOwnProperty("slug")).toBe(true);
              expect(topic.hasOwnProperty("description")).toBe(true);
            });
          });
      });
    });
    describe("/articles", () => {
      describe("GET /articles/:article_Id", () => {
        test("200: returns an object with key 'article' containing an object", () => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
              expect(typeof body).toBe("object");
              expect(Array.isArray(body)).toBe(false);
              expect(typeof body.article).toBe("object");
              expect(Array.isArray(body.article)).toBe(false);
            });
        });
        test("200: if exists, returns the correct article specified by id", () => {
          return request(app)
            .get("/api/articles/1")
            .then(({ body }) => {
              const expectedOutput = {
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              };
              expect(body.article).toMatchObject(expectedOutput);
              expect(body.article.hasOwnProperty("created_at")).toBe(true);
            });
        });
        test("404: valid id number but no matching article", () => {
          return request(app)
            .get("/api/articles/666")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toBe("Not Found");
            });
        });
        test("400: invalid id data type", () => {
          return request(app)
            .get("/api/articles/NotAnId")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("Bad Request");
            });
        });
      });
    });
  });
});

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
    describe("GET /api", () => {
      test("status code 200", () => {
        return request(app).get("/api").expect(200);
      });
      test("200: returns an object containing an object", () => {
        return request(app)
          .get("/api")
          .then(({ body }) => {
            expect(typeof body).toBe("object");
            expect(Array.isArray(body)).toBe(false);
            expect(typeof body.endpoints).toBe("object");
            expect(Array.isArray(body.endpoints)).toBe(false);
          });
      });
      test("200: returns an object containing a description of all available endpoints", () => {
        return request(app)
          .get("/api")
          .then(({ body }) => {
            expect(body.endpoints).toMatchObject({
              "GET /api": {
                "description": "serves up a json representation of all the available endpoints of the api"
              },
              "GET /api/topics": {
                "description": "serves an array of all topics",
                "queries": [],
                "exampleResponse": {
                  "topics": [{ "slug": "football", "description": "Footie!" }]
                }
              },
              "GET /api/articles": {
                "description": "serves an array of all articles",
                "queries": ["author", "topic", "sort_by", "order"],
                "exampleResponse": {
                  "articles": [
                    {
                      "title": "Seafood substitutions are increasing",
                      "topic": "cooking",
                      "author": "weegembump",
                      "body": "Text from the article..",
                      "created_at": "2018-05-30T15:59:13.341Z",
                      "votes": 0,
                      "comment_count": 6
                    }
                  ]
                }
              }
            }
            );
            for(const key in body.endpoints){
              expect(body.endpoints[key].hasOwnProperty('description')).toBe(true)
              expect(body.endpoints[key].hasOwnProperty('queries')).toBe(true)
              expect(body.endpoints[key].hasOwnProperty('exampleResponse')).toBe(true)
            }
          });
      });
    })
    describe("invalid endpoint", () => {
      test("status code 404", () => {
        return request(app).get("/api/nonsense").expect(404);
      });
      test("404: returns message endpoint not found", () => {
        return request(app)
          .get("/api/nonsense")
          .then(({ body }) => {
            expect(body.msg).toBe("Endpoint Not Found");
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

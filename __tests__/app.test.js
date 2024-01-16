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
      describe("GET /articles", () => {
        test("200: returns an object containing an array", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
              expect(Array.isArray(body.articles)).toBe(true);
            });
        });
        test("200: returns the array of articles with all standard article properties", () => {
          return request(app)
            .get("/api/articles")
            .then(({ body }) => {
              expect(body.articles.length).toBeGreaterThan(0);
              body.articles.forEach((article) => {
                expect(article.hasOwnProperty("author")).toBe(true);
                expect(article.hasOwnProperty("title")).toBe(true);
                expect(article.hasOwnProperty("article_id")).toBe(true);
                expect(article.hasOwnProperty("topic")).toBe(true);
                expect(article.hasOwnProperty("created_at")).toBe(true);
                expect(article.hasOwnProperty("votes")).toBe(true);
                expect(article.hasOwnProperty("article_img_url")).toBe(true);
              });
            });
        });
        test("200: articles have comment_count property", () => {
          return request(app)
            .get("/api/articles")
            .then(({ body }) => {
              body.articles.forEach((article) => {
                expect(article.hasOwnProperty("comment_count")).toBe(true);
              });
            });
        });
        test("200: articles are sorted by date in descending order", () => {
          return request(app)
            .get("/api/articles")
            .then(({ body }) => {
              expect(body.articles).toBeSortedBy("created_at", {
                descending: true,
              });
            });
        });
        test("200: articles should not have a body property", () => {
          return request(app)
            .get("/api/articles")
            .then(({ body }) => {
              body.articles.forEach((article) => {
                expect(article.hasOwnProperty("body")).toBe(false);
              });
            });
        });
      });
      describe("GET /articles/:article_Id", () => {
        test("200: returns an object with key 'article' containing an object", () => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
              expect(typeof body).toBe("object");
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
              expect(body.msg).toBe("Article Not Found");
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
      describe("GET /articles/:article_id/comments", () =>{
        test("200: returns an object containing an array", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(Array.isArray(body.comments)).toBe(true);
            });
        });
        test("200: returns the array of comments for the correct article with all standard comment properties", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .then(({ body }) => {
              expect(body.comments.length).toBeGreaterThan(0);
              body.comments.forEach((comment) => {
                expect(comment.hasOwnProperty("comment_id")).toBe(true);
                expect(comment.hasOwnProperty("votes")).toBe(true);
                expect(comment.hasOwnProperty("created_at")).toBe(true);
                expect(comment.hasOwnProperty("author")).toBe(true);
                expect(comment.hasOwnProperty("body")).toBe(true);
                expect(comment.hasOwnProperty("article_id")).toBe(true);
              });
            });
        });
        test("200: comments are sorted by date in descending order", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .then(({ body }) => {
              expect(body.comments).toBeSortedBy("created_at", {
                descending: true,
              });
            });
        });
        test("200: returns empty array when no comments for given article", () => {
          return request(app)
            .get("/api/articles/7/comments")
            .then(({ body }) => {
              expect(body.comments).toEqual([]);
            });
        });
        test("400: returns error bad request when invalid article_id is passed", () => {
          return request(app)
            .get("/api/articles/notAnArticle/comments")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual('Bad Request');
            });
        });
        test("404: returns not found when valid id number but no article exists", () => {
          return request(app)
            .get("/api/articles/25/comments")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual('Article Not Found');
            });
        });
      })
    });
  });
});

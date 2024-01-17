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

              expect(body.endpoints[key].hasOwnProperty("body")).toBe(true);
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
                expect(typeof article.comment_count).toBe("number");
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
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              };
              expect(body.article).toEqual(expectedOutput);
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
      describe("GET /articles/:article_id/comments", () => {
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
              expect(body.comments.length).toBe(11);
              body.comments.forEach((comment) => {
                expect(comment.hasOwnProperty("comment_id")).toBe(true);
                expect(comment.hasOwnProperty("votes")).toBe(true);
                expect(comment.hasOwnProperty("created_at")).toBe(true);
                expect(comment.hasOwnProperty("author")).toBe(true);
                expect(comment.hasOwnProperty("body")).toBe(true);
                expect(comment.article_id).toBe(1);
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
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("404: returns not found when valid id number but no article exists", () => {
          return request(app)
            .get("/api/articles/25/comments")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Article Not Found");
            });
        });
      });
      describe("POST /articles/:article_id/comments", () => {
        test("201: returns an object", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: "icellusedkars",
          };
          return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
              expect(typeof body.comment).toBe("object");
              expect(Array.isArray(body.comment)).toBe(false);
            });
        });
        test("201: creates a new comment and responds with the new comment", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: "icellusedkars",
          };
          return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
              expect(body.comment.hasOwnProperty("comment_id")).toBe(true);
              expect(body.comment.body).toBe("Wow! So cool!");
              expect(body.comment.votes).toBe(0);
              expect(body.comment.author).toBe("icellusedkars");
              expect(body.comment.article_id).toBe(1);
              expect(body.comment.hasOwnProperty("created_at")).toBe(true);
            });
        });
        test("400: returns error bad request when invalid article_id is passed", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: "icellusedkars",
          };
          return request(app)
            .post("/api/articles/Potato/comments")
            .send(newComment)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("404: returns not found when valid id number but no article exists", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: "icellusedkars",
          };
          return request(app)
            .post("/api/articles/5468435/comments")
            .send(newComment)
            .then(({ body }) => {
              expect(body.msg).toEqual("Article Not Found");
            });
        });
        test("400: returns bad request when missing information", () => {
          const newComment = {
            body: "Wow! So cool!",
          };
          return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request - Missing Properties");
            });
        });
        test("400: returns bad request when comment properties are incorrect data type", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: 548613,
          };
          return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request - Missing Properties");
            });
        });
        test("400: returns bad request when comment username does not exist", () => {
          const newComment = {
            body: "Wow! So cool!",
            username: "my_name_jeff",
          };
          return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request - No Such User");
            });
        });
      });
      describe("PATCH /articles/:article_id", () => {
        test("200: returns the article with updated votes value", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body }) => {
              expect(body.article).toEqual({
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 101,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              });
            });
        });
        test("200: returns the article with updated votes value when votes are negative", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: -10 })
            .expect(200)
            .then(({ body }) => {
              expect(body.article).toEqual({
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 90,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              });
            });
        });
        test("404: article valid id but does not exist", () => {
          return request(app)
            .patch("/api/articles/1001")
            .send({ inc_votes: -10 })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Article Not Found");
            });
        });
        test("400: article invalid id", () => {
          return request(app)
            .patch("/api/articles/DROP TABLE users")
            .send({ inc_votes: -10 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("400: no inc_votes passed", () => {
          return request(app)
            .patch("/api/articles/DROP TABLE users")
            .send({ updatedVotes: -10 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("400: inc_votes invalid data type", () => {
          return request(app)
            .patch("/api/articles/DROP TABLE users")
            .send({ inc_votes: "add ten to votes" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
      });
    });
    describe("/comments", () => {
      describe("DELETE /comments/:comment_id", () => {
        test("204: comment deleted", () => {
          return request(app)
            .delete("/api/comments/1")
            .expect(204)
        })
        test("404: comment id valid but does not exist", () => {
          return request(app)
            .delete("/api/comments/65468465")
            .expect(404).then(({body})=>{
              expect(body.msg).toEqual('Comment Not Found')
            })
        })
        test("400: comment id invalid", () => {
          return request(app)
            .delete("/api/comments/thisisnotacomment")
            .expect(400).then(({body})=>{
              expect(body.msg).toEqual('Bad Request')
            })
        })
      });
    describe("/users", () => {
      describe("GET /api/users", () => {
        test("200: returns an array of users", () => {
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              expect(body.users.length).toBeGreaterThan(0);
              body.users.forEach((user) => {
                expect(user.hasOwnProperty("username")).toBe(true);
                expect(user.hasOwnProperty("name")).toBe(true);
                expect(user.hasOwnProperty("avatar_url")).toBe(true);
              });
            });
        });
      });
    });
    
    });
  });
});

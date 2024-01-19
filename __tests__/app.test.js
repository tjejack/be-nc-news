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
            for (const key in body.endpoints.api) {
              for (const subkey in body.endpoints.api) {
                expect(
                  body.endpoints.api[key][subkey].hasOwnProperty("description")
                ).toBe(true);
                expect(
                  body.endpoints.api[key][subkey].hasOwnProperty("queries")
                ).toBe(true);

                expect(
                  body.endpoints.api[key][subkey].hasOwnProperty("body")
                ).toBe(true);
                expect(
                  body.endpoints.api[key][subkey].hasOwnProperty(
                    "exampleResponse"
                  )
                ).toBe(true);
              }
            }
          });
      });
    });
    describe("/topics", () => {
      describe("GET /api/topics", () => {
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
              expect(body.topics.length).toEqual(3);
              body.topics.forEach((topic) => {
                expect(topic.hasOwnProperty("slug")).toBe(true);
                expect(topic.hasOwnProperty("description")).toBe(true);
              });
            });
        });
      });
    });
    describe("/articles", () => {
      describe("GET /api/articles", () => {
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
              expect(body.articles.length).toEqual(13);
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
        test("200: returns articles of a given topic", () => {
          return request(app)
            .get("/api/articles?topic=mitch")
            .then(({ body }) => {
              expect(body.articles.length).toEqual(12);
              body.articles.forEach((article) => {
                expect(article.hasOwnProperty("title")).toEqual(true);
                expect(article.topic).toEqual("mitch");
                expect(article.hasOwnProperty("author")).toEqual(true);
                expect(article.hasOwnProperty("created_at")).toEqual(true);
                expect(article.hasOwnProperty("votes")).toEqual(true);
                expect(article.hasOwnProperty("article_img_url")).toEqual(true);
                expect(article.hasOwnProperty("article_id")).toEqual(true);
              });
            });
        });
        test("200: returns empty array when valid topic but no articles", () => {
          return request(app)
            .get("/api/articles?topic=paper")
            .then(({ body }) => {
              expect(body.articles.length).toEqual(0);
            });
        });
        test("404: non-existent topic", () => {
          return request(app)
            .get("/api/articles?topic=magic")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Not Found");
            });
        });
        test("200: returns articles sorted by any given column", () => {
          return request(app)
            .get("/api/articles?sort_by=votes")
            .then(({ body }) => {
              expect(body.articles.length).toEqual(13);
              expect(body.articles).toBeSortedBy("votes", { descending: true });
            });
        });
        test("404: no such column", () => {
          return request(app)
            .get("/api/articles?sort_by=fakeColumn")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Not Found");
            });
        });
        test("200: returns articles sorted in any given order", () => {
          return request(app)
            .get("/api/articles?order=ASC")
            .then(({ body }) => {
              expect(body.articles.length).toEqual(13);
              expect(body.articles).toBeSortedBy("created_at");
            });
        });
        test("404: no such order", () => {
          return request(app)
            .get("/api/articles?order=54684652")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Not Found");
            });
        });
        test("400: invalid query", () => {
          return (
            request(app)
              .get("/api/articles?notAQuery=bad")
              // .expect(400)
              .then(({ body }) => {
                expect(body.msg).toEqual("Bad Request");
              })
          );
        });
        test("200: takes multiple queries at one time", () => {
          return request(app)
            .get("/api/articles?topic=mitch&sort_by=title&order=ASC")
            .then(({ body }) => {
              expect(body.articles.length).toEqual(12);
              expect(body.articles).toBeSortedBy("title");
            });
        });
      });
      describe("GET /api/articles/:article_Id", () => {
        test("200: returns an object with key 'article' containing an object", () => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
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
              expect(body.article).toMatchObject(expectedOutput);
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
        test("200: returned object should also have a comment_count property", () => {
          return request(app)
            .get("/api/articles/1")
            .then(({ body }) => {
              expect(body.article.comment_count).toEqual(11);
            });
        });
        test("200: returns comment_count 0 when no comments for given article", () => {
          return request(app)
            .get("/api/articles/2")
            .then(({ body }) => {
              expect(body.article.comment_count).toEqual(0);
            });
        });
      });
      describe("GET /api/articles/:article_id/comments", () => {
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
      describe("POST /api/articles/:article_id/comments", () => {
        test("201: returns an object containing comment object", () => {
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
            .expect(400)
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
            .expect(404)
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
      describe("PATCH /api/articles/:article_id", () => {
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
        test("200: no inc_votes passed, returns article unchanged", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ updatedVotes: 10 })
            .expect(200)
            .then(({ body }) => {
              expect(body.article).toEqual({
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              });
            });
        });
        test("404: article valid id but does not exist", () => {
          return request(app)
            .patch("/api/articles/1001")
            .send({ inc_votes: 10 })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Article Not Found");
            });
        });
        test("400: article invalid id", () => {
          return request(app)
            .patch(
              "/api/articles/1; DROP TABLE articles; SELECT * FROM articles "
            )
            .send({ inc_votes: -10 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("400: inc_votes invalid data type", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: "add ten to votes" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
      });
    });
    describe("/comments", () => {
      describe("DELETE /api/comments/:comment_id", () => {
        test("204: comment deleted", () => {
          return request(app).delete("/api/comments/1").expect(204);
        });
        test("404: comment id valid but does not exist", () => {
          return request(app)
            .delete("/api/comments/65468465")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Comment Not Found");
            });
        });
        test("400: comment id invalid", () => {
          return request(app)
            .delete("/api/comments/thisisnotacomment")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
      });
      describe("PATCH /api/comments/:comment_id", () => {
        test("200: returns the comment with updated votes value", () => {
          return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body }) => {
              expect(body.comment).toEqual({
                comment_id: 1,
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                votes: 17,
                author: "butter_bridge",
                article_id: 9,
                created_at: "2020-04-06T12:17:00.000Z",
              });
            });
        });
        test("200: returns the comment with updated votes value when votes are negative", () => {
          return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: -10 })
            .expect(200)
            .then(({ body }) => {
              expect(body.comment).toEqual({
                comment_id: 1,
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                votes: 6,
                author: "butter_bridge",
                article_id: 9,
                created_at: "2020-04-06T12:17:00.000Z",
              });
            });
        });
        test("200: no inc_votes passed, returns comment unchanged", () => {
          return request(app)
            .patch("/api/comments/1")
            .send({ updatedVotes: 10 })
            .expect(200)
            .then(({ body }) => {
              expect(body.comment).toEqual({
                comment_id: 1,
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                votes: 16,
                author: "butter_bridge",
                article_id: 9,
                created_at: "2020-04-06T12:17:00.000Z",
              });
            });
        });
        test("404: comment valid id but does not exist", () => {
          return request(app)
            .patch("/api/comments/1001")
            .send({ inc_votes: 10 })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toEqual("Comment Not Found");
            });
        });
        test("400: comment invalid id", () => {
          return request(app)
            .patch("/api/comments/ImNotAcomment")
            .send({ inc_votes: -10 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
        test("400: inc_votes invalid data type", () => {
          return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: "add ten to votes" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toEqual("Bad Request");
            });
        });
      });
    });
    describe("/users", () => {
      describe("GET /api/users", () => {
        test("200: returns an array of users", () => {
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              expect(body.users.length).toEqual(4);
              body.users.forEach((user) => {
                expect(user.hasOwnProperty("username")).toBe(true);
                expect(user.hasOwnProperty("name")).toBe(true);
                expect(user.hasOwnProperty("avatar_url")).toBe(true);
              });
            });
        });
      });
      describe("GET /api/users/:username", () => {
        test("200: if exists, returns the correct user specified by username", () => {
          return request(app)
            .get("/api/users/butter_bridge")
            .expect(200)
            .then(({ body }) => {
              const expectedOutput = {
                username: "butter_bridge",
                name: "jonny",
                avatar_url:
                  "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
              };
              expect(body.user).toMatchObject(expectedOutput);
            });
        });
        test("404: no such user", () => {
          return request(app)
            .get("/api/users/666")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toBe("User Not Found");
            });
        });
      });
    });
  });
});

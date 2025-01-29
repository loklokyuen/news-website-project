const endpointsJson = require("../endpoints.json");
const request = require("supertest")
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const db = require('../db/connection.js');
const app = require("../app.js")

beforeEach(()=>{ return seed(testData) })
afterAll(()=>{ return db.end() })

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of all topics with slug and descriptions", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBe(3);
        topics.forEach(topic => {
          expect(typeof topic.slug).toBe("string")
          expect(typeof topic.description).toBe("string")
        });
        expect(topics[0]).toEqual({
          description: 'The man, the Mitch, the legend',
          slug: 'mitch'
        })
      });
  });
});

describe("GET non-existent endpoints", ()=>{
  test("404: Responds with an appropriate status and error message if accessing a non-existent endpoint", ()=>{
    return request(app)
      .get("/not-a-route")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Page not found")
      })
  })
})

describe("GET /api/articles", ()=>{
  describe("GET /api/articles/:article_id", ()=>{
    test("200: Responds with an article object for valid article id", ()=>{
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } })=>{
          expect(article).toEqual({
            article_id: 2,
            title: "Sony Vaio; or, The Laptop",
            topic: "mitch",
            author: "icellusedkars",
            body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            votes: 0
          })
        })
    })
    test("400: Responds with an appropriate status and error message if the article id is not a number", ()=>{
      return request(app)
        .get("/api/articles/one")
        .expect(400)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Bad request")
        })
    })
    test("404: Responds with an appropriate status and error message if the article id is out of range", ()=>{
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Article not found")
      })
    })
  })

  describe("GET /api/articles", ()=>{
    test("200: Responds with an array of all articles sorted descendingly", ()=>{
      const expectedOutput = {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        created_at: expect.any(String),
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        votes: 0,
        comment_count: "2"
      }
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } })=>{
          articles.forEach(article => {
            expect(typeof article.author).toBe("string")
            expect(typeof article.title).toBe("string")
            expect(typeof article.article_id).toBe("number")
            expect(typeof article.topic).toBe("string")
            expect(typeof article.created_at).toBe("string")
            expect(typeof article.votes).toBe("number")
            expect(typeof article.article_img_url).toBe("string")
            expect( Number(article.comment_count) ).not.toBeNaN()
            expect(article).not.toHaveProperty("body");
          });
          expect(articles).toBeSortedBy('created_at', { descending: true })
          expect(articles[0]).toMatchObject(expectedOutput)
        })
    })
  })
  describe("sorting queries", ()=>{
    describe("GET /api/articles?sort_by=", ()=>{
      test("200: Responds with an array of all articles sorted by the specified column", ()=>{
        const sortByNumberValuesInsideString = (a, b) => {
          if (Number(a.cost_at_auction) > Number(b.cost_at_auction)) return 1
          else if (Number(a.cost_at_auction) < Number(b.cost_at_auction)) return -1
          else return 0
        }
        return request(app)
          .get("/api/articles?sort_by=comment_count")
          .expect(200)
          .then(({ body: { articles } })=>{
            articles.forEach(article => {
              expect(typeof article.author).toBe("string")
              expect(typeof article.title).toBe("string")
              expect(typeof article.article_id).toBe("number")
              expect(typeof article.topic).toBe("string")
              expect(typeof article.created_at).toBe("string")
              expect(typeof article.votes).toBe("number")
              expect(typeof article.article_img_url).toBe("string")
              expect( Number(article.comment_count) ).not.toBeNaN()
              expect(article).not.toHaveProperty("body");
            });
            expect(articles).toBeSortedBy('comment_count', { descending: true, compare: sortByNumberValuesInsideString })
          })
      })
      test("400: Responds with an appropriate status and error message if request to sort by an invalid parameter", ()=>{
        return request(app)
          .get("/api/articles?sort_by=time")
          .expect(400)
          .then(({ body: { msg } })=>{
            expect(msg).toBe("Bad request")
          })
      })
    })
    describe("GET /api/articles?order=", ()=>{
      test("200: Responds with an array of all articles ordered by the specified order", ()=>{
        return request(app)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(({ body: { articles } })=>{
            articles.forEach(article => {
              expect(typeof article.author).toBe("string")
              expect(typeof article.title).toBe("string")
              expect(typeof article.article_id).toBe("number")
              expect(typeof article.topic).toBe("string")
              expect(typeof article.created_at).toBe("string")
              expect(typeof article.votes).toBe("number")
              expect(typeof article.article_img_url).toBe("string")
              expect( Number(article.comment_count) ).not.toBeNaN()
              expect(article).not.toHaveProperty("body");
            });
            expect(articles).toBeSortedBy('created_at', { descending: false})
          })
      })
      test("400: Responds with an appropriate status and error message if request to order by an invalid order", ()=>{
        return request(app)
          .get("/api/articles?order=best")
          .expect(400)
          .then(({ body: { msg } })=>{
            expect(msg).toBe("Bad request")
          })
      })
    })
    describe("GET /api/articles?sort_by&order", ()=>{
      test("200: Responds with an array of all articles sorted by the specified column and order", ()=>{
        return request(app)
          .get("/api/articles?sort_by=title&order=asc")
          .expect(200)
          .then(({ body: { articles } })=>{
            articles.forEach(article => {
              expect(typeof article.author).toBe("string")
              expect(typeof article.title).toBe("string")
              expect(typeof article.article_id).toBe("number")
              expect(typeof article.topic).toBe("string")
              expect(typeof article.created_at).toBe("string")
              expect(typeof article.votes).toBe("number")
              expect(typeof article.article_img_url).toBe("string")
              expect( Number(article.comment_count) ).not.toBeNaN()
              expect(article).not.toHaveProperty("body");
            });
            expect(articles).toBeSortedBy('title')
          })
      })
      test("400: Responds with an appropriate status and error message if request to sort by or order by invalid parameter", ()=>{
        return request(app)
          .get("/api/articles?sort_by=fun&order=desc")
          .expect(400)
          .then(({ body: { msg } })=>{
            expect(msg).toBe("Bad request")
          })
      })
    })
  })

  describe("GET /api/articles/:article_id/comments", ()=>{
    test("200: Responds with an array of all comments on a specified article, sorted by the newest first", ()=>{
      return request(app)
        .get("/api/articles/9/comments")
        .expect(200)
        .then(({ body: { comments } })=>{
          expect(comments.length).toBe(2);
          comments.forEach(comment => {
            expect(typeof comment.comment_id).toBe("number")
            expect(typeof comment.votes).toBe("number")
            expect(typeof comment.created_at).toBe("string")
            expect(typeof comment.author).toBe("string")
            expect(typeof comment.body).toBe("string")
            expect(typeof comment.article_id).toBe("number")
          });
          expect(comments).toBeSortedBy('created_at', { descending: true })
        })
    })
    test("200: Responds with an empty array if the specified article does not have any comment", ()=>{
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } })=>{
          expect(Array.isArray(comments)).toBe(true)
          expect(comments.length).toBe(0)
        })
    })
    test("400: Responds with an appropriate status and error message if the article id is not a number", ()=>{
      return request(app)
        .get("/api/articles/one/comments")
        .expect(400)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Bad request")
        })
    })
    test("404: Responds with an appropriate status and error message if the article with the article id does not exist", ()=>{
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Article not found")
        })
    })
  })
})

describe("POST /api/articles/:article_id/comments", () => {
  test("200: Responds with a comment object that is inserted to the specified article", ()=>{
    const commentToAdd = {
      username: "butter_bridge",
      body: "So insightful!"
    }
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentToAdd)
      .expect(200)
      .then(({ body: { insertedComment } })=>{
        expect(insertedComment).toMatchObject({
          comment_id: 19,
          body: "So insightful!",
          article_id: 2,
          author: "butter_bridge",
          votes: 0,
          created_at: expect.any(String)
        })
      })
  })
  test("400: Responds with an appropriate status and error message if the article id is not a number", ()=>{
    const commentToAdd = {
      username: "butter_bridge",
      body: "So insightful!"
    }
    return request(app)
      .post("/api/articles/one/comments")
      .send(commentToAdd)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message if the article with the article id does not exist", ()=>{
    const commentToAdd = {
      username: "butter_bridge",
      body: "So insightful!"
    }
    return request(app)
      .post("/api/articles/999/comments")
      .send(commentToAdd)
      .expect(404)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Article not found")
      })
  })
  test("400: Responds with an appropriate status and error message if the username or comment body is missing in the request sent", ()=>{
    const commentToAdd = { username: "butter_bridge" }
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentToAdd)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message if the user with the specified username does not exist", ()=>{
    const commentToAdd = {
      username: "no_user",
      body: "Interesting!"
    }
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentToAdd)
      .expect(404)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("User not found")
      })
  })
})

describe("PATCH /api/articles/:article_id", ()=>{
  test("200: Responds with an article object with the votes increased as expected", ()=>{
    const voteChange = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(voteChange)
      .expect(200)
      .then(({ body: { updatedArticle } })=>{
        expect(updatedArticle).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
    })
  })
  test("200: Responds with an article object with the votes decreased as expected", ()=>{
    const voteChange = { inc_votes: -99 };
    return request(app)
      .patch("/api/articles/1")
      .send(voteChange)
      .expect(200)
      .then(({ body: { updatedArticle } })=>{
        expect(updatedArticle).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 1,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        })
    })
  })
  test("400: Responds with an appropriate status and error message if the article id is not a number", ()=>{
    const voteChange = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/one")
      .send(voteChange)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message if the article with the article id does not exist", ()=>{
    const voteChange = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/99")
      .send(voteChange)
      .expect(404)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Article not found")
      })
  })
    test("400: Responds with an appropriate status and error message if the vote increase input is not a number", ()=>{
    const voteChange = { inc_votes: "five" };
    return request(app)
      .patch("/api/articles/one")
      .send(voteChange)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
})

describe("DELETE: /api/comments/:comment_id", ()=>{
  test("204: Responds with no content when comment successfully deleted", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
  })
  test("400: Responds with an appropriate status and error message if comment_id is not a number", () => {
    return request(app)
      .delete("/api/comments/test")
      .expect(400)
      .then(({ body: { msg }}) => {
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message comment with the comment id out of range", () => {
    return request(app)
      .delete("/api/comments/780")
      .expect(404)
      .then(({ body: { msg }}) => {
        expect(msg).toBe("Comment not found")
      })
  })
})

describe("GET /api/users", ()=>{
  test("200: Responds with an array of all users with username, name, avatar_url", ()=>{
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(4);
        users.forEach(user => {
          expect(typeof user.username).toBe("string")
          expect(typeof user.name).toBe("string")
          expect(typeof user.avatar_url).toBe("string")
        });

      });
  })
})
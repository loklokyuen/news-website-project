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

describe("POST /api/topics", ()=>{
  test("200: Responds with the newly created topic", ()=>{
    const topicToAdd = {
      slug: "dogs",
      description: "Not cats"
    }
    return request(app)
      .post("/api/topics")
      .send(topicToAdd)
      .expect(201)
      .then(({ body: { insertedTopic } })=>{
        expect(insertedTopic).toMatchObject({
          slug: "dogs",
          description: "Not cats"
        })
      })
  })
  test("200: Responds with the newly created topic, when the optional description is not provided", ()=>{
    const topicToAdd = {
      slug: "dogs"
    }
    return request(app)
      .post("/api/topics")
      .send(topicToAdd)
      .expect(201)
      .then(({ body: { insertedTopic } })=>{
        expect(insertedTopic).toMatchObject({
          slug: "dogs"
        })
      })
  })
  test("400: Responds with an appropriate status and error message if slug is missing", ()=>{
    const topicToAdd = {
      description: "Not cats"
    }
    return request(app)
      .post("/api/topics")
      .send(topicToAdd)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
  test("409: Responds with an appropriate status and error message if the topic with the provided slug already exist", ()=>{
    const topicToAdd = {
      slug: "cats",
      description: "Not dogs, not pigs"
    }
    return request(app)
      .post("/api/topics")
      .send(topicToAdd)
      .expect(409)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Topic already exists")
      })
  })
})

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
  test("200: Responds with an array of articles sorted descendingly, default to first 10 articles", ()=>{
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
      .then(({ body: { articles, total_count } })=>{
        expect(articles.length).toBe(10)
        expect(total_count).toBe("13")
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
  describe("sorting queries", ()=>{
    describe("sort_by", ()=>{
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
    describe("order", ()=>{
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
    describe("sort_by&order", ()=>{
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

  describe("filter by topic", ()=>{
    test("200: Responds with an array of articles filtered by the specified topic, default to first 10 items", ()=>{
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } })=>{
          expect(articles.length).toBe(10)
          articles.forEach(article => {
            expect(article.topic).toBe("mitch")
          });
        })
    })
    test("404: Responds with an appropriate status and error message if request to filter by a topic that is not found", ()=>{
      return request(app)
        .get("/api/articles?topic=dogs")
        .expect(404)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Topic not found")
        })
    })
  })

  describe("pagination", ()=>{
    test("200: Responds with an array of articles with the first 10 articles on page 1", ()=>{
      return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then(({ body: { articles, total_count } })=>{
        expect(articles.length).toBe(10);
        expect(articles[0].article_id).toBe(3)
        expect(articles[1].article_id).toBe(6)
        expect(articles[2].article_id).toBe(2)
        expect(articles[3].article_id).toBe(12)
        expect(articles[4].article_id).toBe(13)
        expect(articles[5].article_id).toBe(5)
        expect(articles[6].article_id).toBe(1)
        expect(articles[7].article_id).toBe(9)
        expect(articles[8].article_id).toBe(10)
        expect(articles[9].article_id).toBe(4)
        expect(articles).toBeSortedBy('created_at', { descending: true });
        expect(total_count).toBe("13")
      })
    })
    test("200: Responds with an array of articles with the 3 remaining articles on page 2", ()=>{
      return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body: { articles, total_count } })=>{
        expect(articles.length).toBe(3);
        expect(articles[0].article_id).toBe(8)
        expect(articles[1].article_id).toBe(11)
        expect(articles[2].article_id).toBe(7)
        expect(articles).toBeSortedBy('created_at', { descending: true });
        expect(total_count).toBe("13")
      })
    })
    test("200: Responds with an array of articles with topic filtered on specified page", ()=>{
      return request(app)
      .get("/api/articles?p=3&topic=mitch&limit=3")
      .expect(200)
      .then(({ body: { articles, total_count } })=>{
        expect(articles.length).toBe(3);
        expect(articles[0].article_id).toBe(9)
        expect(articles[1].article_id).toBe(10)
        expect(articles[2].article_id).toBe(4)
        expect(articles).toBeSortedBy('created_at', { descending: true });
        expect(total_count).toBe("12")
      })
    })
    test("200: Responds with an empty array, if there is no item on the page", ()=>{
      return request(app)
        .get("/api/articles?p=3")
        .expect(200)
        .then(({ body: { articles, total_count } })=>{
          expect(articles.length).toBe(0);
          expect(total_count).toBe("13")
        })
    })
    test("400: Responds with an appropriate status and error message if the specified page is not a number", ()=>{
      return request(app)
        .get("/api/articles?p=one")
        .expect(400)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Bad request")
        })
    })
    describe("limit", ()=>{
      test("200: Responds with an array of articles with 3 as the limit", ()=>{
        return request(app)
        .get("/api/articles?limit=3")
        .expect(200)
        .then(({ body: { articles, total_count } })=>{
          expect(articles.length).toBe(3);
          expect(articles[0].article_id).toBe(3)
          expect(articles[1].article_id).toBe(6)
          expect(articles[2].article_id).toBe(2)
          expect(articles).toBeSortedBy('created_at', { descending: true });
          expect(total_count).toBe("13")
        })
      })
      test("200: Responds with an array of articles with 3 as the limit on specified page", ()=>{
        return request(app)
        .get("/api/articles?limit=3&p=3")
        .expect(200)
        .then(({ body: { articles, total_count } })=>{
          expect(articles.length).toBe(3);
          expect(articles[0].article_id).toBe(1)
          expect(articles[1].article_id).toBe(9)
          expect(articles[2].article_id).toBe(10)
          expect(articles).toBeSortedBy('created_at', { descending: true });
          expect(total_count).toBe("13")
        })
      })
      test("400: Responds with an appropriate status and error message if the specified limit is not a number", ()=>{
        return request(app)
          .get("/api/articles?limit=one")
          .expect(400)
          .then(({ body: { msg } })=>{
            expect(msg).toBe("Bad request")
          })
      })
    })
  })
  
  describe("GET /api/articles/:article_id", ()=>{
    test("200: Responds with an article object for valid article id", ()=>{
      return request(app)
        .get("/api/articles/6")
        .expect(200)
        .then(({ body: { article } })=>{
          expect(article).toMatchObject({
            article_id: 6,
            title: "A",
            topic: "mitch",
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            votes: 0,
            comment_count: "1"
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
    describe("pagination", ()=>{
      test("200: Responds with an array of comments with the first 10 comments on page 1", ()=>{
        return request(app)
        .get("/api/articles/1/comments?p=1")
        .expect(200)
        .then(({ body: { comments } })=>{
          expect(comments.length).toBe(10);
          expect(comments[0].comment_id).toBe(5)
          expect(comments[1].comment_id).toBe(2)
          expect(comments[2].comment_id).toBe(18)
          expect(comments[3].comment_id).toBe(13)
          expect(comments[4].comment_id).toBe(7)
          expect(comments[5].comment_id).toBe(8)
          expect(comments[6].comment_id).toBe(6)
          expect(comments[7].comment_id).toBe(12)
          expect(comments[8].comment_id).toBe(3)
          expect(comments[9].comment_id).toBe(4)
          expect(comments).toBeSortedBy('created_at', { descending: true });
        })
      })
      test("200: Responds with an array of comments with the one remaining comment on page 2", ()=>{
        return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body: { comments } })=>{
          expect(comments.length).toBe(1);
          expect(comments[0].comment_id).toBe(9)
        })
      })
      test("200: Responds with an empty array, if there is no comment on the page", ()=>{
        return request(app)
          .get("/api/articles/1/comments?p=3")
          .expect(200)
          .then(({ body: { comments } })=>{
            expect(comments.length).toBe(0);
          })
      })
      test("400: Responds with an appropriate status and error message if the specified page is not a number", ()=>{
        return request(app)
          .get("/api/articles/1/comments?p=one")
          .expect(400)
          .then(({ body: { msg } })=>{
            expect(msg).toBe("Bad request")
          })
      })
      describe("limit", ()=>{
        test("200: Responds with an array of comments with 3 as the limit", ()=>{
          return request(app)
          .get("/api/articles/1/comments?limit=3")
          .expect(200)
          .then(({ body: { comments } })=>{
            expect(comments.length).toBe(3);
            expect(comments[0].comment_id).toBe(5)
            expect(comments[1].comment_id).toBe(2)
            expect(comments[2].comment_id).toBe(18)
            expect(comments).toBeSortedBy('created_at', { descending: true });
          })
        })
        test("200: Responds with an array of comments with 3 as the limit on specified page", ()=>{
          return request(app)
          .get("/api/articles/1/comments?limit=3&p=3")
          .expect(200)
          .then(({ body: { comments } })=>{
            expect(comments.length).toBe(3);
            expect(comments[0].comment_id).toBe(6)
            expect(comments[1].comment_id).toBe(12)
            expect(comments[2].comment_id).toBe(3)
            expect(comments).toBeSortedBy('created_at', { descending: true });
          })
        })
        test("400: Responds with an appropriate status and error message if the specified limit is not a number", ()=>{
          return request(app)
            .get("/api/articles/1/comments?limit=one")
            .expect(400)
            .then(({ body: { msg } })=>{
              expect(msg).toBe("Bad request")
            })
        })
      })
    })
  })
})

describe("POST /api/articles",()=>{
  describe("POST /api/articles/:article_id/comments", () => {
    test("200: Responds with the newly create comment to the specified article", ()=>{
      const commentToAdd = {
        username: "butter_bridge",
        body: "So insightful!"
      }
      return request(app)
        .post("/api/articles/2/comments")
        .send(commentToAdd)
        .expect(201)
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
  describe("POST /api/articles", () => {
    test("200: Responds with the newly created article", ()=>{
      const articleToAdd = {
        author: "butter_bridge",
        title: "Aren't cats so adorable?",
        body: "I just can't resist them",
        topic: "cats",
        article_img_url: "https://images.pexels.com/photos/45170/kittens-cat-cat-puppy-rush-45170.jpeg?w=700&h=700"
      }
      return request(app)
        .post("/api/articles")
        .send(articleToAdd)
        .expect(201)
        .then(({ body: { insertedArticle } })=>{
          expect(insertedArticle).toMatchObject({
            article_id: 14,
            title: "Aren't cats so adorable?",
            body: "I just can't resist them",
            topic: "cats",
            author: "butter_bridge",
            article_img_url: "https://images.pexels.com/photos/45170/kittens-cat-cat-puppy-rush-45170.jpeg?w=700&h=700",
            votes: 0,
            created_at: expect.any(String),
            comment_count: "0"
          })
        })
    })
    test("200: Responds with the newly created article, with s a default article image if not provided", ()=>{
      const articleToAdd = {
        author: "butter_bridge",
        title: "Aren't cats so adorable?",
        body: "I just can't resist them",
        topic: "cats",
      }
      return request(app)
        .post("/api/articles")
        .send(articleToAdd)
        .expect(201)
        .then(({ body: { insertedArticle } })=>{
          expect(insertedArticle).toMatchObject({
            article_id: 14,
            title: "Aren't cats so adorable?",
            body: "I just can't resist them",
            topic: "cats",
            author: "butter_bridge",
            article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            votes: 0,
            created_at: expect.any(String),
            comment_count: "0"
          })
        })
    })
    test("400: Responds with an appropriate status and error message if the some required property is not provided", ()=>{
      const articleToAdd = {
        author: "butter_bridge",
        body: "I just can't resist them",
        topic: "cats",
      }
      return request(app)
        .post("/api/articles")
        .send(articleToAdd)
        .expect(400)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Bad request")
        })
    })
    test("404: Responds with an appropriate status and error message if the user with the username does not exist", ()=>{
      const articleToAdd = {
        author: "cat_god",
        title: "Aren't cats so adorable?",
        body: "I just can't resist them",
        topic: "cats",
      }
      return request(app)
        .post("/api/articles")
        .send(articleToAdd)
        .expect(404)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("User not found")
        })
    })
    test("404: Responds with an appropriate status and error message if the topic does not exist", ()=>{
      const articleToAdd = {
        author: "butter_bridge",
        title: "Aren't dogs so adorable?",
        body: "I just can't resist them",
        topic: "dogs",
      }
      return request(app)
        .post("/api/articles")
        .send(articleToAdd)
        .expect(404)
        .then(({ body: { msg } })=>{
          expect(msg).toBe("Topic not found")
        })
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

describe("DELETE /api/articles/:article_id", ()=>{
  test("204: Responds with no content when article successfully deleted", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
  })
  test("400: Responds with an appropriate status and error message if article id is not a number", () => {
    return request(app)
      .delete("/api/articles/test")
      .expect(400)
      .then(({ body: { msg }}) => {
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message if the article id is out of range", () => {
    return request(app)
      .delete("/api/articles/780")
      .expect(404)
      .then(({ body: { msg }}) => {
        expect(msg).toBe("Article not found")
      })
  })
})

describe("DELETE /api/comments/:comment_id", ()=>{
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
  test("404: Responds with an appropriate status and error message if the comment id is out of range", () => {
    return request(app)
      .delete("/api/comments/780")
      .expect(404)
      .then(({ body: { msg }}) => {
        expect(msg).toBe("Comment not found")
      })
  })
})

describe("PATCH /api/comments/:comment_id", ()=>{
  test("200: Responds with an comment object with the votes increased as expected", ()=>{
    const voteChange = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(voteChange)
      .expect(200)
      .then(({ body: { updatedComment } })=>{
        expect(updatedComment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        })
    })
  })
  test("200: Responds with an comment object with the votes decreased as expected", ()=>{
    const voteChange = { inc_votes: -15 };
    return request(app)
      .patch("/api/comments/1")
      .send(voteChange)
      .expect(200)
      .then(({ body: { updatedComment } })=>{
        expect(updatedComment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 1,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        })
    })
  })
  test("400: Responds with an appropriate status and error message if the comment id is not a number", ()=>{
    const voteChange = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/one")
      .send(voteChange)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
      })
  })
  test("404: Responds with an appropriate status and error message if the comment id is out of range", ()=>{
    const voteChange = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/99")
      .send(voteChange)
      .expect(404)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Comment not found")
      })
  })
    test("400: Responds with an appropriate status and error message if the vote increase input is not a number", ()=>{
    const voteChange = { inc_votes: "five" };
    return request(app)
      .patch("/api/comments/one")
      .send(voteChange)
      .expect(400)
      .then(({ body: { msg } })=>{
        expect(msg).toBe("Bad request")
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
  describe("GET /api/users/:username", ()=>{
    test("200: Responds with a user object by specified username", ()=>{
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body: { user } })=>{
          expect(user).toMatchObject({
            username: 'butter_bridge',
            name: 'jonny',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
          })
        })
    })
    test("404: Responds with an appropriate status and error message if a user with the specified username cannot be found", () => {
      return request(app)
        .get("/api/users/not-a-user")
        .expect(404)
        .then(({ body: { msg }}) => {
          expect(msg).toBe("User not found")
        })
    })
  })
})
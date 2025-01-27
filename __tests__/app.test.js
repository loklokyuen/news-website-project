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
})
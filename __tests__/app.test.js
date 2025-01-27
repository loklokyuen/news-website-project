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

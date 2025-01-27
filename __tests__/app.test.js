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

const { getTopics, postTopic } = require("../controllers/topics.controller");

const topicsRouter = require("express").Router();

topicsRouter.get("/", getTopics);
topicsRouter.post("/", postTopic);

module.exports = topicsRouter;
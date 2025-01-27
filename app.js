const express = require("express");
const { getEndpointDescription } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const app = express();

app.get("/api", getEndpointDescription)
app.get("/api/topics", getTopics)

module.exports = app;
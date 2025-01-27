const express = require("express");
const { getEndpointDescription } = require("./controllers/api.controller");
const app = express();

app.get("/api", getEndpointDescription)

module.exports = app;
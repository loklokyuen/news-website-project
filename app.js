const express = require("express");
const { getEndpointsDescription } = require("./controllers/api.controller");
const app = express();

app.get("/api", getEndpointsDescription)

module.exports = app;
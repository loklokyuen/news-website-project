const express = require("express");
const { getEndpointDescription } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { handleCustomErrors, handleServerErrors } = require("./errors");
const { getArticleById, getArticles, getCommentsByArticleId } = require("./controllers/articles.controller");
const app = express();

app.use(express.json())

app.get("/api", getEndpointDescription)
app.get("/api/topics", getTopics)
app.get("/api/articles/:article_id", getArticleById)
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id/comments", getCommentsByArticleId)



app.all("/*", (req, res)=>{
    res.status(404).send({ msg: "Page not found" });
})

app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app;
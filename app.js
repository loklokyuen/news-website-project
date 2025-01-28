const express = require("express");
const { getEndpointDescription } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { handleCustomErrors, handleServerErrors, handlePSQLErrors } = require("./errors");
const { getArticleById, getArticles, getCommentsByArticleId, postCommentOnArticle, patchArticleVotes } = require("./controllers/articles.controller");
const { deleteCommentById } = require("./controllers/comments.controller");
const { getUsers } = require("./controllers/users.controller");
const app = express();

app.use(express.json())

app.get("/api", getEndpointDescription)
app.get("/api/topics", getTopics)
app.get("/api/articles/:article_id", getArticleById)
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id/comments", getCommentsByArticleId)
app.get("/api/users", getUsers)

app.post("/api/articles/:article_id/comments", postCommentOnArticle)

app.patch("/api/articles/:article_id", patchArticleVotes)

app.delete("/api/comments/:comment_id", deleteCommentById)

app.all("/*", (req, res)=>{
    res.status(404).send({ msg: "Page not found" });
})

app.use(handleCustomErrors)
app.use(handlePSQLErrors)
app.use(handleServerErrors)

module.exports = app;
const express = require("express");
const { getEndpointDescription } = require("./controllers/api.controller");
const cors = require('cors');
const { handleCustomErrors, handleServerErrors, handlePSQLErrors } = require("./errors");
const usersRouter = require("./routers/users-router");
const articleRouter = require("./routers/articles-router");
const commentRouter = require("./routers/comments-router");
const topicsRouter = require("./routers/topics-router");

const app = express();

app.use(cors());
app.use(express.json())

app.get("/api", getEndpointDescription)

app.use("/api/topics", topicsRouter)
app.use("/api/articles", articleRouter)
app.use("/api/users", usersRouter)
app.use("/api/comments", commentRouter)

app.all("/*", (req, res)=>{
    res.status(404).send({ msg: "Page not found" });
})

app.use(handleCustomErrors)
app.use(handlePSQLErrors)
app.use(handleServerErrors)

module.exports = app;
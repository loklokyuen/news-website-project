const { getArticles, getArticleById, getCommentsByArticleId, postCommentOnArticle, patchArticleVotes, postArticle } = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.get("/", getArticles)
articleRouter.get("/:article_id", getArticleById)
articleRouter.get("/:article_id/comments", getCommentsByArticleId)

articleRouter.post("/:article_id/comments", postCommentOnArticle)
articleRouter.post("/", postArticle)

articleRouter.patch("/:article_id", patchArticleVotes)

module.exports = articleRouter;
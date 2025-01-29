const { deleteCommentById, patchCommentVotes } = require("../controllers/comments.controller");

const commentRouter = require("express").Router();

commentRouter.delete("/:comment_id", deleteCommentById)
commentRouter.patch("/:comment_id", patchCommentVotes)

module.exports = commentRouter;
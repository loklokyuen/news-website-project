const { removeCommentById } = require("../models/comments.model")

exports.deleteCommentById = (req, res, next)=>{
    const { comment_id } = req.params;
    removeCommentById(comment_id).then(()=>{
        console.log("pass")
        res.status(204).send();
    })
    .catch((err)=>{
        console.log(err)
        next(err)
    })
}
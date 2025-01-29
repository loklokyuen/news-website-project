const db = require("../db/connection")

exports.removeCommentById = (comment_id)=>{
    return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({rowCount})=>{
        if (rowCount === 0){
            return Promise.reject({code: 404, msg: "Comment not found"})
        }
    })
}
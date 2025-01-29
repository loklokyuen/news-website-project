const db = require("../db/connection")
const { checkCommentExists } = require("../utils/checkExistenceInDB")

exports.removeCommentById = (comment_id)=>{
    return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({rowCount})=>{
        if (rowCount === 0){
            return Promise.reject({code: 404, msg: "Comment not found"})
        }
    })
}

exports.updateVotesOfComment = (comment_id, voteChange)=>{
    return checkCommentExists(comment_id)
    .then(()=>{
        return db.query(`UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`, [voteChange, comment_id])
    })
    .then((result)=>{
        return result.rows[0]
    })
}
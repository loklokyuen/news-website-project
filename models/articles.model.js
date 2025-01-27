const db = require("../db/connection")

exports.selectArticleById = (id)=>{
    if ( isNaN( Number(id) ) ){
        return Promise.reject({code: 400, msg: "Bad request"})
    }
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [id]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({code: 404, msg: "Article not found"})
        }
        return result.rows[0]
    })
}
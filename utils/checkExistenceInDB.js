const db = require("../db/connection")

exports.checkArticleExists = (article_id)=>{
    return db.query(`SELECT 1 FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows })=>{
        if (rows.length === 0){
            return Promise.reject({code: 404, msg: "Article not found"})
        } else {
            return "Article exists"
        }
    })
}
exports.checkUserExists = (username)=>{
    return db.query(`SELECT 1 FROM users WHERE username = $1`, [username])
    .then(({ rows })=>{
        if (rows.length === 0){
            return Promise.reject({code: 404, msg: "User not found"})
        } else {
            return "User exists"
        }
    })
}

exports.checkTopicExists = (topic)=>{
    if ( !topic ) {
        return;
    } else {
        return db.query(`SELECT 1 FROM topics WHERE slug = $1`, [topic])
        .then(({ rows })=>{
            if (rows.length === 0){
                return Promise.reject({code: 404, msg: `Topic not found`})
            } else {
                return "Topic exists"
            }
        })
    }x
}
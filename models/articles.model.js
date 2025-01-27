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

exports.selectArticles = ()=>{
    return db.query(`
        SELECT a.author, title, article_id, topic, a.created_at, a.votes, article_img_url, COUNT(*) AS comment_count 
        FROM articles AS a LEFT OUTER JOIN comments AS c USING (article_id) 
        GROUP BY article_id ORDER BY created_at DESC`).then((result)=>{
            return result.rows
    })
}
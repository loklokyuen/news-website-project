const db = require("../db/connection")
const { checkArticleExists } = require("../utils/checkArticleExists")

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

exports.selectCommentsByArticleId = (id)=>{
    if ( isNaN( Number(id) ) ){
        return Promise.reject({code: 400, msg: "Bad request"})
    }
    return checkArticleExists(id).then(()=>{
        return db.query(`SELECT comment_id, c.votes, c.created_at, c.author, c.body, article_id
            FROM articles AS a INNER JOIN comments AS c USING (article_id)
            WHERE article_id = $1 ORDER BY c.created_at DESC`, [id])
    })
    .then((result)=>{
        return result.rows
    })
}
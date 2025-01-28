const db = require("../db/connection")
const { checkArticleExists, checkUserExists } = require("../utils/checkExistenceInDB")

exports.selectArticleById = (article_id)=>{
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]).then((result)=>{
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

exports.selectCommentsByArticleId = (article_id)=>{
    return checkArticleExists(article_id)
    .then(()=>{
        return db.query(`SELECT comment_id, c.votes, c.created_at, c.author, c.body, article_id
            FROM articles AS a INNER JOIN comments AS c USING (article_id)
            WHERE article_id = $1 ORDER BY c.created_at DESC`, [article_id])
    })
    .then((result)=>{
        return result.rows
    })
}

exports.insertCommentToArticle = (article_id, username, body)=>{
    if ( !username || !body ){
        return Promise.reject({code: 400, msg: "Bad request"})
    }
    return checkArticleExists(article_id)
    .then(()=>{
        return checkUserExists(username)
    })
    .then(()=>{
        return db.query(`INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`, [body, article_id, username])
    })
    .then((result)=>{
        return result.rows[0]
    })
}

exports.updateVotesOfArticle = (article_id, voteChange)=>{
    return checkArticleExists(article_id)
    .then(()=>{
        return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`, [voteChange, article_id])
    })
    .then((result)=>{
        return result.rows[0]
    })
}
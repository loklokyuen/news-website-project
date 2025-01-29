const db = require("../db/connection")
const { checkArticleExists, checkUserExists } = require("../utils/checkExistenceInDB")

exports.selectArticleById = (article_id)=>{
    return db.query(`SELECT a.author, title, a.article_id, a.body, topic, a.created_at, 
        a.votes, article_img_url, COUNT(c.comment_id) AS comment_count
        FROM articles AS a LEFT OUTER JOIN comments AS c USING (article_id)
        WHERE article_id = $1
        GROUP BY article_id`, [article_id]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({code: 404, msg: "Article not found"})
        }
        return result.rows[0]
    })
}

exports.selectArticles = (sort_by = "created_at", order = "desc", topic)=>{
    let sqlString = `
        SELECT a.author, title, article_id, topic, a.created_at, a.votes, article_img_url, COUNT(*) AS comment_count 
        FROM articles AS a LEFT OUTER JOIN comments AS c USING (article_id)`

    let topicCheckPromise = Promise.resolve(true);
    if ( topic ){
        topicCheckPromise = db.query(`SELECT 1 from topics WHERE slug = $1`, [topic]).then(({ rows })=>{
            if (rows.length === 0){
                return Promise.reject({code: 404, msg: `Topic ${topic} not found`})
            }
            sqlString += ` WHERE topic = '${topic}'`
        })
    }
    return topicCheckPromise.then(()=>{
        sqlString += ` GROUP BY article_id`
        const sortByGreenlist = ["author", "title", "article_id", "created_at", "votes", "article_img_url", "comment_count"]
        const orderGreenlist = ["asc", "desc"]
        if ( sortByGreenlist.some(item => item.toLowerCase() === sort_by.toLowerCase()) &&
             orderGreenlist.some(item => item.toLowerCase() === order.toLowerCase())){
            sqlString += ` ORDER BY ${sort_by} ${order}`
        } else {
            return Promise.reject({code: 400, msg: "Bad request"})
        }
        return db.query(sqlString)
    })
    .then(({ rows })=>{
        return rows
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
const db = require("../db/connection")
const { checkTopicDoesNotExist } = require("../utils/checkExistenceInDB")

exports.selectTopics = ()=>{
    return db.query(`SELECT * FROM topics`).then((result)=>{
        return result.rows
    })
}

exports.insertTopic = (slug, description)=>{
    return checkTopicDoesNotExist(slug)
    .then(()=>{
        return db.query(`INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`, [slug, description])
    })
    .then(({ rows })=>{
        return rows[0]
    })
}
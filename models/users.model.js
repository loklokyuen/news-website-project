const db = require("../db/connection")
const { checkUserExists } = require("../utils/checkExistenceInDB")

exports.selectUsers = ()=>{
    return db.query(`SELECT * FROM users`)
    .then(({ rows })=>{
        return rows
    })
}

exports.selectUserByUsername = (username)=>{
    return checkUserExists(username)
    .then(()=>{
        return db.query(`SELECT * FROM users WHERE username = $1`, [username])
    })
    .then(({ rows })=>{
        return rows[0]
    })
}
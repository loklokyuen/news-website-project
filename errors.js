exports.handleCustomErrors = (err, req, res, next)=>{
    if ( err.code && err.msg ){
        res.status(err.code).send({ msg: err.msg})
    } else {
        next(err)
    }
}

exports.handlePSQLErrors = (err, req, res, next)=>{
    if (err.code === '22P02' || err.code === '23502'){
        res.status(400).send({ msg: "Bad request"})
    } else {
        next(err)
    }
}

exports.handleServerErrors = (err, req, res) => {
    res.status(500).send({ msg: "Internal server error" })
}
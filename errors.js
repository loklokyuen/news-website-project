exports.handleCustomErrors = (err, req, res, next)=>{
    if ( err.code && err.msg ){
        res.status(err.code).send({ msg: err.msg})
    } else {
        next(err)
    }
}

exports.handleServerErrors = (err, req, res) => {
    res.status(500).send({ msg: "Internal server error" })
}
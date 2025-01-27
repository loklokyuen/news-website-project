const { fetchEndpointsDescription } = require("../models/api.model")

exports.getEndpointsDescription = (req, res)=>{
    res.status(200).send({ endpoints: fetchEndpointsDescription() })
}
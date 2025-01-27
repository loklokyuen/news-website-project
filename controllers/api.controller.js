const endpointsJson = require("../endpoints.json");

exports.getEndpointDescription = (req, res)=>{
    res.status(200).send({ endpoints: endpointsJson })
}
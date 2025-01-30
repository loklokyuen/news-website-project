const { selectTopics, insertTopic } = require("../models/topics.model")

exports.getTopics = (req, res, next)=>{
    selectTopics().then((topics)=>{
        res.status(200).send({ topics })
    })
    .catch((err)=>{
        next(err)
    })
}

exports.postTopic = (req, res, next)=>{
    const { slug, description } = req.body;
    insertTopic(slug, description).then((insertedTopic)=>{
        res.status(201).send({ insertedTopic });
    })
    .catch((err)=>{
        next(err)
    })
}
const { selectArticleById, selectArticles, selectCommentsByArticleId, insertCommentToArticle, updateVotesOfArticle } = require("../models/articles.model")

exports.getArticleById = (req, res, next)=>{
    const { article_id } = req.params;
    selectArticleById(article_id).then((article)=>{
        res.status(200).send({ article })
    })
    .catch((err)=>{
        next(err)
    })
}

exports.getArticles = (req, res, next)=>{
    selectArticles().then((articles)=>{
        res.status(200).send({ articles })
    })
    .catch((err)=>{
        next(err)
    })
}

exports.getCommentsByArticleId = (req, res, next)=>{
    const { article_id } = req.params;
    selectCommentsByArticleId(article_id).then((comments)=>{
        res.status(200).send({ comments })
    })
    .catch((err)=>{
        next(err)
    })
}

exports.postCommentOnArticle = (req, res, next)=>{
    const { article_id } = req.params;
    const { username, body } = req.body;
    insertCommentToArticle(article_id, username, body).then((insertedComment)=>{
        res.status(200).send({ insertedComment })
    })
    .catch((err)=>{
        next(err)
    })
}

exports.patchArticleVotes = (req, res, next)=>{
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    updateVotesOfArticle(article_id, inc_votes).then((updatedArticle)=>{
        res.status(200).send({ updatedArticle })
    })
    .catch((err)=>{
        next(err)
    })
}
const {
  fetchArticleComments,
  checkCategoryExists,
} = require("../models/comments-models.js");

module.exports.getArticleComments = (req, res, next) => {
  checkCategoryExists(req.params.article_id)
    .then(() => {
      return fetchArticleComments(req.params.article_id);
    }).then((comments)=>{
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

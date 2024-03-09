const {
  checkCommentExists,
  fetchArticleComments,
  addComment,
  removeComment,
  updateComment,
} = require("../models/comments-models.js");
const { checkArticleExists } = require("../models/articles-models.js");
const { checkUserExists } = require("../models/users-models.js");

module.exports.getArticleComments = (req, res, next) => {
  checkArticleExists(req.params.article_id)
    .then(() => {
      return fetchArticleComments(req.params.article_id, req.query);
    })
    .then(({comments, total_count}) => {
      res.status(200).send({ comments, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postComment = (req, res, next) => {
  if (
    typeof req.body.body !== "string" ||
    typeof req.body.username !== "string"
  ) {
    next({ status: 400, msg: "Bad Request - Missing Properties" });
  }
  const articleExists = checkArticleExists(req.params.article_id);
  const userExists = checkUserExists(req.body.username);
  Promise.all([articleExists, userExists])
    .then(() => {
      return addComment(
        req.params.article_id,
        req.body.body,
        req.body.username
      );
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteComment = (req, res, next) => {
  removeComment(req.params.comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchComment = (req, res, next) => {
  checkCommentExists(req.params.comment_id)
    .then(() => {
      return updateComment(req.params.comment_id, req.body.inc_votes);
    })
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

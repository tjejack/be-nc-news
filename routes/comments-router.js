const {
  deleteComment,
  patchComment,
} = require("../controllers/comments-controllers");

const commentsRouter = require("express").Router();

commentsRouter.route("/:comment_id").delete(deleteComment).patch(patchComment);

module.exports = commentsRouter;

import express from "express";
import Authentication from "../middlewares/auth.js";
import commentValidator from "../validators/comment-validate.js";
import { Comment, likeComment } from "../controllers/comment-controller.js";
import validateRequest from "../middlewares/validator.js";
import { deleteComment } from "../controllers/admin-controller.js";

const commentRouter = express.Router();

commentRouter
  .route("/")
  .post(Authentication, validateRequest(commentValidator), Comment)
  .delete(Authentication, deleteComment);
commentRouter.route("/like").put(Authentication, likeComment);

export default commentRouter;

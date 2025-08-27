import express from "express";
import Authentication from "../middlewares/auth.js";
import validateRequest from "../middlewares/validator.js";
import { postValidator } from "../validators/post-validate.js";
import {
  createPost,
  getPost,
  getPosts,
  likePost,
  savePost,
} from "../controllers/post-controller.js";
import { deletePost, updatePost } from "../controllers/admin-controller.js";
import { postMedia } from "../middlewares/multer.js";

const postRouter = express.Router();

postRouter
  .route("/")
  .post(Authentication, postMedia, validateRequest(postValidator), createPost)
  .get(getPost);
postRouter
  .route("/")
  .delete(Authentication, deletePost)
  .put(Authentication, postMedia, updatePost);
postRouter.route("/like").put(Authentication, likePost);
postRouter.route("/all").get(getPosts);
postRouter.route("/save").put(Authentication, savePost);

export default postRouter;

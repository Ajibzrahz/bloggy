import express from "express";
import {
  register,
  login,
  getProfile,
  deleteProfile,
  updateProfile,
  getUser,
  allUsers,
  follow,
  unfollow,
  logout,
} from "../controllers/user-controller.js";
import { deleteUser } from "../controllers/admin-controller.js";
import validateRequest from "../middlewares/validator.js";
import {
  loginValidation,
  registerValidation,
  updateValidation,
} from "../validators/user-validate.js";
import { profilePicture } from "../middlewares/multer.js";
import Authentication from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter
  .route("/register")
  .post(profilePicture, validateRequest(registerValidation), register);
userRouter.route("/login").post(validateRequest(loginValidation), login);
userRouter.route("/logout").get(logout);
userRouter.route("/").get(Authentication, allUsers);
userRouter
  .route("/profile")
  .get(Authentication, getProfile)
  .delete(Authentication, deleteProfile)
  .put(
    Authentication,
    profilePicture,
    validateRequest(updateValidation),
    updateProfile
  );
userRouter
  .route("/single")
  .get(Authentication, getUser)
  .delete(Authentication, deleteUser);
userRouter.route("/follow").put(Authentication, follow);
userRouter.route("/unfollow").put(Authentication, unfollow);

export default userRouter;

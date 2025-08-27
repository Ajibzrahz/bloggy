import userModel from "../models/user.js";
import {
  badRequestError,
  notFoundError,
  unauthenticatedError,
} from "../errors/index.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import postModel from "../models/post.js";
import commentModel from "../models/comment.js";
import reportModel from "../models/report.js";
import { sendEmail } from "../utils/nodemailer.js";

//Admin deleting a user
const deleteUser = async (req, res, next) => {
  const { userId } = req.query;
  const { role } = req.user;
  if (role !== "admin") {
    const err = new unauthenticatedError("Not authorized for this");
    return next(err);
  }

  try {
    const user = await userModel.findById(userId);

    if (!user && !mongoose.Types.ObjectId.isValid(user)) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    await userModel.findByIdAndDelete(user);
    await sendEmail({
      to: user.email,
      subject: "Your account has been banned due to certain reasons",
      text: `Hi ${user.username}, Thanks for trying out blog`,
      html: `<h1>Welcome, ${user.username}!</h1><p>Thank you for your time.</p>`,
    }).catch((err) => {
      console.log(err);
    });
    return res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  const { role, id } = req.user;
  const { postId } = req.query;

  try {
    const post = await postModel.findById(postId);
    if (!post) {
      const err = new notFoundError("Post does not exist");
      return next(err);
    }
    if (role !== "admin" && id !== post.author.toString()) {
      const err = new unauthenticatedError("you cannot delete this post");
      return next(err);
    }

    await postModel.findByIdAndDelete(postId);

    return res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    return next(error);
  }
};
const updatePost = async (req, res, next) => {
  const { role, id } = req.user;
  const { postId } = req.query;
  const payload = req.body;
  const media = req.files || [];

  try {
    const post = await postModel.findById(postId);
    if (!post) {
      const err = new notFoundError("Post does not exist");
      return next(err);
    }
    if (role !== "admin" && id !== post.author.toString()) {
      const err = new unauthenticatedError("you cannot delete this post");
      return next(err);
    }

    if (Date.now() - post.createdAt > 1000 * 60 * 60) {
      const err = new badRequestError("You can no longer update post");
      return next(err);
    }

    const uploaded = [];
    for (const element of media) {
      const result = await cloudinary.uploader.upload(element.path, {
        resource_type: "auto",
      });
      uploaded.push(result.secure_url);

      await fs.unlink(element.path);
    }

    const updatePost = await postModel.findByIdAndUpdate(
      postId,
      { ...payload, media: uploaded },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({ msg: "updated", updatePost });
  } catch (error) {
    return next(error);
  }
};

const deleteComment = async (req, res, next) => {
  const { commentId, postId } = req.query;
  const { id, role } = req.user;

  try {
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      const err = new notFoundError("Comment does not found");
      return next(err);
    }
    if (role !== "admin" && id !== comment.author.toString()) {
      const err = new unauthenticatedError("You cannot delete this comment");
      return next(err);
    }
    await commentModel.findByIdAndDelete(commentId);
    await postModel.findByIdAndUpdate(postId, {
      $pull: { comment: commentId },
    });
    return res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    return next(error);
  }
};
const updateReport = async (req, res, next) => {
  const { role } = req.user;
  const { reportId } = req.query;
  const { status } = req.body;
  try {
    const user = await userModel.findById(userId);

    const report = await reportModel.findById(reportId);
    if (!report) {
      const err = new notFoundError("report not found");
      return next(err);
    }
    const updated = await reportModel.findByIdAndUpdate(postId, {
      status: status,
    });
    await sendEmail({
      to: user.email,
      subject:
        "Your report has been reviewed and post will be taken down almost immediately we get more reports",
      text: `Hi ${user.username}, Thanks for reaching out to us`,
      html: `<h1>Welcome, ${user.username}!</h1><p>Thank you for your time.</p>`,
    }).catch((err) => {
      console.log(err);
    });
    return res.status(StatusCodes.ACCEPTED).json(updated);
  } catch (error) {
    next(err);
  }
};
export { deleteUser, deletePost, updatePost, deleteComment, updateReport };

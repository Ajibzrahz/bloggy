import { StatusCodes } from "http-status-codes";
import { notFoundError, unauthenticatedError } from "../errors/index.js";
import postModel from "../models/post.js";
import reportModel from "../models/report.js";

const reportPost = async (req, res, next) => {
  const { id } = req.user;
  const { postId } = req.query;
  const payload = req.body;
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      const err = new notFoundError("Post not found");
      return next(err);
    }

    const report = new reportModel({
      ...payload,
      reporter: id,
      post: postId,
    });
    const saveReport = await report.save();
    await sendEmail({
      to: user.email,
      subject: "Your report has been submitted",
      text: `Hi ${user.username}, Thanks for reaching out to us`,
      html: `<h1>Welcome, ${user.username}!</h1><p>Thank you for your time.</p>`,
    }).catch((err) => {
      console.log(err);
    });
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "reported", saveReport });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res) => {
  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({
      msg: "to delete your report you'll need to contact the admin 'ajibonaraheem@gmail.com' to take down your report, thanks for your time",
    });
};

export { reportPost, deleteReport };

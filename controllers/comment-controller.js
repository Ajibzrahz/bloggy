import { StatusCodes } from "http-status-codes";
import { notFoundError, unauthenticatedError } from "../errors/index.js";
import commentModel from "../models/comment.js";
import postModel from "../models/post.js";

const Comment = async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.query;
  const { id } = req.user;

  if (!id) {
    const err = new unauthenticatedError(
      "sorry, you cannot add comment until you login"
    );
    return next(err);
  }
  try {
    const Post = await postModel.findById(postId);
    if (!Post) {
      const err = new notFoundError("Post does not exist");
      return next(err);
    }

    const comment = new commentModel({
      content: content,
      post: postId,
      author: id,
    });
    const commented = await comment.save();

    const postInfo = await postModel.findById(postId);
    postInfo.comment.push(comment._id);
    await postInfo.save();

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "commented", comment: commented.content });
  } catch (error) {
    return next(error);
  }
};

const likeComment = async (req, res, next) => {
  const { id } = req.user;
  const { commentId } = req.query;

  try {
    const comment = await commentModel.findOne({ _id: commentId });
    if (!comment) {
      const err = new notFoundError("comment does not exist");
      return next(err);
    }

    const liked = await commentModel.findOne({
      _id: commentId,
      likes: { $in: [id] },
    });
    if (liked) {
      const unlike = await commentModel.findByIdAndUpdate(
        commentId,
        { $pull: { likes: id } },
        { new: true }
      );

      return res.status(StatusCodes.ACCEPTED).json({ unliked: unlike });
    }

    const likecomment = await commentModel.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: id } },
      { new: true }
    );

    return res.status(StatusCodes.ACCEPTED).json({ liked: likecomment });
  } catch (error) {
    next(error);
  }
};

export { Comment, likeComment };

import { StatusCodes } from "http-status-codes";
import {
  customApiError,
  unauthenticatedError,
  notFoundError,
} from "../errors/index.js";
import postModel from "../models/post.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import userModel from "../models/user.js";
import mongoose from "mongoose";

const createPost = async (req, res, next) => {
  const payload = req.body;
  const Media = req.files || [];
  const { id } = req.user;

  try {
    const uploadedFiles = [];
    for (const file of Media) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
      });
      uploadedFiles.push(uploaded.secure_url);

      fs.unlink(file.path);
    }

    const post = new postModel({
      ...payload,
      author: id,
      media: uploadedFiles,
    });
    const posted = await post.save();

    const user = await userModel.findById(id);
    user.posts.push(posted._id);
    await user.save();

    return res.status(StatusCodes.CREATED).json({ posted });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  const { id } = req.user;
  const { postId } = req.query;
  if (!id) {
    const err = new unauthenticatedError(
      "User must be logged in to like a post"
    );
    return next(err);
  }
  try {
    const liked = await postModel.findOne({
      _id: postId,
      likes: { $in: [id] },
    });
    if (liked) {
      const unlike = await postModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: id } },
        { new: true }
      );

      return res.status(StatusCodes.OK).json({ msg: "post unliked", unlike });
    }

    const like = await postModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: id } },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({ msg: "post liked", like });
  } catch (error) {
    return next(error);
  }
};
const getPost = async (req, res, next) => {
  const { postId } = req.query;
  try {
    const post = await postModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                username: 1,
                profilePics: 1,
                _id: 0,
              },
            },
          ],
          as: "likedBy",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comment",
          foreignField: "_id",
          pipeline: [
            { $project: { content: 1, author: 1 } },
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                pipeline: [{ $project: { username: 1, profilePics: 1 } }],
                as: "userInfo",
              },
            },
          ],
          as: "commentsInfo",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    if (!post) {
      const err = new notFoundError("Post does not exist");
      return next(err);
    }
   const newPost = await postModel.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.status(StatusCodes.OK).json(newPost);
  } catch (error) {
    return next(error);
  }
};

const getPosts = async (req, res, next) => {
  const { title } = req.query;
  try {
    const user = await postModel.aggregate([
      {
        $match: {
          title: {
            $regex: title,
            $options: "i",
          },
        },
      },
      {
        $sort: { title: 1 },
      },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

const savePost = async (req, res, next) => {
  const { id } = req.user;
  const { postId } = req.query;
  if (!id) {
    const err = new unauthenticatedError("login to save thid post");
    return next(err);
  }
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      const err = new notFoundError("post not found");
      return next(err);
    }

    const user = await userModel.findById(id);
    const saved = user.savedPost.includes(postId);
    if (saved) {
      await userModel.findByIdAndUpdate(id, {
        $pull: { savedPost: postId },
      });
      return res.status(StatusCodes.OK).json({ msg: " post unsaved" });
    }

    await userModel.findByIdAndUpdate(id, { $push: { savedPost: postId } });
    return res.status(StatusCodes.OK).json({ msg: "post saved" });
  } catch (error) {
    return next(error);
  }
};

export { createPost, likePost, getPost, getPosts, savePost };

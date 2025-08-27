import { StatusCodes } from "http-status-codes";
import userModel from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import {
  customApiError,
  badRequestError,
  notFoundError,
  unauthenticatedError,
} from "../errors/index.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { sendEmail } from "../utils/nodemailer.js";

// Registering a user
const register = async (req, res, next) => {
  const payload = req.body;
  const image = req.file?.path;

  try {
    const isExisting = await userModel.findOne({ email: payload.email });
    if (isExisting) {
      const err = new customApiError("Email already exist");
      err.statusCode = StatusCodes.CONFLICT;
      return next(err);
    }
    let result = null;

    if (image) {
      const uploading = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      result = uploading.secure_url;
      await fs.unlink(image);
    }

    const newUser = new userModel({
      ...payload,
      profilePics: result,
      email: payload.email.toLowerCase(),
    });
    const saveUser = await newUser.save();

    const token = saveUser.generateToken();

    await sendEmail({
      to: payload.email,
      subject: "You've successfully created an account on this blog🎉🎉",
      text: `Hi ${payload.username}, Thanks for registering`,
      html: `<h1>Welcome, ${payload.username}!</h1><p>Thanks for signing up.</p>`,
    }).catch((err) => {
      console.log(err);
    });
    return res
      .status(StatusCodes.OK)
      .cookie("userToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
      .json({
        user: saveUser,
        token,
      });
  } catch (error) {
    next(error);
  }
};

//User Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new notFoundError("Email not found");
      return next(err);
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      const err = new notFoundError("Incorrect email or password");
      return next(err);
    }

    const token = user.generateToken();

    res
      .status(StatusCodes.ACCEPTED)
      .cookie("userToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
      .json({ user: user.username, token });
  } catch (error) {
    next(error);
  }
};

//Logged in user updating profile
const updateProfile = async (req, res, next) => {
  const { id } = req.user;
  const payload = req.body;
  const image = req.file?.path;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    let result = null;
    if (image) {
      const uploading = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      result = uploading.secure_url;
      fs.unlink(image);
    }
    const updated = await userModel.findOneAndUpdate(
      { _id: id },
      { ...payload, profilePics: result, role: user.role },
      { new: true }
    );
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "updated", img: updated.profilePics });
  } catch (error) {
    next(error);
  }
};

//Logged in user getting profile
const getProfile = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await userModel
      .findById(id)
      .select("-password -role -__v -updatedAt")
      .populate("posts", "title details media");
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }
    if (id != user._id) {
      const err = new unauthenticatedError("Not authorized, Login!!!");
      return next(err);
    }

    res.status(StatusCodes.OK).json({
      followers: user.followers.length,
      following: user.following.length,
      posts: user.posts.length,
      saved: user.savedPost.length,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//Logged in user deleting profile
const deleteProfile = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      const err = new notFoundError("User not found");
      return next(err);
    }
    await userModel.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};

const allUsers = async (req, res, next) => {
  const { username } = req.query;
  try {
    const users = await userModel.aggregate([
      {
        $match: {
          username: {
            $regex: username,
            $options: "i",
          },
        },
      },
      {
        $project: {
          username: 1,
          _id: 0,
          profilePics: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
      { $limit: 20 },
    ]);
    return res.status(StatusCodes.OK).json({ user: users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const user = await userModel
      .findById(userId)
      .select("-password")
      .populate("posts", "details media likes ");

    if (!user && !mongoose.Types.ObjectId.isValid(user)) {
      const err = new notFoundError("User not found");
      return next(err);
    }

    return res.status(StatusCodes.OK).json({ user: user });
  } catch (error) {
    next(error);
  }
};

const follow = async (req, res, next) => {
  const { id } = req.user;
  const { userId } = req.query;

  if (!id) {
    const err = new unauthenticatedError(
      "You cannot follow until you are logged in"
    );
    return next(err);
  }
  if (id == userId) {
    const err = new badRequestError("You cannot follow yourself");
    return next(err);
  }
  try {
    const tofollow = await userModel.findById(userId);
    if (!tofollow) {
      const err = new notFoundError("user not found");
      return next(err);
    }
    const user = await userModel.findById(id);
    if (user.following.includes(userId)) {
      const err = new customApiError("Already following user");
      err.statusCode = StatusCodes.CONFLICT;
      return next(err);
    }

    await userModel.findByIdAndUpdate(id, { $push: { following: userId } });
    await userModel.findByIdAndUpdate(userId, { $push: { followers: id } });

    return res
      .status(StatusCodes.ACCEPTED)
      .json(`You have succesfully followed ${tofollow.username}`);
  } catch (error) {
    return next(error);
  }
};
const unfollow = async (req, res, next) => {
  const { id } = req.user;
  const { userId } = req.query;

  if (!id) {
    const err = new unauthenticatedError(
      "You cannot follow until you are logged in"
    );
    return next(err);
  }
  if (id == userId) {
    const err = new badRequestError("You cannot unfollow yourself");
    return next(err);
  }
  try {
    const toUnfollow = await userModel.findById(userId);
    if (!toUnfollow) {
      const err = new notFoundError("user not found");
      return next(err);
    }
    const user = await userModel.findById(id);
    if (!user.following.includes(userId)) {
      const err = new badRequestError("You were not following user before");
      return next(err);
    }
    await userModel.findByIdAndUpdate(id, { $pull: { following: userId } });
    await userModel.findByIdAndUpdate(userId, { $pull: { followers: id } });
    return res
      .status(StatusCodes.ACCEPTED)
      .json(`You have succesfully unfollowed ${toUnfollow.username}`);
  } catch (error) {
    return next(error);
  }
};

export {
  register,
  login,
  getProfile,
  deleteProfile,
  updateProfile,
  getUser,
  allUsers,
  follow,
  unfollow,
};

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: 50,
    },
    details: {
      type: String,
      minLength: 3,
      maxLength: 1000,
      required: true,
    },
    media: {
      type: [String],
    },
    views: {
      type: Number,
      default: 0
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    comment: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.model("Post", postSchema);
export default postModel;

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      maxLength: 255,
      required: true
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
      },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const commentModel = mongoose.model("Comment", commentSchema)
export default commentModel
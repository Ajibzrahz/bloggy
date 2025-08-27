import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      maxLenght: 255,
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const reportModel = mongoose.model("Report", reportSchema);
export default reportModel;

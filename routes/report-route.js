import express from "express";
import { deleteReport, reportPost } from "../controllers/report-controller.js";
import Authentication from "../middlewares/auth.js";

const reportRouter = express.Router();

reportRouter
  .route("/")
  .post(Authentication, reportPost)
  .delete(Authentication, deleteReport);
export default reportRouter;

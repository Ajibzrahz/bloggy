import { StatusCodes } from "http-status-codes";
import customApiError from "./custom.js";

class unauthenticatedError extends customApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
export default unauthenticatedError;

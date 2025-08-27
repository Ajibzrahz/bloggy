import { StatusCodes } from "http-status-codes";
import customApiError from "./custom.js";

class notFoundError extends customApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
export default notFoundError;

import { StatusCodes } from "http-status-codes";

const notFound = (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).send("route not found");
};

export default notFound;

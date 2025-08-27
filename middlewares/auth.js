import jwt from "jsonwebtoken";
import unauthenticatedError from "../errors/unauthenticated.js";

const Authentication = (req, res, next) => {
  const { userToken } = req.cookies;
  if (!userToken) {
    throw new unauthenticatedError("Invalid Token");
  }
  try {
    const decode = jwt.verify(userToken, process.env.JWT_SECRET);
    req.user = { id: decode.id, role: decode.role };

    next();
  } catch (error) {
    next(error);
  }
};
export default Authentication;

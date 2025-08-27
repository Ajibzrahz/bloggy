import {badRequestError} from '../errors/index.js'
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMassage = error.details.map((err) => err.message).join(",");
      return next(new badRequestError(errorMassage));
    }
    next();
  };
};

export default validateRequest;

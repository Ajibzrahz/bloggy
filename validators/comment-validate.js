import Joi from "joi";

const commentValidator = Joi.object({
  content: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.max": "comment cannot exceed 255 characters",
      "any.required": "content is required",
    }),
});

export default commentValidator

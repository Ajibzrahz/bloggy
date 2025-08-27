import Joi from "joi";

const postValidator = Joi.object({
  title: Joi.string().max(50).messages({
    "string.base": "title should be a string",
    "string.max": "title must not exceed 50 characters ",
  }),
  details: Joi.string().min(3).max(1000).required().messages({
    "string.base": "title should be a string",
    "string.min": "title must exceed 3 characters ",
    "string.max": "title must not exceed 1000 characters ",
    "any.required": "details is required",
  }),
  media: Joi.array().items(Joi.string().uri()).messages({
    "array.base": "files must be an array",
    "array.items": "invalid file format",
  }),
  views: Joi.number().min(0).messages({
    "number.base": "views can only be number",
    "number.min": "views cannot be less than 0"
  })
});

export { postValidator };

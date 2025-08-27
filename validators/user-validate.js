import Joi from "joi";

//Registration Validation
const registerValidation = Joi.object({
  username: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9@-_]+$/)
    .min(5)
    .max(255)
    .messages({
      "string.base": "name must be a string",
      "any.required": "name is required",
      "string.pattern.base":
        "username can only include letter, number, @, _ and -",
      "string.min": "name should exceed 5 characters",
      "string.max": "name must not exceed 255 characters",
    }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ng"] },
    })
    .required()
    .messages({
      "string.email": "Invalid Email Format",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9@_#$&!~]+$/)
    .min(8)
    .required()
    .messages({
      "string.pattern.base": "Invalid Pasword format",
      "any.required": "password is required",
      "string.min": "password must contain at least 8 characters ",
    }),
  role: Joi.string().valid("user", "admin").messages({
    "string.base": "role must be a string",
    "any.only": "role can either be user or admin",
  }),
  phone_number: Joi.string().required().messages({
    "any.required": "contact is required",
  }),
  profilePics: Joi.string().uri().messages({
    "string.uri": "picture must be a valid url",
  }),
  bio: Joi.string().max(500).messages({
    "string.max": "Bio cannot exceed 500 characters"
  })
});

//Login Validation
const loginValidation = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ng"] },
    })
    .required()
    .messages({
      "string.email": "Invalid Email Format",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9@_$#$&!~]+$/))
    .min(8)
    .required()
    .messages({
      "string.pattern.base": "Invalid Password format",
      "any.required": "password is required",
      "string.min": "password must contain at least 8 characters ",
    }),
});

//user UpdateValidation
const updateValidation = Joi.object({
  username: Joi.string().min(5).max(255).messages({
    "string.base": "name must be a string",
    "any.required": "name is required",
    "string.min": "name should exceed 5 characters",
    "string.max": "name must not exceed 255 characters",
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ng"] },
    })
    .messages({
      "string.email": "Invalid Email Format",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9@_$#$&!~]+$/)
    .min(8)
    .messages({
      "string.pattern.base": "Invalid Pasword format",
      "any.required": "password is required",
      "string.min": "password must contain at least 8 characters ",
    }),
  role: Joi.string().valid("user", "admin").messages({
    "string.base": "role must be a string",
    "any.only": "role can either be user or admin",
  }),
  phone_number: Joi.string().messages({
    "any.required": "contact is required",
  }),
  profilePics: Joi.string().uri().messages({
    "string.uri": "picture must be a valid url",
  }),
});

export { registerValidation, loginValidation, updateValidation };

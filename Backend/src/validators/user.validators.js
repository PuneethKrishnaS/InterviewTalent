import Joi from "joi";

const symbolRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

const userSchemaValidater = Joi.object({
  userName: Joi.object({
    first: Joi.string().min(3).max(50).trim().required().label("First name"),
    last: Joi.string().max(50).trim().optional().label("Last name"),
  })
    .required()
    .label("User name"),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email address"),

  password: Joi.string()
    .trim()
    .min(8)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[a-z]/, "lowercase letter")
    .pattern(symbolRegex, "special character")
    .required()
    .label("Password")
    .messages({
      "string.pattern.name": "Password must contain at least one {#name}",
      "string.min": "Password must be at least {#limit} characters long",
    }),
});

export { userSchemaValidater };

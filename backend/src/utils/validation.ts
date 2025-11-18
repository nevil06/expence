import Joi from 'joi';

export const userValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().max(100).required(),
});

export const expenseValidationSchema = Joi.object({
  userId: Joi.string().required(),
  categoryId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(500).required(),
  date: Joi.date().required(),
});

export const categoryValidationSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().max(100).required(),
  icon: Joi.string().optional(),
  color: Joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

export const settingsValidationSchema = Joi.object({
  userId: Joi.string().required(),
  currency: Joi.string().length(3).optional(),
  theme: Joi.string().valid('light', 'dark').optional(),
  notificationsEnabled: Joi.boolean().optional(),
  language: Joi.string().max(10).optional(),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
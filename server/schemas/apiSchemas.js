import Joi from 'joi';

/**
 * Joi Validation Schemas for SHIT OR HIT Express API
 */

export const entrySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be formatted as YYYY-MM-DD (e.g. 2026-09-12)',
      'any.required': 'Date is required'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be an integer between 1 and 5',
      'number.min': 'Rating cannot be less than 1',
      'number.max': 'Rating cannot be greater than 5',
      'any.required': 'Rating is required'
    }),
  verdict: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).max(20000).optional(),
  spheres: Joi.object().allow(null).optional(),
  calculatedScore: Joi.number().allow(null).optional(),
  anchors: Joi.object().allow(null).optional()
}).unknown(true); // Allow legacy or extended non-breaking metadata

export const monthlyReportQuerySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': 'Year must be a valid 4-digit number',
    'any.required': 'Year is required'
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12',
    'any.required': 'Month is required'
  }),
  archetypeId: Joi.string().allow('', null).optional(),
  preferredLanguage: Joi.string().valid('auto', 'english', 'hinglish').optional().default('auto')
}).unknown(true);

export const monthlyReportBodySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': 'Year must be a valid 4-digit number',
    'any.required': 'Year is required'
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12',
    'any.required': 'Month is required'
  }),
  customEntries: Joi.alternatives().try(Joi.array(), Joi.object()).allow(null).optional(),
  archetypeId: Joi.string().allow('', null).optional(),
  forceReevaluate: Joi.boolean().optional(),
  preferredLanguage: Joi.string().valid('auto', 'english', 'hinglish').optional().default('auto')
}).unknown(true);

export const aiEnhanceSchema = Joi.object({
  notes: Joi.string().allow('', null).max(20000).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  date: Joi.string().allow('', null).optional(),
  preferredLanguage: Joi.string().valid('auto', 'english', 'hinglish').optional().default('auto'),
  spheres: Joi.object().allow(null).optional(),
  customInstruction: Joi.string().allow('', null).max(5000).optional()
}).custom((value, helpers) => {
  const hasNotes = value.notes && typeof value.notes === 'string' && value.notes.trim().length > 0;
  const hasSpheres = value.spheres && typeof value.spheres === 'object' && Object.keys(value.spheres).length > 0;
  if (!hasNotes && !hasSpheres) {
    return helpers.message('Either non-empty notes or segmented sphere entries are required for AI reflection enhancement');
  }
  return value;
}).unknown(true);

export const bulkEntriesSchema = Joi.object({
  entries: Joi.object().required().messages({
    'any.required': 'Entries dictionary is required for bulk import'
  }),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional()
}).unknown(true);

export const aiAutopsySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  notes: Joi.string().allow('', null).optional(),
  spheres: Joi.object().allow(null).optional(),
  anchors: Joi.object().allow(null).optional(),
  recentHistory: Joi.array().allow(null).optional()
}).unknown(true);


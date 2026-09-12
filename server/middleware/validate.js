/**
 * Express Request Validation Middleware using Joi
 */

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        details: error.details.map(d => ({
          message: d.message,
          path: d.path
        }))
      });
    }
    req.body = value;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        details: error.details.map(d => ({
          message: d.message,
          path: d.path
        }))
      });
    }
    req.query = value;
    next();
  };
}

/**
 * Zod request validation middleware factory.
 * @param {import('zod').ZodSchema} schema  The Zod schema to validate against
 * @param {'body'|'query'|'params'} source  Which part of the request to validate
 */
export const validate = (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    // Replace raw data with parsed/coerced data
    req[source] = result.data;
    next();
  };

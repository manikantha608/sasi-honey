/**
 * Extract and normalise pagination parameters from query string.
 * @returns {{ page, limit, offset }}
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 12));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

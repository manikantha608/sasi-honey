/**
 * Format a number as Indian Rupees.
 * @param {number} amount  Amount in INR
 * @returns {string}  e.g. "₹1,299"
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// Manual validation helpers for input checking

// Check if phone number is valid Indian format
const isValidPhone = (phone) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Check if date is valid format (YYYY-MM-DD)
const isValidDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Check if time is valid format (HH:MM AM/PM)
const isValidTime = (time) => {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time);
};

module.exports = { isValidPhone, isValidDate, isValidTime };

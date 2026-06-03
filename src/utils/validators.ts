/**
 * Validates an email address.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password (minimum 6 characters, contains letters and numbers).
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long.',
    };
  }
  
  // Basic check for letters and numbers
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password should contain both letters and numbers.',
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates a phone number (simple check for 10-15 digits, allowing optional + at start).
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validates that a string value is not empty.
 */
export const validateRequired = (value: string, fieldName: string): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required.`;
  }
  return '';
};

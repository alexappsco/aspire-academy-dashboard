/**
 * Saudi Arabian Phone Number Validation Utilities
 *
 * SAR phone number patterns:
 * - Mobile: starts with 5 (5xxxxxxxx)
 * - Landline: starts with 1, 2, 4, 6, 7, 8, 9
 * - Total length: exactly 9 digits (excluding country code +966)
 * - Country code: +966
 */

// Regex patterns for different phone number formats
export const SAR_PHONE_REGEX = {
  // Basic 9-digit SAR phone number (without country code)
  BASIC: /^(5[0-9]{8}|[1246789][0-9]{8})$/,

  // SAR phone number with country code +966
  WITH_COUNTRY_CODE: /^\+966(5[0-9]{8}|[1246789][0-9]{8})$/,

  // SAR phone number with country code 966 (without +)
  WITH_COUNTRY_CODE_NO_PLUS: /^966(5[0-9]{8}|[1246789][0-9]{8})$/,

  // SAR phone number with optional country code
  OPTIONAL_COUNTRY_CODE: /^(\+?966)?(5[0-9]{8}|[1246789][0-9]{8})$/,
};

// Validation functions
export const validateSARPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;

  // Remove any spaces, dashes, or parentheses
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Check if it matches any of our patterns
  return Object.values(SAR_PHONE_REGEX).some((regex) => regex.test(cleanNumber));
};

export const validateSARPhoneBasic = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;

  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  return SAR_PHONE_REGEX.BASIC.test(cleanNumber);
};

export const validateSARPhoneWithCountryCode = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;

  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  return SAR_PHONE_REGEX.WITH_COUNTRY_CODE.test(cleanNumber);
};

// Formatting functions
export const formatSARPhone = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return phoneNumber;

  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // If it already has country code, return as is
  if (cleanNumber.startsWith('+966')) return cleanNumber;

  // If it has country code without +, add +
  if (cleanNumber.startsWith('966')) return `+${cleanNumber}`;

  // If it's just the basic number, add country code
  if (SAR_PHONE_REGEX.BASIC.test(cleanNumber)) return `+966${cleanNumber}`;

  return phoneNumber;
};

export const extractBasicNumber = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return phoneNumber;

  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Remove country code if present
  if (cleanNumber.startsWith('+966')) return cleanNumber.slice(4);
  if (cleanNumber.startsWith('966')) return cleanNumber.slice(3);

  return cleanNumber;
};

// Phone number type detection
export const getSARPhoneType = (phoneNumber: string): 'mobile' | 'landline' | 'invalid' => {
  if (!validateSARPhoneBasic(phoneNumber)) return 'invalid';

  const basicNumber = extractBasicNumber(phoneNumber);
  if (basicNumber.startsWith('5')) return 'mobile';
  return 'landline';
};

// Constants
export const SAR_PHONE_LENGTH = 9;
export const SAR_COUNTRY_CODE = '+966';
export const SAR_COUNTRY_CODE_NUMERIC = '966';

// Common SAR phone prefixes
export const SAR_PHONE_PREFIXES = {
  MOBILE: ['5'],
  LANDLINE: ['1', '2', '4', '6', '7', '8', '9'],
} as const;

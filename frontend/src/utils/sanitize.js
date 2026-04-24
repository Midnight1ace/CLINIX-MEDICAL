// Client-side sanitization utilities for XSS protection

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return text;
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize user input for safe display
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Escape HTML entities
  let sanitized = escapeHtml(input);
  
  // Remove/nullify dangerous URLs (prevent XSS in href/src attributes)
  sanitized = sanitized.replace(
    /(javascript:|data:|vbscript:|file:|about:)/gi,
    ''
  );
  
  return sanitized;
}

/**
 * Sanitize HTML attributes to prevent XSS
 * @param {string} attrValue - Attribute value to sanitize
 * @returns {string} - Sanitized attribute value
 */
export function sanitizeAttribute(attrValue) {
  if (typeof attrValue !== 'string') {
    return attrValue;
  }
  
  // Escape quotes and remove dangerous protocols
  let sanitized = attrValue
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(
      /(javascript:|data:|vbscript:|file:|about:)/gi,
      ''
    );
  
  return sanitized;
}

/**
 * Deep sanitize an object (recursively sanitize all string properties)
 * @param {Object|Array} obj - Object or array to sanitize
 * @returns {Object|Array} - Sanitized object or array
 */
export function deepSanitize(obj) {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = deepSanitize(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize filename for safe storage
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return '';
  }
  
  // Remove dangerous characters
  let sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, ''); // Remove control characters
  
  // Limit length
  if (sanitized.length > 255) {
    const parts = sanitized.split('.');
    if (parts.length > 1) {
      const ext = parts.pop();
      const name = parts.join('.');
      sanitized = name.slice(0, 255 - ext.length - 1) + '.' + ext;
    } else {
      sanitized = sanitized.slice(0, 255);
    }
  }
  
  return sanitized.trim();
}
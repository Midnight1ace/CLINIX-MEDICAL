// Client-side encryption utilities for localStorage protection
// Uses AES-256-GCM encryption via Web Crypto API

const ENCRYPTION_KEY_NAME = "clinix-encryption-key";

/**
 * Generate or retrieve encryption key from localStorage
 * @returns {Promise<CryptoKey>} - Encryption key
 */
async function getEncryptionKey() {
  if (typeof window === 'undefined' || !window.crypto) {
    throw new Error('Web Crypto API not available');
  }

  // Try to get existing key from localStorage
  const keyData = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (keyData) {
    try {
      const keyBuffer = new Uint8Array(JSON.parse(keyData));
      return await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to import encryption key, generating new one:', error);
    }
  }

  // Generate new key
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Extract key bytes and store in localStorage
  const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
  const keyArray = Array.from(new Uint8Array(keyBuffer));
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(keyArray));

  return key;
}

/**
 * Encrypt data using AES-GCM
 * @param {string} data - Data to encrypt
 * @returns {Promise<Object>} - Encrypted data with iv and tag
 */
export async function encryptData(data) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }

  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encodedData = new TextEncoder().encode(data);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedBuffer))
  };
}

/**
 * Decrypt data using AES-GCM
 * @param {Object} encryptedData - Object with iv and data arrays
 * @returns {Promise<string>} - Decrypted data
 */
export async function decryptData(encryptedData) {
  if (!encryptedData || !encryptedData.iv || !encryptedData.data) {
    throw new Error('Invalid encrypted data format');
  }

  const key = await getEncryptionKey();
  const iv = new Uint8Array(encryptedData.iv);
  const encryptedBuffer = new Uint8Array(encryptedData.data);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Failed to decrypt data: ' + error.message);
  }
}

/**
 * Securely store data in localStorage with encryption
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON.stringify'd if not string)
 * @returns {Promise<void>}
 */
export async function secureSetItem(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const encrypted = await encryptData(value);
    localStorage.setItem(key, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to securely store item:', error);
    // Fallback to unencrypted storage for backward compatibility
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

/**
 * Securely retrieve data from localStorage with decryption
 * @param {string} key - Storage key
 * @returns {Promise<*>} - Decrypted value or null if not found/invalid
 */
export async function secureGetItem(key) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const encryptedData = localStorage.getItem(key);
  if (!encryptedData) {
    return null;
  }

  try {
    const parsed = JSON.parse(encryptedData);
    // Check if it's our encrypted format
    if (parsed.iv && parsed.data) {
      return await decryptData(parsed);
    }
    // Fallback: treat as unencrypted data (backward compatibility)
    return parsed;
  } catch (error) {
    console.warn('Failed to decrypt item, returning raw value:', error);
    // Return raw value as fallback
    try {
      return JSON.parse(encryptedData);
    } catch (e) {
      return encryptedData;
    }
  }
}

/**
 * Securely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {void}
 */
export function secureRemoveItem(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key);
  }
}

/**
 * Check if browser supports required crypto features
 * @returns {boolean}
 */
export function isCryptoAvailable() {
  return typeof window !== 'undefined' && 
         window.crypto && 
         window.crypto.subtle &&
         typeof window.crypto.subtle.importKey === 'function';
}
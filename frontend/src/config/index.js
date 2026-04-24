// Application-wide constants and configuration
export const APP_NAME = "CLINIX";
export const APP_DESCRIPTION = "Multi-agent clinical workflow engine";

export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
} as const;

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
} as const;

export const STATUS_TYPES = {
  STABLE: "stable",
  WATCH: "watch",
  URGENT: "urgent",
  CRITICAL: "critical"
} as const;

export const STORAGE_KEYS = {
  PATIENTS: "clinix_patients_v1",
  AUTH_TOKEN: "clinix_auth_token",
  ENCRYPTION_KEY: "clinix-encryption-key"
};

export const API_CONFIG = {
  DEFAULT_BASE_URL: "http://localhost:8000",
  ENDPOINTS: {
    ANALYZE: "/api/analyze"
  }
};

export const CLINICAL_CONFIG = {
  DEFAULT_ALERT_THRESHOLD: 2,
  SIMULATION_INTERVAL_MS: 20000,
  MAX_SAMPLE_NOTES: 4
};

// Re-export route constants
export { ROUTES, NAV_SECTIONS } from './routes.js';

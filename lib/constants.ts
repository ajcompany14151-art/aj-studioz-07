// This is used for timing-safe password comparison when user doesn't exist
// Use a static dummy password to avoid importing bcrypt in Edge Runtime
export const DUMMY_PASSWORD = "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG";

// Check if we're in development environment
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";

// Regex to match guest user emails
export const guestRegex = /^guest-\d+$/;

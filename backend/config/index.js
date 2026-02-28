require('dotenv').config();

/**
 * Centralized configuration and environment validation
 * Ensures all required variables are present and valid
 */

const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopease',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shopease-test',

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '1h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',

  // Frontend URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  frontendUrlProd: process.env.FRONTEND_URL_PROD || 'https://shopease.example.com',

  // Email
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  notifyEmail: process.env.NOTIFY_EMAIL,

  // Payment Gateways
  flutterwave: {
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
    secretHash: process.env.FLUTTERWAVE_SECRET_HASH
  },
  paystack: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    secretKey: process.env.PAYSTACK_SECRET_KEY
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/shopease.log'
};

/**
 * Validate required environment variables
 * Throws error if any required variables are missing
 */
function validateConfig() {
  const required = [
    'jwtSecret',
    'jwtRefreshSecret',
    'mongodbUri'
  ];

  // Additional requirements in production
  const productionRequired = [
    'emailUser',
    'emailPass',
    'notifyEmail',
    'frontendUrlProd'
  ];

  const env = config.isProduction ? [...required, ...productionRequired] : required;

  const missing = env.filter(key => !config[key.split('.')[0]]);

  if (missing.length > 0) {
    throw new Error(
      `FATAL ERROR: Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please set these variables in your .env file or environment.\n` +
      `See .env.example for reference.`
    );
  }

  console.log(`✅ Configuration validated for ${config.nodeEnv} environment`);
}

// Validate on module load
validateConfig();

module.exports = config;

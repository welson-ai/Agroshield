import pino from "pino";

// AgroShield logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export default logger;

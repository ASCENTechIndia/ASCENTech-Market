const winston = require("winston");
require("winston-daily-rotate-file");

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const createTransport = (filename, level) =>
  new winston.transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d", // Keep logs for 14 days
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat
    ),
  });

const logger = winston.createLogger({
  transports: [
    createTransport("performance", "info"),
    createTransport("error", "error"),
  ],
});

// Optional: log to console in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    })
  );
}

module.exports = logger;

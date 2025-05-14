import winston from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

// Define the directory where log files will be stored
const logsDir = path.resolve("logs");

// Create a custom format for logs
// Includes a timestamp and formats the log message with the log level
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

// Create a logger for error logs
// Logs errors to a daily rotating file and the console
const errorLogger = winston.createLogger({
  level: "error", // Only log messages with "error" level
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, "error-%DATE%.log"), // File name pattern
      datePattern: "YYYY-MM-DD", // Rotate logs daily
      maxFiles: "14d", // Keep logs for the last 14 days
    }),
    new winston.transports.Console(), // Also log to the console
  ],
});

// Create a logger for action logs
// Logs general actions (e.g., successful operations) to a daily rotating file and the console
const actionLogger = winston.createLogger({
  level: "info", // Only log messages with "info" level
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, "action-%DATE%.log"), // File name pattern
      datePattern: "YYYY-MM-DD", // Rotate logs daily
      maxFiles: "14d", // Keep logs for the last 14 days
    }),
    new winston.transports.Console(), // Also log to the console
  ],
});

// Create a logger for traffic logs
// Logs incoming HTTP requests (e.g., IP address and endpoint) to a daily rotating file and the console
const trafficLogger = winston.createLogger({
  level: "info", // Only log messages with "info" level
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, "traffic-%DATE%.log"), // File name pattern
      datePattern: "YYYY-MM-DD", // Rotate logs daily
      maxFiles: "14d", // Keep logs for the last 14 days
    }),
    new winston.transports.Console(), // Also log to the console
  ],
});

// Function to log error messages
// Uses the errorLogger to log messages with "error" level
export function logError(message) {
  errorLogger.error(message);
}

// Function to log general actions
// Uses the actionLogger to log messages with "info" level
export function logAction(message) {
  actionLogger.info(message);
}

// Function to log HTTP traffic
// Logs the IP address and endpoint of incoming requests
export function logTraffic(ipAddress, endpoint) {
  const message = `Request to ${endpoint} from IP: ${ipAddress}`;
  trafficLogger.info(message);
}

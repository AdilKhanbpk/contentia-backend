import { createLogger, format, transports } from "winston";
import os from "os";
const { combine, timestamp, printf, colorize, json } = format;

const consoleLogFormat = printf(({ timestamp, level, message, ...meta }) => {
    const host = os.hostname();
    const pid = process.pid;
    const emoji = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
    return `${emoji} [${timestamp}] [${host}:${pid}] ${level}: ${message} ${
        Object.keys(meta).length ? `| Meta-Data: ${JSON.stringify(meta)}` : ""
    }`;
});

const logger = createLogger({
    level: "info",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
    transports: [
        new transports.Console({
            format: combine(colorize(), consoleLogFormat),
        }),
        new transports.File({
            filename: "app.log",
            format: combine(timestamp(), json()),
        }),
    ],
});

export default logger;

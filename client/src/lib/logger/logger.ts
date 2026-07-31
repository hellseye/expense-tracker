type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  private static isProduction = process.env.NODE_ENV === "production";

  private static log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };

    if (this.isProduction) {
      // Structured JSON logging in production (essential for Datadog, GCP Logs, AWS Cloudwatch)
      console.log(JSON.stringify(payload));
    } else {
      // Human-readable pretty printing in development
      const colorMap = {
        debug: "\x1b[36m[DEBUG]\x1b[0m",
        info: "\x1b[32m[INFO]\x1b[0m",
        warn: "\x1b[33m[WARN]\x1b[0m",
        error: "\x1b[31m[ERROR]\x1b[0m",
      };
      const prefix = colorMap[level] || `[${level.toUpperCase()}]`;
      const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
      console.log(`${prefix} ${timestamp} - ${message}${metaString}`);
    }
  }

  static debug(message: string, meta?: Record<string, any>) {
    this.log("debug", message, meta);
  }

  static info(message: string, meta?: Record<string, any>) {
    this.log("info", message, meta);
  }

  static warn(message: string, meta?: Record<string, any>) {
    this.log("warn", message, meta);
  }

  static error(message: string, error?: Error | any, meta?: Record<string, any>) {
    const errorMeta = error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          ...meta,
        }
      : meta;
    this.log("error", message, errorMeta);
  }
}

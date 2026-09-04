type LogContext = Record<string, unknown>;

function write(level: "debug" | "info" | "warn" | "error", message: string, context?: LogContext) {
  const entry = { level, message, ...(context ? { context } : {}) };

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  if (level === "info") {
    console.info(entry);
    return;
  }

  console.debug(entry);
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

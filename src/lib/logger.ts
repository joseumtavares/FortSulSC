type LogContext = Record<string, string | number | boolean | undefined>

function write(level: 'info' | 'error', event: string, context?: LogContext): void {
  const payload = context ? { event, ...context } : { event }
  console[level](JSON.stringify(payload))
}

export const logger = {
  info(event: string, context?: LogContext): void {
    write('info', event, context)
  },
  error(event: string, context?: LogContext): void {
    write('error', event, context)
  },
}

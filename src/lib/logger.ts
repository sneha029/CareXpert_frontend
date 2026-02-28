/**
 * Production-safe logger utility
 * - Development: Logs to browser console
 * - Production: Silently discards logs (prevents sensitive data exposure)
 * - Never logs user objects, tokens, or sensitive auth data
 */

type LogContext = Record<string, unknown>;

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug level - development only
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Info level - development only
   */
  info(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, context);
    }
  }

  /**
   * Warning level - development only
   */
  warn(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Error level - development logs to console, production silently ignored
   * In production, integrate with error monitoring service (Sentry, LogRocket, etc.)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      // TODO: Send to monitoring service in production
      // Sentry.captureException(error, { extra: context });
      // LogRocket.captureException(error);
    }
  }

  /**
   * Trace level - development only, for detailed flow tracking
   */
  trace(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.trace(`[TRACE] ${message}`, context);
    }
  }
}

export const logger = new Logger();

/**
 * Structured Logging Utility
 * 
 * Provides structured logging for authentication and application events
 * with proper context and no sensitive data exposure.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  email?: string;
  action?: string;
  table?: string;
  operation?: string;
  errorCode?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;
    delete sanitized.apiKey;
    
    // Mask email partially
    if (sanitized.email) {
      const [local, domain] = sanitized.email.split('@');
      if (local && domain) {
        sanitized.email = `${local.substring(0, 2)}***@${domain}`;
      }
    }
    
    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitizeContext(context) : {};
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitizedContext,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    } else {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    } else {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context || '');
    } else {
      console.error(this.formatMessage('error', message, context));
    }
  }

  // Specialized logging methods for common scenarios

  authEvent(event: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, { ...context, category: 'auth' });
  }

  authError(event: string, error: any, context?: LogContext): void {
    this.error(`Auth Error: ${event}`, {
      ...context,
      category: 'auth',
      errorCode: error?.code,
      errorMessage: error?.message,
    });
  }

  rlsViolation(table: string, operation: string, context?: LogContext): void {
    this.warn('RLS Policy Violation', {
      ...context,
      category: 'security',
      table,
      operation,
    });
  }

  profileEvent(event: string, context?: LogContext): void {
    this.info(`Profile: ${event}`, { ...context, category: 'profile' });
  }

  sessionEvent(event: string, context?: LogContext): void {
    this.info(`Session: ${event}`, { ...context, category: 'session' });
  }

  databaseOperation(operation: string, table: string, duration?: number, context?: LogContext): void {
    this.debug(`DB: ${operation} on ${table}`, {
      ...context,
      category: 'database',
      operation,
      table,
      duration,
    });
  }

  performanceMetric(metric: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, {
      ...context,
      category: 'performance',
      duration,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logAuthEvent = (event: string, context?: LogContext) => logger.authEvent(event, context);
export const logAuthError = (event: string, error: any, context?: LogContext) => logger.authError(event, error, context);
export const logRLSViolation = (table: string, operation: string, context?: LogContext) => logger.rlsViolation(table, operation, context);
export const logProfileEvent = (event: string, context?: LogContext) => logger.profileEvent(event, context);
export const logSessionEvent = (event: string, context?: LogContext) => logger.sessionEvent(event, context);
export const logDatabaseOperation = (operation: string, table: string, duration?: number, context?: LogContext) => logger.databaseOperation(operation, table, duration, context);
export const logPerformanceMetric = (metric: string, duration: number, context?: LogContext) => logger.performanceMetric(metric, duration, context);

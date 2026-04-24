// Frontend Logger - Captures all frontend activity and sends to backend
class FrontendLogger {
  constructor() {
    this.sessionId = null;
    this.logBuffer = [];
    this.isSending = false;
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.originalConsole = {};
    this.backendUrl = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }
    
    this.initialized = true;
    this.backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Get or create session ID
    this.sessionId = this._getSessionId();
    
    // Start intercepting console methods
    this._interceptConsole();
    
    // Intercept fetch requests
    this._interceptFetch();
    
    // Intercept errors
    this._interceptErrors();
    
    // Start periodic flush
    this._startFlushInterval();
    
    // Log session start
    this.info('Session started', { 
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem('logger_session_id');
    if (!sessionId) {
      sessionId = new Date().toISOString().replace(/[:.]/g, '-') + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('logger_session_id', sessionId);
    }
    return sessionId;
  }

  _interceptConsole() {
    const methods = ['log', 'error', 'warn', 'info', 'debug'];
    
    methods.forEach(method => {
      this.originalConsole[method] = console[method];
      
      console[method] = (...args) => {
        // Call original console method
        this.originalConsole[method].apply(console, args);
        
        // Log to our logger
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        this._addToBuffer(method.toUpperCase(), message);
      };
    });
  }

  _interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      const startTime = Date.now();
      
      this.info('Fetch request', {
        url,
        method: options.method || 'GET',
        headers: options.headers
      });
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.info('Fetch response', {
          url,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.error('Fetch error', {
          url,
          error: error.message,
          duration: `${duration}ms`
        });
        
        throw error;
      }
    };
  }

  _interceptErrors() {
    window.addEventListener('error', (event) => {
      this.error('Global error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });
  }

  _addToBuffer(level, message, extra = {}) {
    if (typeof window === 'undefined') {
      return;
    }
    
    this.logBuffer.push({
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      ...extra
    });

    if (this.logBuffer.length >= this.batchSize) {
      this.flush();
    }
  }

  _startFlushInterval() {
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  async flush(synchronous = false) {
    if (this.isSending || this.logBuffer.length === 0) {
      return;
    }

    this.isSending = true;
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const sendMethod = synchronous ? 'sendBeacon' : 'fetch';
      
      if (synchronous && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ logs: logsToSend })], { type: 'application/json' });
        navigator.sendBeacon(`${this.backendUrl}/api/logger/frontend-logs`, blob);
      } else {
        await fetch(`${this.backendUrl}/api/logger/frontend-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend })
        });
      }
    } catch (error) {
      // Restore logs to buffer if send failed
      this.logBuffer = [...logsToSend, ...this.logBuffer];
    } finally {
      this.isSending = false;
    }
  }

  // Public logging methods
  debug(message, extra = {}) {
    this._addToBuffer('DEBUG', message, extra);
  }

  info(message, extra = {}) {
    this._addToBuffer('INFO', message, extra);
  }

  warn(message, extra = {}) {
    this._addToBuffer('WARN', message, extra);
  }

  error(message, extra = {}) {
    this._addToBuffer('ERROR', message, extra);
  }

  // Log user actions
  logAction(action, details = {}) {
    this.info(`User action: ${action}`, details);
  }

  // Log component lifecycle
  logComponentMount(componentName, props = {}) {
    this.debug(`Component mounted: ${componentName}`, { props });
  }

  logComponentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }
}

// Create singleton instance but don't initialize yet
const frontendLogger = new FrontendLogger();

// Export logger methods (safe for SSR)
export const initLogger = () => frontendLogger.init();

export const logDebug = (message, extra) => {
  if (frontendLogger.initialized) frontendLogger.debug(message, extra);
};

export const logInfo = (message, extra) => {
  if (frontendLogger.initialized) frontendLogger.info(message, extra);
};

export const logWarn = (message, extra) => {
  if (frontendLogger.initialized) frontendLogger.warn(message, extra);
};

export const logError = (message, extra) => {
  if (frontendLogger.initialized) frontendLogger.error(message, extra);
};

export const logAction = (action, details) => {
  if (frontendLogger.initialized) frontendLogger.logAction(action, details);
};

export const logComponentMount = (name, props) => {
  if (frontendLogger.initialized) frontendLogger.logComponentMount(name, props);
};

export const logComponentUnmount = (name) => {
  if (frontendLogger.initialized) frontendLogger.logComponentUnmount(name);
};

export const flushLogs = () => {
  if (frontendLogger.initialized) frontendLogger.flush();
};

export default frontendLogger;

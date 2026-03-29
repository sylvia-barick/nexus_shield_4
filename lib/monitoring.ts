type LogLevel = "info" | "performance" | "error";

interface MonitorLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  duration?: number;
}

class MonitoringService {
  private logs: MonitorLog[] = [];

  log(level: LogLevel, message: string, data?: any, duration?: number) {
    const entry: MonitorLog = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        duration
    };
    this.logs.push(entry);
    
    // In a real app, this would send to Sentry/Datadog/etc.
    console.log(`[MONITOR][${level.toUpperCase()}] ${message}`, data || "");
    
    // Performance logging
    if (level === "performance" && duration) {
        console.debug(`[MONITOR] Done in ${duration.toFixed(2)}ms`);
    }
  }

  startTimer(label: string) {
    const start = performance.now();
    return () => {
        const end = performance.now();
        const duration = end - start;
        this.log("performance", `${label} completed`, {}, duration);
    };
  }

  getLogs() {
    return this.logs;
  }
}

export const monitoring = new MonitoringService();

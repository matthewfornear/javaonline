/**
 * Logging System for the game
 * Outputs logs to /log/ directory with datetime stamps
 */
class Logger {
    constructor() {
        this.logDir = 'log/';
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        this.currentLevel = this.logLevels.INFO;
        this.logBuffer = [];
        this.maxBufferSize = 100;
    }

    /**
     * Set the minimum log level
     * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
     */
    setLevel(level) {
        this.currentLevel = this.logLevels[level] || this.logLevels.INFO;
    }

    /**
     * Get current timestamp for log entries
     * @returns {string} Formatted timestamp
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').replace('Z', '');
    }

    /**
     * Get log filename with datetime
     * @returns {string} Log filename
     */
    getLogFilename() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        return `log_${dateStr}_${timeStr}.txt`;
    }

    /**
     * Write log entry to buffer and optionally to file
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    log(level, message, data = null) {
        const levelNum = this.logLevels[level];
        if (levelNum < this.currentLevel) return;

        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data: data ? JSON.stringify(data, null, 2) : null
        };

        // Add to buffer
        this.logBuffer.push(logEntry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift(); // Remove oldest entry
        }

        // Format for console
        const consoleMessage = `[${timestamp}] ${level}: ${message}`;
        if (data) {
            console.log(consoleMessage, data);
        } else {
            console.log(consoleMessage);
        }

        // Write to file (in browser, this will trigger download)
        this.writeToFile(logEntry);
    }

    /**
     * Write log entry to localStorage and console
     * @param {Object} logEntry - Log entry object
     */
    writeToFile(logEntry) {
        try {
            // Store in localStorage for persistence
            const logKey = `game_log_${new Date().toISOString().split('T')[0]}`;
            const existingLogs = JSON.parse(localStorage.getItem(logKey) || '[]');
            existingLogs.push(logEntry);
            
            // Keep only last 1000 entries per day
            if (existingLogs.length > 1000) {
                existingLogs.splice(0, existingLogs.length - 1000);
            }
            
            localStorage.setItem(logKey, JSON.stringify(existingLogs));
        } catch (error) {
            console.error('Failed to write log to localStorage:', error);
        }
    }

    /**
     * Format log entry for file output
     * @param {Object} logEntry - Log entry object
     * @returns {string} Formatted log entry
     */
    formatLogEntry(logEntry) {
        let content = `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`;
        if (logEntry.data) {
            content += `\nData: ${logEntry.data}`;
        }
        content += '\n' + '='.repeat(80) + '\n';
        return content;
    }

    /**
     * Get all buffered log entries
     * @returns {Array} Array of log entries
     */
    getLogs() {
        return [...this.logBuffer];
    }

    /**
     * Clear log buffer
     */
    clearLogs() {
        this.logBuffer = [];
    }

    /**
     * View logs in console without downloading
     */
    viewLogs() {
        try {
            const logKey = `game_log_${new Date().toISOString().split('T')[0]}`;
            const storedLogs = JSON.parse(localStorage.getItem(logKey) || '[]');
            
            console.group('📋 Game Logs');
            storedLogs.forEach(entry => {
                const message = `[${entry.timestamp}] ${entry.level}: ${entry.message}`;
                if (entry.data) {
                    console.log(message, JSON.parse(entry.data));
                } else {
                    console.log(message);
                }
            });
            console.groupEnd();
            
            logger.info(`Displayed ${storedLogs.length} log entries in console`);
        } catch (error) {
            logger.error('Failed to view logs:', error);
        }
    }

    /**
     * Export all logs as a single file
     */
    exportAllLogs() {
        try {
            // Get logs from localStorage for the current day
            const logKey = `game_log_${new Date().toISOString().split('T')[0]}`;
            const storedLogs = JSON.parse(localStorage.getItem(logKey) || '[]');
            const allLogs = storedLogs.map(entry => this.formatLogEntry(entry)).join('\n');
            
            const blob = new Blob([allLogs], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `game_logs_${this.getTimestamp().replace(/[: ]/g, '-')}.txt`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            logger.info('Logs exported successfully');
        } catch (error) {
            logger.error('Failed to export logs:', error);
        }
    }

    // Convenience methods
    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
    }
}

// Create global logger instance
window.logger = new Logger();

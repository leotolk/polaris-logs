import winston = require("winston");
import {LogstashTransport} from "winston-logstash-transport";

export class WinstonLogger {
    private readonly logger;

    constructor(logstashHost: string, logstashPort: number) {
        const consoleFormat = WinstonLogger.getConsoleFormat();
        const logstashFormat = WinstonLogger.getLogstashFormat();
        const customLevels = WinstonLogger.getCustomLevels();

        this.logger = winston.createLogger({
            level: 'trace',
            levels: customLevels.levels,
            format: winston.format.json(),
            transports: [
                new LogstashTransport({host: logstashHost, port: logstashPort, format: logstashFormat})
            ],
            exitOnError: false, // do not exit on handled exceptions
        });

        winston.addColors(customLevels.colors);
        this.logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                consoleFormat)
        }));
    }

    private static getConsoleFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf((info) => {
                const {
                    timestamp, level, message, ...args
                } = info;

                const ts = timestamp.slice(0, 19).replace('T', ' ');
                return `${ts} [${level}]: ${message}\n${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
            }));
    }

    private static getLogstashFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf((info) => {
                return JSON.stringify(info, null, 2);
            }));
    }

    private static getCustomLevels() {
        return {
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                debug: 3,
                trace: 4
            },
            colors: {
                error: 'red',
                warn: 'yellow',
                info: 'green',
                trace: 'magenta',
                debug: 'blue',
            }
        };
    }

    public getLogger() {
        return this.logger;
    }
}

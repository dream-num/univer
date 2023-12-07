/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createIdentifier } from '@wendellhu/redi';

import { Disposable } from '../../shared/lifecycle';

export enum LogLevel {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    VERBOSE = 3,
}

export interface ILogService {
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;

    setLogLevel(enabled: LogLevel): void;
}

export const ILogService = createIdentifier<ILogService>('univer.log');

export class DesktopLogService extends Disposable implements ILogService {
    private _logLevel: LogLevel = LogLevel.SILENT;

    log(...args: any[]): void {
        if (this._logLevel >= LogLevel.VERBOSE || !args.length) {
            return;
        }

        const firstArg = args[0];
        const withTag = /^\[(.*?)\]/g.test(firstArg);
        if (withTag) {
            console.log(`\x1B[97;104m${firstArg}\x1B[0m:`, ...args.slice(1));
        } else {
            console.log(...args);
        }
    }

    warn(...args: any[]): void {
        if (this._logLevel >= LogLevel.WARN) {
            console.warn(...args);
        }
    }

    error(...args: any[]): void {
        if (this._logLevel >= LogLevel.ERROR) {
            console.error(...args);
        }
    }

    setLogLevel(logLevel: LogLevel): void {
        this._logLevel = logLevel;
    }
}

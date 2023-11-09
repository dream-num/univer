/* eslint-disable @typescript-eslint/no-explicit-any */

import { createIdentifier } from '@wendellhu/redi';

import { Disposable } from '../../shared/lifecycle';

export interface ILogService {
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;

    toggleLogEnabled(enabled: boolean): void;
    getLogEnabled(): boolean;
}

export const ILogService = createIdentifier<ILogService>('univer.log');

export class DesktopLogService extends Disposable implements ILogService {
    private logEnabled = true;

    log(...args: any[]): void {
        if (!this.logEnabled || !args.length) {
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
        if (this.logEnabled) {
            console.warn(...args);
        }
    }

    error(...args: any[]): void {
        if (this.logEnabled) {
            console.error(...args);
        }
    }

    toggleLogEnabled(enabled: boolean): void {
        this.logEnabled = enabled;
    }

    getLogEnabled(): boolean {
        return this.logEnabled;
    }
}

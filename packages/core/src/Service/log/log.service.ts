/* eslint-disable @typescript-eslint/no-explicit-any */

import { createIdentifier } from '@wendellhu/redi';
import { Disposable } from '../../Shared/Lifecycle';

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
        if (this.logEnabled) {
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

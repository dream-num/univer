/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        if (this._logLevel < LogLevel.VERBOSE || !args.length) {
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

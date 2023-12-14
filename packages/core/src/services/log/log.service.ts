/**
 * Copyright 2023-present DreamNum Inc.
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

import { createIdentifier } from '@wendellhu/redi';

import { Disposable } from '../../shared/lifecycle';

export enum LogLevel /* eslint-disable no-magic-numbers */ {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    VERBOSE = 3,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArgsType = any[];

export interface ILogService {
    log(...args: ArgsType): void;
    warn(...args: ArgsType): void;
    error(...args: ArgsType): void;

    setLogLevel(enabled: LogLevel): void;
}

export const ILogService = createIdentifier<ILogService>('univer.log');

export class DesktopLogService extends Disposable implements ILogService {
    private _logLevel: LogLevel = LogLevel.SILENT;

    log(...args: ArgsType): void {
        if (this._logLevel < LogLevel.VERBOSE || !args.length) {
            return;
        }

        const firstArg = args[0];
        const withTag = /^\[(.*?)\]/g.test(firstArg);
        if (withTag) {
            /* eslint-disable-next-line no-console */
            console.log(`\x1B[97;104m${firstArg}\x1B[0m:`, ...args.slice(1));
        } else {
            /* eslint-disable-next-line no-console */
            console.log(...args);
        }
    }

    warn(...args: ArgsType): void {
        if (this._logLevel >= LogLevel.WARN) {
            /* eslint-disable-next-line no-console */
            console.warn(...args);
        }
    }

    error(...args: ArgsType): void {
        if (this._logLevel >= LogLevel.ERROR) {
            /* eslint-disable-next-line no-console */
            console.error(...args);
        }
    }

    setLogLevel(logLevel: LogLevel): void {
        this._logLevel = logLevel;
    }
}

/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopLogService, LogLevel } from '../log.service';

describe('DesktopLogService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should respect log level thresholds', () => {
        const service = new DesktopLogService();
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service.setLogLevel(LogLevel.WARN);
        service.debug('debug');
        service.log('log');
        service.warn('warn');
        service.error('error');

        expect(debugSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith('warn');
        expect(errorSpy).toHaveBeenCalledWith('error');
    });

    it('should format tagged messages when logging', () => {
        const service = new DesktopLogService();
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        service.log('[core]', 'message');

        expect(logSpy).toHaveBeenCalledWith('\x1B[97;104m[core]\x1B[0m', 'message');
    });

    it('should deduplicate deprecate logs and clear cache on dispose', () => {
        const service = new DesktopLogService();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service.deprecate('[deprecated]', { key: 'value' });
        service.deprecate('[deprecated]', { key: 'value' });

        expect(errorSpy).toHaveBeenCalledTimes(1);

        service.dispose();
        service.deprecate('[deprecated]', { key: 'value' });

        expect(errorSpy).toHaveBeenCalledTimes(2);
    });

    it('should suppress all output at silent level', () => {
        const service = new DesktopLogService();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service.setLogLevel(LogLevel.SILENT);
        service.warn('warn');
        service.error('error');
        service.deprecate('deprecated');

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
    });
});

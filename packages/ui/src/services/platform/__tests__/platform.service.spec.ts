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

import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IPlatformService, PlatformService } from '../platform.service';

function createService(): IPlatformService {
    const injector = new Injector();
    injector.add([IPlatformService, { useClass: PlatformService }]);
    return injector.get(IPlatformService);
}

describe('PlatformService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should detect Mac platform by appVersion', () => {
        vi.stubGlobal('navigator', { appVersion: 'Mac OS X' });
        const service = createService();

        expect(service.isMac).toBe(true);
        expect(service.isWindows).toBe(false);
        expect(service.isLinux).toBe(false);
    });

    it('should detect Windows platform by appVersion', () => {
        vi.stubGlobal('navigator', { appVersion: 'Windows NT' });
        const service = createService();

        expect(service.isMac).toBe(false);
        expect(service.isWindows).toBe(true);
        expect(service.isLinux).toBe(false);
    });

    it('should detect Linux platform by appVersion', () => {
        vi.stubGlobal('navigator', { appVersion: 'Linux x86_64' });
        const service = createService();

        expect(service.isMac).toBe(false);
        expect(service.isWindows).toBe(false);
        expect(service.isLinux).toBe(true);
    });
});

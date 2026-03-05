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
import { PlatformService } from '../platform.service';

describe('PlatformService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should detect Mac platform by appVersion', () => {
        vi.spyOn(window.navigator, 'appVersion', 'get').mockReturnValue('Mac OS X');
        const service = new PlatformService();

        expect(service.isMac).toBe(true);
        expect(service.isWindows).toBe(false);
        expect(service.isLinux).toBe(false);
    });

    it('should detect Windows platform by appVersion', () => {
        vi.spyOn(window.navigator, 'appVersion', 'get').mockReturnValue('Windows NT');
        const service = new PlatformService();

        expect(service.isMac).toBe(false);
        expect(service.isWindows).toBe(true);
        expect(service.isLinux).toBe(false);
    });

    it('should detect Linux platform by appVersion', () => {
        vi.spyOn(window.navigator, 'appVersion', 'get').mockReturnValue('Linux x86_64');
        const service = new PlatformService();

        expect(service.isMac).toBe(false);
        expect(service.isWindows).toBe(false);
        expect(service.isLinux).toBe(true);
    });
});

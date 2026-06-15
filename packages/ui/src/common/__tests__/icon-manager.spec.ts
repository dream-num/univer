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

import type { ILogService } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconManager } from '../icon-manager';

function createLogService(): ILogService {
    return {
        debug: vi.fn(),
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        deprecate: vi.fn(),
        setLogLevel: vi.fn(),
    };
}

describe('IconManager', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should expose built-in icons and clear built-ins on dispose', () => {
        const logService = createLogService();
        const manager = new IconManager(logService);

        expect(manager.has('ShortcutIcon')).toBe(true);
        expect(manager.get('ShortcutIcon')).toBeDefined();

        manager.dispose();
        expect(manager.has('ShortcutIcon')).toBe(false);
        expect(manager.get('ShortcutIcon')).toBeDefined();
    });

    it('should register icon and support get/delete/disposable', () => {
        const logService = createLogService();
        const manager = new IconManager(logService);
        const Icon = () => null;

        const disposable = manager.register('test-icon', Icon);

        expect(manager.has('test-icon')).toBe(true);
        expect(manager.get('test-icon')).toBe(Icon);

        manager.delete('test-icon');
        expect(manager.has('test-icon')).toBe(false);
        expect(manager.get('test-icon')).toBeDefined();

        manager.register('test-icon', Icon);
        disposable.dispose();
        expect(manager.has('test-icon')).toBe(false);
        expect(manager.get('test-icon')).toBeDefined();

        manager.dispose();
    });

    it('should register icons in batch and dispose them together', () => {
        const logService = createLogService();
        const manager = new IconManager(logService);
        const FirstIcon = () => null;
        const SecondIcon = () => null;

        const disposable = manager.register({
            FirstIcon,
            SecondIcon,
        });

        expect(manager.get('FirstIcon')).toBe(FirstIcon);
        expect(manager.get('SecondIcon')).toBe(SecondIcon);

        disposable.dispose();

        expect(manager.has('FirstIcon')).toBe(false);
        expect(manager.has('SecondIcon')).toBe(false);

        manager.dispose();
    });

    it('should warn through log service when registering duplicate icon', () => {
        const logService = createLogService();
        const manager = new IconManager(logService);
        const Icon = () => null;

        manager.register('dup-icon', Icon);
        manager.register('dup-icon', Icon);

        expect(logService.warn).toHaveBeenCalledWith('[IconManager]', 'Icon dup-icon already exists.');

        manager.dispose();
    });

    it('should return empty icon for empty and missing names', () => {
        const logService = createLogService();
        const manager = new IconManager(logService);

        expect(manager.get('')).toBeDefined();
        expect(manager.get('not-exists')).toBeDefined();
        expect(logService.warn).toHaveBeenCalledWith('[IconManager]', 'Icon  does not exist.');
        expect(logService.warn).toHaveBeenCalledWith('[IconManager]', 'Icon not-exists does not exist.');

        manager.dispose();
    });
});

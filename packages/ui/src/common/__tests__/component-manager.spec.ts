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
import { ComponentManager } from '../component-manager';

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

describe('ComponentManager', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should not expose built-in icons and should expose react utils', () => {
        const logService = createLogService();
        const manager = new ComponentManager(logService);

        expect(manager.get('ShortcutIcon')).toBeUndefined();
        expect(manager.reactUtils.createElement).toBeTypeOf('function');
        expect(manager.reactUtils.useEffect).toBeTypeOf('function');
        expect(manager.reactUtils.useRef).toBeTypeOf('function');

        manager.dispose();
        expect(manager.get('ShortcutIcon')).toBeUndefined();
    });

    it('should register default react component and support get/delete/disposable', () => {
        const logService = createLogService();
        const manager = new ComponentManager(logService);
        const Comp = () => null;

        const disposable = manager.register('test-comp', Comp);

        expect(manager.get('test-comp')).toBe(Comp);
        expect('getKey' in manager).toBe(false);

        manager.delete('test-comp');
        expect(manager.get('test-comp')).toBeUndefined();

        manager.register('test-comp', Comp);
        disposable.dispose();
        expect(manager.get('test-comp')).toBeUndefined();

        manager.dispose();
    });

    it('should warn through log service when registering duplicate component', () => {
        const logService = createLogService();
        const manager = new ComponentManager(logService);
        const Comp = () => null;

        manager.register('dup-comp', Comp);
        manager.register('dup-comp', Comp);

        expect(logService.warn).toHaveBeenCalledWith('[ComponentManager]', 'Component dup-comp already exists.');

        manager.dispose();
    });

    it('should allow direct construction without log service', () => {
        const manager = new ComponentManager();
        const Comp = () => null;

        expect(() => {
            manager.register('dup-comp', Comp);
            manager.register('dup-comp', Comp);
        }).not.toThrow();

        expect(manager.get('dup-comp')).toBe(Comp);

        manager.dispose();
    });

    it('should throw when registering vue3 without handler', () => {
        const logService = createLogService();
        const manager = new ComponentManager(logService);

        expect(() => manager.register('vue-comp', () => null, { framework: 'vue3' })).toThrow(
            '[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.'
        );

        manager.dispose();
    });

    it('should use custom framework handler and throw when handler missing at get', () => {
        const logService = createLogService();
        const manager = new ComponentManager(logService);
        const CustomComp = () => null;

        manager.setHandler('custom', (component, name) => ({
            component,
            name,
            wrapped: true,
        }));

        manager.register('custom-comp', CustomComp, { framework: 'custom' });
        expect(manager.get('custom-comp')).toEqual({
            component: CustomComp,
            name: 'custom-comp',
            wrapped: true,
        });

        expect(() => manager.register('unknown-framework-comp', CustomComp, { framework: 'unknown' })).not.toThrow();
        expect(() => manager.get('unknown-framework-comp')).toThrow(
            '[ComponentManager] No handler found for framework: unknown'
        );

        expect(manager.get('')).toBeUndefined();
        expect(manager.get('not-exists')).toBeUndefined();

        manager.dispose();
    });
});

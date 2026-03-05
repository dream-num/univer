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
import { ComponentManager } from '../component-manager';

describe('ComponentManager', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should expose built-in icons, react utils and clear built-ins on dispose', () => {
        const manager = new ComponentManager();

        const iconComp = manager.get('ShortcutIcon');
        expect(iconComp).toBeDefined();
        expect(manager.reactUtils.createElement).toBeTypeOf('function');
        expect(manager.reactUtils.useEffect).toBeTypeOf('function');
        expect(manager.reactUtils.useRef).toBeTypeOf('function');

        manager.dispose();
        expect(manager.get('ShortcutIcon')).toBeUndefined();
    });

    it('should register default react component and support get/getKey/delete/disposable', () => {
        const manager = new ComponentManager();
        const Comp = () => null;

        const disposable = manager.register('test-comp', Comp);

        expect(manager.get('test-comp')).toBe(Comp);
        expect(manager.getKey(Comp)).toBe('test-comp');

        manager.delete('test-comp');
        expect(manager.get('test-comp')).toBeUndefined();

        manager.register('test-comp', Comp);
        disposable.dispose();
        expect(manager.get('test-comp')).toBeUndefined();

        manager.dispose();
    });

    it('should warn when register duplicate name', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const manager = new ComponentManager();
        const Comp = () => null;

        manager.register('dup-comp', Comp);
        manager.register('dup-comp', Comp);

        expect(warn).toHaveBeenCalledWith('Component dup-comp already exists.');

        manager.dispose();
    });

    it('should throw when registering vue3 without handler', () => {
        const manager = new ComponentManager();

        expect(() => manager.register('vue-comp', () => null, { framework: 'vue3' })).toThrow(
            '[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.'
        );

        manager.dispose();
    });

    it('should use custom framework handler and throw when handler missing at get', () => {
        const manager = new ComponentManager();
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

        manager.register('unknown-framework-comp', CustomComp, { framework: 'unknown' });
        expect(() => manager.get('unknown-framework-comp')).toThrow(
            '[ComponentManager] No handler found for framework: unknown'
        );

        expect(manager.get('')).toBeUndefined();
        expect(manager.get('not-exists')).toBeUndefined();

        manager.dispose();
    });
});

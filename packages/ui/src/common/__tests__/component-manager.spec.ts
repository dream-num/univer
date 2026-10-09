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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ComponentManager } from '../component-manager';

describe('ComponentManager', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector([[ComponentManager]]);
    });

    afterEach(() => {
        injector.dispose();
    });

    it.each([true, false])('keeps the host override regardless of registration order (built-in first: %s)', (builtInFirst) => {
        const manager = injector.get(ComponentManager);
        const BuiltInPanel = () => null;
        const HostPanel = () => null;

        if (builtInFirst) {
            manager.register('panel', BuiltInPanel);
        }
        const override = manager.register('panel', HostPanel, { override: true });
        if (!builtInFirst) {
            manager.register('panel', BuiltInPanel);
        }

        expect(manager.get('panel')).toBe(HostPanel);
        override.dispose();
        expect(manager.get('panel')).toBe(BuiltInPanel);
    });

    it('restores the latest live default without letting an old registration remove it', () => {
        const manager = injector.get(ComponentManager);
        const OldPanel = () => null;
        const CurrentPanel = () => null;
        const HostPanel = () => null;
        const oldDefault = manager.register('panel', OldPanel);
        const override = manager.register('panel', HostPanel, { override: true });
        manager.register('panel', CurrentPanel);

        oldDefault.dispose();
        override.dispose();

        expect(manager.get('panel')).toBe(CurrentPanel);
    });

    it('rejects a competing host override without replacing the active override', () => {
        const manager = injector.get(ComponentManager);
        const HostPanel = () => null;
        const CompetingPanel = () => null;
        manager.register('panel', HostPanel, { override: true });

        expect(() => manager.register('panel', CompetingPanel, { override: true })).toThrow(
            '[ComponentManager] Component panel already has an override.'
        );
        expect(manager.get('panel')).toBe(HostPanel);
    });

    it('detects defaults independently of overrides so conditional built-ins remain restorable', () => {
        const manager = injector.get(ComponentManager);
        const BuiltInPanel = () => null;
        const override = manager.register('panel', () => null, { override: true });

        expect(manager.hasDefault('panel')).toBe(false);
        const defaultRegistration = manager.register('panel', BuiltInPanel);
        expect(manager.hasDefault('panel')).toBe(true);
        override.dispose();
        expect(manager.get('panel')).toBe(BuiltInPanel);
        defaultRegistration.dispose();
        expect(manager.hasDefault('panel')).toBe(false);
    });

    it('does not restore a default that was unregistered while overridden', () => {
        const manager = injector.get(ComponentManager);
        const HostPanel = () => null;
        const defaultRegistration = manager.register('panel', () => null);
        const override = manager.register('panel', HostPanel, { override: true });

        defaultRegistration.dispose();
        expect(manager.get('panel')).toBe(HostPanel);
        override.dispose();
        expect(manager.get('panel')).toBeUndefined();
    });

    it('deletes only the default and preserves a replacement from an older disposable', () => {
        const manager = injector.get(ComponentManager);
        const BuiltInPanel = () => null;
        const HostPanel = () => null;
        const oldDefault = manager.register('panel', BuiltInPanel);
        const override = manager.register('panel', HostPanel, { override: true });

        manager.delete('panel');
        expect(manager.get('panel')).toBe(HostPanel);
        override.dispose();
        expect(manager.get('panel')).toBeUndefined();

        manager.register('panel', BuiltInPanel);
        oldDefault.dispose();
        expect(manager.get('panel')).toBe(BuiltInPanel);
    });

    it('allows replacing a disposed override without an old handle removing the new one', () => {
        const manager = injector.get(ComponentManager);
        const HostPanel = () => null;
        const firstOverride = manager.register('panel', HostPanel, { override: true });
        firstOverride.dispose();
        manager.register('panel', HostPanel, { override: true });
        firstOverride.dispose();

        expect(manager.get('panel')).toBe(HostPanel);
    });

    it('clears both registration layers when the manager is disposed', () => {
        const manager = injector.get(ComponentManager);
        manager.register('panel', () => null);
        manager.register('panel', () => null, { override: true });

        manager.dispose();

        expect(manager.get('panel')).toBeUndefined();
    });

    it('rejects Vue components when the Vue adapter is unavailable', () => {
        const manager = injector.get(ComponentManager);

        expect(() => manager.register('vue-panel', () => null, { framework: 'vue3' })).toThrow(
            '[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.'
        );
        expect(manager.get('vue-panel')).toBeUndefined();
    });

    it('resolves components through the selected framework adapter', () => {
        const manager = injector.get(ComponentManager);
        const CustomPanel = () => null;
        manager.setHandler('custom', (component, name) => ({ component, name }));
        manager.register('custom-panel', CustomPanel, { framework: 'custom' });

        expect(manager.get('custom-panel')).toEqual({ component: CustomPanel, name: 'custom-panel' });
        manager.register('unknown-panel', CustomPanel, { framework: 'unknown' });
        expect(() => manager.get('unknown-panel')).toThrow('[ComponentManager] No handler found for framework: unknown');
        expect(manager.get('')).toBeUndefined();
        expect(manager.get('missing-panel')).toBeUndefined();
    });

    it('restores the default framework adapter after disposing an override', () => {
        const manager = injector.get(ComponentManager);
        const BuiltInPanel = () => null;
        const HostPanel = () => null;
        manager.setHandler('custom', (component) => ({ component }));
        manager.register('panel', BuiltInPanel);
        const override = manager.register('panel', HostPanel, { framework: 'custom', override: true });

        expect(manager.get('panel')).toEqual({ component: HostPanel });
        override.dispose();
        expect(manager.get('panel')).toBe(BuiltInPanel);
    });
});

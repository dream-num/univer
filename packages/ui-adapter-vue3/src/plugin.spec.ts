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
import { h, render } from 'vue';
import { UniverVue3AdapterPlugin as ReExportedPlugin } from './index';
import { UniverVue3AdapterPlugin, VueComponentWrapper } from './plugin';

vi.mock('vue', async () => {
    const actual = await vi.importActual<typeof import('vue')>('vue');
    return {
        ...actual,
        h: vi.fn(),
        render: vi.fn(),
    };
});

describe('UniverVue3AdapterPlugin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.mocked(h).mockReset();
        vi.mocked(render).mockReset();
    });

    it('should export plugin from index and expose plugin name', () => {
        expect(ReExportedPlugin).toBe(UniverVue3AdapterPlugin);
        expect(UniverVue3AdapterPlugin.pluginName).toBe('UNIVER_UI_ADAPTER_VUE3_PLUGIN');
    });

    it('should register vue3 handler and strip reserved key prop', () => {
        const createElement = vi.fn(() => Symbol('react-element'));
        const useEffect = vi.fn();
        const useRef = vi.fn();
        const setHandler = vi.fn();
        const componentManager = {
            reactUtils: { createElement, useEffect, useRef },
            setHandler,
        };

        const plugin = new UniverVue3AdapterPlugin(undefined as never, {} as never, componentManager as never);
        plugin.onStarting();

        expect(setHandler).toHaveBeenCalledTimes(1);
        expect(setHandler).toHaveBeenCalledWith('vue3', expect.any(Function));

        const handler = setHandler.mock.calls[0][1] as (component: unknown) => (props: Record<string, unknown>) => unknown;
        const component = () => null;
        const result = handler(component)({ key: 'reserved', foo: 1, bar: 2 });

        expect(result).toBe(createElement.mock.results[0].value);
        expect(createElement).toHaveBeenCalledWith(
            VueComponentWrapper,
            expect.objectContaining({
                component,
                props: expect.objectContaining({ foo: 1, bar: 2 }),
                reactUtils: { createElement, useEffect, useRef },
            })
        );
        expect(createElement).toHaveBeenCalledWith(
            VueComponentWrapper,
            expect.objectContaining({
                props: expect.not.objectContaining({ key: expect.anything() }),
            })
        );
    });
});

describe('VueComponentWrapper', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.mocked(h).mockReset();
        vi.mocked(render).mockReset();
    });

    it('should skip rendering when ref is not ready', () => {
        const domRef = { current: null };
        const createElement = vi.fn();
        const useRef = vi.fn(() => domRef);
        const useEffect = vi.fn((callback: () => void) => callback());
        const component = () => null;

        VueComponentWrapper({
            component: component as never,
            props: { foo: 1 },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(useEffect).toHaveBeenCalledTimes(1);
        expect(vi.mocked(h)).not.toHaveBeenCalled();
        expect(vi.mocked(render)).not.toHaveBeenCalled();
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });

    it('should render vue vnode and cleanup on unmount', () => {
        const host = document.createElement('div');
        const domRef = { current: host };
        const createElement = vi.fn();
        const useRef = vi.fn(() => domRef);
        let cleanup: (() => void) | undefined;
        const useEffect = vi.fn((callback: () => (() => void) | void) => {
            cleanup = callback() ?? undefined;
        });
        const component = () => null;
        const vnode = { type: 'vnode' };

        vi.mocked(h).mockReturnValue(vnode as never);

        VueComponentWrapper({
            component: component as never,
            props: { foo: 'bar' },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(vi.mocked(h)).toHaveBeenCalledWith(component, { foo: 'bar' });
        expect(vi.mocked(render)).toHaveBeenCalledWith(vnode, host);
        expect(cleanup).toBeTypeOf('function');

        cleanup?.();
        expect(vi.mocked(render)).toHaveBeenLastCalledWith(null, host);
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });

    it('should skip cleanup render when ref is unavailable during unmount', () => {
        const host = document.createElement('div');
        const domRef = { current: host as HTMLDivElement | null };
        const createElement = vi.fn();
        const useRef = vi.fn(() => domRef);
        let cleanup: (() => void) | undefined;
        const useEffect = vi.fn((callback: () => (() => void) | void) => {
            cleanup = callback() ?? undefined;
        });
        const component = () => null;
        const vnode = { type: 'vnode' };

        vi.mocked(h).mockReturnValue(vnode as never);

        VueComponentWrapper({
            component: component as never,
            props: { foo: 'bar' },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(vi.mocked(render)).toHaveBeenCalledWith(vnode, host);
        vi.mocked(render).mockClear();

        domRef.current = null;
        cleanup?.();
        expect(vi.mocked(render)).not.toHaveBeenCalled();
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });
});

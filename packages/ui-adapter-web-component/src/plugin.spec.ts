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
import { UniverWebComponentAdapterPlugin as ReExportedPlugin } from './index';
import { UniverWebComponentAdapterPlugin, WebComponentComponentWrapper } from './plugin';

describe('UniverWebComponentAdapterPlugin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should export plugin from index and expose plugin name', () => {
        expect(ReExportedPlugin).toBe(UniverWebComponentAdapterPlugin);
        expect(UniverWebComponentAdapterPlugin.pluginName).toBe('UNIVER_UI_ADAPTER_WEB_COMPONENT_PLUGIN');
    });

    it('should register web-component handler with wrapped name prop', () => {
        const createElement = vi.fn(() => Symbol('react-element'));
        const useEffect = vi.fn();
        const useRef = vi.fn();
        const setHandler = vi.fn();
        const componentManager = {
            reactUtils: { createElement, useEffect, useRef },
            setHandler,
        };

        const plugin = new UniverWebComponentAdapterPlugin(undefined as never, {} as never, componentManager as never);
        plugin.onStarting();

        expect(setHandler).toHaveBeenCalledTimes(1);
        expect(setHandler).toHaveBeenCalledWith('web-component', expect.any(Function));

        const webComponent = class extends HTMLElement {};
        const handler = setHandler.mock.calls[0][1] as (component: CustomElementConstructor, name?: string) => () => unknown;
        const result = handler(webComponent, 'x-test-component')();

        expect(result).toBe(createElement.mock.results[0].value);
        expect(createElement).toHaveBeenCalledWith(WebComponentComponentWrapper, {
            component: webComponent,
            props: { name: 'x-test-component' },
            reactUtils: { createElement, useEffect, useRef },
        });
    });
});

describe('WebComponentComponentWrapper', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should throw when name prop is missing', () => {
        const createElement = vi.fn();
        const useEffect = vi.fn();
        const useRef = vi.fn(() => ({ current: null }));
        const webComponent = class extends HTMLElement {};

        expect(() =>
            WebComponentComponentWrapper({
                component: webComponent,
                reactUtils: { createElement, useEffect, useRef } as never,
            })
        ).toThrow('WebComponentComponentWrapper requires a name prop to define the custom element.');
    });

    it('should define custom element, mount it and cleanup on unmount', () => {
        const createElement = vi.fn();
        const host = document.createElement('div');
        const domRef = { current: host };
        const useRef = vi.fn(() => domRef);
        let cleanup: (() => void) | undefined;
        const useEffect = vi.fn((callback: () => (() => void) | void) => {
            cleanup = callback() ?? undefined;
        });
        const getSpy = vi.spyOn(customElements, 'get').mockReturnValue(undefined);
        const defineSpy = vi.spyOn(customElements, 'define').mockImplementation(() => undefined);
        const createNativeElementSpy = vi.spyOn(document, 'createElement');
        const webComponent = class extends HTMLElement {};

        WebComponentComponentWrapper({
            component: webComponent,
            props: { name: 'x-test-component' },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(getSpy).toHaveBeenCalledWith('x-test-component');
        expect(defineSpy).toHaveBeenCalledWith('x-test-component', webComponent);
        expect(createNativeElementSpy).toHaveBeenCalledWith('x-test-component');
        expect(host.children.length).toBe(1);
        expect(cleanup).toBeTypeOf('function');

        cleanup?.();
        expect(host.children.length).toBe(0);
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });

    it('should not redefine existing custom element and should skip mount if ref is missing', () => {
        const createElement = vi.fn();
        const domRef = { current: null };
        const useRef = vi.fn(() => domRef);
        const useEffect = vi.fn((callback: () => void) => callback());
        const getSpy = vi.spyOn(customElements, 'get').mockReturnValue(class extends HTMLElement {});
        const defineSpy = vi.spyOn(customElements, 'define').mockImplementation(() => undefined);
        const createNativeElementSpy = vi.spyOn(document, 'createElement');
        const webComponent = class extends HTMLElement {};

        WebComponentComponentWrapper({
            component: webComponent,
            props: { name: 'x-existing-component' },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(getSpy).toHaveBeenCalledWith('x-existing-component');
        expect(defineSpy).not.toHaveBeenCalled();
        expect(createNativeElementSpy).not.toHaveBeenCalledWith('x-existing-component');
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });

    it('should skip cleanup removal when ref is unavailable during unmount', () => {
        const createElement = vi.fn();
        const host = document.createElement('div');
        const domRef = { current: host as HTMLDivElement | null };
        const useRef = vi.fn(() => domRef);
        let cleanup: (() => void) | undefined;
        const useEffect = vi.fn((callback: () => (() => void) | void) => {
            cleanup = callback() ?? undefined;
        });
        vi.spyOn(customElements, 'get').mockReturnValue(undefined);
        vi.spyOn(customElements, 'define').mockImplementation(() => undefined);
        const webComponent = class extends HTMLElement {};

        WebComponentComponentWrapper({
            component: webComponent,
            props: { name: 'x-cleanup-skip-component' },
            reactUtils: { createElement, useEffect, useRef } as never,
        });

        expect(host.children.length).toBe(1);
        domRef.current = null;
        cleanup?.();
        expect(host.children.length).toBe(1);
        expect(createElement).toHaveBeenCalledWith('div', { ref: domRef });
    });
});

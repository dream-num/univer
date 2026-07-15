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

import type { ReactElement } from 'react';
import { Injector, LocaleService } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import enUS from '@univerjs/design/locale/en-US';
import { ContextMenuService, IContextMenuService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { MenuItemInput } from '../MenuItemInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class ChangeRecords {
    static values: string[] = [];

    static reset(): void {
        this.values = [];
    }

    static push(value: string): void {
        this.values.push(value);
    }
}

function createInjector() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IContextMenuService, { useClass: ContextMenuService }]);

    return injector;
}

function renderWithDependencies(element: ReactElement) {
    const injector = createInjector();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider locale={enUS.design} mountContainer={container}>
                    {element}
                </ConfigProvider>
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

function getInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input');
    if (!(input instanceof HTMLInputElement)) {
        throw new TypeError('Input not found');
    }

    return input;
}

function setInputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickIncrement(container: HTMLElement) {
    const incrementButton = container.querySelector(`[aria-label="${enUS.design.Accessibility.increment}"]`);
    if (!(incrementButton instanceof HTMLElement)) {
        throw new TypeError('Increment button not found');
    }

    incrementButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('MenuItemInput', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        ChangeRecords.reset();
    });

    it('clamps typed values to the configured maximum before reporting the command value', () => {
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheet.menu.before"
                suffix="sheet.menu.after"
                value="12"
                min={5}
                max={20}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);

        act(() => {
            setInputText(getInput(container), '38');
        });

        expect(getInput(container).value).toBe('20');
        expect(ChangeRecords.values).toEqual(['20']);
    });

    it('uses disabled stream updates to block input changes and resumes reporting after re-enabled', () => {
        const disabled$ = new BehaviorSubject(false);
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheet.menu.before"
                suffix="sheet.menu.after"
                value="10"
                min={1}
                max={20}
                disabled$={disabled$}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);

        act(() => {
            disabled$.next(true);
        });
        act(() => {
            clickIncrement(container);
        });

        expect(getInput(container).value).toBe('10');
        expect(ChangeRecords.values).toEqual([]);

        act(() => {
            disabled$.next(false);
        });
        act(() => {
            clickIncrement(container);
        });

        expect(getInput(container).value).toBe('11');
        expect(ChangeRecords.values).toEqual(['11']);
    });
});

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
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { ContextMenuService, IContextMenuService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { MenuItemInput } from '../MenuItemInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
    injector.add([LocaleService]);
    injector.add([IContextMenuService, { useClass: ContextMenuService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: { ...enUS, ...designEnUS } });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');

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
                <ConfigProvider locale={designEnUS.design} mountContainer={container}>
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
            injector.dispose();
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
    const incrementButton = container.querySelector(`[aria-label="${designEnUS.design.Accessibility.increment}"]`);
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
        vi.useRealTimers();
    });

    it('clamps typed values to the configured maximum before reporting the command value', () => {
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheets-ui.rightClick.insertRowsAbove"
                suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
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
                prefix="sheets-ui.rightClick.insertRowsAbove"
                suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                value="10"
                min={1}
                max={20}
                disabled$={disabled$}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);
        disposals.push(() => disabled$.complete());

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

    it('lets Escape reach the enclosing menu without changing the input value', () => {
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        act(() => getInput(container).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));

        expect(keys).toEqual(['Escape']);
        expect(getInput(container).value).toBe('2');
        expect(ChangeRecords.values).toEqual([]);
    });

    it('keeps editing keys and an active IME Escape inside the input', () => {
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Backspace', 'Delete', 'Enter']) {
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
        }
        for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, ...modifier })));
        }
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, isComposing: true })));

        expect(keys).toEqual([]);
        expect(input.value).toBe('2');
    });

    it('keeps the composition-ending Escape local and accepts a subsequent Escape', () => {
        vi.useFakeTimers();
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        act(() => {
            input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
            // Safari can deliver the ending key after compositionend with isComposing already false.
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, isComposing: false }));
        });
        expect(keys).toEqual([]);
        expect(input.value).toBe('2');
        expect(ChangeRecords.values).toEqual([]);

        act(() => vi.runOnlyPendingTimers());
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        expect(keys).toEqual(['Escape']);
    });

    it.each(['blur', 'unmount'])('cleans up the composition boundary on %s', (action) => {
        vi.useFakeTimers();
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        const initialTimers = vi.getTimerCount();
        act(() => {
            input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        });

        if (action === 'unmount') {
            disposals.pop()?.();
        } else {
            act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
            expect(keys).toEqual(['Escape']);
        }
        expect(vi.getTimerCount()).toBe(initialTimers);
        expect(ChangeRecords.values).toEqual([]);
    });
});

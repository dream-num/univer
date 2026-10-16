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

import type { IMenuItemInputProps } from '../../../menu-item-input/interface';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../../locale/en-US';
import { MobileMenuItemInput } from '../MobileMenuItemInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const disposals: Array<() => void> = [];

async function renderInput(props: Partial<IMenuItemInputProps> = {}) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const onChange = vi.fn();
    const onRowClick = vi.fn();
    const initialProps: IMenuItemInputProps = {
        prefix: 'sheets-ui.rightClick.rowHeight',
        suffix: 'px',
        value: '88',
        min: 2,
        max: 1000,
        onChange,
        ...props,
    };
    const renderWithProps = (nextProps: Partial<IMenuItemInputProps>) => (
        <RediContext.Provider value={{ injector }}>
            <ConfigProvider locale={designEnUS.design} mountContainer={container}>
                <div onClick={onRowClick}>
                    <MobileMenuItemInput {...initialProps} {...nextProps} />
                </div>
            </ConfigProvider>
        </RediContext.Provider>
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(renderWithProps({})));
    let mounted = true;
    const unmount = () => {
        if (!mounted) {
            return;
        }
        mounted = false;
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    };
    disposals.push(unmount);

    return {
        onChange,
        onRowClick,
        container,
        unmount,
        async rerenderWithProps(nextProps: Partial<IMenuItemInputProps>) {
            await act(async () => root.render(renderWithProps(nextProps)));
        },
    };
}

function getInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input');
    if (!input) {
        throw new Error('Numeric input not rendered');
    }
    return input;
}

function getConfirmButton(container: HTMLElement): HTMLButtonElement {
    const button = container.querySelector<HTMLButtonElement>('button[data-u-comp="button"]');
    if (!button) {
        throw new Error('Confirmation button not rendered');
    }
    return button;
}

async function setInputText(input: HTMLInputElement, value: string) {
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

async function pressEnter(input: HTMLInputElement, isComposing = false) {
    await act(async () => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing, bubbles: true }));
    });
}

afterEach(() => {
    disposals.splice(0).forEach((dispose) => dispose());
});

describe('MobileMenuItemInput', () => {
    it('keeps multi-digit typing as a draft until explicit confirmation', async () => {
        const { container, onChange, onRowClick } = await renderInput();
        const input = getInput(container);

        for (const value of ['1', '12', '120']) {
            await setInputText(input, value);
            expect(input.value).toBe(value);
            expect(onChange).not.toHaveBeenCalled();
        }
        await act(async () => {
            input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        });
        await act(async () => container.querySelector('span')?.click());
        expect(onChange).not.toHaveBeenCalled();
        expect(onRowClick).not.toHaveBeenCalled();

        await act(async () => getConfirmButton(container).click());

        expect(onChange).toHaveBeenCalledExactlyOnceWith('120');
        expect(onRowClick).not.toHaveBeenCalled();
    });

    it.each([
        { value: '1', expected: '2' },
        { value: '1200', expected: '1000' },
    ])('clamps $value only when Enter confirms the draft', async ({ value, expected }) => {
        const { container, onChange } = await renderInput();
        const input = getInput(container);
        await setInputText(input, value);
        expect(input.value).toBe(value);
        expect(onChange).not.toHaveBeenCalled();

        await pressEnter(input);

        expect(onChange).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('does not submit an empty draft or an IME confirmation key', async () => {
        const { container, onChange, unmount } = await renderInput();
        const input = getInput(container);
        await setInputText(input, '');
        expect(getConfirmButton(container).disabled).toBe(true);
        await pressEnter(input);
        expect(onChange).not.toHaveBeenCalled();

        await setInputText(input, '24');
        await pressEnter(input, true);
        unmount();

        expect(onChange).not.toHaveBeenCalled();
    });

    it('drops the previous selection draft when the menu value changes', async () => {
        const { container, onChange, rerenderWithProps } = await renderInput();
        const input = getInput(container);
        await setInputText(input, '120');

        await rerenderWithProps({ value: '32' });
        expect(input.value).toBe('32');
        await act(async () => getConfirmButton(container).click());

        expect(onChange).toHaveBeenCalledExactlyOnceWith('32');
    });
});

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

import type { IColorPickerProps } from '@univerjs/design';
import type { ReactNode } from 'react';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { ColorPicker, ConfigProvider, Dropdown, DropdownMenu } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { COLOR_PICKER_COMPONENT, ComponentManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorColorPicker } from '../EditorColorPicker';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const cleanups: Array<() => void> = [];

function ConfiguredColorPicker({ value }: IColorPickerProps) {
    return <input aria-label="Configured color" value={value} readOnly />;
}

function renderPicker(
    children: ReactNode,
    ownerDocument = document,
    configureComponents?: (components: ComponentManager) => void
) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ComponentManager]);
    const components = injector.get(ComponentManager);
    components.register(COLOR_PICKER_COMPONENT, ColorPicker);
    configureComponents?.(components);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: designEnUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const container = ownerDocument.createElement('div');
    ownerDocument.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(
        <RediContext.Provider value={{ injector }}>
            <ConfigProvider mountContainer={ownerDocument.body} locale={designEnUS.design}>{children}</ConfigProvider>
        </RediContext.Provider>
    ));
    cleanups.push(() => {
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    });
    return { container, components: injector.get(ComponentManager) };
}

function openCustomPicker(container: ParentNode = document) {
    const more = Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent === designEnUS.design.ColorPicker.more)!;
    act(() => more.click());
    return container.querySelector<HTMLInputElement>('input[aria-label="HEX"]')!;
}

function keyDown(input: HTMLElement, key: string, isComposing = false) {
    const event = new KeyboardEvent('keydown', { key, isComposing, bubbles: true, cancelable: true });
    act(() => input.dispatchEvent(event));
    return event;
}

afterEach(() => {
    cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
});

describe('EditorColorPicker', () => {
    it.each([
        ['popover', 'Escape'],
        ['popover', 'Enter'],
        ['menu', 'Escape'],
        ['menu', 'Enter'],
        ['submenu', 'Escape'],
        ['submenu', 'Enter'],
    ])('retains an IME %s draft on %s until normal confirmation or dismissal', (surface, key) => {
        const onChange = vi.fn();
        const onOpenChange = vi.fn();
        const picker = <EditorColorPicker value="#654321" onChange={onChange} />;
        renderPicker(surface === 'popover'
            ? <Dropdown open onOpenChange={onOpenChange} overlay={picker}><button type="button">Color</button></Dropdown>
            : (
                <DropdownMenu
                    open
                    onOpenChange={onOpenChange}
                    items={surface === 'menu'
                        ? [{ type: 'custom', children: picker }]
                        : [{ type: 'subItem', children: 'More', options: [{ type: 'custom', children: picker }] }]}
                >
                    <button type="button">Color</button>
                </DropdownMenu>
            ));
        if (surface === 'submenu') {
            keyDown(document.querySelector<HTMLElement>('[data-slot="dropdown-menu-sub-trigger"]')!, 'ArrowRight');
        }
        const input = openCustomPicker();
        expect(input).not.toBeNull();
        expect(document.activeElement).toBe(input);
        act(() => input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
        const composing = keyDown(input, key, true);
        expect(composing.defaultPrevented).toBe(false);
        expect(document.querySelector('input[aria-label="HEX"]')).toBe(input);
        expect(document.activeElement).toBe(input);
        expect(input.value.toLowerCase()).toBe('654321');
        expect(onChange).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();
        act(() => input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
        keyDown(input, key);
        if (key === 'Enter') {
            expect(onChange).toHaveBeenCalledExactlyOnceWith('#654321');
            expect(document.querySelector('input[aria-label="HEX"]')).toBeNull();
        } else {
            expect(onOpenChange).toHaveBeenCalledWith(false);
            expect(onChange).not.toHaveBeenCalled();
        }
    });

    it('leaves unrelated inputs and ordinary editing keys available to their owners', () => {
        const { container } = renderPicker(
            <>
                <input aria-label="Other" />
                <EditorColorPicker value="#123456" />
            </>
        );
        const onKeyDown = vi.fn();
        const other = container.querySelector('input')!;
        other.addEventListener('keydown', onKeyDown);
        keyDown(other, 'Escape', true);
        keyDown(other, 'Enter', true);
        expect(onKeyDown).toHaveBeenCalledTimes(2);
        const input = openCustomPicker(container);
        const ordinary = keyDown(input, 'ArrowLeft', true);
        expect(ordinary.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(input);
    });

    it('preserves the registered host color picker', () => {
        const { container } = renderPicker(<EditorColorPicker value="#123456" />, document, (components) => {
            components.register(COLOR_PICKER_COMPONENT, ConfiguredColorPicker, { override: true });
        });
        expect(container.querySelector<HTMLInputElement>('input[aria-label="Configured color"]')?.value).toBe('#123456');
    });

    it('releases its input boundary on unmount', () => {
        const { container } = renderPicker(<EditorColorPicker value="#123456" />);
        const input = openCustomPicker(container);
        const boundary = input.closest('[data-u-comp="color-picker"]')!.parentElement!;
        cleanups.pop()!();
        document.body.appendChild(boundary);
        const onKeyDown = vi.fn();
        document.addEventListener('keydown', onKeyDown, true);
        cleanups.push(() => {
            document.removeEventListener('keydown', onKeyDown, true);
            boundary.remove();
        });
        keyDown(input, 'Escape', true);
        expect(onKeyDown).toHaveBeenCalledOnce();
    });

    it('preserves composed input in the editor owner window', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        cleanups.push(() => iframe.remove());
        const ownerDocument = iframe.contentDocument!;
        const onChange = vi.fn();
        const { container } = renderPicker(<EditorColorPicker value="#123456" onChange={onChange} />, ownerDocument);
        const input = openCustomPicker(container);
        keyDown(input, 'Escape', true);
        keyDown(input, 'Enter', true);
        expect(container.contains(input)).toBe(true);
        expect(ownerDocument.activeElement).toBe(input);
        expect(onChange).not.toHaveBeenCalled();
        const confirm = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === designEnUS.design.ColorPicker.confirm)!;
        act(() => confirm.click());
        expect(onChange).toHaveBeenCalledExactlyOnceWith('#123456');
    });

    it('keeps simultaneously mounted editors independent', () => {
        const onFirstChange = vi.fn();
        const onSecondChange = vi.fn();
        const { container } = renderPicker(
            <>
                <section><EditorColorPicker value="#123456" onChange={onFirstChange} /></section>
                <section><EditorColorPicker value="#654321" onChange={onSecondChange} /></section>
            </>
        );
        const [first, second] = Array.from(container.querySelectorAll('section'));
        const firstInput = openCustomPicker(first);
        const secondInput = openCustomPicker(second);
        keyDown(secondInput, 'Enter', true);
        expect(onFirstChange).not.toHaveBeenCalled();
        expect(onSecondChange).not.toHaveBeenCalled();
        expect(first.contains(firstInput)).toBe(true);
        expect(second.contains(secondInput)).toBe(true);
        keyDown(secondInput, 'Enter');
        expect(onSecondChange).toHaveBeenCalledExactlyOnceWith('#654321');
        expect(first.contains(firstInput)).toBe(true);
    });
});

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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from '../ColorPicker';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('ColorPicker extra', () => {
    it('should handle rgba mode and confirm custom color', () => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorPicker format="rgba" value="rgba(10, 20, 30, 0.5)" onChange={onChange} />
        );

        const moreLink = container.querySelector('[data-u-comp="color-picker"] a') as HTMLAnchorElement;
        expect(moreLink).toBeTruthy();
        fireEvent.click(moreLink);

        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons[buttons.length - 1] as HTMLButtonElement;
        expect(confirmBtn).toBeTruthy();
        fireEvent.click(confirmBtn);
        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls.some(([value]) => String(value).startsWith('rgba('))).toBe(true);
    });

    it('should log error when invalid value is provided', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<ColorPicker format="rgba" value="invalid-rgba" />);
        expect(errorSpy).toHaveBeenCalled();
    });

    it('should stop click propagation on root container', () => {
        const parentClick = vi.fn();
        const { container } = render(
            <div onClick={parentClick}>
                <ColorPicker />
            </div>
        );

        const root = container.querySelector('[data-u-comp="color-picker"]') as HTMLElement;
        expect(root).toBeTruthy();
        fireEvent.click(root);
        expect(parentClick).not.toHaveBeenCalled();
    });

    it('should emit rgba from presets and confirm/cancel inside dialog', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorPicker format="rgba" value="rgba(0, 0, 0, 1)" onChange={onChange} />);

        const presetButton = container.querySelector('[data-u-comp="color-picker-presets"] button') as HTMLButtonElement;
        fireEvent.click(presetButton);
        expect(onChange.mock.calls.some(([value]) => String(value).startsWith('rgba('))).toBe(true);

        const moreLink = container.querySelector('[data-u-comp="color-picker"] a') as HTMLAnchorElement;
        fireEvent.click(moreLink);

        const alphaInput = document.querySelector('input[maxlength="4"]') as HTMLInputElement;
        fireEvent.change(alphaInput, { target: { value: '0.6' } });

        const [cancelBtn, confirmBtn] = Array.from(document.querySelectorAll('footer button')) as HTMLButtonElement[];
        fireEvent.click(cancelBtn);
        fireEvent.click(moreLink);
        fireEvent.click(confirmBtn);
        expect(onChange).toHaveBeenCalled();
    });

    it('should confirm custom color in hex mode', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorPicker format="hex" value="#00ff00" onChange={onChange} />);
        const moreLink = container.querySelector('[data-u-comp="color-picker"] a') as HTMLAnchorElement;

        fireEvent.click(moreLink);
        const confirmBtn = Array.from(document.querySelectorAll('footer button')).at(-1) as HTMLButtonElement;
        fireEvent.click(confirmBtn);

        expect(onChange.mock.calls.some(([value]) => String(value).startsWith('#'))).toBe(true);
    });
});

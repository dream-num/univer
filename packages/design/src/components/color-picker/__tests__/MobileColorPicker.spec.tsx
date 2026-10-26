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
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileDropdown } from '../../dropdown/MobileDropdown';
import { MobileColorPicker } from '../MobileColorPicker';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

function getMoreColorButton(container: HTMLElement): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.textContent === enUS.design.ColorPicker.more);
    if (!button) throw new Error('More color button was not rendered.');
    return button;
}

describe('MobileColorPicker', () => {
    it('does not select black for an unset tab color', () => {
        const view = render(<MobileColorPicker value="" />);
        expect(view.getByRole('button', { name: '#000000' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('opens custom colors above the containing mobile dropdown', () => {
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileDropdown open overlay={<MobileColorPicker value="#FFFFFF" />}>
                    <button type="button">Color</button>
                </MobileDropdown>
            </ConfigProvider>
        );

        fireEvent.click(getMoreColorButton(document.body));

        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
        expect(dialogs).toHaveLength(2);
        const input = document.querySelector<HTMLInputElement>('[data-u-comp="mobile-color-picker-custom"] input');
        expect(input).toBeInTheDocument();
        fireEvent.change(input!, { target: { value: '123456' } });
        expect(input).toHaveValue('123456');
    });

    it('closes the containing mobile dropdown after selecting a preset color', () => {
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileDropdown overlay={<MobileColorPicker value="#FFFFFF" />}>
                    <button type="button">Color</button>
                </MobileDropdown>
            </ConfigProvider>
        );

        fireEvent.click(document.querySelector('button')!);
        fireEvent.click(document.querySelectorAll('[data-u-comp="color-picker"] button')[1]);

        expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('closes both color dialogs after confirming a custom color', () => {
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileDropdown overlay={<MobileColorPicker value="#FFFFFF" />}>
                    <button type="button">Color</button>
                </MobileDropdown>
            </ConfigProvider>
        );

        fireEvent.click(document.querySelector('button')!);
        fireEvent.click(getMoreColorButton(document.body));
        fireEvent.click(document.querySelector<HTMLButtonElement>('[data-u-comp="mobile-color-picker-custom"] button:last-child')!);

        expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('keeps the containing mobile dropdown open after cancelling a custom color', () => {
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileDropdown overlay={<MobileColorPicker value="#FFFFFF" />}>
                    <button type="button">Color</button>
                </MobileDropdown>
            </ConfigProvider>
        );

        fireEvent.click(document.querySelector('button')!);
        fireEvent.click(getMoreColorButton(document.body));
        fireEvent.click(document.querySelector<HTMLButtonElement>('[data-u-comp="mobile-color-picker-custom"] button')!);

        expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
        expect(document.querySelector('[data-u-comp="color-picker"]')).toBeInTheDocument();
    });
});

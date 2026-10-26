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
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { ColorPicker } from '../ColorPicker';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('ColorPicker', () => {
    it('distinguishes an unset color from black and follows external color changes', () => {
        const view = render(<ColorPicker value="" />);
        expect(view.getByRole('button', { name: '#000000' })).toHaveAttribute('aria-pressed', 'false');
        view.rerender(<ColorPicker value="#000000" />);
        expect(view.getByRole('button', { name: '#000000' })).toHaveAttribute('aria-pressed', 'true');
        view.rerender(<ColorPicker value="#3f83f8" />);
        expect(view.getByRole('button', { name: '#3F83F8' })).toHaveAttribute('aria-pressed', 'true');
        view.rerender(<ColorPicker value="" />);
        expect(view.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
    });

    it.each(['hex', 'rgba'] as const)('applies a preset immediately in %s format', (format) => {
        const onChange = vi.fn();
        const view = render(<ColorPicker format={format} onChange={onChange} />);
        fireEvent.click(view.getByRole('button', { name: '#3F83F8' }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(format === 'hex' ? '#3f83f8' : 'rgba(63, 131, 248, 1)');
        expect(view.getByRole('button', { name: '#3F83F8' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('edits in the same popover and applies a pasted hex color only on confirmation', () => {
        const onChange = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design}>
                <ColorPicker value="#3F83F8" onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.more }));
        expect(view.queryByRole('dialog')).not.toBeInTheDocument();
        const input = view.getByRole('textbox', { name: 'HEX' });
        expect(input).toHaveFocus();
        fireEvent.paste(input, { clipboardData: { getData: () => '#12ab34' } });
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.confirm }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith('#12ab34');
        expect(view.getByRole('button', { name: enUS.design.ColorPicker.more })).toHaveFocus();
    });

    it.each(['button', 'Escape'])('discards custom drafts using %s and restores focus', (cancel) => {
        const onChange = vi.fn();
        const parentKeyDown = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design}>
                <div onKeyDown={parentKeyDown}>
                    <ColorPicker value="#3F83F8" onChange={onChange} />
                </div>
            </ConfigProvider>
        );
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.more }));
        fireEvent.change(view.getByRole('textbox', { name: 'HEX' }), { target: { value: 'aabbcc' } });
        fireEvent.keyDown(view.getByRole('textbox', { name: 'HEX' }), { key: 'ArrowLeft' });
        expect(parentKeyDown).not.toHaveBeenCalled();
        if (cancel === 'button') {
            fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.cancel }));
        } else {
            fireEvent.keyDown(view.getByRole('textbox', { name: 'HEX' }), { key: 'Escape' });
            expect(parentKeyDown).not.toHaveBeenCalled();
        }
        expect(onChange).not.toHaveBeenCalled();
        expect(view.getByRole('button', { name: enUS.design.ColorPicker.more })).toHaveFocus();
        expect(view.getByRole('button', { name: '#3F83F8' })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.more }));
        expect(view.getByRole('textbox', { name: 'HEX' })).toHaveValue('3f83f8');
    });

    it('preserves alpha for custom colors and applies with Enter', () => {
        const onChange = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design}>
                <ColorPicker format="rgba" value="rgba(63, 131, 248, 0.5)" onChange={onChange} />
            </ConfigProvider>
        );
        expect(view.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.more }));
        fireEvent.change(view.getByRole('textbox', { name: 'HEX' }), { target: { value: '123456' } });
        fireEvent.keyDown(view.getByRole('textbox', { name: 'HEX' }), { key: 'Enter' });
        expect(onChange).toHaveBeenCalledExactlyOnceWith('rgba(18, 52, 86, 0.5)');
    });

    it('keeps editing clicks inside the picker and follows RTL direction', () => {
        const parentClick = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} direction="rtl" locale={enUS.design}>
                <div onClick={parentClick}><ColorPicker /></div>
            </ConfigProvider>
        );
        fireEvent.click(view.getByRole('button', { name: enUS.design.ColorPicker.more }));
        expect(parentClick).not.toHaveBeenCalled();
        expect(view.container.querySelector('[data-u-comp="color-picker"]')).toHaveAttribute('dir', 'rtl');
    });

    it('reports invalid color input without crashing', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<ColorPicker format="rgba" value="invalid-rgba" />);
        expect(errorSpy).toHaveBeenCalled();
    });
});

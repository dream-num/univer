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

import type { IMobileKeyboardViewport } from '../../config-provider/ConfigProvider';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileDialog } from '../MobileDialog';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('MobileDialog', () => {
    it('keeps keyboard focus out of input fields until the user edits', () => {
        render(<MobileDialog open title="Print"><input aria-label="Page range" /></MobileDialog>);
        expect(screen.getByRole('dialog')).toHaveFocus();
        expect(screen.getByRole('textbox')).not.toHaveFocus();
        screen.getByRole('textbox').focus();
        expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('closes once through the close control after the locale changes', () => {
        const onClose = vi.fn();
        const { getByRole, rerender } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body} direction="ltr">
                <MobileDialog open title="Print" onClose={onClose}>Preview</MobileDialog>
            </ConfigProvider>
        );

        rerender(
            <ConfigProvider locale={zhCN.design} mountContainer={document.body} direction="ltr">
                <MobileDialog open title="Print" onClose={onClose}>Preview</MobileDialog>
            </ConfigProvider>
        );

        fireEvent.click(getByRole('button', { name: '关闭' }));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('keeps the dialog above the keyboard as its height and viewport offset change', () => {
        vi.stubGlobal('CSS', { supports: () => false });
        vi.stubGlobal('innerHeight', 768);
        const renderDialog = (viewport: IMobileKeyboardViewport | null) => (
            <ConfigProvider
                mountContainer={document.body}
                mobileKeyboardViewport={viewport}
            >
                <MobileDialog open title="Rename"><input aria-label="Sheet name" /></MobileDialog>
            </ConfigProvider>
        );
        const { rerender } = render(renderDialog(null));
        const dialog = screen.getByRole('dialog');
        expect(dialog.style.bottom).toBe('0px');
        expect(dialog.style.maxHeight).toBe('80vh');

        rerender(renderDialog({ top: 0, bottom: 448, height: 448, stableHeight: 768 }));
        expect(dialog.style.bottom).toBe('320px');
        expect(dialog.style.maxHeight).toBe('min(80vh, 448px)');

        rerender(renderDialog({ top: 24, bottom: 376, height: 352, stableHeight: 768 }));
        expect(dialog.style.bottom).toBe('392px');
        expect(dialog.style.maxHeight).toBe('min(80vh, 352px)');

        rerender(renderDialog(null));
        expect(dialog.style.bottom).toBe('0px');
        expect(dialog.style.maxHeight).toBe('80vh');
    });

    it('does not lift the dialog twice when the layout viewport already excludes the keyboard', () => {
        vi.stubGlobal('CSS', { supports: () => false });
        vi.stubGlobal('innerHeight', 448);
        render(
            <ConfigProvider
                mountContainer={document.body}
                mobileKeyboardViewport={{ top: 0, bottom: 448, height: 448, stableHeight: 768 }}
            >
                <MobileDialog open title="Rename"><input aria-label="Sheet name" /></MobileDialog>
            </ConfigProvider>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.style.bottom).toBe('0px');
        expect(dialog.style.maxHeight).toBe('min(80vh, 448px)');
    });

    it('keeps the dialog open for IME candidate Escape and closes after composition ends', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        const { getByRole } = render(
            <MobileDialog open onOpenChange={onOpenChange} onClose={onClose}>
                <input aria-label="HEX color" />
            </MobileDialog>
        );
        const input = getByRole('textbox');
        input.focus();
        fireEvent.compositionStart(input);
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', isComposing: true });
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input);
        fireEvent.compositionEnd(input);
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps Escape disabled without disabling the close control', () => {
        const onClose = vi.fn();
        const { getByRole } = render(
            <MobileDialog open keyboard={false} onClose={onClose}>
                <input aria-label="Dialog draft" />
            </MobileDialog>
        );
        const input = getByRole('textbox');
        input.focus();
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', isComposing: true });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.click(getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledOnce();
    });
});

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
import zhCN from '../../../locale/zh-CN';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Dialog } from '../Dialog';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Dialog', () => {
    it('renders its title, content and custom footer only while open', () => {
        const { queryByRole, getByText, rerender } = render(<Dialog open={false} title="Title">Content</Dialog>);
        expect(queryByRole('dialog')).toBeNull();

        rerender(<Dialog open title="Title" footer={<button type="button">Custom footer</button>}>Content</Dialog>);

        expect(queryByRole('dialog', { name: 'Title' })).not.toBeNull();
        expect(getByText('Content')).toBeDefined();
        expect(queryByRole('button', { name: 'Custom footer' })).not.toBeNull();
    });

    it('updates the close control with the locale and dismisses exactly once', () => {
        const onClose = vi.fn();
        const onOpenChange = vi.fn();
        const { getByRole, rerender } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body} direction="ltr">
                <Dialog open title="Title" onClose={onClose} onOpenChange={onOpenChange}>Content</Dialog>
            </ConfigProvider>
        );

        rerender(
            <ConfigProvider locale={zhCN.design} mountContainer={document.body} direction="ltr">
                <Dialog open title="Title" onClose={onClose} onOpenChange={onOpenChange}>Content</Dialog>
            </ConfigProvider>
        );

        fireEvent.click(getByRole('button', { name: '关闭' }));
        expect(onClose).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('routes localized confirmation and cancellation actions', () => {
        const onOk = vi.fn();
        const onCancel = vi.fn();
        const { getByRole } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body} direction="ltr">
                <Dialog open title="Title" showOk showCancel onOk={onOk} onCancel={onCancel}>Content</Dialog>
            </ConfigProvider>
        );
        fireEvent.click(getByRole('button', { name: 'ok' }));
        fireEvent.click(getByRole('button', { name: 'cancel' }));
        expect(onOk).toHaveBeenCalledOnce();
        expect(onCancel).toHaveBeenCalledOnce();
    });

    it('keeps the dialog open for IME candidate Escape and closes after composition ends', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        const { getByRole } = render(
            <Dialog open title="Title" onOpenChange={onOpenChange} onClose={onClose}>
                <input aria-label="HEX color" />
            </Dialog>
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
        expect(onClose).toHaveBeenCalledOnce();
    });

    it.each([true, false])('keeps Escape disabled without disabling the close control (mask=%s)', (mask) => {
        const onClose = vi.fn();
        const onOpenChange = vi.fn();
        const { getByRole } = render(
            <Dialog open title="Title" mask={mask} keyboard={false} onClose={onClose} onOpenChange={onOpenChange}>
                <input aria-label="Dialog draft" />
            </Dialog>
        );
        const input = getByRole('textbox');
        input.focus();
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', isComposing: true });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.click(getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    it.each([
        { mask: true, maskClosable: true, shouldClose: true },
        { mask: true, maskClosable: false, shouldClose: false },
        { mask: false, maskClosable: true, shouldClose: true },
    ])('honors outside dismissal with mask=$mask and maskClosable=$maskClosable', async ({ mask, maskClosable, shouldClose }) => {
        const onClose = vi.fn();
        const onOpenChange = vi.fn();
        render(<Dialog open title="Title" mask={mask} maskClosable={maskClosable} onClose={onClose} onOpenChange={onOpenChange}>Content</Dialog>);
        await new Promise((resolve) => setTimeout(resolve, 0));

        fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 });
        fireEvent.pointerUp(document.body, { pointerType: 'mouse', button: 0 });
        fireEvent.click(document.body);

        if (shouldClose) {
            expect(onClose).toHaveBeenCalledOnce();
            expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        } else {
            expect(onClose).not.toHaveBeenCalled();
            expect(onOpenChange).not.toHaveBeenCalled();
        }
    });

    it('updates its width and keeps dragging within viewport bounds', () => {
        vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(300);
        vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(200);
        const { getByRole, getByText, rerender } = render(
            <Dialog open title="Drag" width={320} draggable defaultPosition={{ x: 10, y: 10 }}>Content</Dialog>
        );
        const dialog = getByRole('dialog');
        vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
            width: 200,
            height: 100,
            top: 0,
            left: 0,
            right: 200,
            bottom: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });
        expect(dialog.style.width).toBe('320px');
        fireEvent.mouseDown(getByText('Drag'), { clientX: 10, clientY: 10 });
        expect(document.body.style.userSelect).toBe('none');
        fireEvent.mouseMove(document, { clientX: -100, clientY: -100 });
        expect(dialog.style.transform).toBe('translate(0px, 0px)');
        fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
        expect(dialog.style.transform).toBe('translate(100px, 100px)');
        fireEvent.mouseUp(document);
        expect(document.body.style.userSelect).toBe('');

        rerender(<Dialog open title="Drag" width="40rem" draggable>Content</Dialog>);
        expect(dialog.style.width).toBe('40rem');
    });

    it('uses the configured portal container and text direction', () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);
        const { getByRole, unmount } = render(
            <ConfigProvider mountContainer={mountContainer} direction="rtl">
                <Dialog open title="RTL title">Content</Dialog>
            </ConfigProvider>
        );
        const dialog = getByRole('dialog');
        expect(mountContainer.contains(dialog)).toBe(true);
        expect(dialog.dir).toBe('rtl');
        unmount();
        mountContainer.remove();
    });
});

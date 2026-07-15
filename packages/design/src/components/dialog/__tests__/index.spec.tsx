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
import { Dialog } from '../Dialog';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Dialog', () => {
    it('should not render when open is false', () => {
        const { queryByText } = render(<Dialog open={false} title="Title">content</Dialog>);
        expect(queryByText('Title')).not.toBeInTheDocument();
    });

    it('should render with title and content', () => {
        const { getByText } = render(<Dialog open title="Test Title">Dialog Content</Dialog>);
        expect(getByText('Test Title')).toBeInTheDocument();
        expect(getByText('Dialog Content')).toBeInTheDocument();
    });

    it('should render custom footer', () => {
        const { getByText } = render(<Dialog open footer={<div>Custom Footer</div>}>content</Dialog>);
        expect(getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should call onOpenChange and onClose when close button clicked', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        const { container } = render(<Dialog open title="T" onOpenChange={onOpenChange} onClose={onClose}>content</Dialog>);
        const closeBtn = container.querySelector('[data-slot="close"]') as HTMLElement;
        if (closeBtn) {
            closeBtn.click();
            expect(onOpenChange).toHaveBeenCalledWith(false);
            expect(onClose).toHaveBeenCalled();
        }
    });

    it('should call onOk and onCancel', () => {
        const onOk = vi.fn();
        const onCancel = vi.fn();
        const { getByText } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <Dialog open showOk showCancel onOk={onOk} onCancel={onCancel}>content</Dialog>
            </ConfigProvider>
        );
        getByText(enUS.design.Confirm.confirm).click();
        getByText(enUS.design.Confirm.cancel).click();
        expect(onOk).toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalled();
    });

    it('should not close when maskClosable is false', () => {
        const onOpenChange = vi.fn();
        const { container } = render(<Dialog open maskClosable={false} onOpenChange={onOpenChange}>content</Dialog>);
        // mock the mask click event
        const mask = container.querySelector('.univer-fixed');
        if (mask) {
            mask.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(onOpenChange).not.toHaveBeenCalledWith(false);
        }
    });

    it('should apply width and draggable styles', () => {
        const { rerender } = render(
            <Dialog open title="drag" width={320} draggable>
                content
            </Dialog>
        );

        const content = document.querySelector('[role="dialog"]') as HTMLElement;
        expect(content.style.width).toBe('320px');
        expect(content.style.transform).toContain('translate(');

        const header = document.querySelector('[data-drag-handle="true"]') as HTMLElement;
        expect(header).toBeInTheDocument();
        fireEvent.mouseDown(header, { clientX: 20, clientY: 20 });
        fireEvent.mouseMove(document, { clientX: 40, clientY: 50 });
        fireEvent.mouseUp(document);

        rerender(
            <Dialog open title="drag" width="40rem" draggable>
                content
            </Dialog>
        );
        expect((document.querySelector('[role="dialog"]') as HTMLElement).style.width).toBe('40rem');
    });

    it('should honor keyboard=false and trigger open change from close button', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        render(
            <Dialog open keyboard={false} onOpenChange={onOpenChange} onClose={onClose}>
                content
            </Dialog>
        );

        fireEvent.keyDown(document, { key: 'Escape' });

        const closeBtn = (document.querySelector('.univer-sr-only') as HTMLElement | null)?.parentElement as HTMLElement | null;
        expect(closeBtn).toBeInTheDocument();
        if (!closeBtn) {
            throw new Error('Close button should exist');
        }
        closeBtn.click();
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalled();
    });

    it('should render inside the configured mount container with rtl direction', () => {
        const mountContainer = document.createElement('div');
        mountContainer.dir = 'rtl';
        document.body.appendChild(mountContainer);

        render(
            <ConfigProvider mountContainer={mountContainer} direction="rtl">
                <Dialog open title="RTL Title">content</Dialog>
            </ConfigProvider>
        );

        const dialog = mountContainer.querySelector('[role="dialog"]') as HTMLElement;
        expect(dialog).toBeInTheDocument();
        expect(dialog.dir).toBe('rtl');

        const closeButton = dialog.querySelector('[data-slot="close"]') as HTMLElement;
        expect(closeButton.className).toContain('rtl:univer-left-4');
        expect(closeButton.className).toContain('rtl:univer-right-auto');

        const header = dialog.querySelector('[data-slot="dialog-header"]') as HTMLElement;
        expect(header.className).toContain('sm:rtl:!univer-text-right');

        mountContainer.remove();
    });
});

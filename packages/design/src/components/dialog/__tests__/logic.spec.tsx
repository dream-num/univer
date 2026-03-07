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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';

import '@testing-library/jest-dom/vitest';

vi.mock('../DialogPrimitive', async () => {
    const React = await import('react');

    const Dialog = ({ children, open, onOpenChange, modal }: any) => (
        <div data-testid="dialog-provider" data-open={String(open)} data-modal={String(modal)}>
            <button type="button" data-testid="provider-close" onClick={() => onOpenChange?.(false)}>
                provider-close
            </button>
            {children}
        </div>
    );

    const DialogContent = React.forwardRef<HTMLDivElement, any>((props, ref) => {
        const { children, onEscapeKeyDown, onPointerDownOutside, onClickClose } = props;
        return (
            <div
                ref={ref}
                role="dialog"
                tabIndex={0}
                onKeyDown={(e) => onEscapeKeyDown?.(e)}
                onPointerDown={(e) => onPointerDownOutside?.(e)}
            >
                <button type="button" data-slot="close" onClick={onClickClose}>
                    close
                </button>
                {children}
            </div>
        );
    });

    const DialogHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
    const DialogFooter = ({ children }: any) => <div>{children}</div>;
    const DialogTitle = ({ children }: any) => <div>{children}</div>;
    const DialogDescription = ({ children }: any) => <div>{children}</div>;

    return {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
    };
});

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('Dialog logic branches', () => {
    it('should ignore provider close when mask is false', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();

        render(
            <Dialog open mask={false} onOpenChange={onOpenChange} onClose={onClose}>
                content
            </Dialog>
        );

        fireEvent.click(screen.getByTestId('provider-close'));
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close on escape and pointer outside when enabled', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();

        render(
            <Dialog open keyboard maskClosable onOpenChange={onOpenChange} onClose={onClose}>
                content
            </Dialog>
        );

        const dialog = screen.getByRole('dialog');
        fireEvent.keyDown(dialog, { key: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalled();

        onOpenChange.mockClear();
        onClose.mockClear();

        fireEvent.pointerDown(dialog);
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalled();
    });

    it('should not close from pointer outside when maskClosable is false', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();

        render(
            <Dialog open maskClosable={false} onOpenChange={onOpenChange} onClose={onClose}>
                content
            </Dialog>
        );

        fireEvent.pointerDown(screen.getByRole('dialog'));
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should run draggable bounds and drag lifecycle', () => {
        Object.defineProperty(document.documentElement, 'clientWidth', { value: 300, configurable: true });
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 200, configurable: true });

        render(
            <Dialog open draggable title="drag-title">
                content
            </Dialog>
        );

        const dialog = screen.getByRole('dialog') as HTMLDivElement;
        dialog.getBoundingClientRect = vi.fn(() => ({
            width: 200,
            height: 100,
            top: 0,
            left: 0,
            right: 200,
            bottom: 100,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        fireEvent.mouseMove(document, { clientX: 1, clientY: 1 });
        const header = screen.getByText('drag-title').parentElement as HTMLElement;
        fireEvent.mouseDown(header, { clientX: 10, clientY: 10 });
        expect(document.body.style.userSelect).toBe('none');

        fireEvent.mouseMove(document, { clientX: -100, clientY: -100 });
        fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
        fireEvent.mouseUp(document);
        expect(document.body.style.userSelect).toBe('');
    });
});

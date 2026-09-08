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

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';
import { MobileDialog } from '../MobileDialog';

afterEach(cleanup);

describe.each([['Dialog', Dialog], ['MobileDialog', MobileDialog]] as const)('%s focus recovery', (_name, DialogComponent) => {
    it('keeps composition Escape inside the real dialog and allows ordinary Escape afterwards', async () => {
        const onClose = vi.fn();
        const onOpenChange = vi.fn();
        const { getByRole } = render(
            <DialogComponent open title="Color" onClose={onClose} onOpenChange={onOpenChange}>
                <input aria-label="Hex color" />
            </DialogComponent>
        );
        const input = getByRole('textbox', { name: 'Hex color' });
        await waitFor(() => expect(document.activeElement).toBe(input));

        fireEvent.compositionStart(input);
        const composingEscape = new KeyboardEvent('keydown', {
            key: 'Escape',
            isComposing: true,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(input, composingEscape);
        expect(composingEscape.defaultPrevented).toBe(true);
        expect(onClose).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input);
        expect(getByRole('dialog').contains(input)).toBe(true);

        fireEvent.compositionEnd(input);
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('restores input before delayed teardown and preserves subsequently chosen focus', async () => {
        const editor = document.createElement('input');
        const nextTarget = document.createElement('input');
        document.body.append(editor, nextTarget);
        try {
            editor.focus();
            const { rerender, getByRole } = render(<DialogComponent open title="Validation"><button>OK</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
            vi.useFakeTimers();
            await act(async () => {
                rerender(<DialogComponent open={false} title="Validation"><button>OK</button></DialogComponent>);
                await Promise.resolve();
            });
            expect(document.activeElement).toBe(editor);
            nextTarget.focus();
            act(() => vi.runOnlyPendingTimers());
            expect(document.activeElement).toBe(nextTarget);
        } finally {
            if (vi.isFakeTimers()) {
                act(() => vi.runOnlyPendingTimers());
                vi.useRealTimers();
            }
            editor.remove();
            nextTarget.remove();
        }
    });

    it('honors a caller override instead of restoring the transient opener', async () => {
        const opener = document.createElement('button');
        const returnTarget = document.createElement('button');
        document.body.append(opener, returnTarget);
        const restoreFocus = (event: Event) => {
            event.preventDefault();
            returnTarget.focus();
        };
        try {
            opener.focus();
            const { rerender, getByRole } = render(<DialogComponent open title="Validation" onCloseAutoFocus={restoreFocus}><button>OK</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
            rerender(<DialogComponent open={false} title="Validation" onCloseAutoFocus={restoreFocus}><button>OK</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(returnTarget));
        } finally {
            opener.remove();
            returnTarget.remove();
        }
    });

    it('returns focus through the parent modal before returning to the editor', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        try {
            editor.focus();
            const { rerender, getByRole } = render(
                <DialogComponent open title="Parent">
                    <button>Parent action</button>
                    <DialogComponent open={false} title="Child"><button>Child action</button></DialogComponent>
                </DialogComponent>
            );
            const parentAction = getByRole('button', { name: 'Parent action' });
            await waitFor(() => expect(document.activeElement).toBe(parentAction));
            rerender(
                <DialogComponent open title="Parent">
                    <button>Parent action</button>
                    <DialogComponent open title="Child"><button>Child action</button></DialogComponent>
                </DialogComponent>
            );
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'Child action' })));
            rerender(
                <DialogComponent open title="Parent">
                    <button>Parent action</button>
                    <DialogComponent open={false} title="Child"><button>Child action</button></DialogComponent>
                </DialogComponent>
            );
            await waitFor(() => expect(document.activeElement).toBe(parentAction));
            rerender(<DialogComponent open={false} title="Parent"><button>Parent action</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(editor));
        } finally {
            editor.remove();
        }
    });

    it('captures the current editor separately on each open', async () => {
        const first = document.createElement('input');
        const second = document.createElement('input');
        document.body.append(first, second);
        try {
            const { rerender, getByRole } = render(<DialogComponent open={false} title="Validation"><button>OK</button></DialogComponent>);
            for (const editor of [first, second]) {
                editor.focus();
                rerender(<DialogComponent open title="Validation"><button>OK</button></DialogComponent>);
                await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
                rerender(<DialogComponent open={false} title="Validation"><button>OK</button></DialogComponent>);
                await waitFor(() => expect(document.activeElement).toBe(editor));
            }
        } finally {
            first.remove();
            second.remove();
        }
    });

    it('does not focus a removed editor when closing', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        editor.focus();
        const { rerender, getByRole, queryByRole } = render(<DialogComponent open title="Validation"><button>OK</button></DialogComponent>);
        await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
        editor.remove();
        rerender(<DialogComponent open={false} title="Validation"><button>OK</button></DialogComponent>);
        await waitFor(() => expect(queryByRole('dialog')).toBeNull());
        expect(document.activeElement).toBe(document.body);
    });

    it('returns focus to the editor after a programmatically opened modal closes', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        try {
            editor.focus();
            const { rerender, getByRole } = render(<DialogComponent open title="Validation"><button>OK</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
            rerender(<DialogComponent open={false} title="Validation"><button>OK</button></DialogComponent>);
            await waitFor(() => expect(document.activeElement).toBe(editor));
        } finally {
            editor.remove();
        }
    });
});

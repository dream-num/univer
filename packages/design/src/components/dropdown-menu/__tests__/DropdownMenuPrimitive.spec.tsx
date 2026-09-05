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

import { Content, Portal } from '@radix-ui/react-dropdown-menu';
import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuPrimitive, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../DropdownMenuPrimitive';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('retained dropdown trigger ownership', () => {
    it('opens on its own trigger while a closed menu remains mounted', async () => {
        render(
            <DropdownMenuPrimitive modal={false}>
                <DropdownMenuTrigger><span>Open</span></DropdownMenuTrigger>
                <DropdownMenuContent forceMount>
                    <DropdownMenuItem>Action</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuPrimitive>
        );
        // DismissableLayer installs its document pointer listener on the next task.
        await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
        const event = createEvent.pointerDown(screen.getByText('Open'), { bubbles: true, cancelable: true });
        Object.defineProperties(event, { button: { value: 0 }, pointerType: { value: 'mouse' }, ctrlKey: { value: false } });
        fireEvent(screen.getByText('Open'), event);
        expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
        const closeEvent = createEvent.pointerDown(screen.getByText('Open'), { bubbles: true, cancelable: true });
        Object.defineProperties(closeEvent, { button: { value: 0 }, pointerType: { value: 'mouse' }, ctrlKey: { value: false } });
        fireEvent(screen.getByText('Open'), closeEvent);
        expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes for another trigger or outside target and preserves the outside callback', async () => {
        const onOutside = vi.fn();
        render(
            <>
                <button>Outside</button>
                {['First', 'Second'].map((name) => (
                    <DropdownMenuPrimitive key={name} modal={false}>
                        <DropdownMenuTrigger>{name}</DropdownMenuTrigger>
                        <DropdownMenuContent forceMount onPointerDownOutside={onOutside}>
                            <DropdownMenuItem>
                                {name}
                                {' '}
                                action
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenuPrimitive>
                ))}
            </>
        );
        await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
        for (const name of ['First', 'Second', 'Outside']) {
            const button = screen.getByRole('button', { name });
            const event = createEvent.pointerDown(button, { bubbles: true, cancelable: true });
            Object.defineProperties(event, { button: { value: 0 }, pointerType: { value: 'mouse' }, ctrlKey: { value: false } });
            fireEvent(button, event);
            expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', String(name === 'First'));
            expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute('aria-expanded', String(name === 'Second'));
        }
        expect(onOutside).toHaveBeenCalled();
    });

    it('forwards the mounted content and clears an object ref on unmount', () => {
        const ref = createRef<HTMLDivElement>();
        const { unmount } = render(
            <DropdownMenuPrimitive defaultOpen modal={false}>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent ref={ref}><DropdownMenuItem>Action</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenuPrimitive>
        );
        expect(ref.current).toBe(screen.getByRole('menu'));
        unmount();
        expect(ref.current).toBeNull();
    });

    it('preserves callback ref cleanup', () => {
        const cleanupRef = vi.fn();
        const ref = vi.fn(() => cleanupRef);
        const { unmount } = render(
            <DropdownMenuPrimitive defaultOpen modal={false}>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent ref={ref}><DropdownMenuItem>Action</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenuPrimitive>
        );
        expect(ref).toHaveBeenCalledWith(screen.getByRole('menu'));
        unmount();
        expect(cleanupRef).toHaveBeenCalledOnce();
    });
});

describe.each([
    ['normal', <DropdownMenuItem key="normal">Action</DropdownMenuItem>],
    ['checkbox', <DropdownMenuCheckboxItem key="checkbox">Action</DropdownMenuCheckboxItem>],
    ['radio', <DropdownMenuRadioGroup key="radio" value="a"><DropdownMenuRadioItem value="a">Action</DropdownMenuRadioItem></DropdownMenuRadioGroup>],
    ['submenu', <DropdownMenuSub key="submenu"><DropdownMenuSubTrigger>Action</DropdownMenuSubTrigger></DropdownMenuSub>],
])('closed %s dropdown pointer ownership', (_name, content) => {
    it.each(['pointerMove', 'pointerOut'] as const)('does not reclaim focus on %s while retained for exit', (eventType) => {
        render(
            <>
                <input aria-label="External" />
                <DropdownMenuPrimitive open={false} modal={false}>
                    <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                    <Portal forceMount>
                        <Content forceMount>
                            {content}
                        </Content>
                    </Portal>
                </DropdownMenuPrimitive>
            </>
        );
        const external = screen.getByRole('textbox');
        const item = screen.getByText('Action');
        expect(item.closest('[data-radix-menu-content]')).toHaveAttribute('data-state', 'closed');
        external.focus();
        const event = createEvent[eventType](item, { bubbles: true, cancelable: true, relatedTarget: external });
        Object.defineProperty(event, 'pointerType', { value: 'mouse' });
        fireEvent(item, event);
        expect(external).toHaveFocus();
    });
});

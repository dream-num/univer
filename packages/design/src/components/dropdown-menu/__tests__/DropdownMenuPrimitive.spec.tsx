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
import {
    DropdownMenuContent,
    DropdownMenuPrimitive,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../DropdownMenuPrimitive';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('DropdownMenuPrimitive', () => {
    it.each(['root', 'submenu'])('preserves IME Escape in a %s input before normal dismissal', async (surface) => {
        const onOpenChange = vi.fn();
        const onEscapeKeyDown = vi.fn();
        const view = render(
            <DropdownMenuPrimitive defaultOpen modal={false} onOpenChange={onOpenChange}>
                <DropdownMenuTrigger asChild><button type="button">Trigger</button></DropdownMenuTrigger>
                <DropdownMenuContent onEscapeKeyDown={surface === 'root' ? onEscapeKeyDown : undefined}>
                    {surface === 'root'
                        ? <input aria-label="Draft" />
                        : (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent onEscapeKeyDown={onEscapeKeyDown}>
                                    <input aria-label="Draft" />
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}
                </DropdownMenuContent>
            </DropdownMenuPrimitive>
        );
        if (surface === 'submenu') {
            fireEvent.keyDown(view.getByRole('menuitem', { name: 'More' }), { key: 'ArrowRight' });
        }
        const input = await view.findByRole('textbox', { name: 'Draft' });
        input.focus();
        const composing = new KeyboardEvent('keydown', {
            key: 'Escape',
            isComposing: true,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(input, composing);
        expect(composing.defaultPrevented).toBe(true);
        expect(onEscapeKeyDown).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(input).toHaveFocus();

        fireEvent.keyDown(input, { key: 'Escape' });
        expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    });
});

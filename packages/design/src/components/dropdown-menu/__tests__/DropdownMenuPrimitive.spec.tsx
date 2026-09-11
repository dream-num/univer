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
import {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '../DropdownMenuPrimitive';

afterEach(cleanup);

describe('dropdown menu exit focus', () => {
    it.each(['item', 'checkbox', 'radio'])('does not reclaim editor focus when a closing %s loses hover', (kind) => {
        const { getByRole } = render(menuContent(true, kind));
        const menu = getByRole('menu');
        const item = getByRole(kind === 'item' ? 'menuitem' : `menuitem${kind}`);
        const editor = getByRole('textbox');

        item.focus();
        expect(document.activeElement).toBe(item);
        fireEvent.pointerOut(item, { pointerType: 'mouse', relatedTarget: menu });
        expect(document.activeElement).toBe(menu);

        // Retain the menu DOM as the browser does while its exit animation runs.
        menu.setAttribute('data-state', 'closed');
        editor.focus();
        expect(menu.getAttribute('data-state')).toBe('closed');
        const leave = new MouseEvent('pointerout', { bubbles: true, cancelable: true, relatedTarget: document.body });
        Object.defineProperty(leave, 'pointerType', { value: 'mouse' });
        fireEvent(item, leave);
        expect(document.activeElement).toBe(editor);
    });
});

function menuContent(open: boolean, kind: string) {
    return (
        <>
            <input aria-label="Editor" />
            <DropdownMenuPrimitive open={open} modal={false}>
                <DropdownMenuTrigger>Insert</DropdownMenuTrigger>
                <DropdownMenuContent forceMount>
                    {kind === 'item' && <DropdownMenuItem>Text</DropdownMenuItem>}
                    {kind === 'checkbox' && <DropdownMenuCheckboxItem>Check</DropdownMenuCheckboxItem>}
                    {kind === 'radio' && (
                        <DropdownMenuRadioGroup value="a">
                            <DropdownMenuRadioItem value="a">Radio</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    )}
                </DropdownMenuContent>
            </DropdownMenuPrimitive>
        </>
    );
}

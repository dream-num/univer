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

import type { ComponentProps } from 'react';
import type { Root } from 'react-dom/client';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SideMenu } from '../SideMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const menus = [
    { id: 'title', level: 1, text: 'Harbor habitat field report', isTitle: true },
    { id: 'intro', level: 1, text: 'Introduction' },
    { id: 'details', level: 2, text: 'Details' },
];

function renderSideMenu(props: Partial<ComponentProps<typeof SideMenu>> = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function Example() {
        const [open, setOpen] = useState(props.open ?? true);
        return <SideMenu label="Document outline" menus={menus} maxHeight={180} {...props} open={open} onOpenChange={setOpen} />;
    }

    act(() => root.render(<Example />));
    return { container, root };
}

describe('SideMenu', () => {
    let root: Root | undefined;
    let container: HTMLElement;

    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = undefined;
    });

    it('selects a heading with its document location metadata and marks the current location', () => {
        const onClick = vi.fn();
        ({ root, container } = renderSideMenu({ onClick, activeId: 'intro' }));
        const details = container.querySelector<HTMLButtonElement>('button[title="Details"]')!;
        act(() => details.click());
        expect(onClick).toHaveBeenCalledWith(menus[2]);
        expect(container.querySelector('[aria-current="location"]')?.textContent).toBe('Introduction');
    });

    it('removes closed headings from keyboard navigation and restores them when reopened', () => {
        ({ root, container } = renderSideMenu({ open: false }));
        const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
        expect(container.querySelector('nav')).toBeNull();
        act(() => toggle.click());
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(container.querySelector('nav')?.getAttribute('id')).toBe(toggle.getAttribute('aria-controls'));
        expect(container.querySelectorAll('nav button')).toHaveLength(3);
        act(() => toggle.click());
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(container.querySelector('nav')).toBeNull();
    });

    it('supports arrow, Home and End navigation and returns focus on Escape', () => {
        ({ root, container } = renderSideMenu());
        const buttons = container.querySelectorAll<HTMLButtonElement>('nav button');
        buttons[0].focus();
        for (const [key, expectedIndex] of [['ArrowDown', 1], ['End', 2], ['ArrowUp', 1], ['Home', 0]] as const) {
            act(() => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
            expect(document.activeElement).toBe(buttons[expectedIndex]);
        }
        act(() => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        expect(container.querySelector('nav')).toBeNull();
        expect(document.activeElement).toBe(container.querySelector('button[aria-expanded="false"]'));
    });

    it.each(['float', 'side-bar'] as const)('dismisses only floating navigation after a heading click (%s)', (mode) => {
        const onClick = vi.fn();
        ({ root, container } = renderSideMenu({ mode, onClick }));
        act(() => container.querySelector<HTMLButtonElement>('button[title="Details"]')!.click());
        expect(onClick).toHaveBeenCalledWith(menus[2]);
        expect(container.querySelector('nav') !== null).toBe(mode === 'side-bar');
    });

    it.each(['float', 'side-bar'] as const)('dismisses only floating navigation on an outside pointer interaction (%s)', (mode) => {
        ({ root, container } = renderSideMenu({ mode }));
        act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
        expect(container.querySelector('nav') !== null).toBe(mode === 'side-bar');
    });
});

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

import type { Root } from 'react-dom/client';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SideMenu } from '../SideMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const menus = [
    { id: 'title', level: 1, text: 'Document outline', isTitle: true },
    { id: 'intro', level: 1, text: 'Introduction' },
    { id: 'details', level: 2, text: 'Details' },
];

function renderSideMenu(props: React.ComponentProps<typeof SideMenu>) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(<SideMenu {...props} />);
    });

    return { container, root };
}

describe('SideMenu', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('emits the clicked outline item with its document location metadata', () => {
        const selectedItems: typeof menus = [];
        const rendered = renderSideMenu({
            menus,
            maxHeight: 180,
            open: true,
            onClick: (menu) => {
                selectedItems.push(menu);
            },
        });
        root = rendered.root;
        container = rendered.container;

        const detailsItem = Array.from(container.querySelectorAll('div')).find((element) => element.textContent === 'Details');
        if (!detailsItem) {
            throw new Error('Missing Details menu item');
        }

        act(() => {
            detailsItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(selectedItems).toEqual([{ id: 'details', level: 2, text: 'Details' }]);
    });

    it('requests an open state change and translates the panel from the controlled state', () => {
        const openStates: boolean[] = [];
        const rendered = renderSideMenu({
            menus,
            maxHeight: 180,
            open: false,
            mode: 'side-bar',
            onOpenChange: (open) => {
                openStates.push(open);
            },
        });
        root = rendered.root;
        container = rendered.container;

        const toggle = container.firstElementChild?.firstElementChild;
        const panel = container.firstElementChild?.children.item(1) as HTMLElement | null;
        if (!toggle || !panel) {
            throw new Error('Missing side menu toggle or panel');
        }

        expect(panel.style.transform).toBe('translateX(-100%)');

        act(() => {
            toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(openStates).toEqual([true]);
        expect(panel.style.transform).toBe('translateX(-100%)');
    });
});

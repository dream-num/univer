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
import type { IDocPopupMenuItem } from '../../services/doc-quick-insert-popup.service';
import { DesktopLogService, ILogService, Injector } from '@univerjs/core';
import { IconManager, RediContext } from '@univerjs/ui';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QuickInsertMenu } from '../QuickInsertMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const insertTableMenu: IDocPopupMenuItem = {
    id: 'insert-table',
    title: 'Table',
};

const insertImageMenu: IDocPopupMenuItem = {
    id: 'insert-image',
    title: 'Image',
};

const insertEquationMenu: IDocPopupMenuItem = {
    id: 'insert-equation',
    title: 'Equation',
};

const nestedMenus = [
    {
        id: 'insert-group',
        title: 'Insert',
        children: [
            insertTableMenu,
            insertImageMenu,
        ],
    },
    insertEquationMenu,
];

class TestState {
    static focusedMenus: Array<IDocPopupMenuItem | null> = [];
    static focusedIndexes: number[] = [];
    static selectedMenus: IDocPopupMenuItem[] = [];

    static reset(): void {
        this.focusedMenus = [];
        this.focusedIndexes = [];
        this.selectedMenus = [];
    }
}

function createInjector() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IconManager, { useClass: IconManager }]);

    return injector;
}

function QuickInsertMenuHarness() {
    const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);

    return (
        <QuickInsertMenu
            menus={nestedMenus}
            focusedMenuIndex={focusedMenuIndex}
            onFocusedMenuIndexChange={(index) => {
                TestState.focusedIndexes.push(index);
                setFocusedMenuIndex(index);
            }}
            onFocusedMenuChange={(menu) => TestState.focusedMenus.push(menu)}
            onSelect={(menu) => TestState.selectedMenus.push(menu)}
        />
    );
}

describe('QuickInsertMenu', () => {
    let container: HTMLDivElement;
    let root: Root;
    let scrollIntoViewDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        TestState.reset();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value: () => {},
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        if (scrollIntoViewDescriptor) {
            Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
        } else {
            delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
        }
    });

    function renderMenu() {
        const injector = createInjector();

        act(() => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <QuickInsertMenuHarness />
                </RediContext.Provider>
            );
        });
    }

    function findMenuItem(title: string) {
        return Array.from(container.querySelectorAll('[role="button"]'))
            .find((node) => node.textContent === title) as HTMLElement | undefined;
    }

    it('maps nested menu leaves to keyboard focus order and selects the hovered business item', () => {
        renderMenu();

        expect(TestState.focusedMenus.at(-1)).toBe(insertTableMenu);

        const imageMenuNode = findMenuItem('Image');
        expect(imageMenuNode).toBeDefined();

        act(() => {
            imageMenuNode!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });

        expect(TestState.focusedIndexes).toEqual([1]);
        expect(TestState.focusedMenus.at(-1)).toBe(insertImageMenu);

        act(() => {
            imageMenuNode!.click();
        });

        expect(TestState.selectedMenus).toEqual([insertImageMenu]);
    });

    it('releases the focused menu when the pointer leaves a business item', () => {
        renderMenu();

        const tableMenuNode = findMenuItem('Table');
        expect(tableMenuNode).toBeDefined();

        act(() => {
            tableMenuNode!.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        });

        expect(Number.isNaN(TestState.focusedIndexes.at(-1))).toBe(true);
        expect(TestState.focusedMenus.at(-1)).toBeNull();
    });
});

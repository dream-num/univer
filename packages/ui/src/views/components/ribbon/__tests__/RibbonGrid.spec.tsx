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

/**
 * @vitest-environment jsdom
 */

import type { ComponentType } from 'react';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { ICommandService, Injector, LocaleService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { ISidebarService } from '../../../../services/sidebar/sidebar.service';
import { connectInjector } from '../../../../utils/di';
import { RibbonGrid } from '../RibbonGrid';

const injectors: Injector[] = [];
let availableWidth = 250;
let resizeCallbacks: ResizeObserverCallback[] = [];
let groupWidths: Record<string, number> = {};
let compactWidths: Record<string, number> = {};

function mountGrid(groups: IMenuSchema[]) {
    const injector = new Injector([
        [ComponentManager],
        [IconManager, { useValue: { get: () => null } }],
        [LocaleService, { useValue: { t: (key: string) => key } }],
        [ICommandService, { useValue: { executeCommand: async () => true } }],
        [ILayoutService, { useValue: { focus: () => {} } }],
        [IShortcutService, { useValue: { shortcutChanged$: new Subject(), getShortcutDisplayOfCommand: () => null } }],
        [IDialogService, { useValue: { getDialogs$: () => new Subject() } }],
        [ISidebarService, { useValue: { sidebarOptions$: new Subject() } }],
    ]);
    injectors.push(injector);
    const ConnectedGrid = connectInjector(RibbonGrid, injector) as ComponentType<{ groups: IMenuSchema[]; title: string }>;
    const result = render(<ConnectedGrid groups={groups} title="Start" />);
    return { ...result, ConnectedGrid };
}

function createGroups(): IMenuSchema[] {
    return ['clipboard', 'font', 'layout'].map((key, index) => ({
        key,
        title: key,
        order: index,
        children: [0, 1].map((i) => ({
            key: `${key}-${i}`,
            order: i,
            item: { id: `${key}-${i}`, type: MenuItemType.BUTTON, title: `${key}-${i}` },
            gridLayout: { row: 1, column: i + 1, rowSpan: 2 },
        })),
    }));
}

function resize() {
    act(() => resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver)));
}

beforeEach(() => {
    availableWidth = 250;
    resizeCallbacks = [];
    groupWidths = {};
    compactWidths = {};
    vi.stubGlobal('ResizeObserver', class {
        constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
        observe() {}
        disconnect() {}
    });
    const getComputedStyle = window.getComputedStyle;
    vi.stubGlobal('getComputedStyle', (element: Element) => {
        const style = getComputedStyle(element);
        const key = element.getAttribute('data-group-key');
        const toolbar = element.getAttribute('data-u-comp') === 'ribbon-grid-toolbar';
        const compact = element.closest('[role="toolbar"]')?.getAttribute('style')?.includes('--ribbon-grid-density: 1');
        const width = toolbar ? availableWidth : key ? (compact ? compactWidths[key] : undefined) ?? groupWidths[key] ?? 100 : 64;
        return new Proxy(style, {
            get(target, property) {
                if (property === 'width') return `${width}px`;
                if (toolbar && (property === 'borderLeftWidth' || property === 'borderRightWidth')) return '0px';
                const value = Reflect.get(target, property, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
    });
});

afterEach(() => {
    cleanup();
    injectors.splice(0).forEach((injector) => injector.dispose());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('RibbonGrid overflow', () => {
    it('compacts controls before moving a whole group into More', () => {
        availableWidth = 280;
        compactWidths.font = 50;
        const { getByRole, queryByRole } = mountGrid(createGroups());
        expect(queryByRole('button', { name: 'ui.ribbon.more' })).toBeNull();
        expect(within(getByRole('toolbar')).getAllByRole('button')).toHaveLength(6);

        availableWidth = 220;
        resize();
        expect(getByRole('button', { name: 'ui.ribbon.more' })).toBeTruthy();
        expect(within(getByRole('toolbar')).getByRole('button', { name: 'font-1' })).toBeTruthy();
        expect(within(getByRole('toolbar')).queryByRole('button', { name: 'layout-0' })).toBeNull();
    });

    it('shows More immediately below the exact fit and restores all items at the boundary', () => {
        availableWidth = 299;
        const { getByRole, queryByRole } = mountGrid(createGroups());
        expect(getByRole('button', { name: 'ui.ribbon.more' })).toBeTruthy();
        availableWidth = 300;
        resize();
        expect(queryByRole('button', { name: 'ui.ribbon.more' })).toBeNull();
        expect(within(getByRole('toolbar')).getAllByRole('button')).toHaveLength(6);
    });

    it('reserves More space, moves whole groups, and restores them when space returns', () => {
        const { getByRole, queryByRole } = mountGrid(createGroups());
        const toolbar = getByRole('toolbar');
        expect(within(toolbar).getByRole('button', { name: 'clipboard-1' })).toBeTruthy();
        expect(within(toolbar).queryByRole('button', { name: 'font-0' })).toBeNull();
        fireEvent.click(getByRole('button', { name: 'ui.ribbon.more' }));
        const popup = getByRole('dialog', { name: 'ui.ribbon.more' });
        for (const name of ['font-0', 'font-1', 'layout-0', 'layout-1']) {
            expect(within(popup).getByRole('button', { name })).toBeTruthy();
        }
        expect(within(popup).queryByRole('button', { name: 'clipboard-0' })).toBeNull();

        availableWidth = 300;
        resize();
        expect(queryByRole('button', { name: 'ui.ribbon.more' })).toBeNull();
        expect(queryByRole('dialog')).toBeNull();
        expect(within(toolbar).getAllByRole('button')).toHaveLength(6);
    });

    it('does not lose fractional widths when deciding whether More fits', () => {
        availableWidth = 300;
        groupWidths.font = 100.25;
        const { getByRole } = mountGrid(createGroups());
        expect(getByRole('button', { name: 'ui.ribbon.more' })).toBeTruthy();
        expect(within(getByRole('toolbar')).queryByRole('button', { name: 'layout-0' })).toBeNull();
    });

    it('remeasures changing group widths without dropping later groups', () => {
        availableWidth = 300;
        const { getByRole, queryByRole } = mountGrid(createGroups());
        groupWidths.font = 180;
        resize();
        expect(within(getByRole('toolbar')).queryByRole('button', { name: 'font-0' })).toBeNull();
        fireEvent.click(getByRole('button', { name: 'ui.ribbon.more' }));
        expect(within(getByRole('dialog')).getByRole('button', { name: 'layout-1' })).toBeTruthy();
        groupWidths.font = 100;
        resize();
        expect(queryByRole('button', { name: 'ui.ribbon.more' })).toBeNull();
    });

    it('removes stale overflow when the active menu changes, including an empty menu', () => {
        const { getByRole, queryByRole, rerender, ConnectedGrid } = mountGrid(createGroups());
        fireEvent.click(getByRole('button', { name: 'ui.ribbon.more' }));
        rerender(<ConnectedGrid groups={[createGroups()[2]]} title="View" />);
        resize();
        expect(queryByRole('dialog')).toBeNull();
        expect(getByRole('button', { name: 'layout-0' })).toBeTruthy();
        rerender(<ConnectedGrid groups={[]} title="View" />);
        expect(queryByRole('button')).toBeNull();
    });
});

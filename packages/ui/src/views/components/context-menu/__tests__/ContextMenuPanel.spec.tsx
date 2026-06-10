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

import { act, fireEvent, render, screen } from '@testing-library/react';
import { LocaleService } from '@univerjs/core';
import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import {
    CONTEXT_MENU_SUBMENU_CLOSE_DELAY,
    CONTEXT_MENU_SUBMENU_PORTAL_ATTR,
    ContextMenuPanel,
    getContextMenuQuickGroupColumns,
    getContextMenuSchemaRenderGroups,
    shouldShowContextMenuGroupSeparator,
} from '../ContextMenuPanel';

const dependencyMap = new Map();
const tinyMenuGroupSpy = vi.fn();

vi.mock('../../../../utils/di', async () => {
    const ReactModule = await import('react');

    return {
        useDependency(token: unknown) {
            return dependencyMap.get(token);
        },
        useObservable<T>(observable: any, defaultValue?: T) {
            const [value, setValue] = ReactModule.useState(defaultValue);

            ReactModule.useEffect(() => {
                if (!observable) {
                    return;
                }

                const source = typeof observable === 'function' ? observable() : observable;
                const sub = source.subscribe?.((nextValue: T) => setValue(nextValue));

                return () => sub?.unsubscribe?.();
            }, [observable]);

            return value;
        },
    };
});

vi.mock('../../../../components/menu/desktop/TinyMenuGroup', () => ({
    resolveMenuItemActiveState: () => false,
    UITinyMenuGroup: (props: unknown) => {
        tinyMenuGroupSpy(props);
        return <div data-testid="tiny-menu-group" />;
    },
    UIQuickTileMenuGroup: () => <div data-testid="quick-tile-menu-group" />,
}));

vi.mock('../../../../components/custom-label/CustomLabel', () => ({
    CustomLabel: () => <span data-testid="custom-label" />,
}));

describe('ContextMenuPanel', () => {
    it('applies the enlarged paragraph T size variant without affecting the shared defaults', () => {
        dependencyMap.clear();
        tinyMenuGroupSpy.mockClear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'quickTop',
                order: 0,
                title: 'docs-ui.paragraphMenu.align',
                quickLayout: 'icon',
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        const { container } = render(React.createElement(ContextMenuPanel as never, {
            menuType: 'quick-layout-menu',
            sizeVariant: 'paragraph-t',
        }));

        const className = (container.firstChild as HTMLDivElement | null)?.className ?? '';
        expect(className).toContain('univer-min-w-64');
        expect(className).toContain('univer-text-base');
        expect(className).toContain('univer-px-3');
        expect(className).toContain('univer-py-2');
        expect(tinyMenuGroupSpy.mock.calls[0][0]).toEqual(expect.objectContaining({
            columns: 6,
            sizeVariant: 'paragraph-t',
        }));
    });

    it('does not render a separator between consecutive header quick rows', () => {
        expect(shouldShowContextMenuGroupSeparator([
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as never, 0)).toBe(false);

        expect(shouldShowContextMenuGroupSeparator([
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as never, 1)).toBe(true);
    });

    it('clusters consecutive paragraph T header quick rows into one shared container', () => {
        dependencyMap.clear();
        tinyMenuGroupSpy.mockClear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [
                {
                    key: 'quickTop',
                    order: 0,
                    quickLayout: 'icon',
                    children: [{
                        key: 'quickItemTop',
                        order: 0,
                        item: {
                            id: 'quick-item-top',
                            type: MenuItemType.BUTTON,
                        },
                    }],
                },
                {
                    key: 'quickBottom',
                    order: 1,
                    quickLayout: 'icon',
                    children: [{
                        key: 'quickItemBottom',
                        order: 0,
                        item: {
                            id: 'quick-item-bottom',
                            type: MenuItemType.BUTTON,
                        },
                    }],
                },
            ]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        const { container } = render(React.createElement(ContextMenuPanel as never, {
            menuType: 'quick-layout-menu',
            sizeVariant: 'paragraph-t',
        }));

        const tinyGroups = screen.getAllByTestId('tiny-menu-group');
        const sharedCluster = container.querySelector('.univer-gap-0') as HTMLDivElement | null;

        expect(sharedCluster).not.toBeNull();
        expect(sharedCluster?.className ?? '').toContain('univer-py-2');
        expect(sharedCluster?.querySelectorAll('[data-testid="tiny-menu-group"]').length).toBe(2);
        expect(container.querySelectorAll('.univer-gap-0 [data-testid="tiny-menu-group"]').length).toBe(2);
    });

    it('groups consecutive paragraph T header quick rows before rendering', () => {
        expect(getContextMenuSchemaRenderGroups([
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'align', order: 2 },
        ] as never, 'paragraph-t')).toEqual([
            {
                startIndex: 0,
                endIndex: 1,
                menuSchemas: [
                    { key: 'quickTop', order: 0, quickLayout: 'icon' },
                    { key: 'quickBottom', order: 1, quickLayout: 'icon' },
                ],
            },
            {
                startIndex: 2,
                endIndex: 2,
                menuSchemas: [
                    { key: 'align', order: 2 },
                ],
            },
        ]);
    });

    it('uses a fixed six-column layout for header quick icon groups only', () => {
        expect(getContextMenuQuickGroupColumns({
            key: 'quickTop',
            order: 0,
            quickLayout: 'icon',
        } as never)).toBe(6);

        expect(getContextMenuQuickGroupColumns({
            key: 'quickBottom',
            order: 1,
            quickLayout: 'icon',
        } as never)).toBe(6);

        expect(getContextMenuQuickGroupColumns({
            key: 'align',
            order: 0,
            quickLayout: 'icon',
        } as never)).toBeUndefined();
    });

    it('passes compact quick layout metadata through to tiny menu groups', () => {
        dependencyMap.clear();
        tinyMenuGroupSpy.mockClear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'colors',
                order: 0,
                quickLayout: 'icon',
                quickColumns: 8,
                quickLayoutVariant: 'compact',
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        render(React.createElement(ContextMenuPanel as never, {
            menuType: 'quick-layout-menu',
            sizeVariant: 'paragraph-t',
        }));

        expect(tinyMenuGroupSpy.mock.calls[0][0]).toEqual(expect.objectContaining({
            columns: 8,
            layoutVariant: 'compact',
        }));
    });

    it('renders a right-aligned header action for titled context menu groups', () => {
        dependencyMap.clear();
        tinyMenuGroupSpy.mockClear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'colors',
                order: 0,
                title: 'docs-ui.toolbar.textColor.main',
                headerActionItem: {
                    id: 'header-action',
                    type: MenuItemType.BUTTON_SELECTOR,
                    icon: 'HeaderTextColorIcon',
                    tooltip: 'header-action',
                    selections: [],
                },
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        render(React.createElement(ContextMenuPanel as never, {
            menuType: 'quick-layout-menu',
            sizeVariant: 'paragraph-t',
        }));

        expect(document.querySelector('button[title="header-action"]')).not.toBeNull();
    });

    it('renders quick layout group titles before icon rows', () => {
        dependencyMap.clear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'quickGroup',
                order: 0,
                title: 'docs-ui.paragraphMenu.align',
                quickLayout: 'icon',
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        render(<ContextMenuPanel menuType="quick-layout-menu" />);

        expect(screen.getAllByText('docs-ui.paragraphMenu.align').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('tiny-menu-group').length).toBeGreaterThan(0);
    });

    it('keeps the newly hovered submenu open when switching quickly between sibling submenu items', () => {
        vi.useFakeTimers();
        dependencyMap.clear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn((key: string) => {
                if (key === 'submenu-root') {
                    return [
                        {
                            key: 'indent',
                            order: 0,
                            item: {
                                id: 'indent',
                                type: MenuItemType.SUBITEMS,
                                title: 'indent',
                                tooltip: 'indent',
                            },
                        },
                        {
                            key: 'colors',
                            order: 1,
                            item: {
                                id: 'colors',
                                type: MenuItemType.SUBITEMS,
                                title: 'colors',
                                tooltip: 'colors',
                            },
                        },
                    ];
                }

                if (key === 'indent') {
                    return [{
                        key: 'indent-option',
                        order: 0,
                        item: {
                            id: 'indent-option',
                            type: MenuItemType.BUTTON,
                            title: 'indent option',
                        },
                    }];
                }

                if (key === 'colors') {
                    return [{
                        key: 'colors-option',
                        order: 0,
                        item: {
                            id: 'colors-option',
                            type: MenuItemType.BUTTON,
                            title: 'colors option',
                        },
                    }];
                }

                return [];
            }),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        render(<ContextMenuPanel menuType="submenu-root" />);

        const indentButton = document.querySelector('button[title="indent"]') as HTMLButtonElement | null;
        const colorsButton = document.querySelector('button[title="colors"]') as HTMLButtonElement | null;
        expect(indentButton).not.toBeNull();
        expect(colorsButton).not.toBeNull();

        const indentWrapper = indentButton?.parentElement as HTMLDivElement | null;
        const colorsWrapper = colorsButton?.parentElement as HTMLDivElement | null;
        expect(indentWrapper).not.toBeNull();
        expect(colorsWrapper).not.toBeNull();

        act(() => {
            fireEvent.mouseEnter(indentWrapper!);
        });
        expect(document.querySelectorAll(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)).toHaveLength(1);

        act(() => {
            fireEvent.mouseLeave(indentWrapper!, { relatedTarget: colorsWrapper });
            fireEvent.mouseEnter(colorsWrapper!);
        });
        expect(document.querySelectorAll(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(CONTEXT_MENU_SUBMENU_CLOSE_DELAY + 10);
        });
        expect(document.querySelectorAll(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)).toHaveLength(1);

        vi.useRealTimers();
    });
});

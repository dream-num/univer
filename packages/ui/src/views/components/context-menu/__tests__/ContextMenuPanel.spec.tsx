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

import type { ComponentType, ReactElement } from 'react';
import type { IValueOption } from '../../../../services/menu/menu';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { connectInjector } from '../../../../utils/di';
import {
    CONTEXT_MENU_SUBMENU_CLOSE_DELAY,
    CONTEXT_MENU_SUBMENU_PORTAL_ATTR,
    ContextMenuPanel,
    getContextMenuQuickGroupColumns,
    getContextMenuSchemaRenderGroups,
    getNextMenuButtonByDirection,
    shouldShowContextMenuGroupSeparator,
} from '../ContextMenuPanel';

vi.mock('@univerjs/icons', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/icons')>();

    return {
        ...actual,
        CheckMarkIcon: ({ className }: { className?: string }) => <span className={className} data-icon="check-mark" />,
        MoreLeftIcon: ({ className }: { className?: string }) => <span className={className} data-icon="more-left" />,
        MoreRightIcon: ({ className }: { className?: string }) => <span className={className} data-icon="more-right" />,
    };
});

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();
    private readonly _menusByPosition = new Map<string, IMenuSchema[]>();

    setMenus(position: string, menus: IMenuSchema[]): void {
        this._menusByPosition.set(position, menus);
        this.menuChanged$.next();
    }

    getMenuByPositionKey(position: string): IMenuSchema[] {
        return this._menusByPosition.get(position) ?? [];
    }
}

class TestLocaleService {
    readonly direction$ = new BehaviorSubject<'ltr' | 'rtl'>('ltr');

    t(key: string): string {
        return `translated:${key}`;
    }
}

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

class TestLogService {
    warn(): void {}
}

class TestState {
    static selectedOptions: IValueOption[] = [];
    static cancels = 0;

    static reset(): void {
        this.selectedOptions = [];
        this.cancels = 0;
    }
}

function createContextMenuTestInjector() {
    const injector = new Injector();
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    injector.get(IconManager).register({
        AlignLeftIcon: ({ className }: { className?: string }) => <span className={className} data-icon="align-left" />,
        AlignCenterIcon: ({ className }: { className?: string }) => <span className={className} data-icon="align-center" />,
        TextColorIcon: ({ className }: { className?: string }) => <span className={className} data-icon="text-color" />,
        ResetIcon: ({ className }: { className?: string }) => <span className={className} data-icon="reset" />,
    });

    return injector;
}

function renderWithDependencies(
    element: ReactElement,
    menuMap: Record<string, IMenuSchema[]>,
    setupInjector?: (injector: Injector) => void
) {
    const injector = createContextMenuTestInjector();
    setupInjector?.(injector);
    const menuManagerService = injector.get(IMenuManagerService) as unknown as TestMenuManagerService;

    Object.entries(menuMap).forEach(([position, menus]) => menuManagerService.setMenus(position, menus));

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

function createButtonItem(
    key: string,
    options: {
        icon?: string;
        title?: string;
        tooltip?: string;
        params?: Record<string, unknown>;
        activated$?: BehaviorSubject<boolean>;
        hidden$?: BehaviorSubject<boolean>;
    } = {}
): IMenuSchema {
    return {
        key,
        order: 0,
        item: {
            id: key,
            type: MenuItemType.BUTTON,
            icon: options.icon,
            title: options.title,
            tooltip: options.tooltip,
            params: options.params,
            activated$: options.activated$,
            hidden$: options.hidden$,
        },
    };
}

function hasClassToken(element: HTMLElement, token: string): boolean {
    return element.className.split(/\s+/).includes(token);
}

async function nextFrame() {
    await act(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
}

describe('ContextMenuPanel', () => {
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        TestState.reset();
    });

    it('keeps paragraph quick groups visually connected while separating the next normal group', () => {
        const schemas = [
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as IMenuSchema[];

        expect(shouldShowContextMenuGroupSeparator(schemas, 0)).toBe(false);
        expect(shouldShowContextMenuGroupSeparator(schemas, 1)).toBe(true);
        expect(getContextMenuSchemaRenderGroups(schemas, 'paragraph-t')).toEqual([
            {
                startIndex: 0,
                endIndex: 1,
                menuSchemas: [schemas[0], schemas[1]],
            },
            {
                startIndex: 2,
                endIndex: 2,
                menuSchemas: [schemas[2]],
            },
        ]);
        expect(getContextMenuQuickGroupColumns(schemas[0])).toBe(6);
    });

    it('renders paragraph quick menus with real tiny groups and submits the clicked command', () => {
        renderWithDependencies(
            <ContextMenuPanel
                menuType="paragraph-menu"
                sizeVariant="paragraph-t"
                activeItemIds={['align-center']}
                hiddenItemIds={['reset-format']}
                onOptionSelect={(option) => TestState.selectedOptions.push(option)}
            />,
            {
                'paragraph-menu': [
                    {
                        key: 'quickTop',
                        order: 0,
                        title: 'docs-ui.paragraphMenu.align',
                        quickLayout: 'icon',
                        children: [
                            createButtonItem('align-left', {
                                icon: 'AlignLeftIcon',
                                tooltip: 'docs-ui.toolbar.alignLeft',
                            }),
                            createButtonItem('align-center', {
                                icon: 'AlignCenterIcon',
                                tooltip: 'docs-ui.toolbar.alignCenter',
                                params: { horizontalAlign: 'center' },
                            }),
                        ],
                    },
                    {
                        key: 'quickBottom',
                        order: 1,
                        quickLayout: 'icon',
                        children: [
                            createButtonItem('reset-format', {
                                icon: 'ResetIcon',
                                tooltip: 'docs-ui.toolbar.resetFormat',
                            }),
                        ],
                    },
                    {
                        key: 'insert',
                        order: 2,
                        children: [
                            createButtonItem('insert-link', {
                                title: 'docs-ui.toolbar.link',
                                tooltip: 'docs-ui.toolbar.link',
                            }),
                        ],
                    },
                ],
            }
        );

        expect(screen.getByText('translated:docs-ui.paragraphMenu.align')).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'translated:docs-ui.toolbar.resetFormat' })).toBeNull();

        const alignCenterButton = screen.getByRole('button', { name: 'translated:docs-ui.toolbar.alignCenter' });
        expect(hasClassToken(alignCenterButton, 'univer-bg-gray-50')).toBe(true);

        fireEvent.click(alignCenterButton);

        expect(TestState.selectedOptions).toEqual([{
            id: 'align-center',
            label: 'align-center',
            commandId: undefined,
            params: { horizontalAlign: 'center' },
            value: undefined,
            tooltip: 'translated:docs-ui.toolbar.alignCenter',
        }]);
    });

    it('removes a group when all of its children become hidden', async () => {
        const visible$ = new BehaviorSubject(false);
        const hidden$ = new BehaviorSubject(true);

        renderWithDependencies(
            <ContextMenuPanel menuType="context-menu" />,
            {
                'context-menu': [
                    {
                        key: 'hidden-group',
                        order: 0,
                        title: 'docs-ui.hiddenGroup',
                        children: [
                            createButtonItem('hidden-action', {
                                title: 'docs-ui.hiddenAction',
                                tooltip: 'docs-ui.hiddenAction',
                                hidden$,
                            }),
                        ],
                    },
                    {
                        key: 'visible-group',
                        order: 1,
                        title: 'docs-ui.visibleGroup',
                        children: [
                            createButtonItem('visible-action', {
                                title: 'docs-ui.visibleAction',
                                tooltip: 'docs-ui.visibleAction',
                                hidden$: visible$,
                            }),
                        ],
                    },
                ],
            }
        );

        await waitFor(() => {
            expect(screen.queryByText('translated:docs-ui.hiddenGroup')).toBeNull();
        });
        expect(screen.getByText('translated:docs-ui.visibleGroup')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'translated:docs-ui.visibleAction' })).not.toBeNull();
    });

    it('supports keyboard navigation, confirm, and cancel from the real menu DOM', async () => {
        renderWithDependencies(
            <ContextMenuPanel
                menuType="keyboard-menu"
                autoFocus
                onCancel={() => {
                    TestState.cancels += 1;
                }}
                onOptionSelect={(option) => TestState.selectedOptions.push(option)}
            />,
            {
                'keyboard-menu': [
                    {
                        key: 'insert',
                        order: 0,
                        children: [
                            createButtonItem('heading-1', {
                                title: 'docs-ui.heading1',
                                tooltip: 'docs-ui.heading1',
                            }),
                            createButtonItem('callout', {
                                title: 'docs-ui.callout',
                                tooltip: 'docs-ui.callout',
                                params: { block: 'callout' },
                            }),
                        ],
                    },
                ],
            }
        );

        await nextFrame();

        const panel = document.querySelector('[tabindex="-1"]') as HTMLDivElement;
        const headingButton = screen.getByRole('button', { name: 'translated:docs-ui.heading1' });
        const calloutButton = screen.getByRole('button', { name: 'translated:docs-ui.callout' });

        expect(document.activeElement).toBe(headingButton);

        fireEvent.keyDown(panel, { key: 'ArrowDown' });
        expect(document.activeElement).toBe(calloutButton);

        fireEvent.keyDown(panel, { key: 'Enter' });
        expect(TestState.selectedOptions).toEqual([{
            id: 'callout',
            label: 'callout',
            commandId: undefined,
            params: { block: 'callout' },
            value: undefined,
        }]);

        fireEvent.keyDown(panel, { key: 'Escape' });
        expect(TestState.cancels).toBe(1);
    });

    it('selects an option from a selector submenu with the selector command id', () => {
        renderWithDependencies(
            <ContextMenuPanel
                menuType="format-menu"
                onOptionSelect={(option) => TestState.selectedOptions.push(option)}
            />,
            {
                'format-menu': [
                    {
                        key: 'format',
                        order: 0,
                        children: [
                            {
                                key: 'color',
                                order: 0,
                                item: {
                                    id: 'text-color',
                                    type: MenuItemType.BUTTON_SELECTOR,
                                    icon: 'TextColorIcon',
                                    title: 'docs-ui.textColor',
                                    tooltip: 'docs-ui.textColor',
                                    selectionsCommandId: 'doc.command.setTextColor',
                                    selections: [
                                        {
                                            label: 'palette.red',
                                            value: '#ff0000',
                                        },
                                        {
                                            label: 'palette.blue',
                                            value: '#0000ff',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }
        );

        const colorButton = screen.getByRole('button', { name: 'translated:docs-ui.textColor' });
        fireEvent.mouseEnter(colorButton.parentElement as HTMLElement);

        fireEvent.click(screen.getByText('translated:palette.red').closest('button') as HTMLButtonElement);

        expect(TestState.selectedOptions).toEqual([{
            id: 'text-color',
            label: 'color',
            commandId: 'doc.command.setTextColor',
            value: '#ff0000',
        }]);
        expect(document.querySelectorAll(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)).toHaveLength(0);
    });

    it('does not add option padding around a non-selectable custom submenu component', () => {
        renderWithDependencies(
            <ContextMenuPanel menuType="insert-menu" sizeVariant="paragraph-t" />,
            {
                'insert-menu': [
                    {
                        key: 'insert-table',
                        order: 0,
                        item: {
                            id: 'insert-table',
                            type: MenuItemType.BUTTON_SELECTOR,
                            title: 'docs-ui.insertTable',
                            selections: [{
                                label: {
                                    name: 'test-picker',
                                    hoverable: false,
                                    selectable: false,
                                },
                            }],
                        },
                    },
                ],
            },
            (injector) => {
                injector.get(ComponentManager).register('test-picker', () => <div data-testid="test-picker" />);
            }
        );

        const insertButton = screen.getByRole('button', { name: 'translated:docs-ui.insertTable' });
        fireEvent.mouseEnter(insertButton.parentElement as HTMLElement);

        const picker = screen.getByTestId('test-picker');
        const optionWrapper = picker.parentElement?.parentElement as HTMLElement;

        expect(hasClassToken(optionWrapper, 'univer-p-0')).toBe(true);
        expect(hasClassToken(optionWrapper, 'univer-px-3')).toBe(false);
    });

    it('keeps the newly hovered submenu open when moving across sibling submenu items', () => {
        vi.useFakeTimers();

        renderWithDependencies(
            <ContextMenuPanel menuType="submenu-root" />,
            {
                'submenu-root': [
                    {
                        key: 'indent',
                        order: 0,
                        item: {
                            id: 'indent',
                            type: MenuItemType.SUBITEMS,
                            title: 'docs-ui.indent',
                            tooltip: 'docs-ui.indent',
                        },
                    },
                    {
                        key: 'colors',
                        order: 1,
                        item: {
                            id: 'colors',
                            type: MenuItemType.SUBITEMS,
                            title: 'docs-ui.colors',
                            tooltip: 'docs-ui.colors',
                        },
                    },
                ],
                indent: [
                    createButtonItem('indent-more', {
                        title: 'docs-ui.indentMore',
                        tooltip: 'docs-ui.indentMore',
                    }),
                ],
                colors: [
                    createButtonItem('fill-color', {
                        title: 'docs-ui.fillColor',
                        tooltip: 'docs-ui.fillColor',
                    }),
                ],
            }
        );

        const indentButton = screen.getByRole('button', { name: 'translated:docs-ui.indent' });
        const colorsButton = screen.getByRole('button', { name: 'translated:docs-ui.colors' });
        const indentWrapper = indentButton.parentElement as HTMLElement;
        const colorsWrapper = colorsButton.parentElement as HTMLElement;

        act(() => {
            fireEvent.mouseEnter(indentWrapper);
        });
        expect(screen.getByText('translated:docs-ui.indentMore')).not.toBeNull();

        act(() => {
            fireEvent.mouseLeave(indentWrapper, { relatedTarget: colorsWrapper });
            fireEvent.mouseEnter(colorsWrapper);
        });
        expect(screen.getByText('translated:docs-ui.fillColor')).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'translated:docs-ui.indentMore' })).toBeNull();

        act(() => {
            vi.advanceTimersByTime(CONTEXT_MENU_SUBMENU_CLOSE_DELAY + 10);
        });
        expect(screen.getByText('translated:docs-ui.fillColor')).not.toBeNull();
    });

    it('opens submenus to the left by default in rtl when there is enough space', async () => {
        renderWithDependencies(
            <ContextMenuPanel menuType="submenu-root" />,
            {
                'submenu-root': [
                    {
                        key: 'insert',
                        order: 0,
                        item: {
                            id: 'insert',
                            type: MenuItemType.SUBITEMS,
                            title: 'docs-ui.insert',
                            tooltip: 'docs-ui.insert',
                        },
                    },
                ],
                insert: [
                    createButtonItem('insert-row', {
                        title: 'docs-ui.insertRow',
                        tooltip: 'docs-ui.insertRow',
                    }),
                ],
            },
            (injector) => {
                (injector.get(LocaleService) as unknown as TestLocaleService).direction$.next('rtl');
            }
        );

        const insertButton = screen.getByRole('button', { name: 'translated:docs-ui.insert' });
        const insertWrapper = insertButton.parentElement as HTMLElement;
        insertWrapper.getBoundingClientRect = () => ({
            bottom: 140,
            height: 40,
            left: 300,
            right: 420,
            top: 100,
            width: 120,
            x: 300,
            y: 100,
            toJSON: () => ({}),
        });

        act(() => {
            fireEvent.mouseEnter(insertWrapper);
        });

        const submenu = document.querySelector(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`) as HTMLElement;
        submenu.getBoundingClientRect = () => ({
            bottom: 220,
            height: 120,
            left: 0,
            right: 160,
            top: 100,
            width: 160,
            x: 0,
            y: 100,
            toJSON: () => ({}),
        });

        await nextFrame();

        expect(submenu.style.left).toBe('142px');
        expect(submenu.style.paddingRight).toBe('20px');
        expect(submenu.style.paddingLeft).toBe('0px');
    });

    it('renders the submenu affordance toward the opening side in rtl', () => {
        renderWithDependencies(
            <ContextMenuPanel menuType="submenu-root" />,
            {
                'submenu-root': [
                    {
                        key: 'insert',
                        order: 0,
                        item: {
                            id: 'insert',
                            type: MenuItemType.SUBITEMS,
                            title: 'docs-ui.insert',
                            tooltip: 'docs-ui.insert',
                        },
                    },
                ],
                insert: [
                    createButtonItem('insert-row', {
                        title: 'docs-ui.insertRow',
                        tooltip: 'docs-ui.insertRow',
                    }),
                ],
            },
            (injector) => {
                (injector.get(LocaleService) as unknown as TestLocaleService).direction$.next('rtl');
            }
        );

        const insertButton = screen.getByRole('button', { name: 'translated:docs-ui.insert' });

        expect(insertButton.querySelector('[data-icon="more-left"]')).not.toBeNull();
        expect(insertButton.querySelector('[data-icon="more-right"]')).toBeNull();
    });

    it('keeps row navigation on the same visual row until the row boundary', () => {
        const createButton = (left: number, top: number) => ({
            getBoundingClientRect: () => ({
                bottom: top + 32,
                height: 32,
                left,
                right: left + 32,
                top,
                width: 32,
                x: left,
                y: top,
                toJSON: () => ({}),
            }),
        }) as HTMLButtonElement;
        const first = createButton(0, 0);
        const second = createButton(56, 0);
        const nextRow = createButton(4, 40);

        expect(getNextMenuButtonByDirection([first, second, nextRow], 0, 'ArrowRight')).toBe(second);
        expect(getNextMenuButtonByDirection([first, second, nextRow], 1, 'ArrowRight')).toBe(nextRow);
    });
});

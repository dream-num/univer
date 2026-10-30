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

import type { ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceService,
} from '@univerjs/core';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IValueOption } from '../../../../services/menu/menu';
import type { IMenuSchema, MenuSchemaType } from '../../../../services/menu/menu-manager.service';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import enUS from '../../../../locale/en-US';
import { DesktopLayoutService, ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../../../services/menu/menu-manager.service';
import {
    CONTEXT_MENU_SUBMENU_CLOSE_DELAY,
    CONTEXT_MENU_SUBMENU_PORTAL_ATTR,
    ContextMenuPanel,
    getContextMenuQuickGroupColumns,
    getContextMenuSchemaRenderGroups,
    getNextMenuButtonByDirection,
    shouldShowContextMenuGroupSeparator,
} from '../ContextMenuPanel';

// The locally linked icon package uses a separate React runtime for these hook-based icons.
vi.mock('@univerjs/icons', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/icons')>();

    return {
        ...actual,
        CheckMarkIcon: () => <span data-icon="check-mark" />,
        MoreLeftIcon: () => <span data-icon="more-left" />,
        MoreRightIcon: () => <span data-icon="more-right" />,
    };
});

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const injectors: Injector[] = [];

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
    injectors.push(injector);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([LocaleService]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    injector.get(IconManager).register({
        AlignLeftIcon: () => <span />,
        AlignCenterIcon: () => <span />,
        ResetIcon: () => <span />,
    });
    injector.get(ILayoutService).registerRootContainerElement(document.body);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');

    return injector;
}

function renderWithDependencies(
    element: ReactElement,
    menuMap: Record<string, IMenuSchema[]>,
    setupInjector?: (injector: Injector) => void
) {
    const injector = createContextMenuTestInjector();
    setupInjector?.(injector);
    const menuManagerService = injector.get(IMenuManagerService);

    function toMenuSchema(menus: IMenuSchema[]): MenuSchemaType {
        return Object.fromEntries(menus.map(({ key, item, children, ...schema }) => [key, {
            ...schema,
            ...(item ? { menuItemFactory: () => item } : {}),
            ...(children ? toMenuSchema(children) : {}),
        }]));
    }

    menuManagerService.appendRootMenu(Object.fromEntries(
        Object.entries(menuMap).map(([position, menus]) => [position, toMenuSchema(menus)])
    ));

    return render(<RediContext.Provider value={{ injector }}>{element}</RediContext.Provider>);
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

async function nextFrame() {
    await act(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
}

describe('ContextMenuPanel', () => {
    afterEach(() => {
        cleanup();
        injectors.splice(0).forEach((injector) => injector.dispose());
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        TestState.reset();
    });

    it.each([[36, 636], [240, 500]])('keeps the menu fully visible when the editor starts at y=%i', async (containerTop, menuTop) => {
        vi.stubGlobal('innerHeight', 800);
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            return this === document.body
                ? new DOMRect(0, containerTop, 1280, 800 - containerTop)
                : new DOMRect(500, menuTop, 208, 164);
        });
        vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(162);

        const { container } = renderWithDependencies(<ContextMenuPanel menuType="bottom-menu" />, {
            'bottom-menu': [createButtonItem('action', { title: 'Action' })],
        });
        await nextFrame();

        const panel = container.firstElementChild as HTMLElement;
        expect(Number.parseFloat(panel.style.maxHeight)).toBeGreaterThanOrEqual(panel.getBoundingClientRect().height);
    });

    it('limits tall menus to the viewport and restores room when the viewport grows', async () => {
        vi.stubGlobal('innerHeight', 320);
        const { container } = renderWithDependencies(<ContextMenuPanel menuType="tall-menu" />, {
            'tall-menu': Array.from({ length: 30 }, (_, index) => createButtonItem(`action-${index}`, { title: `Action ${index}` })),
        });
        await nextFrame();

        const panel = container.firstElementChild as HTMLElement;
        const initialMaxHeight = Number.parseFloat(panel.style.maxHeight);
        expect(initialMaxHeight).toBeGreaterThan(0);
        expect(initialMaxHeight).toBeLessThanOrEqual(window.innerHeight);

        vi.stubGlobal('innerHeight', 800);
        fireEvent(window, new Event('resize'));
        await nextFrame();

        expect(Number.parseFloat(panel.style.maxHeight)).toBeGreaterThan(initialMaxHeight);
        expect(Number.parseFloat(panel.style.maxHeight)).toBeLessThanOrEqual(window.innerHeight);
    });

    it('keeps paragraph quick groups visually connected while separating the next normal group', () => {
        const schemas = [
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as IMenuSchema[];

        expect(shouldShowContextMenuGroupSeparator(schemas, 0)).toBe(false);
        expect(shouldShowContextMenuGroupSeparator(schemas, 1)).toBe(true);
        expect(getContextMenuSchemaRenderGroups(schemas)).toEqual([
            {
                startIndex: 0,
                endIndex: 0,
                menuSchemas: [schemas[0]],
            },
            {
                startIndex: 1,
                endIndex: 1,
                menuSchemas: [schemas[1]],
            },
            {
                startIndex: 2,
                endIndex: 2,
                menuSchemas: [schemas[2]],
            },
        ]);
        expect(getContextMenuSchemaRenderGroups(schemas, true)).toEqual([
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
        const { container } = renderWithDependencies(
            <ContextMenuPanel
                menuType="paragraph-menu"
                sizeVariant="paragraph-t"
                flowQuickGroups
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
                            createButtonItem('extension-item', {
                                icon: 'ResetIcon',
                                tooltip: 'extension-item',
                            }),
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

        const quickGrids = container.querySelectorAll('.univer-menu-item-group');
        expect(quickGrids).toHaveLength(1);
        expect(screen.getByText('docs-ui.paragraphMenu.align')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'extension-item' })).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'docs-ui.toolbar.resetFormat' })).toBeNull();

        const alignCenterButton = screen.getByRole('button', { name: 'docs-ui.toolbar.alignCenter' });

        fireEvent.click(alignCenterButton);

        expect(TestState.selectedOptions).toEqual([{
            id: 'align-center',
            label: 'align-center',
            commandId: undefined,
            params: { horizontalAlign: 'center' },
            value: undefined,
            tooltip: 'docs-ui.toolbar.alignCenter',
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
            expect(screen.queryByText('docs-ui.hiddenGroup')).toBeNull();
        });
        expect(screen.getByText('docs-ui.visibleGroup')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'docs-ui.visibleAction' })).not.toBeNull();
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
        const headingButton = screen.getByRole('button', { name: 'docs-ui.heading1' });
        const calloutButton = screen.getByRole('button', { name: 'docs-ui.callout' });

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

    it('enters, navigates, and exits a submenu with arrow keys', async () => {
        renderWithDependencies(<ContextMenuPanel menuType="root" />, {
            root: [
                {
                    key: 'arrange',
                    order: 0,
                    item: {
                        id: 'arrange',
                        type: MenuItemType.SUBITEMS,
                        title: 'Arrange',
                    },
                },
            ],
            arrange: [
                createButtonItem('bring-front', { title: 'Bring to Front' }),
                createButtonItem('send-back', { title: 'Send to Back' }),
            ],
        });
        const trigger = screen.getByRole('button', { name: 'Arrange' });
        trigger.focus();

        fireEvent.keyDown(trigger, { key: 'ArrowRight' });
        const first = await screen.findByRole('button', { name: 'Bring to Front' });
        await nextFrame();
        await waitFor(() => expect(document.activeElement).toBe(first));

        fireEvent.keyDown(first, { key: 'ArrowDown' });
        const second = screen.getByRole('button', { name: 'Send to Back' });
        expect(document.activeElement).toBe(second);

        fireEvent.keyDown(second, { key: 'ArrowLeft' });
        expect(document.activeElement).toBe(trigger);
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

        const colorButton = screen.getByRole('button', { name: 'docs-ui.textColor' });
        fireEvent.mouseEnter(colorButton.parentElement as HTMLElement);

        fireEvent.click(screen.getByText('palette.red').closest('button') as HTMLButtonElement);

        expect(TestState.selectedOptions).toEqual([{
            id: 'text-color',
            label: 'color',
            commandId: 'doc.command.setTextColor',
            value: '#ff0000',
        }]);
        expect(document.querySelectorAll(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)).toHaveLength(0);
    });

    it('keeps a custom submenu component interactive without selecting its parent option', async () => {
        const onOptionSelect = vi.fn();
        const onPickerClick = vi.fn();
        renderWithDependencies(
            <ContextMenuPanel menuType="insert-menu" sizeVariant="paragraph-t" onOptionSelect={onOptionSelect} />,
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
                injector.get(ComponentManager).register('test-picker', () => (
                    <button type="button" onClick={onPickerClick}>Pick a value</button>
                ));
            }
        );

        const insertButton = screen.getByRole('button', { name: 'docs-ui.insertTable' });
        fireEvent.mouseEnter(insertButton.parentElement as HTMLElement);
        await nextFrame();

        fireEvent.click(screen.getByRole('button', { name: 'Pick a value' }));

        screen.getByRole('button', { name: 'Pick a value' }).focus();
        const submenu = document.querySelector(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)!;
        fireEvent.mouseLeave(submenu, { relatedTarget: document.body });
        fireEvent.mouseLeave(insertButton.parentElement!, { relatedTarget: document.body });

        expect(onPickerClick).toHaveBeenCalledOnce();
        expect(onOptionSelect).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Pick a value' })).not.toBeNull();
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

        const indentButton = screen.getByRole('button', { name: 'docs-ui.indent' });
        const colorsButton = screen.getByRole('button', { name: 'docs-ui.colors' });
        const indentWrapper = indentButton.parentElement as HTMLElement;
        const colorsWrapper = colorsButton.parentElement as HTMLElement;

        act(() => {
            fireEvent.mouseEnter(indentWrapper);
        });
        expect(screen.getByText('docs-ui.indentMore')).not.toBeNull();

        act(() => {
            fireEvent.mouseLeave(indentWrapper, { relatedTarget: colorsWrapper });
            fireEvent.mouseEnter(colorsWrapper);
        });
        expect(screen.getByText('docs-ui.fillColor')).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'docs-ui.indentMore' })).toBeNull();

        act(() => {
            vi.advanceTimersByTime(CONTEXT_MENU_SUBMENU_CLOSE_DELAY + 10);
        });
        expect(screen.getByText('docs-ui.fillColor')).not.toBeNull();
    });

    it('closes an open submenu when its parent becomes disabled', async () => {
        const disabled$ = new BehaviorSubject(false);

        renderWithDependencies(
            <ContextMenuPanel menuType="submenu-root" />,
            {
                'submenu-root': [
                    {
                        key: 'print',
                        order: 0,
                        item: {
                            id: 'print',
                            type: MenuItemType.SUBITEMS,
                            title: 'docs-ui.print',
                            disabled$,
                        },
                    },
                ],
                print: [
                    createButtonItem('print-layout', {
                        title: 'docs-ui.printLayout',
                    }),
                ],
            }
        );

        const printButton = screen.getByRole('button', { name: 'docs-ui.print' });
        fireEvent.mouseEnter(printButton.parentElement as HTMLElement);
        expect(screen.getByText('docs-ui.printLayout')).not.toBeNull();

        act(() => disabled$.next(true));
        await waitFor(() => expect(screen.queryByText('docs-ui.printLayout')).toBeNull());
    });

    it('keeps a submenu inside the viewport when its color editor grows', async () => {
        vi.stubGlobal('innerHeight', 600);
        const resizeCallbacks = new Map<Element, () => void>();
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            constructor(private readonly callback: () => void) {}
            observe(element: Element) { resizeCallbacks.set(element, this.callback); }
            disconnect = disconnect;
        });
        const view = renderWithDependencies(
            <ContextMenuPanel menuType="color-root" />,
            {
                'color-root': [{
                    key: 'color',
                    order: 0,
                    item: {
                        id: 'color',
                        type: MenuItemType.SELECTOR,
                        title: 'Color',
                        selections: [{ label: 'Custom color', value: '#123456' }],
                    },
                }],
            }
        );
        const button = screen.getByRole('button', { name: 'Color' });
        vi.spyOn(button.parentElement!, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 400, 160, 32));
        fireEvent.click(button);
        const submenu = document.querySelector<HTMLElement>(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}="true"]`)!;
        let height = 100;
        vi.spyOn(submenu, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 288, height));
        await nextFrame();
        height = 320;
        act(() => resizeCallbacks.get(submenu)!());
        expect(Number.parseFloat(submenu.style.top) + height).toBeLessThanOrEqual(window.innerHeight);
        expect(Number.parseFloat(submenu.style.top)).toBeGreaterThanOrEqual(0);
        view.unmount();
        expect(disconnect).toHaveBeenCalled();
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
                injector.get(LocaleService).setDirection('rtl');
            }
        );

        const insertButton = screen.getByRole('button', { name: 'docs-ui.insert' });
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
                injector.get(LocaleService).setDirection('rtl');
            }
        );

        const insertButton = screen.getByRole('button', { name: 'docs-ui.insert' });

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

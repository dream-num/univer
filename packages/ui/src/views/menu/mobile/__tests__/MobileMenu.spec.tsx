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
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../../../services/menu/menu-manager.service';
import { RediProvider } from '../../../../utils/di';
import { MobileMenu } from '../MobileMenu';

function renderWithDependencies(
    schemas: IMenuSchema[],
    onOptionSelect: NonNullable<ComponentProps<typeof MobileMenu>['onOptionSelect']>,
    props?: Pick<ComponentProps<typeof MobileMenu>, 'showHeader' | 'onNavigationChange' | 'presentation'>
) {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);
    injector.get(ComponentManager).register('interactive-test-label', () => <button type="button">Nested control</button>);
    injector.get(ComponentManager).register('interactive-button-label', (props: { value?: number; onChange?: (value: number) => void }) => (
        <button type="button" onClick={() => props.onChange?.((props.value ?? 0) + 1)}>
            Increase
        </button>
    ));
    injector.get(ComponentManager).register('plain-custom-label', () => <span>Plain custom action</span>);

    const renderMenu = (nextSchemas: IMenuSchema[]) => (
        <RediProvider value={{ injector }}>
            <MobileMenu schemas={nextSchemas} onOptionSelect={onOptionSelect} {...props} />
        </RediProvider>
    );
    const result = render(renderMenu(schemas));

    return {
        ...result,
        rerenderWithSchemas(nextSchemas: IMenuSchema[]) {
            result.rerender(renderMenu(nextSchemas));
        },
    };
}

afterEach(cleanup);

describe('MobileMenu', () => {
    it('renders grouped context menu items as a horizontal text-only bar', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'quick',
            order: 0,
            children: [{
                key: 'copy',
                order: 0,
                item: { id: 'copy', type: MenuItemType.BUTTON, title: 'Copy' },
            }, {
                key: 'clear',
                order: 1,
                item: { id: 'clear', type: MenuItemType.SUBITEMS, title: 'Clear' },
                children: [{
                    key: 'clear.all',
                    order: 0,
                    item: { id: 'clear.all', type: MenuItemType.BUTTON, title: 'Clear all' },
                }],
            }],
        }], onOptionSelect, { presentation: 'context-bar' });

        const bar = document.querySelector('[data-u-comp="mobile-context-menu-bar"]');
        const copy = screen.getByRole('menuitem', { name: 'Copy' });
        expect(bar).toBeTruthy();
        expect(copy.querySelector('svg')).toBeNull();
        expect(copy.className).toContain('univer-snap-start');
        expect(copy.className).toContain('univer-outline-none');

        fireEvent.click(screen.getByRole('menuitem', { name: 'Clear' }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'Clear all' }));
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'clear.all' }));
    });

    it('uses the shared mobile touch target and dark theme surface', () => {
        renderWithDependencies([
            {
                key: 'insert',
                order: 0,
                item: {
                    id: 'insert.menu',
                    type: MenuItemType.BUTTON,
                    title: 'Insert',
                },
            },
        ], vi.fn());

        const menuItem = screen.getByRole('button', { name: 'Insert' });
        expect(menuItem.className).toContain('univer-min-h-12');
        expect(menuItem.className).toContain('dark:!univer-bg-gray-800');
    });

    it('uses a toolbar tooltip as the mobile menu label', () => {
        renderWithDependencies([
            {
                key: 'image',
                order: 0,
                item: {
                    id: 'image.menu',
                    type: MenuItemType.SUBITEMS,
                    tooltip: 'Insert image',
                },
                children: [
                    {
                        key: 'image.float',
                        order: 0,
                        item: {
                            id: 'image.float',
                            type: MenuItemType.BUTTON,
                            title: 'Floating image',
                        },
                    },
                ],
            },
        ], vi.fn());

        fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));
        expect(screen.getByText('Insert image')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Floating image' })).toBeTruthy();
    });

    it('can delegate nested navigation to a drawer header', async () => {
        const onNavigationChange = vi.fn();
        renderWithDependencies([
            {
                key: 'image',
                order: 0,
                item: { id: 'image.menu', type: MenuItemType.SUBITEMS, title: 'Image' },
                children: [{
                    key: 'image.float',
                    order: 0,
                    item: { id: 'image.float', type: MenuItemType.BUTTON, title: 'Floating image' },
                }],
            },
        ], vi.fn(), { showHeader: false, onNavigationChange });

        fireEvent.click(screen.getByRole('button', { name: 'Image' }));
        await waitFor(() => expect(onNavigationChange).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Image' })));
        expect(screen.queryByText('Image')).toBeNull();
        expect(screen.getByRole('button', { name: 'Floating image' })).toBeTruthy();
    });

    it('keeps an open child view when an equivalent schema array is recreated', () => {
        const createSchemas = (): IMenuSchema[] => [{
            key: 'image',
            order: 0,
            item: { id: 'image.menu', type: MenuItemType.SUBITEMS, title: 'Image' },
            children: [{
                key: 'image.float',
                order: 0,
                item: { id: 'image.float', type: MenuItemType.BUTTON, title: 'Floating image' },
            }],
        }];
        const rendered = renderWithDependencies(createSchemas(), vi.fn());

        fireEvent.click(screen.getByRole('button', { name: 'Image' }));
        rendered.rerenderWithSchemas(createSchemas());

        expect(screen.getByRole('button', { name: 'Floating image' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Image' })).toBeNull();
    });

    it('returns through every nested level using the delegated drawer back action', async () => {
        let navigation: { title?: string; onBack: () => void } | null = null;
        renderWithDependencies([{
            key: 'insert',
            order: 0,
            item: { id: 'insert.menu', type: MenuItemType.SUBITEMS, title: 'Insert' },
            children: [{
                key: 'rows',
                order: 0,
                item: { id: 'rows.menu', type: MenuItemType.SUBITEMS, title: 'Rows' },
                children: [{
                    key: 'rows.above',
                    order: 0,
                    item: { id: 'rows.above', type: MenuItemType.BUTTON, title: 'Above' },
                }],
            }],
        }], vi.fn(), {
            showHeader: false,
            onNavigationChange: (nextNavigation) => {
                navigation = nextNavigation;
            },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Insert' }));
        fireEvent.click(screen.getByRole('button', { name: 'Rows' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Above' })).toBeTruthy());

        act(() => navigation?.onBack());
        await waitFor(() => expect(screen.getByRole('button', { name: 'Rows' })).toBeTruthy());
        expect(screen.queryByRole('button', { name: 'Above' })).toBeNull();

        act(() => navigation?.onBack());
        await waitFor(() => expect(screen.getByRole('button', { name: 'Insert' })).toBeTruthy());
    });

    it('disables an open child view when its parent becomes disabled', async () => {
        const disabled$ = new BehaviorSubject(false);
        const onOptionSelect = vi.fn();

        renderWithDependencies([
            {
                key: 'print',
                order: 0,
                item: {
                    id: 'print.menu',
                    type: MenuItemType.SUBITEMS,
                    title: 'Print',
                    disabled$,
                },
                children: [
                    {
                        key: 'print.layout',
                        order: 0,
                        item: {
                            id: 'print.layout',
                            type: MenuItemType.BUTTON,
                            title: 'Print layout',
                        },
                    },
                ],
            },
        ], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: 'Print' }));
        const child = screen.getByRole('button', { name: 'Print layout' });
        expect(child.hasAttribute('disabled')).toBe(false);

        act(() => disabled$.next(true));
        await waitFor(() => expect(child.hasAttribute('disabled')).toBe(true));
        fireEvent.click(child);
        expect(onOptionSelect).not.toHaveBeenCalled();
    });

    it('disables a submenu when every child is hidden', async () => {
        const childHidden$ = new BehaviorSubject(true);

        renderWithDependencies([{
            key: 'insert',
            order: 0,
            item: { id: 'insert.menu', type: MenuItemType.SUBITEMS, title: 'Insert' },
            children: [{
                key: 'insert.row',
                order: 0,
                item: {
                    id: 'insert.row',
                    type: MenuItemType.BUTTON,
                    title: 'Insert row',
                    hidden$: childHidden$,
                },
            }],
        }], vi.fn());

        const insert = screen.getByRole('button', { name: 'Insert' });
        await waitFor(() => expect(insert.hasAttribute('disabled')).toBe(true));

        act(() => childHidden$.next(false));
        await waitFor(() => expect(insert.hasAttribute('disabled')).toBe(false));
    });

    it('keeps a button-selector action available beside its auxiliary submenu items', () => {
        const activated$ = new BehaviorSubject(false);
        const onOptionSelect = vi.fn();

        renderWithDependencies([{
            key: 'filter',
            order: 0,
            item: {
                id: 'filter.toggle',
                type: MenuItemType.BUTTON_SELECTOR,
                title: 'Filter',
                activated$,
            },
            children: [{
                key: 'filter.clear',
                order: 0,
                item: { id: 'filter.clear', type: MenuItemType.BUTTON, title: 'Clear filter' },
            }],
        }], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
        const toggle = screen.getByRole('button', { name: 'Filter' });
        expect(screen.getByRole('button', { name: 'Clear filter' })).toBeTruthy();

        fireEvent.click(toggle);
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'filter.toggle' }));

        act(() => activated$.next(true));
        expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });

    it('executes every supported actionable menu type with its command metadata', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([
            {
                key: 'button',
                order: 0,
                item: {
                    id: 'button.menu',
                    commandId: 'button.command',
                    type: MenuItemType.BUTTON,
                    title: 'Button',
                    params: { source: 'mobile' },
                },
            },
            {
                key: 'toggle',
                order: 1,
                item: {
                    id: 'toggle.menu',
                    commandId: 'toggle.command',
                    type: MenuItemType.BUTTON_SELECTOR,
                    title: 'Toggle',
                    value$: new BehaviorSubject('on'),
                },
            },
            {
                key: 'selector',
                order: 2,
                item: {
                    id: 'selector.menu',
                    type: MenuItemType.SELECTOR,
                    title: 'Selector',
                    value$: new BehaviorSubject('first'),
                    selections: [
                        { label: 'First', value: 'first', commandId: 'selector.command' },
                        { label: 'Disabled', value: 'disabled', commandId: 'disabled.command', disabled: true },
                    ],
                },
            },
            {
                key: 'submenu',
                order: 3,
                item: { id: 'submenu.menu', type: MenuItemType.SUBITEMS, title: 'Submenu' },
                children: [{
                    key: 'nested',
                    order: 0,
                    item: { id: 'nested.menu', commandId: 'nested.command', type: MenuItemType.BUTTON, title: 'Nested' },
                }],
            },
        ], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: 'Button' }));
        fireEvent.click(screen.getByRole('button', { name: /Toggle/ }));
        fireEvent.click(screen.getByRole('button', { name: /Selector/ }));
        expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-pressed')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'First' }));
        fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
        fireEvent.click(screen.getByRole('button', { name: 'ui.navigation.back' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submenu' }));
        fireEvent.click(screen.getByRole('button', { name: 'Nested' }));

        expect(onOptionSelect.mock.calls.map(([option]) => option)).toEqual([
            expect.objectContaining({ id: 'button.menu', commandId: 'button.command', params: { source: 'mobile' } }),
            expect.objectContaining({ id: 'toggle.menu', commandId: 'toggle.command', value: 'on' }),
            expect.objectContaining({ id: 'selector.menu', commandId: 'selector.command', value: 'first' }),
            expect.objectContaining({ id: 'nested.menu', commandId: 'nested.command' }),
        ]);
    });

    it('does not wrap an interactive custom selector component in another button', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'shape',
            order: 0,
            item: {
                id: 'shape.menu',
                type: MenuItemType.SELECTOR,
                title: 'Shape',
                value$: new BehaviorSubject('rectangle'),
                selections: [{
                    value: 'rectangle',
                    label: { name: 'interactive-test-label', props: {} },
                }],
            },
        }], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: /Shape/ }));
        const nestedControl = screen.getByRole('button', { name: 'Nested control' });
        expect(nestedControl.parentElement?.closest('button')).toBeNull();
        expect(nestedControl.closest('.univer-overflow-y-auto')).toBeNull();
        fireEvent.click(nestedControl);
        expect(onOptionSelect).not.toHaveBeenCalled();
    });

    it('executes a custom selector when its component changes value', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'color',
            order: 0,
            item: {
                id: 'color.menu',
                type: MenuItemType.SELECTOR,
                title: 'Color',
                selections: [{
                    value: 1,
                    commandId: 'color.command',
                    label: { name: 'interactive-button-label', props: {} },
                }],
            },
        }], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: /Color/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'color.menu',
            commandId: 'color.command',
            value: 2,
        }));
    });

    it('keeps an unregistered object label as a clickable localized option', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'conditional-formatting',
            order: 0,
            item: {
                id: 'conditional-formatting.menu',
                type: MenuItemType.SELECTOR,
                title: 'Conditional formatting',
                selections: [{
                    value: 'create',
                    label: { name: 'Create rule', selectable: false },
                }],
            },
        }], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: /Conditional formatting/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Create rule' }));
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'conditional-formatting.menu',
            value: 'create',
        }));
    });

    it('lets an interactive custom button component execute without nesting buttons', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'insert.rows',
            order: 0,
            item: {
                id: 'insert.rows',
                commandId: 'insert.rows.command',
                type: MenuItemType.BUTTON,
                value$: new BehaviorSubject(2),
                label: { name: 'interactive-button-label', props: {} },
            },
        }], onOptionSelect);

        const increase = screen.getByRole('button', { name: 'Increase' });
        expect(increase.parentElement?.closest('button')).toBeNull();
        fireEvent.click(increase);
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'insert.rows',
            commandId: 'insert.rows.command',
            value: 3,
        }));
    });

    it('keeps a plain custom button label clickable', () => {
        const onOptionSelect = vi.fn();
        renderWithDependencies([{
            key: 'freeze.selection',
            order: 0,
            item: {
                id: 'freeze.selection',
                type: MenuItemType.BUTTON,
                label: { name: 'plain-custom-label', props: {} },
            },
        }], onOptionSelect);

        fireEvent.click(screen.getByText('Plain custom action'));
        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'freeze.selection' }));
    });
});

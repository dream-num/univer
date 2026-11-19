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
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { ContextService, ICommandService, IContextService, ILogService, Injector, IUniverInstanceService, LocaleService, LocaleType, UniverInstanceService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import enUS from '../../../../locale/en-US';
import { ContextMenuHostService, IContextMenuHostService } from '../../../../services/contextmenu/contextmenu-host.service';
import { DesktopDialogService } from '../../../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { IUIPartsService, UIPartsService } from '../../../../services/parts/parts.service';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { DesktopSidebarService } from '../../../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../../../services/sidebar/sidebar.service';
import { connectInjector } from '../../../../utils/di';
import { RibbonOverflow } from '../RibbonOverflow';

const injectors: Injector[] = [];

function mountOverflow(groups: IMenuSchema[]) {
    const executeCommand = vi.fn(async () => true);
    const injector = new Injector([
        [ComponentManager],
        [IContextMenuHostService, { useClass: ContextMenuHostService }],
        [IconManager, { useValue: { get: () => null } }],
        [LocaleService],
        [ICommandService, { useValue: { executeCommand } }],
        [ILayoutService, { useValue: { focus: () => document.getElementById('editor')?.focus() } }],
        [IContextService, { useClass: ContextService }],
        [ILogService, { useValue: { warn: () => {} } }],
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [IMenuManagerService, { useValue: { menuChanged$: new Subject(), getMenuByPositionKey: () => [] } }],
        [IShortcutService, { useValue: { shortcutChanged$: new Subject(), getShortcutDisplayOfCommand: () => null, forceEscape: () => ({ dispose: () => {} }) } }],
        [IDialogService, { useClass: DesktopDialogService }],
        [ISidebarService, { useClass: DesktopSidebarService }],
        [IUIPartsService, { useClass: UIPartsService }],
    ]);
    injectors.push(injector);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.get(ComponentManager).register('FontField', () => <input aria-label="Font" defaultValue="Arial" />);
    const ConnectedOverflow = connectInjector(RibbonOverflow, injector) as ComponentType<{ groups: IMenuSchema[]; grid?: boolean }>;
    return { ...render(
        <>
            <input id="editor" aria-label="Editor" />
            <ConnectedOverflow groups={groups} grid />
        </>
    ), injector, executeCommand, ConnectedOverflow };
}

function createGroups(disabled$ = new BehaviorSubject(false)): IMenuSchema[] {
    return [{
        key: 'format',
        title: 'Formatting',
        order: 0,
        children: [
            { key: 'bold', order: 0, item: { id: 'bold', type: MenuItemType.BUTTON, title: 'Bold', disabled$ } },
            { key: 'font', order: 1, item: { id: 'font', type: MenuItemType.SELECTOR, tooltip: 'Font family', label: 'FontField' } },
            { key: 'alignment', order: 2, item: { id: 'alignment', type: MenuItemType.SELECTOR, title: 'Alignment', selections: [{ label: 'Left', value: 'left' }] } },
        ],
    }];
}

afterEach(() => {
    cleanup();
    injectors.splice(0).forEach((injector) => injector.dispose());
});

describe('RibbonOverflow', () => {
    it('closes More when an independent viewer takes over and keeps it closed until exit', async () => {
        const groups: IMenuSchema[] = [{ key: 'tools', order: 0, children: [{
            key: 'history',
            order: 0,
            item: { id: 'history', type: MenuItemType.BUTTON, title: 'History' },
        }] }];
        const { injector, getByRole, queryByRole, executeCommand } = mountOverflow(groups);
        const menuHost = injector.get(IContextMenuHostService);
        let viewer: ReturnType<IContextMenuHostService['suspend']> | undefined;
        executeCommand.mockImplementationOnce(async () => {
            viewer = menuHost.suspend();
            return true;
        });
        fireEvent.click(getByRole('button', { name: 'More' }));
        fireEvent.click(getByRole('button', { name: 'History' }));
        await waitFor(() => expect(queryByRole('dialog', { name: 'More' })).toBeNull());
        fireEvent.click(getByRole('button', { name: 'More' }));
        expect(queryByRole('dialog', { name: 'More' })).toBeNull();
        act(() => viewer?.dispose());
        fireEvent.click(getByRole('button', { name: 'More' }));
        expect(getByRole('button', { name: 'History' })).toBeTruthy();
    });

    it('keeps formatting available after editor focus and respects live disabled state', () => {
        const disabled$ = new BehaviorSubject(false);
        const { getByRole, executeCommand } = mountOverflow(createGroups(disabled$));
        fireEvent.click(getByRole('button', { name: 'More' }));
        fireEvent.change(getByRole('textbox', { name: 'Font' }), { target: { value: 'Courier New' } });
        fireEvent.click(getByRole('button', { name: 'Bold' }));
        expect((getByRole('textbox', { name: 'Font' }) as HTMLInputElement).value).toBe('Courier New');
        expect(executeCommand).toHaveBeenCalledWith('bold', undefined);
        expect(document.activeElement).toBe(getByRole('textbox', { name: 'Editor' }));
        expect(getByRole('dialog', { name: 'More' })).toBeTruthy();
        act(() => disabled$.next(true));
        fireEvent.click(getByRole('button', { name: 'Bold' }));
        expect(executeCommand).toHaveBeenCalledTimes(1);
    });

    it('closes nested selectors before More and returns keyboard focus to their triggers', async () => {
        const { getByRole, queryByRole } = mountOverflow(createGroups());
        const more = getByRole('button', { name: 'More' });
        more.focus();
        fireEvent.keyDown(more, { key: 'Enter' });
        fireEvent.click(more);
        const alignment = getByRole('button', { name: 'Alignment' });
        alignment.focus();
        fireEvent.keyDown(alignment, { key: 'Enter' });
        expect(getByRole('menuitem', { name: 'Left' })).toBeTruthy();
        fireEvent.keyDown(getByRole('menu'), { key: 'Escape' });
        await waitFor(() => expect(queryByRole('menu')).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(alignment));
        expect(getByRole('dialog', { name: 'More' })).toBeTruthy();
        fireEvent.keyDown(alignment, { key: 'Escape' });
        await waitFor(() => expect(queryByRole('dialog')).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(more));
    });

    it.each(['sidebar', 'dialog'] as const)('closes when an independent %s opens', async (surface) => {
        const { getByRole, queryByRole, injector } = mountOverflow(createGroups());
        fireEvent.click(getByRole('button', { name: 'More' }));
        act(() => {
            if (surface === 'sidebar') {
                injector.get(ISidebarService).open({ id: 'format' });
            } else {
                injector.get(IDialogService).open({ id: 'format' });
            }
        });
        await waitFor(() => expect(queryByRole('dialog')).toBeNull());
        fireEvent.click(getByRole('button', { name: 'More' }));
        act(() => {
            if (surface === 'sidebar') {
                injector.get(ISidebarService).close();
            } else {
                injector.get(IDialogService).open({ id: 'format', width: 500 });
                injector.get(IDialogService).close('format');
            }
        });
        expect(getByRole('dialog', { name: 'More' })).toBeTruthy();
    });

    it('replaces an open menu when its groups change', () => {
        const { getByRole, queryByRole, rerender, ConnectedOverflow } = mountOverflow(createGroups());
        fireEvent.click(getByRole('button', { name: 'More' }));
        rerender(<ConnectedOverflow groups={[{ key: 'new', order: 0, title: 'New group', children: [{ key: 'new-action', order: 0, item: { id: 'new-action', type: MenuItemType.BUTTON, title: 'New action' } }] }]} />);
        expect(queryByRole('dialog')).toBeNull();
        fireEvent.click(getByRole('button', { name: 'More' }));
        const popup = getByRole('dialog');
        expect(within(popup).queryByRole('button', { name: 'Bold' })).toBeNull();
        expect(within(popup).getByRole('button', { name: 'New action' })).toBeTruthy();
    });
});

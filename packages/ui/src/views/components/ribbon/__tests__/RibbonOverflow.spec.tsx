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
import { TransientUIController } from '../../../../controllers/transient-ui.controller';
import enUS from '../../../../locale/en-US';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { ISidebarService } from '../../../../services/sidebar/sidebar.service';
import { ITransientUIService, TransientUIService } from '../../../../services/transient-ui/transient-ui.service';
import { connectInjector } from '../../../../utils/di';
import { RibbonOverflow } from '../RibbonOverflow';

const injectors: Injector[] = [];

function mountOverflow(groups: IMenuSchema[]) {
    const sidebarOptions$ = new Subject<{ visible: boolean }>();
    const dialogs$ = new Subject<Array<{ id: string; open: boolean }>>();
    const executeCommand = vi.fn(async () => true);
    const injector = new Injector([
        [ComponentManager],
        [TransientUIController],
        [ITransientUIService, { useClass: TransientUIService }],
        [IconManager, { useValue: { get: () => null } }],
        [LocaleService],
        [ICommandService, { useValue: { executeCommand } }],
        [ILayoutService, { useValue: { focus: () => document.getElementById('editor')?.focus() } }],
        [IContextService, { useClass: ContextService }],
        [ILogService, { useValue: { warn: () => {} } }],
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [IMenuManagerService, { useValue: { menuChanged$: new Subject(), getMenuByPositionKey: () => [] } }],
        [IShortcutService, { useValue: { shortcutChanged$: new Subject(), getShortcutDisplayOfCommand: () => null, forceEscape: () => ({ dispose: () => {} }) } }],
        [IDialogService, { useValue: { getDialogs$: () => dialogs$ } }],
        [ISidebarService, { useValue: { sidebarOptions$ } }],
    ]);
    injectors.push(injector);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.get(TransientUIController);
    injector.get(ComponentManager).register('FontField', () => <input aria-label="Font" defaultValue="Arial" />);
    const ConnectedOverflow = connectInjector(RibbonOverflow, injector) as ComponentType<{ groups: IMenuSchema[]; grid?: boolean }>;
    return { ...render(
        <>
            <input id="editor" aria-label="Editor" />
            <ConnectedOverflow groups={groups} grid />
        </>
    ), injector, executeCommand, sidebarOptions$, dialogs$, ConnectedOverflow };
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
        const transientUI = injector.get(ITransientUIService);
        let viewer: ReturnType<ITransientUIService['suspend']> | undefined;
        executeCommand.mockImplementationOnce(async () => {
            viewer = transientUI.suspend();
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
        fireEvent.click(getByRole('button', { name: 'Bold' }));
        expect(executeCommand).toHaveBeenCalledWith('bold', undefined);
        expect(document.activeElement).toBe(getByRole('textbox', { name: 'Editor' }));
        expect(getByRole('dialog', { name: 'More' })).toBeTruthy();
        act(() => disabled$.next(true));
        fireEvent.click(getByRole('button', { name: 'Bold' }));
        expect(executeCommand).toHaveBeenCalledTimes(1);
    });

    it('preserves custom controls without duplicating their label', () => {
        const { getByRole, queryByText } = mountOverflow(createGroups());
        fireEvent.click(getByRole('button', { name: 'More' }));
        expect(getByRole('textbox', { name: 'Font' }).getAttribute('value')).toBe('Arial');
        expect(queryByText('Font family')).toBeNull();
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
        const { getByRole, queryByRole, sidebarOptions$, dialogs$ } = mountOverflow(createGroups());
        fireEvent.click(getByRole('button', { name: 'More' }));
        act(() => {
            if (surface === 'sidebar') sidebarOptions$.next({ visible: true });
            else dialogs$.next([{ id: 'format', open: true }]);
        });
        await waitFor(() => expect(queryByRole('dialog')).toBeNull());
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

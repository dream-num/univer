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
import type { IValueOption } from '../../../../services/menu/menu';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ICommandService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { MenuManagerPosition } from '../../../../services/menu/types';
import { IRibbonService } from '../../../../services/ribbon/ribbon.service';
import { RediProvider } from '../../../../utils/di';
import { FEATURE_SEARCH_DIALOG_ID, FeatureSearch } from '../FeatureSearch';

const hidden$ = new BehaviorSubject(true);
const disabled$ = new BehaviorSubject(true);
const pendingHidden$ = new Subject<boolean>();
const submenuHidden$ = new BehaviorSubject(false);
const submenuDisabled$ = new BehaviorSubject(true);
const selectorOptions: IValueOption[] = [
    {
        commandId: 'format.rows.command',
        value: 'row',
        label: 'Format rows',
        params: (value) => ({ value, source: 'selector' }),
    },
    {
        commandId: 'format.disabled.command',
        value: 'disabled',
        label: 'Disabled format',
        disabled: true,
    },
];
const selectorOptions$ = new BehaviorSubject<IValueOption[]>([]);

const ribbon: IMenuSchema[] = [{
    key: 'ribbon.start',
    order: 0,
    title: 'ui.ribbon.start',
    children: [
        {
            key: 'run',
            order: 0,
            item: {
                id: 'run.command',
                type: MenuItemType.BUTTON,
                title: 'test.run',
                params: { source: 'menu' },
            },
        },
        {
            key: 'format',
            order: 1,
            item: {
                id: 'format.command',
                type: MenuItemType.SELECTOR,
                title: 'test.format',
                selections: selectorOptions$,
                disabled$,
            },
        },
        {
            key: 'hidden',
            order: 3,
            item: {
                id: 'hidden.command',
                type: MenuItemType.BUTTON,
                title: 'test.hidden',
                hidden$,
            },
        },
        {
            key: 'disabled',
            order: 4,
            item: {
                id: 'disabled.command',
                type: MenuItemType.BUTTON,
                title: 'test.disabled',
                disabled$,
            },
        },
        {
            key: 'pending',
            order: 5,
            item: {
                id: 'pending.command',
                type: MenuItemType.BUTTON,
                title: 'test.pending',
                hidden$: pendingHidden$,
            },
        },
        {
            key: 'print',
            order: 2,
            item: {
                id: 'print.menu',
                type: MenuItemType.SUBITEMS,
                title: 'test.print',
                hidden$: submenuHidden$,
                disabled$: submenuDisabled$,
            },
            children: [
                {
                    key: 'print.action',
                    order: 0,
                    item: {
                        id: 'print.action',
                        type: MenuItemType.BUTTON,
                        title: 'test.print',
                    },
                },
                {
                    key: 'print.layout',
                    order: 1,
                    item: {
                        id: 'print.layout',
                        type: MenuItemType.BUTTON,
                        title: 'test.printLayout',
                    },
                },
            ],
        },
    ],
}];

const contextMenu: IMenuSchema[] = [{
    key: 'contextMenu.mainArea',
    order: 0,
    children: [
        {
            key: 'run-context',
            order: 0,
            item: {
                id: 'run.command',
                type: MenuItemType.BUTTON,
                title: 'test.run',
                params: () => ({ source: 'menu' }),
            },
        },
        {
            key: 'run-context-variant',
            order: 1,
            item: {
                id: 'run.command',
                type: MenuItemType.BUTTON,
                title: 'test.run',
                params: { source: 'context' },
            },
        },
    ],
}];

const contextualRibbon: IMenuSchema = {
    key: 'ribbon.target',
    order: 10,
    title: 'test.targetTab',
    contextual: true,
    children: [{
        key: 'ribbon.target.group',
        order: 0,
        children: [{
            key: 'target.action',
            order: 0,
            item: {
                id: 'target.action',
                type: MenuItemType.BUTTON,
                title: 'test.targetAction',
            },
        }],
    }],
};
const visibleRibbon$ = new BehaviorSubject<IMenuSchema[]>(ribbon);

class TestLocaleService {
    readonly localeChanged$ = new Subject<void>();

    t(key: string) {
        return ({
            'ui.featureSearch.ribbon': 'Ribbon',
            'ui.featureSearch.contextMenu': 'Context menu',
            'ui.featureSearch.placeholder': 'Search features',
            'ui.featureSearch.empty': 'No features',
            'ui.ribbon.start': 'Start',
            'test.run': 'Run',
            'test.format': 'Format',
            'test.print': 'Print',
            'test.printLayout': 'Print layout',
            'test.hidden': 'Hidden',
            'test.disabled': 'Disabled',
            'test.pending': 'Pending',
            'test.targetTab': 'Target',
            'test.targetAction': 'Target action',
        } as Record<string, string>)[key] ?? key;
    }
}

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    getMenuByPositionKey(position: string) {
        return position === MenuManagerPosition.RIBBON ? [...ribbon, contextualRibbon] : contextMenu;
    }
}

function renderWithDependencies(element: ReactElement) {
    const commandService = { executeCommand: vi.fn().mockResolvedValue(true) };
    const dialogService = { close: vi.fn() };
    const layoutService = { focus: vi.fn() };
    const injector = new Injector();

    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([IRibbonService, { useValue: { ribbon$: visibleRibbon$ } as never }]);
    injector.add([ICommandService, { useValue: commandService as never }]);
    injector.add([IDialogService, { useValue: dialogService as never }]);
    injector.add([ILayoutService, { useValue: layoutService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    return {
        ...render(<RediProvider value={{ injector }}>{element}</RediProvider>),
        commandService,
        dialogService,
        layoutService,
    };
}

afterEach(() => {
    hidden$.next(true);
    disabled$.next(true);
    submenuHidden$.next(false);
    submenuDisabled$.next(true);
    selectorOptions$.next([]);
    visibleRibbon$.next(ribbon);
    cleanup();
});

describe('FeatureSearch', () => {
    it('searches only currently visible ribbon tabs', async () => {
        renderWithDependencies(<FeatureSearch />);

        await screen.findAllByText('Run');
        expect(screen.queryByText('Target action')).toBeNull();

        act(() => visibleRibbon$.next([...ribbon, contextualRibbon]));
        expect(await screen.findByText('Target action')).toBeTruthy();

        act(() => visibleRibbon$.next(ribbon));
        await waitFor(() => expect(screen.queryByText('Target action')).toBeNull());
    });

    it('hides hidden and disabled items', async () => {
        renderWithDependencies(<FeatureSearch />);

        const runLabels = await screen.findAllByText('Run');
        expect(runLabels).toHaveLength(2);
        expect(runLabels.filter((label) => (
            label.closest('[cmdk-item]')?.getAttribute('data-selected') === 'true'
        ))).toHaveLength(1);
        expect(screen.queryByText('Hidden')).toBeNull();

        expect(screen.queryByText('Disabled')).toBeNull();

        act(() => hidden$.next(false));
        expect(await screen.findByText('Hidden')).toBeTruthy();
    });

    it('does not expose stateful items before their availability is known', async () => {
        renderWithDependencies(<FeatureSearch />);

        await screen.findAllByText('Run');
        expect(screen.queryByText('Pending')).toBeNull();

        act(() => pendingHidden$.next(false));
        expect(await screen.findByText('Pending')).toBeTruthy();
    });

    it('executes a button by click and closes the dialog', async () => {
        const { commandService, dialogService, layoutService } = renderWithDependencies(<FeatureSearch />);

        fireEvent.click((await screen.findAllByText('Run'))[0]);

        await waitFor(() => {
            expect(layoutService.focus).toHaveBeenCalledTimes(1);
            expect(commandService.executeCommand).toHaveBeenCalledWith('run.command', { source: 'menu' });
            expect(dialogService.close).toHaveBeenCalledWith(FEATURE_SEARCH_DIALOG_ID);
        });
    });

    it('executes the selected button with Enter', async () => {
        const { commandService } = renderWithDependencies(<FeatureSearch />);
        const input = await screen.findByRole('combobox');

        input.focus();
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(commandService.executeCommand).toHaveBeenCalledWith('run.command', { source: 'menu' });
        });
    });

    it('shows live selector options as executable results', async () => {
        const { commandService, dialogService, layoutService } = renderWithDependencies(<FeatureSearch />);

        act(() => selectorOptions$.next(selectorOptions));
        expect(screen.queryByText('Format rows')).toBeNull();
        expect(screen.queryByText('Disabled format')).toBeNull();

        act(() => disabled$.next(false));
        const optionLabel = await screen.findByText('Format rows');
        const optionItem = optionLabel.closest('[cmdk-item]') as HTMLElement;
        expect(within(optionItem).getByText('Format')).toBeTruthy();
        expect(screen.queryByText('Disabled format')).toBeNull();
        fireEvent.click(optionLabel);

        await waitFor(() => {
            expect(layoutService.focus).toHaveBeenCalledTimes(1);
            expect(commandService.executeCommand).toHaveBeenCalledWith('format.rows.command', {
                value: 'row',
                source: 'selector',
            });
            expect(dialogService.close).toHaveBeenCalledWith(FEATURE_SEARCH_DIALOG_ID);
        });
    });

    it('inherits hidden and disabled state from submenu ancestors', async () => {
        const { commandService } = renderWithDependencies(<FeatureSearch />);

        expect(screen.queryByText('Print layout')).toBeNull();

        act(() => submenuDisabled$.next(false));
        const layoutLabel = await screen.findByText('Print layout');
        const layoutItem = layoutLabel.closest('[cmdk-item]') as HTMLElement;
        expect(within(layoutItem).getByText('Print')).toBeTruthy();
        const printItem = screen.getAllByRole('option').find((item) => item.getAttribute('data-value')?.includes('/print.action:0:item')) as HTMLElement;
        expect(within(printItem).getAllByText('Print')).toHaveLength(2);
        fireEvent.click(layoutLabel);
        expect(commandService.executeCommand).toHaveBeenCalledWith('print.layout', undefined);

        act(() => submenuHidden$.next(true));
        await waitFor(() => expect(screen.queryByText('Print layout')).toBeNull());
    });
});

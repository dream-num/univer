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
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
import { RediProvider } from '../../../../utils/di';
import { FEATURE_SEARCH_DIALOG_ID, FeatureSearch } from '../FeatureSearch';

const hidden$ = new BehaviorSubject(true);
const disabled$ = new BehaviorSubject(true);

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
            },
        },
        {
            key: 'hidden',
            order: 2,
            item: {
                id: 'hidden.command',
                type: MenuItemType.BUTTON,
                title: 'test.hidden',
                hidden$,
            },
        },
        {
            key: 'disabled',
            order: 3,
            item: {
                id: 'disabled.command',
                type: MenuItemType.BUTTON,
                title: 'test.disabled',
                disabled$,
            },
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
            'test.hidden': 'Hidden',
            'test.disabled': 'Disabled',
        } as Record<string, string>)[key] ?? key;
    }
}

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    getMenuByPositionKey(position: string) {
        return position === MenuManagerPosition.RIBBON ? ribbon : contextMenu;
    }
}

function renderWithDependencies(element: ReactElement) {
    const commandService = { executeCommand: vi.fn().mockResolvedValue(true) };
    const dialogService = { close: vi.fn() };
    const layoutService = { focus: vi.fn() };
    const injector = new Injector();

    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
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
    cleanup();
});

describe('FeatureSearch', () => {
    it('shows only currently usable menu items and deduplicates execution targets', async () => {
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

    it('keeps selectors searchable but non-actionable', async () => {
        const { commandService } = renderWithDependencies(<FeatureSearch />);
        const label = await screen.findByText('Format');
        const item = label.closest('[cmdk-item]');

        expect(item?.getAttribute('data-disabled')).toBe('true');
        fireEvent.click(label);
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });
});

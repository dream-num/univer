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

import type { IDisposable, Univer } from '@univerjs/core';
import { ICommandService, IConfirmService, Injector, RANGE_TYPE, TestConfirmService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsRenderService } from '@univerjs/sheets-ui';
import { ComponentManager, IconManager, IDialogService, ILayoutService, IMenuManagerService, IUIPartsService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { SortRangeCustomCommand } from '../../commands/commands/sheets-sort.command';
import { SheetsSortUIService } from '../../services/sheets-sort-ui.service';
import { SheetsSortUIController } from '../sheets-sort-ui.controller';

function createDisposable(): IDisposable {
    return {
        dispose: vi.fn(),
    };
}

describe('SheetsSortUIController', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        vi.stubGlobal('window', {
            innerWidth: 1440,
        });

        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const dialogService = {
            open: vi.fn(() => createDisposable()),
            close: vi.fn(),
        };
        const layoutService = {
            focus: vi.fn(),
        };
        const uiPartsService = {
            registerComponent: vi.fn(() => createDisposable()),
        };
        const sheetsRenderService = {
            registerSkeletonChangingMutations: vi.fn(() => createDisposable()),
        };
        const componentManager = {
            register: vi.fn(() => createDisposable()),
        };
        const iconManager = {
            register: vi.fn(() => createDisposable()),
        };

        const testBed = createCommandTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
            [IMenuManagerService, { useValue: menuManagerService as unknown as IMenuManagerService }],
            [IDialogService, { useValue: dialogService as unknown as IDialogService }],
            [ILayoutService, { useValue: layoutService as unknown as ILayoutService }],
            [IUIPartsService, { useValue: uiPartsService as unknown as IUIPartsService }],
            [SheetsRenderService, { useValue: sheetsRenderService as unknown as SheetsRenderService }],
            [ComponentManager, { useValue: componentManager as unknown as ComponentManager }],
            [IconManager, { useValue: iconManager as unknown as IconManager }],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        get(Injector).createInstance(SheetsSortUIController);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        univer.dispose();
    });

    it('opens and closes the custom sort dialog from the real command and service state', async () => {
        get(SheetsSelectionsService).addSelections([{
            range: {
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: {
                actualRow: 0,
                actualColumn: 9,
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await commandService.executeCommand(SortRangeCustomCommand.id)).toBe(true);

        const dialogService = get(IDialogService) as unknown as { open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };
        const sortUIService = get(SheetsSortUIService);

        expect(dialogService.open).toHaveBeenCalledWith(expect.objectContaining({
            id: 'custom-sort-dialog',
            children: { label: 'CustomSortPanel' },
            title: expect.objectContaining({
                title: expect.stringContaining('J1:L7'),
            }),
        }));
        expect(sortUIService.customSortState()).toEqual(expect.objectContaining({
            show: true,
            location: expect.objectContaining({
                subUnitId: 'sheet1',
            }),
        }));

        sortUIService.closeCustomSortPanel();
        await Promise.resolve();

        const layoutService = get(ILayoutService) as unknown as { focus: ReturnType<typeof vi.fn> };
        expect(dialogService.close).toHaveBeenCalledWith('custom-sort-dialog');
        expect(layoutService.focus).toHaveBeenCalled();
        expect(sortUIService.customSortState()).toEqual({ show: false });
    });
});

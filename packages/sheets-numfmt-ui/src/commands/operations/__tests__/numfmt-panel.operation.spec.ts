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

import type { ISelectionWithStyle } from '@univerjs/sheets';
import { ICommandService, LocaleService } from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager, DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../../controllers/__tests__/test.util';
import { SheetNumfmtUIController } from '../../../controllers/ui.controller';
import { CloseNumfmtPanelOperator } from '../close.numfmt.panel.operation';
import { OpenNumfmtPanelOperator } from '../open.numfmt.panel.operation';

function createSelection(row: number, column: number): ISelectionWithStyle {
    return {
        range: { startRow: row, endRow: row, startColumn: column, endColumn: column },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
        },
    };
}

describe('number format panel operation', () => {
    let commandService: ICommandService;
    let selectionsService: SheetsSelectionsService;
    let sidebarService: ISidebarService;
    let unitId: string;
    let subUnitId: string;

    beforeEach(() => {
        const testBed = createTestBed(undefined, [
            [SheetsSelectionsService],
            [IRenderManagerService, { useClass: RenderManagerService }],
            [SheetSkeletonManagerService],
            [ComponentManager],
            [ISidebarService, { useClass: DesktopSidebarService }],
            [SheetsNumfmtCellContentController],
            [SheetNumfmtUIController],
        ]);

        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        selectionsService = testBed.get(SheetsSelectionsService);
        sidebarService = testBed.get(ISidebarService);
        testBed.get(LocaleService).load({});
        testBed.get(SheetNumfmtUIController);
    });

    it('opens the number format panel with the active cell preview value', async () => {
        selectionsService.setSelections(unitId, subUnitId, [createSelection(0, 1)]);

        await commandService.executeCommand(OpenNumfmtPanelOperator.id);

        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.header?.title).toBe('sheets-numfmt-ui.title');
        expect(sidebarService.options.children).toMatchObject({
            label: 'SHEET_NUMFMT_PANEL',
            value: {
                defaultPattern: '',
                defaultValue: 1,
                row: 0,
                col: 1,
            },
        });
    });

    it('keeps the sidebar closed when there is no active selection', async () => {
        await commandService.executeCommand(OpenNumfmtPanelOperator.id);

        expect(sidebarService.visible).toBe(false);
    });

    it('publishes a close notification after the number format panel is dismissed', async () => {
        const closedPanelEvents: string[] = [];
        commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === CloseNumfmtPanelOperator.id) {
                closedPanelEvents.push(commandInfo.id);
            }
        });
        selectionsService.setSelections(unitId, subUnitId, [createSelection(0, 1)]);
        await commandService.executeCommand(OpenNumfmtPanelOperator.id);

        await commandService.executeCommand(CloseNumfmtPanelOperator.id);

        expect(closedPanelEvents).toEqual([CloseNumfmtPanelOperator.id]);
    });
});

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

import type { IRange } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { RANGE_TYPE } from '@univerjs/core';
import { SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { createRenderTestBed } from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { SheetSelectionRenderService } from '../selection-render.service';

describe('SheetSelectionRenderService', () => {
    it('renders selections from model changes and respects SELECTIONS_ENABLED', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useValue: {} }],
            ],
        });

        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context } = testBed;
        commandService.registerCommand(SetSelectionsOperation);

        const renderService = injector.createInstance(SheetSelectionRenderService, context as any);

        // Simulate initial skeleton ready (as if the sheet got rendered).
        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as any,
        });

        // The skeleton change listener ensures there is at least one selection.
        expect(renderService.getSelectionControls().length).toBeGreaterThan(0);

        const unitId = sheet.getUnitId();
        const workbookSelections = injector.get(SheetsSelectionsService).getWorkbookSelections(unitId);
        expect(workbookSelections.getCurrentSelections().length).toBeGreaterThan(0);

        const range: IRange = {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            rangeType: RANGE_TYPE.NORMAL,
        };

        const selection: ISelectionWithStyle = {
            range,
            primary: {
                startRow: range.startRow,
                endRow: range.endRow + 1,
                startColumn: range.startColumn,
                endColumn: range.endColumn + 1,
                actualRow: range.startRow,
                actualColumn: range.startColumn,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        };

        // Update selections like a real command (keyboard / API / mouse drag end).
        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection],
        })).toBeTruthy();

        expect(renderService.getSelectionControls().length).toBe(1);

        renderService.disableSelection();
        // When disabled, selection rendering should be cleared and should not create new selection controls.
        expect(renderService.getSelectionControls().length).toBe(0);

        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection, selection],
        })).toBeTruthy();
        expect(renderService.getSelectionControls().length).toBe(0);

        renderService.enableSelection();
        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection],
        })).toBeTruthy();
        expect(renderService.getSelectionControls().length).toBe(1);

        testBed.univer.dispose();
    });
});

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
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { createRenderTestBed } from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { SheetSelectionRenderService } from '../selection-render.service';

class TestShortcutService {
    forceEscape() {
        return { dispose: () => { } };
    }
}

describe('SheetSelectionRenderService', () => {
    function preparePointerSelectionTestBed() {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
            ],
        });
        const { commandService, skeleton, context, scene, engine } = testBed;
        (skeleton as never as {
            getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
            getColumnCount: () => number;
            getRowCount: () => number;
            expandRangeByMerge: <T>(range: T) => T;
        }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
            const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
                actualRow: row,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
                mergeInfo: {
                    ...cell,
                    startRow: row,
                    endRow: row,
                    startColumn: column,
                    endColumn: column,
                },
            };
        };
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;
        (scene as never as { getTransformer: () => { clearSelectedObjects: () => void } }).getTransformer = () => ({ clearSelectedObjects: () => { } });
        (engine as never as { setCapture: () => void }).setCapture = () => { };
        commandService.registerCommand(SetSelectionsOperation);

        const service = testBed.injector.createInstance(SheetSelectionRenderService, context as any);
        testBed.sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: testBed.sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as any,
        });

        return { ...testBed, service };
    }

    it('renders selections from model changes and respects SELECTIONS_ENABLED', async () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
            ],
        });

        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context } = testBed;
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        commandService.registerCommand(SetSelectionsOperation);

        const renderService = injector.createInstance(SheetSelectionRenderService, context as any);

        // Simulate initial skeleton ready (as if the sheet got rendered).
        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as any,
        });
        await Promise.resolve();

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

        renderService.transparentSelection();
        expect(renderService.getSelectionControls()[0].currentStyle.stroke).toBe('transparent');

        renderService.showSelection();
        expect(renderService.getSelectionControls()[0].getRange()).toMatchObject(range);

        const leftTopPlaceholder = context.components.get(SHEET_VIEW_KEY.LEFT_TOP)!;
        let stopped = false;
        (leftTopPlaceholder.onPointerDown$ as unknown as { emit: (evt: unknown, state: { stopPropagation: () => void }) => void }).emit({ button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(renderService.getActiveRange()).toMatchObject({
            startRow: 0,
            startColumn: 0,
            endRow: 199,
            endColumn: 49,
        });

        renderService.dispose();
        testBed.univer.dispose();
    });

    it('creates normal row and column selections from pointer gestures', () => {
        const { context, scene, service, univer } = preparePointerSelectionTestBed();
        const stopCalls: string[] = [];
        const state = { stopPropagation: () => stopCalls.push('stop') };

        const spreadsheet = context.mainComponent!;
        (spreadsheet.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 250,
            offsetY: 45,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 2,
            endColumn: 2,
        });

        (scene.onPointerUp$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({}, {});

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW)!;
        (rowHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 10,
            offsetY: 65,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 49,
        });

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN)!;
        (columnHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 350,
            offsetY: 5,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 0,
            endRow: 199,
            startColumn: 3,
            endColumn: 3,
        });
        expect(stopCalls.length).toBeGreaterThanOrEqual(3);

        service.dispose();
        univer.dispose();
    });
});

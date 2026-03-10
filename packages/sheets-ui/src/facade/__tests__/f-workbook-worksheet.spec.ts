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

import { ICommandService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, SetWorksheetRowIsAutoHeightCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { ISheetSelectionRenderService, SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand, SHEET_VIEW_KEY, SheetScrollManagerService, SheetSkeletonManagerService, SheetsScrollRenderController } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SetWorksheetColAutoWidthCommand } from '../../commands/commands/set-worksheet-auto-col-width.command';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EditorBridgeService, IEditorBridgeService } from '../../services/editor-bridge.service';
import { createFacadeTestBed } from './create-test-bed';
import '../f-workbook';
import '../f-worksheet';

describe('Test FWorkbook/FWorksheet UI mixin', () => {
    it('workbook and worksheet api basic flows', async () => {
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetCellEditVisibleOperation);

        const startResult = workbook.startEditing();
        expect(startResult).toBe(true);
        expect(workbook.isCellEditing()).toBe(true);

        await workbook.endEditingAsync(true);
        expect(workbook.isCellEditing()).toBe(false);

        await workbook.abortEditingAsync();

        const scrollState = workbook.getScrollStateBySheetId(worksheet.getSheetId());
        expect(scrollState === null || typeof scrollState === 'object').toBe(true);

        expect(workbook.disableSelection()).toBe(workbook);
        expect(workbook.enableSelection()).toBe(workbook);
        expect(workbook.transparentSelection()).toBe(workbook);
        expect(workbook.showSelection()).toBe(workbook);

        expect(typeof worksheet.getZoom()).toBe('number');

        const visibleRange = worksheet.getVisibleRange();
        expect(visibleRange === null || typeof visibleRange === 'object').toBe(true);

        const allViewportRanges = worksheet.getVisibleRangesOfAllViewports();
        expect(allViewportRanges === null || allViewportRanges instanceof Map).toBe(true);

        expect(worksheet.scrollToCell(10, 10, 0)).toBe(worksheet);
        expect(worksheet.getScrollState()).toBeTruthy();

        const onScrollSpy = vi.fn();
        const onScrollDis = worksheet.onScroll(onScrollSpy);
        onScrollDis.dispose();

        const skeleton = worksheet.getSkeleton();
        expect(skeleton == null || typeof skeleton === 'object').toBe(true);
    });

    it('workbook and worksheet render facade methods should use render services and command ids consistently', async () => {
        const sheetSize = 100;
        const rowHeader = { setCustomHeader: vi.fn() };
        const columnHeader = { setCustomHeader: vi.fn() };
        const mainComponent = { makeDirty: vi.fn() };
        const visibleRange = { startRow: 1, endRow: 4, startColumn: 2, endColumn: 6 };
        const visibleRanges = new Map([[SHEET_VIEWPORT_KEY.VIEW_MAIN, visibleRange]]);
        const skeleton = {
            getVisibleRangeByViewport: vi.fn(() => visibleRange),
            getVisibleRanges: vi.fn(() => visibleRanges),
        };
        const worksheetSkeleton = { skeleton: { id: 'sheet-skeleton' } };
        const skeletonManager = {
            reCalculate: vi.fn(),
            getCurrentSkeleton: vi.fn(() => skeleton),
            getWorksheetSkeleton: vi.fn(() => worksheetSkeleton),
            setColumnHeaderSize: vi.fn(),
            setRowHeaderSize: vi.fn(),
        };
        const scrollState = {
            offsetX: 12,
            offsetY: 24,
            sheetViewStartColumn: 3,
            sheetViewStartRow: 5,
        };
        const validViewportScrollInfo$ = {
            subscribe: vi.fn((callback: (params: typeof scrollState) => void) => {
                callback(scrollState);
                return { unsubscribe: vi.fn() };
            }),
        };
        const scrollManager = {
            getScrollStateByParam: vi.fn(() => scrollState),
            validViewportScrollInfo$,
        };
        const scrollRenderController = { scrollToCell: vi.fn() };
        const selectionRenderService = {
            disableSelection: vi.fn(),
            enableSelection: vi.fn(),
            transparentSelection: vi.fn(),
            showSelection: vi.fn(),
        };
        const render = {
            components: new Map([
                [SHEET_VIEW_KEY.ROW, rowHeader],
                [SHEET_VIEW_KEY.COLUMN, columnHeader],
            ]),
            mainComponent,
            with: vi.fn((service: unknown) => {
                if (service === SheetSkeletonManagerService) {
                    return skeletonManager;
                }

                if (service === SheetsScrollRenderController) {
                    return scrollRenderController;
                }

                if (service === SheetScrollManagerService) {
                    return scrollManager;
                }

                if (service === ISheetSelectionRenderService) {
                    return selectionRenderService;
                }

                throw new Error(`Unexpected render service: ${String(service)}`);
            }),
        };
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;
        const renderManagerService = testBed.get(IRenderManagerService);
        vi.spyOn(renderManagerService, 'getRenderById').mockReturnValue(render as never);
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as never);
        const syncExecuteSpy = vi.spyOn(commandService, 'syncExecuteCommand').mockReturnValue(true as never);
        const onScrollSpy = vi.fn();

        expect(worksheet.refreshCanvas()).toBe(worksheet);
        expect(skeletonManager.reCalculate).toHaveBeenCalledTimes(1);
        expect(mainComponent.makeDirty).toHaveBeenCalledTimes(1);

        expect(worksheet.getVisibleRange()).toEqual(visibleRange);
        expect(worksheet.getVisibleRangesOfAllViewports()).toEqual(visibleRanges);

        expect(worksheet.scrollToCell(9, 8, 120)).toBe(worksheet);
        expect(scrollRenderController.scrollToCell).toHaveBeenCalledWith(9, 8, 120);

        expect(worksheet.getScrollState()).toEqual(scrollState);

        const onScrollDisposable = worksheet.onScroll(onScrollSpy);
        expect(onScrollSpy).toHaveBeenCalledWith(scrollState);
        expect(onScrollDisposable).toBeTruthy();

        expect(worksheet.getSkeleton()).toEqual(worksheetSkeleton.skeleton);

        expect(worksheet.autoResizeColumn(2)).toBe(worksheet);
        expect(worksheet.setColumnAutoWidth(4, 3)).toBe(worksheet);
        expect(worksheet.autoResizeRows(1, 2)).toBe(worksheet);
        expect(syncExecuteSpy).toHaveBeenCalledWith(SetWorksheetColAutoWidthCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startColumn: 2, endColumn: 2, startRow: 0, endRow: sheetSize - 1 }],
        });
        expect(syncExecuteSpy).toHaveBeenCalledWith(SetWorksheetColAutoWidthCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startColumn: 4, endColumn: 6, startRow: 0, endRow: sheetSize - 1 }],
        });
        expect(syncExecuteSpy).toHaveBeenCalledWith(SetWorksheetRowIsAutoHeightCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 1, endRow: 2, startColumn: 0, endColumn: sheetSize - 1 }],
        });

        workbook.customizeColumnHeader({ columnsCfg: { 0: 'A' } });
        workbook.customizeRowHeader({ rowsCfg: { 0: '1' } });
        worksheet.customizeColumnHeader({ headerStyle: { size: 28 } });
        worksheet.customizeRowHeader({ headerStyle: { size: 18 } });

        expect(columnHeader.setCustomHeader).toHaveBeenCalledWith({ columnsCfg: { 0: 'A' } });
        expect(rowHeader.setCustomHeader).toHaveBeenCalledWith({ rowsCfg: { 0: '1' } });
        expect(skeletonManager.setColumnHeaderSize).toHaveBeenCalledWith(render, worksheet.getSheetId(), 28);
        expect(skeletonManager.setRowHeaderSize).toHaveBeenCalledWith(render, worksheet.getSheetId(), 18);
        expect(columnHeader.setCustomHeader).toHaveBeenCalledWith({ headerStyle: { size: 28 } }, worksheet.getSheetId());
        expect(rowHeader.setCustomHeader).toHaveBeenCalledWith({ headerStyle: { size: 18 } }, worksheet.getSheetId());

        expect(worksheet.setColumnHeaderHeight(36)).toBe(worksheet);
        expect(worksheet.setRowHeaderWidth(22)).toBe(worksheet);
        expect(executeSpy).toHaveBeenCalledWith(SetColumnHeaderHeightCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            size: 36,
        });
        expect(executeSpy).toHaveBeenCalledWith(SetRowHeaderWidthCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            size: 22,
        });

        expect(workbook.getScrollStateBySheetId(worksheet.getSheetId())).toEqual(scrollState);
        expect(workbook.disableSelection()).toBe(workbook);
        expect(workbook.enableSelection()).toBe(workbook);
        expect(workbook.transparentSelection()).toBe(workbook);
        expect(workbook.showSelection()).toBe(workbook);
        expect(selectionRenderService.disableSelection).toHaveBeenCalledTimes(1);
        expect(selectionRenderService.enableSelection).toHaveBeenCalledTimes(1);
        expect(selectionRenderService.transparentSelection).toHaveBeenCalledTimes(1);
        expect(selectionRenderService.showSelection).toHaveBeenCalledTimes(1);
    });
});

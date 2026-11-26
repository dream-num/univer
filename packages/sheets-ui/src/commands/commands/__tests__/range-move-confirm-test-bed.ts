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

import type { ICommand, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    TestConfirmService,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, Spreadsheet, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService, SheetSkeletonService, SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { onTestFinished, vi } from 'vitest';
import enUS from '../../../locale/en-US';

export function createRangeMoveConfirmTestBed(command: ICommand, mergeData: IRange[] = []) {
    const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        { setTransform: () => {}, clearRect: () => {} } as unknown as CanvasRenderingContext2D
    );
    onTestFinished(() => canvasContext.mockRestore());
    const univer = new Univer({ locale: LocaleType.EN_US });
    onTestFinished(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IConfirmService, { useClass: TestConfirmService }]);
    const confirm = vi.spyOn(injector.get(IConfirmService), 'confirm').mockResolvedValue(true);
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'range-move',
        sheetOrder: ['sheet', 'other'],
        sheets: {
            other: { id: 'other', rowCount: 6, columnCount: 3, cellData: { 1: { 0: { v: 'other' } } } },
            sheet: {
                id: 'sheet',
                rowCount: 6,
                columnCount: 3,
                mergeData,
                cellData: { 1: { 0: { v: 'first' } }, 2: { 0: { v: 'second' } }, 3: { 0: { v: 'third' } } },
            },
        },
    });
    const skeletonService = injector.get(SheetSkeletonService);
    injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    const worksheet = workbook.getActiveSheet()!;
    const renders = injector.get(IRenderManagerService);
    const primary = renders.createRender(workbook.getUnitId());
    const companion = renders.createRender(workbook.getUnitId(), { embeddedRender: true }, 'range-move-companion');
    const skeleton = skeletonService.createRenderSkeleton(worksheet, workbook.getStyles(), companion.scene);
    const spreadsheet = injector.createInstance(Spreadsheet, 'range-move-sheet', skeleton);
    companion.mainComponent = spreadsheet;
    companion.components.set(spreadsheet.oKey, spreadsheet);
    onTestFinished(() => skeleton.dispose());
    renders.focusRender?.(companion.renderId!);
    injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'sheet', [{
        range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
        primary: null,
        style: null,
    }]);
    const commands = injector.get(ICommandService);
    commands.registerCommand(command);
    const values = () => [1, 2, 3].map((row) => worksheet.getCellRaw(row, 0)?.v);
    const select = (row: number) => injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'sheet', [{
        range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
        primary: null,
        style: null,
    }]);
    const switchSheet = () => {
        workbook.setActiveSheet(workbook.getSheetBySheetId('other')!);
        injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'other', [{
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
    };
    const selectRanges = (ranges: IRange[]) => injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'sheet', ranges.map((range) => ({ range, primary: null, style: null })));
    return { selectRanges, switchSheet, select, commands, confirm, worksheet, skeleton, skeletonService, companion, primary, renders, values, filterPublicRows: () => injector.get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
        handler: (value, { row }, next) => next(value || row === 2),
    }), undo: () => commands.executeCommand(UndoCommand.id), redo: () => commands.executeCommand(RedoCommand.id) };
}

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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    CancelMarkDirtyRowAutoHeightOperation,
    MarkDirtyRowAutoHeightOperation,
    SetColWidthCommand,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { AutoHeightController } from '../auto-height.controller';

const RANGE: IRange = { startRow: 1, endRow: 3, startColumn: 0, endColumn: 2 };

describe('AutoHeightController', () => {
    let univer: Univer;

    beforeEach(() => {
        // Happy DOM has no canvas backend; the render and skeleton services remain real.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([SheetSkeletonService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([AutoHeightController]);
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        injector.get(SheetSkeletonService);
        injector.get(SheetInterceptorService);
        injector.get(IRenderManagerService).registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        injector.get(ICommandService).registerCommand(SetWorksheetRowAutoHeightMutation);
        injector.get(ICommandService).registerCommand(SetColWidthCommand);
        injector.get(ICommandService).registerCommand(SetWorksheetColWidthMutation);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    for (const current of ['none', 'other-workbook', 'other-worksheet'] as const) {
        it(`updates only the explicit child worksheet with ${current} current and restores its height on undo`, () => {
            const injector = univer.__getInjector();
            const instances = injector.get(IUniverInstanceService);
            const renderManager = injector.get(IRenderManagerService);
            const peer = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('peer'),
                { makeCurrent: false }
            );
            const child = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('child'),
                { makeCurrent: false }
            );
            renderManager.createRender('peer');
            renderManager.createRender('child');
            if (current !== 'none') {
                instances.setCurrentUnitForType(current === 'other-workbook' ? 'peer' : 'child');
            }
            injector.get(AutoHeightController);
            const worksheet = child.getSheetBySheetId('sheet2')!;
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const otherSheetBefore = Tools.deepClone(child.getSheetBySheetId('sheet1')!.getSnapshot());
            const rowsBefore = Tools.deepClone(worksheet.getSnapshot().rowData);
            const result = injector.get(SheetInterceptorService).generateMutationsOfAutoHeight({
                unitId: 'child',
                subUnitId: 'sheet2',
                ranges: [RANGE],
            });

            expect(result.redos).toEqual([{
                id: SetWorksheetRowAutoHeightMutation.id,
                params: { unitId: 'child', subUnitId: 'sheet2', rowsAutoHeightInfo: [{ row: 1, autoHeight: 20 }] },
            }]);
            const commands = injector.get(ICommandService);
            for (const mutation of result.redos) {
                expect(commands.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            expect(worksheet.getRowHeight(1)).toBe(20);
            expect(worksheet.getRowHeight(3)).toBe(50);
            for (const mutation of result.undos) {
                expect(commands.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            expect(worksheet.getSnapshot().rowData).toEqual(rowsBefore);
            for (const mutation of result.redos) {
                expect(commands.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            expect(worksheet.getRowHeight(1)).toBe(20);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            expect(child.getSheetBySheetId('sheet1')!.getSnapshot()).toEqual(otherSheetBefore);
        });
    }

    for (const current of ['none', 'peer'] as const) {
        it(`completes explicit column resizing and its undo/redo with ${current} current`, async () => {
            const injector = univer.__getInjector();
            const instances = injector.get(IUniverInstanceService);
            const peer = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('peer'),
                { makeCurrent: false }
            );
            const child = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('child'),
                { makeCurrent: false }
            );
            injector.get(IRenderManagerService).createRender('peer');
            injector.get(IRenderManagerService).createRender('child');
            if (current === 'peer') {
                instances.setCurrentUnitForType('peer');
                instances.focusUnit('peer');
            }
            injector.get(AutoHeightController);
            const target = child.getSheetBySheetId('sheet2')!;
            const before = Tools.deepClone(target.getSnapshot());
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const commands = injector.get(ICommandService);

            expect(await commands.executeCommand(SetColWidthCommand.id, {
                unitId: 'child',
                subUnitId: 'sheet2',
                ranges: [RANGE],
                value: 120,
            })).toBe(true);
            expect(target.getColumnWidth(1)).toBe(120);
            expect(target.getRowHeight(1)).toBe(20);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            const resized = Tools.deepClone(target.getSnapshot());
            instances.focusUnit('child');
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(target.getColumnWidth(1)).toBe(before.defaultColumnWidth);
            expect(target.getSnapshot().rowData).toEqual(before.rowData);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(target.getSnapshot()).toEqual(resized);
            expect(peer.getSnapshot()).toEqual(peerBefore);
        });
    }

    for (const missing of ['unit', 'worksheet', 'render'] as const) {
        it(`does not fall back to the current Sheet when the explicit target ${missing} is missing`, () => {
            const injector = univer.__getInjector();
            const peer = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookSnapshot('peer'));
            injector.get(IRenderManagerService).createRender('peer');
            injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('child'),
                { makeCurrent: false }
            );
            if (missing !== 'render') {
                injector.get(IRenderManagerService).createRender('child');
            }
            injector.get(AutoHeightController);
            const before = Tools.deepClone(peer.getSnapshot());
            const result = injector.get(SheetInterceptorService).generateMutationsOfAutoHeight({
                unitId: missing === 'unit' ? 'missing' : 'child',
                subUnitId: missing === 'worksheet' ? 'missing' : 'sheet2',
                ranges: [RANGE],
            });
            expect(result).toEqual({ redos: [], undos: [], preRedos: [], preUndos: [] });
            expect(peer.getSnapshot()).toEqual(before);
        });
    }

    it('preserves implicit current-worksheet calls and filters unchanged or manually sized rows', () => {
        const injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookSnapshot('current'));
        workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
        injector.get(IRenderManagerService).createRender('current');
        const result = injector.get(AutoHeightController).getUndoRedoParamsOfAutoHeight([RANGE]);
        expect(result.redos).toEqual([{
            id: SetWorksheetRowAutoHeightMutation.id,
            params: { unitId: 'current', subUnitId: 'sheet2', rowsAutoHeightInfo: [{ row: 1, autoHeight: 20 }] },
        }]);
        expect(result.undos).toEqual([{
            id: SetWorksheetRowAutoHeightMutation.id,
            params: { unitId: 'current', subUnitId: 'sheet2', rowsAutoHeightInfo: [{ row: 1, autoHeight: 40 }] },
        }]);
    });

    it('keeps lazy dirty-row operations paired and unregisters the interceptor on disposal', () => {
        const injector = univer.__getInjector();
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookSnapshot('current'));
        injector.get(IRenderManagerService).createRender('current');
        const controller = injector.get(AutoHeightController);
        const interceptor = injector.get(SheetInterceptorService);
        const context = { unitId: 'current', subUnitId: 'sheet2', ranges: [], lazyAutoHeightRanges: [RANGE] };
        const result = interceptor.generateMutationsOfAutoHeight(context);
        expect(result.redos).toEqual([{
            id: MarkDirtyRowAutoHeightOperation.id,
            params: { unitId: 'current', subUnitId: 'sheet2', ranges: [RANGE], id: expect.any(String) },
            options: { onlyLocal: true },
        }]);
        expect(result.undos).toEqual([{
            id: CancelMarkDirtyRowAutoHeightOperation.id,
            params: { unitId: 'current', subUnitId: 'sheet2', id: (result.redos[0].params as { id: string }).id },
            options: { onlyLocal: true },
        }]);
        controller.dispose();
        expect(interceptor.generateMutationsOfAutoHeight(context)).toEqual({ redos: [], undos: [], preRedos: [], preUndos: [] });
    });
});

function workbookSnapshot(id: string): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: id,
        styles: {},
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Peer sheet',
                rowCount: 5,
                columnCount: 3,
                defaultRowHeight: 30,
                rowData: { 1: { ah: 60 } },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Target sheet',
                rowCount: 5,
                columnCount: 3,
                defaultRowHeight: 20,
                rowData: { 1: { ah: 40 }, 2: { ah: 20 }, 3: { h: 50, ia: BooleanNumber.FALSE } },
            },
        },
    };
}

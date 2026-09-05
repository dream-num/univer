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

import type { Ctor, ICommandInfo, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import {
    DataValidationRenderMode,
    DataValidationStatus,
    DataValidationType,
    ICommandService,
    ILogService,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { AddDataValidationMutation, DataValidatorRegistryService } from '@univerjs/data-validation';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import {
    INTERCEPTOR_POINT,
    IRefSelectionsService,
    SetWorksheetRowAutoHeightMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import { DataValidationCacheService, UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import {
    AutoHeightController,
    EditorBridgeService,
    IEditorBridgeService,
    ISheetCellDropdownManagerService,
    SheetCanvasPopManagerService,
    SheetCellDropdownManagerService,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { CanvasPopupService, ICanvasPopupService, IMenuManagerService, MenuManagerService } from '@univerjs/ui';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { DataValidationDropdownManagerService } from '../../services/dropdown-manager.service';
import { SheetsDataValidationMobileRenderController, SheetsDataValidationRenderController } from '../dv-render.controller';
import { SheetsDataValidationUIController } from '../ui.controller';

vi.hoisted(() => {
    vi.stubGlobal('Path2D', class {});
});

afterAll(() => vi.unstubAllGlobals());

const controllers: Ctor<IDisposable>[] = [SheetsDataValidationRenderController, SheetsDataValidationMobileRenderController];

for (const Controller of controllers) {
    describe(Controller.name, () => {
        let univer: Univer;
        let peer: Workbook;
        let first: Workbook;
        let second: Workbook;

        beforeEach(() => {
            vi.useFakeTimers();
            // Only the unavailable Canvas backend is replaced; controllers and providers are real.
            vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
                return {
                    canvas: this,
                    setTransform: vi.fn(),
                    clearRect: vi.fn(),
                    measureText: (text: string) => ({
                        width: text.length * 7,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                } as unknown as CanvasRenderingContext2D;
            });
            univer = new Univer();
            univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
            univer.registerPlugin(UniverSheetsDataValidationPlugin);
            peer = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookSnapshot('peer', 70));
            const injector = univer.__getInjector();
            injector.get(ILogService).setLogLevel(LogLevel.SILENT);
            injector.get(LocaleService).load({ enUS });
            injector.get(LocaleService).setLocale(LocaleType.EN_US);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([AutoHeightController]);
            injector.add([DocSelectionManagerService]);
            injector.add([IEditorService, { useClass: EditorService }]);
            injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
            injector.add([IRefSelectionsService, { useClass: SheetsSelectionsService }]);
            injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
            injector.add([SheetCanvasPopManagerService]);
            injector.add([ISheetCellDropdownManagerService, { useClass: SheetCellDropdownManagerService }]);
            injector.add([DataValidationDropdownManagerService]);
            injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
            injector.add([Controller]);
            injector.add([SheetsDataValidationUIController]);
            const instances = injector.get(IUniverInstanceService);
            first = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('first', 50),
                { makeCurrent: false }
            );
            second = instances.createUnit<IWorkbookData, Workbook>(
                UniverInstanceType.UNIVER_SHEET,
                workbookSnapshot('second', 60),
                { makeCurrent: false }
            );
            const renders = injector.get(IRenderManagerService);
            renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
            for (const workbook of [peer, first, second]) {
                renders.createRender(workbook.getUnitId());
            }
            injector.get(SheetsDataValidationUIController);
            injector.get(Controller);
        });

        afterEach(() => {
            vi.clearAllTimers();
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        });

        it('keeps each workbook and worksheet in a shared batch isolated after focus changes', async () => {
            const injector = univer.__getInjector();
            const instances = injector.get(IUniverInstanceService);
            instances.setCurrentUnitForType('first');
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const heights: ISetWorksheetRowAutoHeightMutationParams[] = [];
            const commands = injector.get(ICommandService);
            const listener = commands.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetRowAutoHeightMutation.id) {
                    heights.push(command.params as ISetWorksheetRowAutoHeightMutationParams);
                }
            });
            addRule(univer, 'first', 'sheet1', 1, DataValidationType.LIST);
            addRule(univer, 'first', 'sheet1', 2, DataValidationType.LIST_MULTIPLE);
            addRule(univer, 'first', 'sheet2', 3, DataValidationType.LIST);
            addRule(univer, 'second', 'sheet1', 4, DataValidationType.LIST_MULTIPLE);
            instances.setCurrentUnitForType('peer');
            instances.focusUnit('peer');
            expect(first.getSheetBySheetId('sheet1')!.getRowHeight(1)).toBe(100);
            await vi.advanceTimersByTimeAsync(100);

            expect(first.getSheetBySheetId('sheet1')!.getRowHeight(1)).toBe(50);
            expect(first.getSheetBySheetId('sheet1')!.getRowHeight(2)).toBe(50);
            expect(first.getSheetBySheetId('sheet2')!.getRowHeight(3)).toBe(55);
            expect(second.getSheetBySheetId('sheet1')!.getRowHeight(4)).toBe(60);
            expect(first.getSheetBySheetId('sheet1')!.getRowHeight(4)).toBe(100);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            expect(heights).toHaveLength(3);
            expect(heights).toEqual(expect.arrayContaining([
                { unitId: 'first', subUnitId: 'sheet1', rowsAutoHeightInfo: [{ row: 1, autoHeight: 50 }, { row: 2, autoHeight: 50 }] },
                { unitId: 'first', subUnitId: 'sheet2', rowsAutoHeightInfo: [{ row: 3, autoHeight: 55 }] },
                { unitId: 'second', subUnitId: 'sheet1', rowsAutoHeightInfo: [{ row: 4, autoHeight: 60 }] },
            ]));
            listener.dispose();
        });

        it('cancels buffered and future work when its controller is disposed', async () => {
            const injector = univer.__getInjector();
            injector.get(IUniverInstanceService).setCurrentUnitForType('first');
            addRule(univer, 'first', 'sheet1', 1, DataValidationType.LIST);
            injector.get(Controller).dispose();
            addRule(univer, 'first', 'sheet1', 2, DataValidationType.LIST);
            const before = Tools.deepClone(first.getSnapshot());
            await vi.advanceTimersByTimeAsync(200);
            expect(first.getSnapshot()).toEqual(before);
        });

        it('ignores patched changes and non-list rules without suppressing command-origin list changes', async () => {
            addRule(univer, 'first', 'sheet1', 1, DataValidationType.LIST, 'patched');
            addRule(univer, 'first', 'sheet1', 2, DataValidationType.WHOLE);
            addRule(univer, 'first', 'sheet1', 3, DataValidationType.LIST);
            await vi.advanceTimersByTimeAsync(100);
            const sheet = first.getSheetBySheetId('sheet1')!;
            expect([sheet.getRowHeight(1), sheet.getRowHeight(2), sheet.getRowHeight(3)]).toEqual([100, 100, 50]);
        });

        it('discards a disposed target without changing the current workbook', async () => {
            addRule(univer, 'first', 'sheet1', 1, DataValidationType.LIST);
            const before = Tools.deepClone(peer.getSnapshot());
            univer.__getInjector().get(IUniverInstanceService).disposeUnit('first');
            await vi.advanceTimersByTimeAsync(100);
            expect(peer.getSnapshot()).toEqual(before);
        });

        it('preserves invalid markers, custom rendering, and list layout through real cell interceptors', () => {
            const injector = univer.__getInjector();
            addRule(univer, 'peer', 'sheet1', 1, DataValidationType.LIST, 'patched');
            injector.get(DataValidationCacheService).ensureCache('peer', 'sheet1').setValue(1, 0, DataValidationStatus.INVALID);
            const worksheet = peer.getSheetBySheetId('sheet1')!;
            const raw = { v: 'bad', markers: { bl: { size: 1, color: '#112233' } } };
            const cell = injector.get(SheetInterceptorService).fetchThroughInterceptors(
                INTERCEPTOR_POINT.CELL_CONTENT,
                InterceptorEffectEnum.Style
            )(raw, { row: 1, col: 0, unitId: 'peer', subUnitId: 'sheet1', rawData: raw, workbook: peer, worksheet })!;
            const validator = injector.get(DataValidatorRegistryService).getValidatorItem(DataValidationType.LIST)!;

            expect(cell).not.toBe(raw);
            expect(cell.markers?.bl).toEqual(raw.markers.bl);
            expect(cell.markers?.tr?.size).toBeGreaterThan(0);
            expect(cell.customRender).toContain(validator.canvasRender);
            expect(cell.fontRenderExtension?.isSkip).toBe(true);
            expect(cell.coverable).toBe(false);
            expect(cell.interceptorAutoHeight?.()).toBeGreaterThan(0);
            expect(cell.interceptorAutoWidth?.()).toBeGreaterThan(0);
        });
    });
}

function addRule(
    univer: Univer,
    unitId: string,
    subUnitId: string,
    row: number,
    type: DataValidationType,
    source: 'command' | 'patched' = 'command'
) {
    expect(univer.__getInjector().get(ICommandService).syncExecuteCommand(AddDataValidationMutation.id, {
        unitId,
        subUnitId,
        source,
        rule: {
            uid: `rule-${row}`,
            type,
            formula1: 'red,blue',
            ranges: [{ startRow: row, endRow: row, startColumn: 0, endColumn: 0 }],
            renderMode: DataValidationRenderMode.CUSTOM,
        },
    })).toBe(true);
}

function workbookSnapshot(id: string, defaultRowHeight: number): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: id,
        styles: {},
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: Object.fromEntries(['sheet1', 'sheet2'].map((sheetId, index) => [sheetId, {
            id: sheetId,
            name: sheetId,
            rowCount: 6,
            columnCount: 3,
            defaultRowHeight: defaultRowHeight + index * 5,
            rowData: { 1: { ah: 100 }, 2: { ah: 100 }, 3: { ah: 100 }, 4: { ah: 100 } },
        }])),
    };
}

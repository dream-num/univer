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

import type { Dependency, ICellData, IDisposable, IRange, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ICellDataWithSpanInfo } from '@univerjs/sheets-ui';
import {
    DisposableCollection,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    Plugin,
    RANGE_TYPE,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CalculateFormulaService,
    DefinedNamesService,
    FormulaCurrentConfigService,
    FormulaDataModel,
    FormulaRuntimeService,
    HyperlinkEngineFormulaService,
    ICalculateFormulaService,
    IDefinedNamesService,
    IFormulaCurrentConfigService,
    IFormulaRuntimeService,
    IHyperlinkEngineFormulaService,
    LexerTreeBuilder,
    SetArrayFormulaDataMutation,
    SetFormulaDataMutation,
} from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    discreteRangeToRange,
    MoveRangeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetRowAutoHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { UpdateFormulaController } from '@univerjs/sheets-formula';
import {
    COPY_TYPE,
    IMarkSelectionService,
    ISheetClipboardService,
    ISheetSelectionRenderService,
    PREDEFINED_HOOK_NAME_COPY,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardController,
    SheetClipboardService,
    SheetSelectionRenderService,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import {
    BrowserClipboardService,
    DesktopMessageService,
    IClipboardInterfaceService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaClipboardController, getSetCellFormulaMutations } from '../formula-clipboard.controller';
import { createCommandTestBed } from './create-command-test-bed';

interface ITestSheetClipboardService extends ISheetClipboardService {
    _generateCopyContent: (
        unitId: string,
        subUnitId: string,
        range: IRange,
        hooks: unknown[]
    ) => {
        matrixFragment: Nullable<ObjectMatrix<ICellDataWithSpanInfo>>;
        copyId: string;
    };
    _pasteInternal: (copyId: string, pasteType: string) => Promise<boolean>;
}

class testMarkSelectionService {
    addShape(): string | null {
        return null;
    }

    addShapeWithNoFresh(): string | null {
        return null;
    }

    removeShape(id: string): void {
        // empty
    }

    removeAllShapes(): void {
        // empty
    }

    refreshShapes(): void {
        // empty
    }

    getShapeMap(): Map<string, any> {
        return new Map();
    }
}

class testNotificationService {
    show(): IDisposable {
        return {
            dispose: () => { /* empty */ },
        };
    }
}

class testPlatformService {
    isWindows: boolean = false;
    isMac: boolean = true;
    isLinux: boolean = false;
}

describe('FormulaClipboardController formula-only copy hook', () => {
    it('copies only formulas, resolves shared formula strings and reports filtered rows', () => {
        const hooks: any[] = [];
        const worksheet = {
            getSheetId: () => 'sheet1',
            getUnitId: () => 'unit1',
            getCellRaw: (row: number, col: number) => {
                if (row === 0 && col === 0) return { f: '=A1' };
                if (row === 0 && col === 1) return { si: 'shared-1' };
                if (row === 0 && col === 2) return { v: 10 };
                return null;
            },
            getRowFiltered: (row: number) => row === 2,
        };
        const workbook = {
            getSheetBySheetId: () => worksheet,
        };
        const controller = new FormulaClipboardController(
            {
                getUnit: () => workbook,
                getCurrentUnitOfType: () => ({ getActiveSheet: () => worksheet }),
            } as never,
            {} as never,
            {
                addClipboardHook: (hook: unknown) => {
                    hooks.push(hook);
                    return { dispose: () => undefined };
                },
            } as never,
            {} as never,
            { getFormulaStringByCell: () => '=A2' } as never
        );
        const formulaOnlyHook = hooks.find((hook) => hook.id === PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY);

        formulaOnlyHook.onBeforeCopy('unit1', 'sheet1');

        expect(formulaOnlyHook.onCopyCellContent(0, 0)).toBe('=A1');
        expect(formulaOnlyHook.onCopyCellContent(0, 1)).toBe('=A2');
        expect(formulaOnlyHook.onCopyCellContent(0, 2)).toBe('');
        expect(formulaOnlyHook.getFilteredOutRows('unit1', 'sheet1', {
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 0,
        })).toEqual([2]);

        formulaOnlyHook.onAfterCopy();
        expect(formulaOnlyHook.onCopyCellContent(0, 0)).toBe('');

        controller.dispose();
    });

    it('writes formulas to copy matrices and clears non-formula cells in formula-only copy', () => {
        const hooks: any[] = [];
        const worksheet = {
            getSheetId: () => 'sheet1',
            getUnitId: () => 'unit1',
            getCellRaw: () => null,
            getRowFiltered: () => false,
        };
        const workbook = {
            getSheetBySheetId: () => worksheet,
        };
        const controller = new FormulaClipboardController(
            {
                getUnit: () => workbook,
                getCurrentUnitOfType: () => ({ getActiveSheet: () => worksheet }),
            } as never,
            {} as never,
            {
                addClipboardHook: (hook: unknown) => {
                    hooks.push(hook);
                    return { dispose: () => undefined };
                },
            } as never,
            {} as never,
            { getFormulaStringByCell: () => '=A2' } as never
        );
        const formulaOnlyHook = hooks.find((hook) => hook.id === PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY);
        const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
            0: {
                0: { f: '=A1' },
                1: { si: 'shared-1' },
                2: { v: 10 },
            },
        });
        const matrixFragment = new ObjectMatrix<ICellDataWithSpanInfo>();
        const plainMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();

        formulaOnlyHook.onBeforeCopy('unit1', 'sheet1');
        formulaOnlyHook.handleMatrixOnCell(0, 0, 0, 0, matrix, matrixFragment, plainMatrix);
        formulaOnlyHook.handleMatrixOnCell(0, 1, 0, 1, matrix, matrixFragment, plainMatrix);
        formulaOnlyHook.handleMatrixOnCell(0, 2, 0, 2, matrix, matrixFragment, plainMatrix);

        expect(matrixFragment.getValue(0, 0)).toMatchObject({ f: '=A1' });
        expect(plainMatrix.getValue(0, 0)).toMatchObject({ f: '=A1', displayV: '=A1' });
        expect(matrixFragment.getValue(0, 1)).toMatchObject({ f: '=A2' });
        expect(plainMatrix.getValue(0, 1)).toMatchObject({ f: '=A2', displayV: '=A2' });
        expect(matrixFragment.getValue(0, 2)).toMatchObject({ v: null, f: null, si: null, p: null });
        expect(plainMatrix.getValue(0, 2)).toMatchObject({ v: null, f: null, si: null, p: null });
        expect(matrix.getValue(0, 2)).toMatchObject({ v: null, f: null, si: null, p: null });

        controller.dispose();
    });
});

export function clipboardTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IUIPartsService, { useClass: UIPartsService }]);
            injector.add([SheetsSelectionsService]);
            injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }]);
            injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
            injector.add([IMessageService, { useClass: DesktopMessageService, lazy: true }]);
            injector.add([IMarkSelectionService, { useClass: testMarkSelectionService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
            injector.add([INotificationService, { useClass: testNotificationService }]);
            injector.add([IPlatformService, { useClass: testPlatformService }]);

            // Because SheetClipboardController is initialized in the rendered life cycle, here we need to initialize it manually
            const sheetClipboardController = injector.createInstance(SheetClipboardController);

            injector.add([SheetClipboardController, { useValue: sheetClipboardController }]);
            injector.add([SheetInterceptorService]);
            injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([IHyperlinkEngineFormulaService, { useClass: HyperlinkEngineFormulaService }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([SheetSkeletonService]);

            dependencies?.forEach((d) => injector.add(d));

            const localeService = injector.get(LocaleService);
            localeService.load({});

            injector.get(IUIPartsService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData || {});

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    // NOTE: This is pretty hack for the test. But with these hacks we can avoid to create
    // real canvas-environment in univerjs/sheets-ui. If some we have to do that, this hack could be removed.
    const fakeSheetSkeletonManagerService = new SheetSkeletonManagerService({
        unit: sheet,
        unitId: 'test',
        type: UniverInstanceType.UNIVER_SHEET,
        engine: null as any,
        scene: null as any,
        mainComponent: null as any,
        components: null as any,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    }, injector.get(SheetSkeletonService));

    injector.add([SheetSkeletonManagerService, { useValue: fakeSheetSkeletonManagerService }]);
    injector.get(IRenderManagerService).addRender('test', {
        type: UniverInstanceType.UNIVER_SHEET,
        unitId: 'test',
        engine: new DisposableCollection() as any,
        scene: new DisposableCollection() as any,
        mainComponent: null as any,
        components: new Map(),
        isMainScene: true,
        with: injector.get.bind(injector),
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
        isDisposed: () => false,
    });

    return {
        univer,
        get,
        sheet,
    };
}

function createFormulaClipboardWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {
                    0: {
                        0: { v: 1 },
                        1: { v: 2 },
                        2: { f: '=A1' },
                        3: { f: '=SUM(A1:B2)' },
                        4: { f: '=$A1' },
                        5: { f: '=A$1' },
                        6: { f: '=$A$1' },
                        7: { f: '=B1' },
                        8: { f: '=H1' },
                        9: { f: '=F3' },
                        10: { f: '=A1', si: 'shared-ref' },
                    },
                    1: {
                        0: { v: 3 },
                        1: { v: 4 },
                        10: { si: 'shared-ref' },
                    },
                    2: {
                        0: { v: 'label' },
                        1: { v: 7 },
                        2: { f: '=B3' },
                        3: { f: '=C3+1' },
                        4: { v: 11 },
                        5: { f: '=SUM(B3:E3)' },
                    },
                    3: {
                        0: { f: '=SUM(Sheet3!A1:A3,B1)' },
                    },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {
                    0: {
                        0: { f: '=Sheet1!A1' },
                        1: { f: '=Sheet1!H1' },
                    },
                },
            },
            sheet3: {
                id: 'sheet3',
                name: 'Sheet3',
                cellData: {
                    0: {
                        0: { v: 1 },
                        1: { v: 2 },
                        2: { v: 3 },
                    },
                },
            },
        },
    };
}

describe('Test cut command with formulas', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        sheetId?: string
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = clipboardTestBed(createFormulaClipboardWorkbookData(), [
            [UpdateFormulaController],
            [FormulaClipboardController],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(SetWorksheetRowAutoHeightMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        sheetClipboardService = get(ISheetClipboardService);

        get(UpdateFormulaController);
        get(FormulaClipboardController);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            sheetId: string = 'sheet1'
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId(sheetId)
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('pastes cross-page formula payload with relative reference offsets', async () => {
        get(SheetsSelectionsService).addSelections([
            {
                range: { startRow: 4, startColumn: 3, endRow: 4, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        const formulaItem = {
            types: ['web application/x-univer-sheets-formula', 'text/html'],
            getType: async (type: string) => {
                if (type === 'web application/x-univer-sheets-formula') {
                    return new Blob([JSON.stringify({
                        rowCount: 1,
                        columnCount: 1,
                        origin: {
                            row: 1,
                            column: 1,
                        },
                        formulas: [
                            {
                                row: 0,
                                column: 0,
                                f: '=C2',
                            },
                        ],
                    })], { type });
                }

                return new Blob([
                    '<google-sheets-html-origin><table><tbody><tr><td>formula result</td></tr></tbody></table></google-sheets-html-origin>',
                ], { type });
            },
        } as unknown as ClipboardItem;

        await sheetClipboardService.paste(formulaItem);

        expect(getValues(4, 3, 4, 3)?.[0][0]?.f).toBe('=E5');
    });

    it('keeps non-formula html cells when formula payload restores formulas', async () => {
        get(SheetsSelectionsService).addSelections([
            {
                range: { startRow: 4, startColumn: 3, endRow: 4, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        const formulaItem = {
            types: ['web application/x-univer-sheets-formula', 'text/html'],
            getType: async (type: string) => {
                if (type === 'web application/x-univer-sheets-formula') {
                    return new Blob([JSON.stringify({
                        rowCount: 1,
                        columnCount: 2,
                        origin: {
                            row: 1,
                            column: 1,
                        },
                        formulas: [
                            {
                                row: 0,
                                column: 1,
                                f: '=B2',
                            },
                        ],
                    })], { type });
                }

                return new Blob([
                    '<google-sheets-html-origin><table><tbody><tr><td>10</td><td>10</td></tr></tbody></table></google-sheets-html-origin>',
                ], { type });
            },
        } as unknown as ClipboardItem;

        await sheetClipboardService.paste(formulaItem);

        const values = getValues(4, 3, 4, 4);
        expect(values?.[0][0]?.v).toBe(10);
        expect(values?.[0][1]?.f).toBe('=D5');
    });

    async function cutPaste(
        fromRange: { rows: number[]; cols: number[] },
        toRange: { startRow: number; startColumn: number; endRow: number; endColumn: number },
        fromSubUnitId: string = 'sheet1',
        toSubUnitId: string = fromSubUnitId
    ) {
        const testSheetClipboardService = sheetClipboardService as ITestSheetClipboardService;
        const copyContentCache = sheetClipboardService.copyContentCache();
        const workbook = get(IUniverInstanceService).getUniverSheetInstance('test');
        const targetWorksheet = workbook?.getSheetBySheetId(toSubUnitId);

        if (targetWorksheet) {
            workbook?.setActiveSheet(targetWorksheet);
        }

        const { matrixFragment, copyId } = testSheetClipboardService._generateCopyContent(
            'test',
            fromSubUnitId,
            discreteRangeToRange(fromRange),
            []
        );

        copyContentCache.set(copyId, {
            unitId: 'test',
            subUnitId: fromSubUnitId,
            range: fromRange,
            matrix: matrixFragment,
            copyType: COPY_TYPE.CUT,
        });

        get(SheetsSelectionsService).addSelections([
            {
                range: { ...toRange, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        await testSheetClipboardService._pasteInternal(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE);
    }

    it('cut-moving a referenced value range updates direct, range, mixed-absolute, cross-sheet, and shared formulas', async () => {
        await cutPaste(
            { rows: [0, 1], cols: [0, 1] },
            { startRow: 3, startColumn: 3, endRow: 4, endColumn: 4 }
        );

        expect(getValues(0, 0, 1, 1)).toStrictEqual([
            [null, null],
            [null, null],
        ]);
        expect(getValues(3, 3, 4, 4)).toStrictEqual([
            [{ v: 1 }, { v: 2 }],
            [{ v: 3 }, { v: 4 }],
        ]);

        expect(getValues(0, 2, 0, 6)).toStrictEqual([
            [
                { f: '=D4' },
                { f: '=SUM(D4:E5)' },
                { f: '=$D4' },
                { f: '=D$4' },
                { f: '=$D$4' },
            ],
        ]);
        expect(getValues(0, 10, 1, 10)).toStrictEqual([
            [{ f: '=D4' }],
            [{ f: '=D5' }],
        ]);
        expect(getValues(0, 0, 0, 1, 'sheet2')).toStrictEqual([
            [{ f: '=Sheet1!D4' }, { f: '=Sheet1!H1' }],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(getValues(0, 2, 0, 6)).toStrictEqual([
            [
                { f: '=A1' },
                { f: '=SUM(A1:B2)' },
                { f: '=$A1' },
                { f: '=A$1' },
                { f: '=$A$1' },
            ],
        ]);
        expect(getValues(0, 10, 1, 10)).toStrictEqual([
            [{ f: '=A1', si: 'shared-ref' }],
            [{ si: 'shared-ref' }],
        ]);
        expect(getValues(0, 0, 0, 1, 'sheet2')).toStrictEqual([
            [{ f: '=Sheet1!A1' }, { f: '=Sheet1!H1' }],
        ]);
    });

    it('cut-pasting a referenced value range across sheets adds and removes sheet qualifiers correctly', async () => {
        await cutPaste(
            { rows: [0, 1], cols: [0, 1] },
            { startRow: 2, startColumn: 2, endRow: 3, endColumn: 3 },
            'sheet1',
            'sheet2'
        );

        expect(getValues(0, 0, 1, 1)).toStrictEqual([
            [null, null],
            [null, null],
        ]);
        expect(getValues(2, 2, 3, 3, 'sheet2')).toStrictEqual([
            [{ v: 1 }, { v: 2 }],
            [{ v: 3 }, { v: 4 }],
        ]);

        expect(getValues(0, 2, 0, 6)).toStrictEqual([
            [
                { f: '=Sheet2!C3' },
                { f: '=SUM(Sheet2!C3:D4)' },
                { f: '=Sheet2!$C3' },
                { f: '=Sheet2!C$3' },
                { f: '=Sheet2!$C$3' },
            ],
        ]);
        expect(getValues(0, 0, 0, 1, 'sheet2')).toStrictEqual([
            [{ f: '=C3' }, { f: '=Sheet1!H1' }],
        ]);
    });

    it('cut-moving a formula cell keeps its formula text stable while dependents update to the new address', async () => {
        await cutPaste(
            { rows: [0], cols: [7] },
            { startRow: 3, startColumn: 9, endRow: 3, endColumn: 9 }
        );

        expect(getValues(0, 7, 0, 8)).toStrictEqual([
            [null, { f: '=J4' }],
        ]);
        expect(getValues(3, 9, 3, 9)).toStrictEqual([
            [{ f: '=B1' }],
        ]);
        expect(getValues(0, 0, 0, 1, 'sheet2')).toStrictEqual([
            [{ f: '=Sheet1!A1' }, { f: '=Sheet1!J4' }],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(getValues(0, 7, 0, 8)).toStrictEqual([
            [{ f: '=B1' }, { f: '=H1' }],
        ]);
        expect(getValues(0, 0, 0, 1, 'sheet2')).toStrictEqual([
            [{ f: '=Sheet1!A1' }, { f: '=Sheet1!H1' }],
        ]);
    });

    it('cut-moving a larger mixed value, text, and formula range preserves moved formulas and updates dependents', async () => {
        await cutPaste(
            { rows: [2], cols: [0, 1, 2, 3, 4, 5] },
            { startRow: 5, startColumn: 0, endRow: 5, endColumn: 5 }
        );

        expect(getValues(2, 0, 2, 5)).toStrictEqual([
            [null, null, null, null, null, null],
        ]);
        expect(getValues(5, 0, 5, 5)).toStrictEqual([
            [
                { v: 'label' },
                { v: 7 },
                { f: '=B6' },
                { f: '=C6+1' },
                { v: 11 },
                { f: '=SUM(B6:E6)' },
            ],
        ]);
        expect(getValues(0, 9, 0, 9)).toStrictEqual([
            [{ f: '=F6' }],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(getValues(2, 0, 2, 5)).toStrictEqual([
            [
                { v: 'label' },
                { v: 7 },
                { f: '=B3' },
                { f: '=C3+1' },
                { v: 11 },
                { f: '=SUM(B3:E3)' },
            ],
        ]);
        expect(getValues(0, 9, 0, 9)).toStrictEqual([
            [{ f: '=F3' }],
        ]);
    });

    it('cut-pasting a formula cell across worksheets, the reference range is not affected by the moved range', async () => {
        await cutPaste(
            { rows: [0], cols: [2] },
            { startRow: 10, startColumn: 0, endRow: 10, endColumn: 0 },
            'sheet1',
            'sheet2'
        );

        expect(getValues(0, 2, 0, 2)).toStrictEqual([
            [null],
        ]);
        expect(getValues(10, 0, 10, 0, 'sheet2')).toStrictEqual([
            [{ f: '=Sheet1!A1' }],
        ]);
        expect(getValues(10, 0, 10, 0, 'sheet1')).toStrictEqual([
            [null],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

        expect(getValues(0, 2, 0, 2)).toStrictEqual([
            [{ f: '=A1' }],
        ]);
        expect(getValues(10, 0, 10, 0, 'sheet2')).toStrictEqual([
            [null],
        ]);
        expect(getValues(10, 0, 10, 0, 'sheet1')).toStrictEqual([
            [null],
        ]);
    });

    it('cut-pasting a formula cell across worksheets, the reference range is affected by the moved range', async () => {
        await cutPaste(
            { rows: [2], cols: [0, 1, 2, 3, 4, 5] },
            { startRow: 11, startColumn: 0, endRow: 11, endColumn: 0 },
            'sheet1',
            'sheet2'
        );

        expect(getValues(2, 0, 2, 5)).toStrictEqual([
            [null, null, null, null, null, null],
        ]);
        expect(getValues(11, 0, 11, 5, 'sheet2')).toStrictEqual([
            [{ v: 'label' }, { v: 7 }, { f: '=B12' }, { f: '=C12+1' }, { v: 11 }, { f: '=SUM(B12:E12)' }],
        ]);
        expect(getValues(11, 0, 11, 5, 'sheet1')).toStrictEqual([
            [null, null, null, null, null, null],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

        expect(getValues(2, 0, 2, 5)).toStrictEqual([
            [{ v: 'label' }, { v: 7 }, { f: '=B3' }, { f: '=C3+1' }, { v: 11 }, { f: '=SUM(B3:E3)' }],
        ]);
        expect(getValues(11, 0, 11, 5, 'sheet2')).toStrictEqual([
            [null, null, null, null, null, null],
        ]);
        expect(getValues(11, 0, 11, 5, 'sheet1')).toStrictEqual([
            [null, null, null, null, null, null],
        ]);
    });

    it('cut-pasting a formula cell across worksheets, the reference range has Sheet3 range and Sheet1 range', async () => {
        await cutPaste(
            { rows: [3], cols: [0] },
            { startRow: 12, startColumn: 0, endRow: 12, endColumn: 0 },
            'sheet1',
            'sheet2'
        );

        expect(getValues(3, 0, 3, 0)).toStrictEqual([
            [null],
        ]);
        expect(getValues(12, 0, 12, 0, 'sheet2')).toStrictEqual([
            [{ f: '=SUM(Sheet3!A1:A3,Sheet1!B1)' }],
        ]);
        expect(getValues(12, 0, 12, 0, 'sheet1')).toStrictEqual([
            [null],
        ]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

        expect(getValues(3, 0, 3, 0)).toStrictEqual([
            [{ f: '=SUM(Sheet3!A1:A3,B1)' }],
        ]);
        expect(getValues(12, 0, 12, 0, 'sheet2')).toStrictEqual([
            [null],
        ]);
        expect(getValues(12, 0, 12, 0, 'sheet1')).toStrictEqual([
            [null],
        ]);
    });
});

describe('Test paste with formula', () => {
    let univer: Univer;
    let get: Injector['get'];
    let has: Injector['has'];
    let commandService: ICommandService;
    let lexerTreeBuilder: LexerTreeBuilder;
    let formulaDataModel: FormulaDataModel;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        has = testBed.has;
        commandService = get(ICommandService);
        lexerTreeBuilder = get(LexerTreeBuilder);
        formulaDataModel = get(FormulaDataModel);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('correct situations', () => {
        it('Copy two cells, one of which is the formula', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const range = {
                rows: [12],
                cols: [2, 3],
            };
            const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
                0: {
                    0: {
                        v: 3,
                    },
                    1: {
                        v: 2,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
            });

            const accessor = {
                get,
                has,
            };

            const copyInfo = {
                copyRange: {
                    rows: [0],
                    cols: [2, 3],
                },
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            };

            const pasteFrom = {
                unitId,
                subUnitId,
                range: {
                    rows: [0],
                    cols: [2, 3],
                },
            };

            const result = {
                undos: [
                    {
                        id: SetRangeValuesMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                12: {
                                    3: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                            },
                        },
                    },
                ],
                redos: [
                    {
                        id: SetRangeValuesMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                12: {
                                    3: {
                                        f: null,
                                        si: '3e4r5t',
                                        v: null,
                                        p: null,
                                    },
                                },
                            },
                        },
                    },
                ],
            };

            const redoUndoList = getSetCellFormulaMutations(
                unitId,
                subUnitId,
                range,
                matrix,
                accessor,
                copyInfo,
                lexerTreeBuilder,
                formulaDataModel,
                false,
                pasteFrom
            );

            expect(redoUndoList).toStrictEqual(result);
        });

        it('Copy range with formulas', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const range = {
                rows: [5, 6, 7, 8],
                cols: [5, 6, 7, 8],
            };
            const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
                0: {
                    0: {
                        p: null,
                        v: 1,
                        s: null,
                        f: '=SUM(A1)',
                        si: null,
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 2,
                        s: null,
                        f: '=SUM(B1)',
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                1: {
                    0: {
                        p: null,
                        v: 2,
                        s: null,
                        f: '=SUM(A2)',
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                2: {
                    0: {
                        p: null,
                        v: 3,
                        s: null,
                        f: null,
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
                3: {
                    0: {
                        p: null,
                        v: 4,
                        s: null,
                        f: null,
                        si: 'jcozeE',
                        t: 2,
                    },
                    1: {
                        p: null,
                        v: 5,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    2: {
                        p: null,
                        v: 6,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                    3: {
                        p: null,
                        v: 7,
                        s: null,
                        f: null,
                        si: 'OENnXU',
                        t: 2,
                    },
                },
            });

            const accessor = {
                get,
                has,
            };

            const copyInfo = {
                copyType: COPY_TYPE.COPY,
                copyRange: {
                    rows: [0, 1, 2, 3],
                    cols: [5, 6, 7, 8],
                },
                pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            };

            const pasteFrom = {
                unitId,
                subUnitId,
                range: {
                    rows: [0, 1, 2, 3],
                    cols: [5, 6, 7, 8],
                },
            };

            const result = {
                undos: [
                    {
                        id: 'sheet.mutation.set-range-values',
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                5: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                6: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                7: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                                8: {
                                    5: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    6: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    7: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                    8: {
                                        custom: null,
                                        s: null,
                                        f: null,
                                        si: null,
                                        p: null,
                                        v: null,
                                        t: null,
                                    },
                                },
                            },
                        },
                    },
                ],
                redos: [
                    {
                        id: 'sheet.mutation.set-range-values',
                        params: {
                            unitId,
                            subUnitId,
                            cellValue: {
                                5: {
                                    5: {
                                        si: 'bBSIMi',
                                        f: '=SUM(A6)',
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                6: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                7: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                                8: {
                                    5: {
                                        si: 'jcozeE',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    6: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    7: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                    8: {
                                        si: 'OENnXU',
                                        f: null,
                                        v: null,
                                        p: null,
                                    },
                                },
                            },
                        },
                    },
                ],
            };

            const redoUndoList = getSetCellFormulaMutations(
                unitId,
                subUnitId,
                range,
                matrix,
                accessor,
                copyInfo,
                lexerTreeBuilder,
                formulaDataModel,
                false,
                pasteFrom
            );

            // Randomly generated id, no comparison is made
            const resultFormulaId = result.redos[0].params.cellValue['5'][5].si;
            const originRedoParams = redoUndoList.redos[0].params as ISetRangeValuesMutationParams;

            if (!originRedoParams.cellValue || !originRedoParams.cellValue['5'] || !originRedoParams.cellValue['5'][5]) {
                throw new Error('cellValue is undefined');
            }

            originRedoParams.cellValue['5'][5].si = resultFormulaId;

            expect(redoUndoList).toStrictEqual(result);
        });
    });
});

describe('getSetCellFormulaMutations matrix branches', () => {
    let univer: Univer;
    let get: Injector['get'];
    let has: Injector['has'];

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        has = testBed.has;
    });

    afterEach(() => {
        univer.dispose();
    });

    function accessor() {
        return { get, has };
    }

    it('converts pasted formula-looking text into cell formulas when there is no paste source', () => {
        const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
            0: {
                0: { v: '=SUM(A1)' },
                1: { v: 'plain' },
            },
        });

        const result = getSetCellFormulaMutations(
            'test',
            'sheet1',
            { rows: [8], cols: [4, 5] },
            matrix,
            accessor(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE },
            { moveFormulaRefOffset: (formula: string) => formula } as any,
            { getSheetFormulaData: () => ({}) } as any,
            false,
            null
        );

        expect(result.redos[0]).toMatchObject({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: {
                    8: {
                        4: { v: null, f: '=SUM(A1)', si: null, p: null },
                    },
                },
            },
        });
    });

    it('special-paste value removes formulas while preserving display values and rich text text', () => {
        const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
            0: {
                0: { v: 12, f: '=A1' },
                1: { v: null, p: { body: { dataStream: 'rich text\r\n' } } as any },
            },
        });

        const result = getSetCellFormulaMutations(
            'test',
            'sheet1',
            { rows: [9], cols: [1, 2] },
            matrix,
            accessor(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE },
            { moveFormulaRefOffset: (formula: string) => formula } as any,
            {
                getArrayFormulaCellData: () => ({}),
                getSheetFormulaData: () => ({ 9: { 2: { f: '=OLD()' } } }),
            } as any,
            false,
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [0], cols: [0, 1] },
            }
        );

        expect(result.redos[0]).toMatchObject({
            params: {
                cellValue: {
                    9: {
                        1: { v: 12, f: null, si: null, p: null },
                        2: { v: 'rich text', f: null, si: null, p: null },
                    },
                },
            },
        });
    });

    it('special-paste formula shifts formula refs across sheets and reuses shared ids inside the pasted block', () => {
        const moveFormulaRefOffset = (formula: string, offsetX: number, offsetY: number) => `${formula}:${offsetX}:${offsetY}`;
        const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
            0: {
                0: { si: 'shared-source' },
                1: { f: '=A1' },
            },
            1: {
                0: { si: 'shared-source' },
                1: { f: '=A1' },
            },
        });

        const result = getSetCellFormulaMutations(
            'test',
            'sheet1',
            { rows: [10, 11], cols: [5, 6] },
            matrix,
            accessor(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA },
            { moveFormulaRefOffset } as any,
            {
                getFormulaStringByCell: () => '=B2',
            } as any,
            true,
            {
                unitId: 'test',
                subUnitId: 'sheet2',
                range: { rows: [0, 1], cols: [0, 1] },
            }
        );

        const cellValue = (result.redos[0].params as ISetRangeValuesMutationParams).cellValue;
        if (!cellValue) {
            throw new Error('Expected formula paste to generate cell values.');
        }
        const firstSharedCell = cellValue[10]?.[6];
        const secondSharedCell = cellValue[11]?.[6];
        if (!firstSharedCell || !secondSharedCell) {
            throw new Error('Expected formula paste to generate shared formula target cells.');
        }
        expect(cellValue[10][5]).toEqual({ v: null, si: null, f: '=B2:5:10', p: null });
        expect(cellValue[11][5]).toEqual({ v: null, si: null, f: '=B2:5:10', p: null });
        expect(cellValue[10][6]).toMatchObject({ v: null, f: '=A1:5:10', p: null });
        expect(cellValue[11][6]).toMatchObject({ v: null, f: '=A1:5:10', p: null });
        expect(firstSharedCell.si).toEqual(expect.any(String));
        expect(secondSharedCell.si).toEqual(expect.any(String));
    });

    it('default cut paste keeps cut formulas stable and expands external shared formula references into formula strings', () => {
        const matrix = new ObjectMatrix<ICellDataWithSpanInfo>({
            0: {
                0: { f: '=A1', si: 'shared-cut' },
                1: { si: 'shared-cut' },
            },
        });

        const result = getSetCellFormulaMutations(
            'test',
            'sheet1',
            { rows: [12], cols: [3, 4] },
            matrix,
            accessor(),
            { copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE },
            { moveFormulaRefOffset: (formula: string) => formula } as any,
            {
                getFormulaStringByCell: (row: number, col: number) => `=R${row}C${col}`,
                getSheetFormulaData: () => ({
                    0: { 2: { si: 'shared-cut' } },
                }),
            } as any,
            false,
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [0], cols: [0, 1] },
            }
        );

        const cellValue = (result.redos[0].params as ISetRangeValuesMutationParams).cellValue;
        if (!cellValue) {
            throw new Error('Expected cut paste to generate cell values.');
        }
        expect(cellValue[12][3]).toEqual({ f: '=A1', si: 'shared-cut', v: null, p: null });
        expect(cellValue[12][4]).toEqual({ f: null, si: 'shared-cut', v: null, p: null });
        expect(cellValue[0][2]).toEqual({ f: '=R0C2', si: null, v: null, p: null });
    });
});

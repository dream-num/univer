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

import type { Dependency, ICellData, IWorkbookData, Nullable, UnitModel, Workbook } from '@univerjs/core';
import type { BaseAstNode, BaseFunction, IUnitData } from '@univerjs/engine-formula';
import type { IRender } from '@univerjs/engine-render';
import {
    CellValueType,
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
    RedoCommand,
    set,
    ThemeService,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AstRootNodeFactory,
    AstTreeBuilder,
    CalculateFormulaService,
    DefinedNamesService,
    FormulaCurrentConfigService,
    FormulaDataModel,
    FormulaDependencyGenerator,
    FormulaRuntimeService,
    functionMath,
    FunctionNodeFactory,
    FunctionService,
    generateExecuteAstNodeData,
    getObjectValue,
    HyperlinkEngineFormulaService,
    ICalculateFormulaService,
    IDefinedNamesService,
    IFormulaCurrentConfigService,
    IFormulaDependencyGenerator,
    IFormulaRuntimeService,
    IFunctionService,
    IHyperlinkEngineFormulaService,
    Interpreter,
    IOtherFormulaManagerService,
    ISheetRowFilteredService,
    ISuperTableService,
    LambdaNodeFactory,
    LambdaParameterNodeFactory,
    Lexer,
    LexerNode,
    LexerTreeBuilder,
    OperatorNodeFactory,
    OtherFormulaManagerService,
    PrefixNodeFactory,
    ReferenceNodeFactory,
    RemoveSuperTableMutation,
    SetArrayFormulaDataMutation,
    SetFormulaDataMutation,
    SetSuperTableMutation,
    SheetRowFilteredService,
    SuffixNodeFactory,
    SuperTableService,
    UnionNodeFactory,
    ValueNodeFactory,
} from '@univerjs/engine-formula';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { InsertColMutation, InsertRowMutation, MoveRangeCommand, MoveRangeMutation, RangeProtectionRuleModel, RefRangeService, RemoveColByRangeCommand, RemoveColCommand, RemoveColMutation, RemoveRowByRangeCommand, RemoveRowCommand, RemoveRowMutation, SetRangeValuesCommand, SetRangeValuesMutation, SheetInterceptorService, SheetSkeletonService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { UpdateFormulaController } from '@univerjs/sheets-formula';
import enUS from '@univerjs/sheets/locale/en-US';
import zhCN from '@univerjs/sheets/locale/zh-CN';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteSheetTableCommand } from '../../commands/commands/delete-sheet-table.command';
import { SetSheetTableCommand } from '../../commands/commands/set-sheet-table.command';
import { SheetTableInsertColumnAtCommand, SheetTableRemoveColumnAtCommand } from '../../commands/commands/sheet-table-row-col.command';
import { AddSheetTableMutation } from '../../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../../commands/mutations/delete-sheet-table.mutation';
import { SetSheetTableMutation } from '../../commands/mutations/set-sheet-table.mutation';
import { TableManager } from '../../models/table-manager';
import { SheetTableService } from '../../services/table.service';
import { SheetTableFormulaController } from '../sheet-table-formula.controller';
import { SheetTableRefRangeController } from '../sheet-table-ref-range.controller';

interface ITestBed {
    univer: Univer;
    sheet: UnitModel<IWorkbookData>;
    injector: Injector;
}

class RenderManagerServiceTestBed extends RenderManagerService {
    override createRender(unitId: string): IRender {
        const renderer = this._createRender(unitId, new Engine('', { elementHeight: 100, elementWidth: 100 }));
        return renderer;
    }
}

function createFacadeTestBed(workbookData: IWorkbookData, dependencies: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

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
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerServiceTestBed }]);
            injector.add([SheetSkeletonService]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);

            dependencies.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    injector.get(LocaleService).load({ zhCN, enUS });

    const themeService = injector.get(ThemeService);
    const theme = themeService.getCurrentTheme();
    const newTheme = set(theme, 'black', '#35322b');
    themeService.setTheme(newTheme);

    univer.registerPlugin(TestPlugin);

    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData);
    injector.get(IUniverInstanceService).focusUnit('test');
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        sheet,
        injector,
    };
}

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 'product', t: CellValueType.STRING },
                        1: { v: 'amount', t: CellValueType.STRING },
                        2: { v: 'tax', t: CellValueType.STRING },
                    },
                    1: {
                        0: { v: 'A', t: CellValueType.STRING },
                        1: { v: 10, t: CellValueType.NUMBER },
                        2: { v: 1, t: CellValueType.NUMBER },
                    },
                    2: {
                        0: { v: 'B', t: CellValueType.STRING },
                        1: { v: 20, t: CellValueType.NUMBER },
                        2: { v: 2, t: CellValueType.NUMBER },
                    },
                    3: {
                        0: { v: 'C', t: CellValueType.STRING },
                        1: { v: 30, t: CellValueType.NUMBER },
                        2: { v: 3, t: CellValueType.NUMBER },
                    },
                    5: {
                        4: { f: '=SUM(Orders[amount])' },
                        5: { f: '="Orders[amount]"' },
                        6: { f: '=Table[1]' },
                        7: { f: '=Table[2]' },
                        8: { f: '="Table[1]"' },
                    },
                    6: {
                        4: { f: '=SUM(Orders[amount],Orders[amount])' },
                    },
                    7: {
                        4: { f: '=SUM(Orders[amount])' },
                    },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    2: {
                        0: { f: '=SUM(Orders)' },
                    },
                    3: {
                        0: { f: '=SUM(Orders[amount])' },
                    },
                    4: {
                        0: { f: '=SUM(Orders[amount],Orders[tax])' },
                    },
                },
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [
        [ICalculateFormulaService, { useClass: CalculateFormulaService }],
        [Lexer],
        [IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }],
        [IHyperlinkEngineFormulaService, { useClass: HyperlinkEngineFormulaService }],
        [IFormulaRuntimeService, { useClass: FormulaRuntimeService }],
        [IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }],
        [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
        [IFormulaDependencyGenerator, { useClass: FormulaDependencyGenerator }],
        [Interpreter],
        [AstTreeBuilder],
        [AstRootNodeFactory],
        [FunctionNodeFactory],
        [LambdaNodeFactory],
        [LambdaParameterNodeFactory],
        [OperatorNodeFactory],
        [PrefixNodeFactory],
        [ReferenceNodeFactory],
        [SuffixNodeFactory],
        [UnionNodeFactory],
        [ValueNodeFactory],
        [ISuperTableService, { useClass: SuperTableService }],
        [TableManager],
        [SheetTableService],
        [SheetTableFormulaController],
        [SheetTableRefRangeController],
        [UpdateFormulaController],
    ];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

describe('Sheet table formula integration', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;
    let calculate: (formula: string, row?: number, column?: number, sheetId?: string) => string | number | boolean | null | (string | number | boolean | null)[][];

    function getFormula(unitId: string, sheetId: string, row: number, column: number) {
        return formulaDataModel.getFormulaData()[unitId]?.[sheetId]?.[row]?.[column]?.f;
    }

    function getCellFormula(sheetId: string, row: number, column: number) {
        return testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId(sheetId)
            ?.getRange(row, column, row, column)
            .getValue()
            ?.f;
    }

    function getAllUnitData() {
        const workbook = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const sheetData: IUnitData[string] = {};

        workbook.getSheets().forEach((sheet) => {
            const sheetConfig = sheet.getConfig();
            sheetData[sheet.getSheetId()] = {
                cellData: new ObjectMatrix(sheetConfig.cellData),
                rowCount: sheetConfig.rowCount,
                columnCount: sheetConfig.columnCount,
                rowData: sheetConfig.rowData ?? {},
                columnData: sheetConfig.columnData ?? {},
            };
        });

        return {
            [workbook.getUnitId()]: sheetData,
        };
    }

    function calculateCellFormula(unitId: string, sheetId: string, row: number, column: number) {
        const formula = getFormula(unitId, sheetId, row, column);
        expect(formula).toBeDefined();

        return calculate(formula!, row, column, sheetId);
    }

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        formulaDataModel = testBed.injector.get(FormulaDataModel);

        commandService.registerCommand(RemoveRowCommand);
        commandService.registerCommand(RemoveColCommand);
        commandService.registerCommand(MoveRangeCommand);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(RemoveRowByRangeCommand);
        commandService.registerCommand(RemoveColByRangeCommand);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(AddSheetTableMutation);
        commandService.registerCommand(DeleteSheetTableCommand);
        commandService.registerCommand(DeleteSheetTableMutation);
        commandService.registerCommand(SetSheetTableCommand);
        commandService.registerCommand(SetSheetTableMutation);
        commandService.registerCommand(SheetTableInsertColumnAtCommand);
        commandService.registerCommand(SheetTableRemoveColumnAtCommand);
        commandService.registerCommand(SetSuperTableMutation);
        commandService.registerCommand(RemoveSuperTableMutation);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        testBed.injector.get(SheetTableFormulaController);
        testBed.injector.get(SheetTableRefRangeController);
        testBed.injector.get(UpdateFormulaController);

        commandService.syncExecuteCommand(AddSheetTableMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
            name: 'Orders',
            range: {
                startRow: 0,
                endRow: 3,
                startColumn: 0,
                endColumn: 2,
            },
            header: ['product', 'amount', 'tax'],
            options: {
                columns: [
                    { id: 'product-column', displayName: 'product' },
                    { id: 'amount-column', displayName: 'amount' },
                    { id: 'tax-column', displayName: 'tax' },
                ],
            },
        });

        const functionService = testBed.injector.get(IFunctionService);
        const mathFunctions = functionMath as Array<[new (name: string) => BaseFunction, string]>;
        functionService.registerExecutors(...mathFunctions.map(([FunctionCtor, name]) => new FunctionCtor(name)));

        calculate = (formula: string, row = 0, column = 0, sheetId = 'sheet1') => {
            const workbook = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!;
            const worksheet = workbook.getSheetBySheetId(sheetId)!;
            const formulaCurrentConfigService = testBed.injector.get(IFormulaCurrentConfigService);
            const formulaRuntimeService = testBed.injector.get(IFormulaRuntimeService);

            formulaCurrentConfigService.load({
                formulaData: formulaDataModel.getFormulaData(),
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: false,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtySuperTableMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: getAllUnitData(),
            });
            formulaRuntimeService.setCurrent(row, column, worksheet.getRowCount(), worksheet.getColumnCount(), sheetId, workbook.getUnitId());

            const lexerNode = testBed.injector.get(Lexer).treeBuilder(formula);
            if (!(lexerNode instanceof LexerNode)) {
                throw new TypeError(`Failed to parse formula: ${formula}`);
            }
            const astNode = testBed.injector.get(AstTreeBuilder).parse(lexerNode);
            const result = testBed.injector.get(Interpreter).execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('should sync table formulas when a table is renamed, undone, and redone', async () => {
        expect(await commandService.executeCommand(SetSheetTableCommand.id, {
            unitId: 'test',
            tableId: 'orders-table',
            name: 'Sales',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(Sales[amount])');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(Sales[amount])');
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(Sales[amount])');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(Sales[amount])');
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);
    });

    it('should sync wrapped repeated table references when a table is renamed, removed, and has a referenced column removed', async () => {
        expect(calculateCellFormula('test', 'sheet1', 6, 4)).toBe(120);

        expect(await commandService.executeCommand(SetSheetTableCommand.id, {
            unitId: 'test',
            tableId: 'orders-table',
            name: 'Sales',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Sales[amount],Sales[amount])');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(Sales[amount],Sales[amount])');
        expect(calculateCellFormula('test', 'sheet1', 6, 4)).toBe(120);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Sales[amount],Sales[amount])');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(Sales[amount],Sales[amount])');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');

        expect(await commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
            index: 1,
            count: 1,
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');

        expect(await commandService.executeCommand(DeleteSheetTableCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(Orders[amount],Orders[amount])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');
        expect(getCellFormula('sheet1', 6, 4)).toBe('=SUM(#REF!,#REF!)');
    });

    it('should sync multiple table formulas across sheets when a table changes, then undo and redo', async () => {
        expect(calculateCellFormula('test', 'sheet1', 7, 4)).toBe(60);
        expect(calculateCellFormula('test', 'sheet2', 3, 0)).toBe(60);
        expect(calculateCellFormula('test', 'sheet2', 4, 0)).toBe(66);

        expect(await commandService.executeCommand(SetSheetTableCommand.id, {
            unitId: 'test',
            tableId: 'orders-table',
            name: 'Sales',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Sales[amount])');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(Sales[amount])');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(Sales[amount],Sales[tax])');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(Orders[amount],Orders[tax])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Sales[amount])');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(Sales[amount])');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(Sales[amount],Sales[tax])');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Orders[amount])');

        expect(await commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
            index: 1,
            count: 1,
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(#REF!,Orders[tax])');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(Orders[amount],Orders[tax])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(#REF!,Orders[tax])');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Orders[amount])');

        expect(await commandService.executeCommand(DeleteSheetTableCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(#REF!,#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(Orders[amount])');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(Orders[amount],Orders[tax])');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 7, 4)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 3, 0)).toBe('=SUM(#REF!)');
        expect(getFormula('test', 'sheet2', 4, 0)).toBe('=SUM(#REF!,#REF!)');
    });

    it('should recalculate table formulas when table columns shrink, then undo and redo the column insertion', async () => {
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);

        expect(await commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
            index: 2,
            count: 1,
        })).toBe(true);

        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(60);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(60);
    });

    it('should recalculate table formulas when table columns are inserted, undone, and redone', async () => {
        const tableManager = testBed.injector.get(TableManager);
        const getTableRange = () => tableManager.getTableById('test', 'orders-table')?.getRange();

        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);
        expect(getTableRange()).toMatchObject({ startColumn: 0, endColumn: 2 });

        expect(await commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
            index: 2,
            count: 1,
        })).toBe(true);

        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getTableRange()).toMatchObject({ startColumn: 0, endColumn: 3 });
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getTableRange()).toMatchObject({ startColumn: 0, endColumn: 2 });
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getCellFormula('sheet2', 2, 0)).toBe('=SUM(Orders)');
        expect(getTableRange()).toMatchObject({ startColumn: 0, endColumn: 3 });
        expect(calculateCellFormula('test', 'sheet2', 2, 0)).toBe(66);
    });

    it('should recalculate table column formulas when worksheet rows are removed, undone, and redone', async () => {
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RemoveRowCommand.id, {
            range: {
                startRow: 2,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            },
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 4, 4)).toBe('=SUM(Orders[amount])');
        expect(getCellFormula('sheet1', 4, 4)).toBe('=SUM(Orders[amount])');
        expect(calculateCellFormula('test', 'sheet1', 4, 4)).toBe(40);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 4, 4)).toBe('=SUM(Orders[amount])');
        expect(getCellFormula('sheet1', 4, 4)).toBe('=SUM(Orders[amount])');
        expect(calculateCellFormula('test', 'sheet1', 4, 4)).toBe(40);
    });

    it('should sync table column formulas when worksheet columns are removed, undone, and redone', async () => {
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RemoveColCommand.id, {
            range: {
                startRow: 0,
                endRow: 19,
                startColumn: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.COLUMN,
            },
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 5, 3)).toBe('=SUM(#REF!)');
        expect(getCellFormula('sheet1', 5, 3)).toBe('=SUM(#REF!)');
        expect(calculate('=SUM(#REF!)', 5, 3)).toBe('#REF!');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 3)).toBe('=SUM(#REF!)');
        expect(getCellFormula('sheet1', 5, 3)).toBe('=SUM(#REF!)');
        expect(calculate('=SUM(#REF!)', 5, 3)).toBe('#REF!');
    });

    it('should sync table formulas when a table is deleted, undone, and redone', async () => {
        expect(await commandService.executeCommand(DeleteSheetTableCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            tableId: 'orders-table',
        })).toBe(true);

        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(#REF!)');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(#REF!)');
        expect(calculate('=SUM(#REF!)', 5, 4)).toBe('#REF!');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(Orders[amount])');
        expect(calculateCellFormula('test', 'sheet1', 5, 4)).toBe(60);

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula('test', 'sheet1', 5, 4)).toBe('=SUM(#REF!)');
        expect(getCellFormula('sheet1', 5, 4)).toBe('=SUM(#REF!)');
        expect(calculate('=SUM(#REF!)', 5, 4)).toBe('#REF!');
    });

    it('should rewrite formulas when a referenced table is renamed', async () => {
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);
        const renameTableResult = sheetInterceptorService.onCommandExecute({
            id: 'sheet.command.set-table-config',
            params: {
                unitId: 'test',
                tableId: 'table-1',
                name: 'Sales',
                oldTableName: 'Orders',
            },
        });

        for (const mutation of renameTableResult.redos) {
            await commandService.executeCommand(mutation.id, mutation.params);
        }

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 4, 5, 4)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[{ f: '=SUM(Sales[amount])' }]]);

        const stringLiteralValues = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 5, 5, 5)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(stringLiteralValues).toEqual([[{ f: '="Orders[amount]"' }]]);
    });

    it('should rewrite formulas when a referenced table is removed', async () => {
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);
        const removeTableResult = sheetInterceptorService.onCommandExecute({
            id: 'sheet.command.delete-table',
            params: {
                unitId: 'test',
                tableId: 'table-1',
                tableName: 'Orders',
            },
        });

        for (const mutation of removeTableResult.redos) {
            await commandService.executeCommand(mutation.id, mutation.params);
        }

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 4, 5, 4)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[{ f: '=SUM(#REF!)' }]]);

        const stringLiteralValues = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 5, 5, 5)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(stringLiteralValues).toEqual([[{ f: '="Orders[amount]"' }]]);
    });

    it('should rewrite numeric table column references when the referenced table column is removed', async () => {
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);
        const removeTableColumnResult = sheetInterceptorService.onCommandExecute({
            id: 'sheet.command.table-remove-column-at',
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                tableId: 'table-1',
                tableName: 'Table',
                removedColumnNames: ['1'],
            },
        });

        for (const mutation of removeTableColumnResult.redos) {
            await commandService.executeCommand(mutation.id, mutation.params);
        }

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 6, 5, 8)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[
            { f: '=#REF!' },
            { f: '=Table[2]' },
            { f: '="Table[1]"' },
        ]]);
    });

    it('should move formula cells when worksheet column removal deletes a referenced table column', async () => {
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);
        const removeTableColumnResult = sheetInterceptorService.onCommandExecute({
            id: 'sheet.command.table-remove-col',
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                tableId: 'table-1',
                tableName: 'Table',
                range: { startRow: 0, endRow: 19, startColumn: 0, endColumn: 0 },
                removedColumnNames: ['1'],
            },
        });

        for (const mutation of removeTableColumnResult.redos) {
            await commandService.executeCommand(mutation.id, mutation.params);
        }

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 5, 5, 8)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[{ f: '=#REF!' }, { f: '=Table[2]' }, { f: '="Table[1]"' }, null]]);
    });
});

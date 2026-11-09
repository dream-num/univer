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

/* eslint-disable max-lines-per-function */

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import type { FormulaDataModel, ISheetData } from '@univerjs/engine-formula';
import type { FFormula } from '@univerjs/engine-formula/facade';
import {
    CellValueType,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    touchDependencies,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { AstRootNodeFactory, AstTreeBuilder, CalculateController, CalculateFormulaService, DependencyManagerService, FeatureCalculationManagerService, FormulaCurrentConfigService, FormulaDependencyGenerator, FormulaResultService, FormulaRuntimeService, FormulaUnitReferenceResolver, FunctionNodeFactory, ICalculateFormulaService, IDependencyManagerService, IFeatureCalculationManagerService, IFormulaCurrentConfigService, IFormulaDependencyGenerator, IFormulaExternalReferenceDataLoader, IFormulaRuntimeService, IFormulaUnitReferenceResolver, Interpreter, IOtherFormulaManagerService, LambdaNodeFactory, LambdaParameterNodeFactory, Lexer, NoopFormulaExternalReferenceDataLoader, OperatorNodeFactory, OtherFormulaManagerService, PrefixNodeFactory, ReferenceNodeFactory, stripErrorMargin, SuffixNodeFactory, UnionNodeFactory, UniverFormulaEnginePlugin, ValueNodeFactory } from '@univerjs/engine-formula';
import { CalculateResultApplyController } from '../../calculate-result-apply.controller';

const getTestWorkbookData = (): IWorkbookData => {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                    },
                    1: {
                        0: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 'B2',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'R2C2',
                            t: CellValueType.STRING,
                        },
                    },
                    2: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: ' ',
                            t: CellValueType.STRING,
                        },
                        2: {
                            v: 1.23,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                        4: {
                            v: false,
                            t: CellValueType.BOOLEAN,
                        },
                    },
                    3: {
                        0: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: '100',
                            t: CellValueType.STRING,
                        },
                        2: {
                            v: '2.34',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'test',
                            t: CellValueType.STRING,
                        },
                        4: {
                            v: -3,
                            t: CellValueType.NUMBER,
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

export function createFunctionTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends UniverFormulaEnginePlugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        private _formulaDataModel: FormulaDataModel | null = null;

        override onStarting(): void {
            super.onStarting();
            const injector = this._injector;
            injector.add([FormulaResultService]);
            injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
            injector.add([Lexer]);

            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([IFormulaExternalReferenceDataLoader, { useClass: NoopFormulaExternalReferenceDataLoader }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFormulaUnitReferenceResolver, { useClass: FormulaUnitReferenceResolver }]);
            injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);
            injector.add([IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }]);
            injector.add([IDependencyManagerService, { useClass: DependencyManagerService }]);

            injector.add([Interpreter]);
            injector.add([AstTreeBuilder]);

            injector.add([IFormulaDependencyGenerator, { useClass: FormulaDependencyGenerator }]);

            injector.add([CalculateController]);

            injector.add([AstRootNodeFactory]);
            injector.add([FunctionNodeFactory]);
            injector.add([LambdaNodeFactory]);
            injector.add([LambdaParameterNodeFactory]);
            injector.add([OperatorNodeFactory]);
            injector.add([PrefixNodeFactory]);
            injector.add([ReferenceNodeFactory]);
            injector.add([SuffixNodeFactory]);
            injector.add([UnionNodeFactory]);
            injector.add([ValueNodeFactory]);

            injector.add([CalculateResultApplyController]);

            dependencies?.forEach((d) => injector.replace(d.length === 1 ? [d[0], { useClass: d[0] }] : d));
        }

        override onReady(): void {
            touchDependencies(this._injector, [
                [CalculateController],
                [CalculateResultApplyController],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin, { notExecuteFormula: true });
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData || getTestWorkbookData());

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `true` to debug tests via logs

    const sheetData: ISheetData = {};
    const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const sheetId = workbook.getActiveSheet()!.getSheetId();
    workbook.getSheets().forEach((sheet) => {
        const sheetConfig = sheet.getConfig();
        sheetData[sheet.getSheetId()] = {
            cellData: new ObjectMatrix(sheetConfig.cellData),
            rowCount: sheetConfig.rowCount,
            columnCount: sheetConfig.columnCount,
            rowData: sheetConfig.rowData,
            columnData: sheetConfig.columnData,
        };
    });

    return {
        univer,
        api: FUniver.newAPI(univer),
        get,
        sheet,
        unitId,
        sheetId,
        sheetData,
    };
}

export function waitForCalculationEnd(formulaEngine: FFormula): Promise<void> {
    return new Promise((resolve) => {
        const disposable = formulaEngine.calculationEnd(() => {
            disposable.dispose();
            resolve();
        });
    });
}

export function stripArrayValue(array: (string | number | boolean | null)[][]) {
    return array.map((row) => row.map((cell) => {
        if (typeof cell === 'number') {
            return stripErrorMargin(cell);
        }
        return cell;
    }));
}

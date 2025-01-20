/**
 * Copyright 2023-present DreamNum Inc.
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
import type { ISheetData } from '../../basics/common';

import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../engine/value-object/base-value-object';

import {
    CellValueType,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { Lexer } from '../../engine/analysis/lexer';
import { LexerTreeBuilder } from '../../engine/analysis/lexer-tree-builder';
import { AstTreeBuilder } from '../../engine/analysis/parser';
import { AstRootNodeFactory } from '../../engine/ast-node/ast-root-node';
import { FunctionNodeFactory } from '../../engine/ast-node/function-node';
import { LambdaNodeFactory } from '../../engine/ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../../engine/ast-node/lambda-parameter-node';
import { OperatorNodeFactory } from '../../engine/ast-node/operator-node';
import { PrefixNodeFactory } from '../../engine/ast-node/prefix-node';
import { ReferenceNodeFactory } from '../../engine/ast-node/reference-node';
import { SuffixNodeFactory } from '../../engine/ast-node/suffix-node';
import { UnionNodeFactory } from '../../engine/ast-node/union-node';
import { ValueNodeFactory } from '../../engine/ast-node/value-node';
import { FormulaDependencyGenerator, IFormulaDependencyGenerator } from '../../engine/dependency/formula-dependency';
import { Interpreter } from '../../engine/interpreter/interpreter';
import { stripErrorMargin } from '../../engine/utils/math-kit';
import { FormulaDataModel } from '../../models/formula-data.model';
import { CalculateFormulaService, ICalculateFormulaService } from '../../services/calculate-formula.service';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from '../../services/current-data.service';
import { DefinedNamesService, IDefinedNamesService } from '../../services/defined-names.service';
import { FunctionService, IFunctionService } from '../../services/function.service';
import { IOtherFormulaManagerService, OtherFormulaManagerService } from '../../services/other-formula-manager.service';
import { FormulaRuntimeService, IFormulaRuntimeService } from '../../services/runtime.service';
import { ISuperTableService, SuperTableService } from '../../services/super-table.service';

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
    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        private _formulaDataModel: FormulaDataModel | null = null;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
            injector.add([Lexer]);
            injector.add([LexerTreeBuilder]);

            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([ISuperTableService, { useClass: SuperTableService }]);

            injector.add([IFormulaDependencyGenerator, { useClass: FormulaDependencyGenerator }]);
            injector.add([Interpreter]);
            injector.add([AstTreeBuilder]);

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
            injector.add([FormulaDataModel]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookData || getTestWorkbookData());

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `true` to debug tests via logs

    const sheetData: ISheetData = {};
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
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
        get,
        sheet,
        unitId,
        sheetId,
        sheetData,
    };
}

export function getObjectValue(result: FunctionVariantType) {
    if ((result as ErrorValueObject).isError()) {
        return (result as ErrorValueObject).getValue();
    } else if ((result as BaseReferenceObject).isReferenceObject()) {
        return (result as BaseReferenceObject).toArrayValueObject().toValue();
    } else if ((result as ArrayValueObject).isArray()) {
        return (result as ArrayValueObject).toValue();
    }
    return (result as BaseValueObject).getValue();
}

export function stripArrayValue(array: (string | number | boolean | null)[][]) {
    return array.map((row) => row.map((cell) => {
        if (typeof cell === 'number') {
            return stripErrorMargin(cell);
        }
        return cell;
    }));
}

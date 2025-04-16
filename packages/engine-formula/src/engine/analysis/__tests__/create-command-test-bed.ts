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

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetData } from '../../../basics/common';

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
import { FormulaDataModel } from '../../../models/formula-data.model';
import { CalculateFormulaService, ICalculateFormulaService } from '../../../services/calculate-formula.service';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { DefinedNamesService, IDefinedNamesService } from '../../../services/defined-names.service';
import { DependencyManagerService, IDependencyManagerService } from '../../../services/dependency-manager.service';
import { FeatureCalculationManagerService, IFeatureCalculationManagerService } from '../../../services/feature-calculation-manager.service';
import { FunctionService, IFunctionService } from '../../../services/function.service';
import {
    IOtherFormulaManagerService,
    OtherFormulaManagerService,
} from '../../../services/other-formula-manager.service';
import { FormulaRuntimeService, IFormulaRuntimeService } from '../../../services/runtime.service';
import { ISheetRowFilteredService, SheetRowFilteredService } from '../../../services/sheet-row-filtered.service';
import { ISuperTableService, SuperTableService } from '../../../services/super-table.service';
import { AstRootNodeFactory } from '../../ast-node/ast-root-node';
import { FunctionNodeFactory } from '../../ast-node/function-node';
import { LambdaNodeFactory } from '../../ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../../ast-node/lambda-parameter-node';
import { OperatorNodeFactory } from '../../ast-node/operator-node';
import { PrefixNodeFactory } from '../../ast-node/prefix-node';
import { ReferenceNodeFactory } from '../../ast-node/reference-node';
import { SuffixNodeFactory } from '../../ast-node/suffix-node';
import { UnionNodeFactory } from '../../ast-node/union-node';
import { ValueNodeFactory } from '../../ast-node/value-node';
import { FormulaDependencyGenerator, IFormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { Interpreter } from '../../interpreter/interpreter';
import { Lexer } from '../lexer';
import { LexerTreeBuilder } from '../lexer-tree-builder';
import { AstTreeBuilder } from '../parser';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Main',
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
        sheet2: {
            id: 'sheet2',
            name: 'Tool',
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
export function createCommandTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
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
            registerFormulaDependencies(this._injector);
            dependencies?.forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookData || TEST_WORKBOOK_DATA);

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

function registerFormulaDependencies(injector: Injector) {
    injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
    injector.add([Lexer]);
    injector.add([LexerTreeBuilder]);

    injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
    injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);
    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }]);
    injector.add([IDependencyManagerService, { useClass: DependencyManagerService }]);
    injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);

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
}

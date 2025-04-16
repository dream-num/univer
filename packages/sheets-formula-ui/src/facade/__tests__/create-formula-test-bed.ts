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
import {
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ActiveDirtyManagerService, AstRootNodeFactory, AstTreeBuilder, CalculateController, CalculateFormulaService, DefinedNamesService, DependencyManagerService, FeatureCalculationManagerService, FormulaCurrentConfigService, FormulaDataModel, FormulaDependencyGenerator, FormulaRuntimeService, FunctionNodeFactory, FunctionService, IActiveDirtyManagerService, ICalculateFormulaService, IDefinedNamesService, IDependencyManagerService, IFeatureCalculationManagerService, IFormulaCurrentConfigService, IFormulaRuntimeService, IFunctionService, Interpreter, IOtherFormulaManagerService, ISheetRowFilteredService, ISuperTableService, LambdaNodeFactory, LambdaParameterNodeFactory, Lexer, LexerTreeBuilder, OperatorNodeFactory, OtherFormulaManagerService, PrefixNodeFactory, ReferenceNodeFactory, SheetRowFilteredService, SuffixNodeFactory, SuperTableService, UnionNodeFactory, ValueNodeFactory } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import {
    DescriptionService,
    IDescriptionService,
    IRegisterFunctionService,
    RegisterFunctionService,
} from '@univerjs/sheets-formula';
import enUS from '@univerjs/sheets-formula-ui/locale/en-US';
import zhCN from '@univerjs/sheets-formula-ui/locale/zh-CN';

import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-formula/facade';

function getTestWorkbookDataDemo(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        3: {
                            f: '=SUM(A1)',
                            si: '3e4r5t',
                        },
                    },
                    1: {
                        3: {
                            f: '=SUM(A2)',
                            si: 'OSPtzm',
                        },
                    },
                    2: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            si: 'OSPtzm',
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
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
    univerAPI: FUniver;
}

export function createFormulaTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);

            registerFormulaDependencies(injector);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    injector.get(LocaleService).load({ zhCN, enUS });

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookData || getTestWorkbookDataDemo());

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
    };
}

function registerFormulaDependencies(injector: Injector) {
    injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
    injector.add([
        IDescriptionService,
        {
            useFactory: () => injector.createInstance(DescriptionService),
        },
    ]);

    injector.add([FormulaDataModel]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);

    injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
    injector.add([Lexer]);
    injector.add([LexerTreeBuilder]);

    injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
    injector.add([IDependencyManagerService, { useClass: DependencyManagerService }]);
    injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);
    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([CalculateController]);

    injector.add([IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }]);
    injector.add([FormulaDependencyGenerator]);
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
}

import type { IWorkbookData } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { LexerTreeBuilder } from '../../engine/analysis/lexer';
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
import { FormulaDependencyGenerator } from '../../engine/dependency/formula-dependency';
import { Interpreter } from '../../engine/interpreter/interpreter';
import type { FormulaDataModel } from '../../models/formula-data.model';
import { CalculateFormulaService } from '../../services/calculate-formula.service';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from '../../services/current-data.service';
import { FunctionService, IFunctionService } from '../../services/function.service';
import { IOtherFormulaManagerService, OtherFormulaManagerService } from '../../services/other-formula-manager.service';
import { FormulaRuntimeService, IFormulaRuntimeService } from '../../services/runtime.service';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            },
        },
    },
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: [],
    styles: {},
};
export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        private _formulaDataModel: FormulaDataModel | null = null;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([CalculateFormulaService]);
            injector.add([LexerTreeBuilder]);

            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([IOtherFormulaManagerService, { useClass: OtherFormulaManagerService }]);

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

            dependencies?.forEach((d) => injector.add(d));
        }

        override onDestroy(): void {
            get = undefined;
        }

        override onReady(): void {
            this._formulaDataModel?.initFormulaData();
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}

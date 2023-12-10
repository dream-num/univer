import type { IWorkbookData } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { DefinedNamesService, IDefinedNamesService } from '../../../services/defined-names.service';
import { FormulaRuntimeService, IFormulaRuntimeService } from '../../../services/runtime.service';
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
import { LexerTreeBuilder } from '../lexer-tree-builder';
import { AstTreeBuilder } from '../parser';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '1': {
                    '1': {
                        v: 1,
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

export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([AstTreeBuilder]);
            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([LexerTreeBuilder]);
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
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}

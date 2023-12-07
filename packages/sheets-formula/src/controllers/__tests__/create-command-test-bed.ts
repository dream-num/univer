import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import { FormulaEngineService } from '@univerjs/engine-formula';
import { SelectionManagerService } from '@univerjs/sheets';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 1,
                    },
                    '1': {
                        f: '=SUM(A1)',
                    },
                },
                '1': {
                    '1': {
                        v: 1,
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

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    let get: Injector['get'] | undefined;

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
            injector.add([SelectionManagerService]);
            injector.add([FormulaEngineService]);

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

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SLIENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}

// import type { IWorkbookData } from '@univerjs/core';
// import { ILogService, IUniverInstanceService, LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
// import { FormulaEngineService } from '@univerjs/engine-formula';
// import { SelectionManagerService } from '@univerjs/sheets';
// import type { Dependency } from '@wendellhu/redi';
// import { Inject, Injector } from '@wendellhu/redi';

// const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
//     id: 'test',
//     appVersion: '3.0.0-alpha',
//     sheets: {
//         sheet1: {
//             id: 'sheet1',
//             cellData: {
//                 '1': {
//                     '1': {
//                         v: 1,
//                     },
//                 },
//             },
//         },
//     },
//     locale: LocaleType.EN_US,
//     name: '',
//     sheetOrder: [],
//     styles: {},
// };

// export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]) {
//     const univer = new Univer();

//     let get: Injector['get'] | undefined;

//     /**
//      * This plugin hooks into Sheet's DI system to expose API to test scripts
//      */
//     class TestSpyPlugin extends Plugin {
//         static override type = PluginType.Sheet;

//         constructor(
//             _config: undefined,
//             @Inject(Injector) override readonly _injector: Injector
//         ) {
//             super('test-plugin');

//             this._injector = _injector;
//             get = this._injector.get.bind(this._injector);
//         }

//         override onStarting(injector: Injector): void {
//             injector.add([SelectionManagerService]);
//             injector.add([FormulaEngineService]);

//             dependencies?.forEach((d) => injector.add(d));
//         }

//         override onDestroy(): void {
//             get = undefined;
//         }
//     }

//     univer.registerPlugin(TestSpyPlugin);
//     const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

//     if (get === undefined) {
//         throw new Error('[TestPlugin]: not hooked on!');
//     }

//     const univerInstanceService = get(IUniverInstanceService);
//     univerInstanceService.focusUniverInstance('test');

//     const logService = get(ILogService);
//     logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

//     return {
//         univer,
//         get,
//         sheet,
//     };
// }

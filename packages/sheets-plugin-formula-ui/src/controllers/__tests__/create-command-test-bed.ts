import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    ILogService,
    IUniverInstanceService,
    IWorkbookData,
    LocaleType,
    Plugin,
    PluginType,
    Univer,
    Workbook,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

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

    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
        }

        override onStarting(injector: Injector): void {
            injector.add([SelectionManagerService]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');
    const logService = injector.get(ILogService);

    logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}

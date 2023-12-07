import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { enUS } from '../../locale';
import { DataRequestService, IDataRequestService } from '../data-request.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'A2',
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

/**
 * data connector api url
 */
export const dataConnectorUrl = {
    dataTree: '/data-tree',
    previewDataForm: '/preview-data-form',
    dataForm: '/data-form',
};

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            enUS,
        },
    });
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
            injector.add([
                IDataRequestService,
                {
                    useFactory: () => injector.createInstance(DataRequestService, dataConnectorUrl),
                },
            ]);
            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `true` to debug tests via logs

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}

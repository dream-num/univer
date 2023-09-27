import { ICurrentUniverService, IWorkbookConfig, LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { BorderStyleManagerService } from '../../../services/border-style-manager.service';
import { SelectionManagerService } from '../../../services/selection-manager.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookConfig = {
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
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    namedRanges: [],
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export function createCommandTestBed(workbookConfig?: IWorkbookConfig) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
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
            injector.add([BorderStyleManagerService]);
        }

        override onDestroy(): void {
            get = undefined;
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const currentUniverService = get(ICurrentUniverService);
    currentUniverService.focusUniverInstance('test');

    return {
        univer,
        get,
        sheet,
    };
}

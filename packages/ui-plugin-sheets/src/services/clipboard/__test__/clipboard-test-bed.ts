import { SelectionManagerService } from '@univerjs/base-sheets';
import { BrowserClipboardService, IClipboardInterfaceService } from '@univerjs/base-ui';
import {
    ILogService,
    IUniverInstanceService,
    IWorkbookConfig,
    LocaleType,
    Plugin,
    PluginType,
    Univer,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SheetClipboardController } from '../../../controller/clipboard/clipboard.controller';
import { ISheetClipboardService, SheetClipboardService } from '../clipboard.service';

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
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export function clipboardTestBed(workbookConfig?: IWorkbookConfig, dependencies?: Dependency[]) {
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
            injector.add([SelectionManagerService]);
            injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }]);
            injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
            injector.add([SheetClipboardController]);

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
    logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}

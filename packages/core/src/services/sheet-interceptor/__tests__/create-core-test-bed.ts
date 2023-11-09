import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { Univer } from '../../../basics/univer';
import { Plugin, PluginType } from '../../../plugin/plugin';
import { LocaleType } from '../../../types/enum/locale-type';
import { IWorkbookConfig } from '../../../types/interfaces/i-workbook-data';
import { IUniverInstanceService } from '../../instance/instance.service';
import { ILogService } from '../../log/log.service';

const TEST_WORKBOOK_DATA: IWorkbookConfig = {
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
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export function createCoreTestBed(workbookConfig?: IWorkbookConfig, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-spy-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(_injector);
        }

        override onDestroy(): void {
            get = undefined;
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
    logService.toggleLogEnabled(false);

    return {
        univer,
        get,
        sheet,
    };
}

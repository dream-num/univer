/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { Univer } from '../../basics/univer';
import { Plugin, PluginType } from '../../plugin/plugin';
import { IUniverInstanceService } from '../../services/instance/instance.service';
import { ILogService, LogLevel } from '../../services/log/log.service';
import { LocaleType } from '../../types/enum/locale-type';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'B1',
                    },
                },
            },
            name: 'Sheet-001',
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export function createCoreTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]) {
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
    const sheet = univer.createUniverSheetByConfig(workbookConfig || TEST_WORKBOOK_DATA);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}

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
import type { IMessageProps } from '@univerjs/design';
import type { IMessageService as IUiMessageService } from '@univerjs/ui';
import {
    Disposable,
    IConfirmService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    TestConfirmService,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IMessageService } from '@univerjs/ui';
import enUS from '../locale/en-US';

import { IFindReplaceService } from '../services/find-replace.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
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

class TestMessageService implements IUiMessageService {
    readonly messages: IMessageProps[] = [];

    show(options: IMessageProps): Disposable {
        this.messages.push(options);
        return new Disposable();
    }

    remove(_id: string): void {}

    removeAll(): void {
        this.messages.length = 0;
    }
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

export function createTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'find-replace-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.add([IConfirmService, { useClass: TestConfirmService }]);
            this._injector.add([IMessageService, { useClass: TestMessageService }]);
            dependencies?.forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const snapshot = Tools.deepClone(workbookData || TEST_WORKBOOK_DATA_DEMO);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot);
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit(sheet.getUnitId());

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const localeService = injector.get(LocaleService);
    localeService.load({ enUS });

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}

export { IFindReplaceService, IMessageService, TestMessageService };

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

import type { IWorkbookData } from '@univerjs/core';
import { Inject, Injector, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { RangeProtectionCache, RangeProtectionRefRangeService, RangeProtectionRenderModel, RangeProtectionRuleModel, RangeProtectionService, RefRangeService, SheetInterceptorService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { IMenuManagerService, IPlatformService, IShortcutService, MenuManagerService, PlatformService, ShortcutService } from '@univerjs/ui';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
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
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export function createMenuTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';

        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(_config: unknown, @Inject(Injector) override readonly _injector: Injector) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IPlatformService, { useClass: PlatformService }]);
            injector.add([SheetsSelectionsService]);
            injector.add([IShortcutService, { useClass: ShortcutService }]);
            injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([SheetInterceptorService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([RefRangeService]);

            injector.add([RangeProtectionRefRangeService]);
            injector.add([RangeProtectionRenderModel]);
            injector.add([RangeProtectionCache]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([RangeProtectionService]);

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(TEST_WORKBOOK_DATA_DEMO);

    return {
        univer,
        get,
        sheet,
    };
}

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

import type { IWorkbookData } from '@univerjs/core';
import { LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { RangeProtectionRefRangeService, RangeProtectionRenderModel, RangeProtectionRuleModel, RangeProtectionService, RefRangeService, SelectionManagerService,
    SheetInterceptorService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { DesktopMenuService, DesktopPlatformService, DesktopShortcutService, IMenuService, IPlatformService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';

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
        protected override _injector: Injector;

        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(_config: unknown, @Inject(Injector) _injector: Injector) {
            super();

            this._injector = _injector;
            // get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([IPlatformService, { useClass: DesktopPlatformService }]);
            injector.add([SelectionManagerService]);
            injector.add([IShortcutService, { useClass: DesktopShortcutService }]);
            injector.add([IMenuService, { useClass: DesktopMenuService }]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([SheetInterceptorService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([RefRangeService]);

            injector.add([RangeProtectionRefRangeService]);
            injector.add([RangeProtectionRenderModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([RangeProtectionService]);
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

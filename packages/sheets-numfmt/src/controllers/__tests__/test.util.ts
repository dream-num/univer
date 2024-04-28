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
import { ICommandService, IUniverInstanceService, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

const TEST_WORKBOOK_DATA_DEMO: () => IWorkbookData = () => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: { 0: { v: 0, t: 2 }, 1: { v: 1, t: 2 }, 2: { v: 2, t: 2 }, 3: { v: 3, t: 2 }, 4: { v: 4, t: 2 } },
                1: { 0: { v: 0, t: 2 }, 1: { v: 1, t: 2 }, 2: { v: 2, t: 2 }, 3: { v: 3, t: 2 }, 4: { v: 4, t: 2 } },
                2: { 0: { v: 0, t: 2 }, 1: { v: 1, t: 2 }, 2: { v: 2, t: 2 }, 3: { v: 3, t: 2 }, 4: { v: 4, t: 2 } },
                3: { 0: { v: 0, t: 2 }, 1: { v: 1, t: 2 }, 2: { v: 2, t: 2 }, 3: { v: 3, t: 2 }, 4: { v: 4, t: 2 } },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
});
export const createTestBed = (dependencies?: Dependency[]) => {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(injector: Injector): void {
            injector.add([INumfmtService, { useClass: NumfmtService }]);
            injector.add([SheetInterceptorService]);
            injector.add([SheetSkeletonManagerService]);
            injector.add([LexerTreeBuilder]);
            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const workbookJson = TEST_WORKBOOK_DATA_DEMO();
    const sheet = univer.createUniverSheet(workbookJson);

    const univerInstanceService = injector.get(IUniverInstanceService);
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(RemoveNumfmtMutation);
    commandService.registerCommand(SetNumfmtMutation);
    univerInstanceService.focusUnit('test');
    const unitId = workbookJson.id;
    const subUnitId = workbookJson.sheets.sheet1.id!;

    return {
        univer,
        get,
        sheet,
        unitId,
        subUnitId,
        // numfmtService,
    };
};

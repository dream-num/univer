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
import { ICommandService, IUniverInstanceService, LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
import {
    SheetInterceptorService,
} from '@univerjs/sheets';

import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { IActiveDirtyManagerService } from '@univerjs/engine-formula';
import { ConditionalFormattingService } from '../conditional-formatting.service';
import { ConditionalFormattingFormulaService } from '../conditional-formatting-formula.service';
import { SheetsConditionalFormattingPlugin } from '../../plugin';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../../models/conditional-formatting-view-model';

const TEST_WORKBOOK_DATA_DEMO: () => IWorkbookData = () => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                1: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                2: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                3: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                4: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                5: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
    resources: [
        {
            name: 'SHEET_NUMFMT_PLUGIN',
            data: '{"model":{},"refModel":[]}',
        },
        {
            name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
            data: '{"sheet1":[{"cfId":"1","ranges":[{"startRow":0,"startColumn":0,"endRow":5,"endColumn":6,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"config":[{"color":"#ff0000","value":{"type":"min","value":10},"index":0},{"color":"#0000ff","value":{"type":"max","value":90},"index":1}],"type":"colorScale"},"stopIfTrue":false}]}',
        },
    ],
});
export const createTestBed = (dependencies?: Dependency[]) => {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');
        }

        override onStarting(injector: Injector): void {
            injector.add([SheetInterceptorService]);
            dependencies?.forEach((d) => injector.add(d));
        }

        override onReady(): void {
            this._injector.add([ConditionalFormattingService]);
            this._injector.add([ConditionalFormattingFormulaService]);
            this._injector.add([ConditionalFormattingRuleModel]);
            this._injector.add([ConditionalFormattingViewModel]);
            this._injector.add([IActiveDirtyManagerService, { useFactory: () => ({ register: () => {} } as any) }]);
            this._injector.get(ConditionalFormattingService);
        }
    }

    univer.registerPlugin(TestPlugin);

    const workbookJson = TEST_WORKBOOK_DATA_DEMO();
    const workbook = univer.createUniverSheet(workbookJson);

    const univerInstanceService = injector.get(IUniverInstanceService);
    const commandService = injector.get(ICommandService);
    [...SheetsConditionalFormattingPlugin.commandList, ...SheetsConditionalFormattingPlugin.mutationList].forEach((commandInfo) => {
        commandService.registerCommand(commandInfo);
    });
    const unitId = workbookJson.id;
    const subUnitId = workbookJson.sheets.sheet1.id!;
    univerInstanceService.focusUniverInstance('test');
    univerInstanceService.setCurrentUniverSheetInstance(subUnitId);
    const getConditionalFormattingRuleModel = () => injector.get(ConditionalFormattingRuleModel);
    const getConditionalFormattingViewModel = () => injector.get(ConditionalFormattingViewModel);
    const getConditionalFormattingService = () => injector.get(ConditionalFormattingService);
    return {
        univer,
        get,
        workbook,
        unitId,
        subUnitId,
        commandService,
        getConditionalFormattingRuleModel,
        getConditionalFormattingViewModel,
        getConditionalFormattingService,
    };
};

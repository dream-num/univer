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

import type { Dependency, IWorkbookData } from '@univerjs/core';
import { ICommandService, Inject, Injector, IUniverInstanceService, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { IActiveDirtyManagerService } from '@univerjs/engine-formula';
import {
    SheetInterceptorService,
} from '@univerjs/sheets';
import { AddConditionalRuleMutation } from '../../../commands/mutations/add-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from '../../../commands/mutations/delete-conditional-rule.mutation';
import { ConditionalFormattingFormulaMarkDirty } from '../../../commands/mutations/formula-mark-dirty.mutation';
import { MoveConditionalRuleMutation } from '../../../commands/mutations/move-conditional-rule.mutation';
import { SetConditionalRuleMutation } from '../../../commands/mutations/set-conditional-rule.mutation';

import { ConditionalFormattingRuleModel } from '../../../models/conditional-formatting-rule-model';
import { ConditionalFormattingFormulaService } from '../../../services/conditional-formatting-formula.service';

import { ConditionalFormattingService } from '../../../services/conditional-formatting.service';
import { ConditionalFormattingViewModel } from '../../conditional-formatting-view-model';

const TEST_WORKBOOK_DATA_DEMO: () => IWorkbookData = () => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 }, 7: { v: 8, t: 2 }, 8: { v: 9, t: 2 } },
                1: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                2: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                3: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                4: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                5: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 } },
                6: { 0: { v: 0, t: 2 } },
                7: { 0: { v: 1, t: 2 }, 1: { v: 2, t: 2 }, 2: { v: 3, t: 2 }, 3: { v: 4, t: 2 }, 4: { v: 5, t: 2 }, 5: { v: 6, t: 2 }, 6: { v: 7, t: 2 }, 7: { v: 8, t: 2 }, 8: { v: 9, t: 2 }, 9: { v: 10, t: 2 } },
            },
            rowCount: 8,
            columnCount: 10,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
    resources: [],
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
            this._injector.add([SheetInterceptorService]);
            this._injector.add([ConditionalFormattingService]);
            this._injector.add([ConditionalFormattingFormulaService]);
            this._injector.add([ConditionalFormattingRuleModel]);
            this._injector.add([ConditionalFormattingViewModel]);
            this._injector.add([IActiveDirtyManagerService, { useFactory: () => ({ register: () => { /* empty */ } } as any) }]);
        }

        override onStarting(): void {
            dependencies?.forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const workbookJson = TEST_WORKBOOK_DATA_DEMO();
    const workbook = univer.createUniverSheet(workbookJson);

    const univerInstanceService = injector.get(IUniverInstanceService);
    const commandService = injector.get(ICommandService);

    [
        AddConditionalRuleMutation,
        DeleteConditionalRuleMutation,
        SetConditionalRuleMutation,
        MoveConditionalRuleMutation,
        ConditionalFormattingFormulaMarkDirty,
    ].forEach((commandInfo) => {
        commandService.registerCommand(commandInfo);
    });

    const unitId = workbookJson.id;
    const subUnitId = workbookJson.sheets.sheet1.id!;

    univerInstanceService.focusUnit('test');
    univerInstanceService.setCurrentUnitForType(unitId);

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

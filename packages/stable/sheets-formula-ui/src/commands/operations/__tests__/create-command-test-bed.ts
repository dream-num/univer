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
import { AuthzIoLocalService, IAuthzIoService, ILogService, Inject, Injector, IUniverInstanceService, LocaleType, LogLevel, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RangeProtectionRuleModel, RefSelectionsService, SheetInterceptorService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { EditorBridgeService, IEditorBridgeService, ISheetSelectionRenderService, SheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { FormulaPromptService, IFormulaPromptService } from '../../../services/prompt.service';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                1: {
                    1: {
                        v: 1,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
});

export function createCommandTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
            injector.add([SheetsSelectionsService]);
            injector.add([LexerTreeBuilder]);
            injector.add([DocSelectionManagerService]);
            injector.add([IFormulaPromptService, { useClass: FormulaPromptService }]);
            injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
            injector.add([IEditorService, { useClass: EditorService }]);
            injector.add([SheetSkeletonManagerService]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([SheetInterceptorService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([IAuthzIoService, { useClass: AuthzIoLocalService }]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IRefSelectionsService, { useClass: RefSelectionsService }]);

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData || TEST_WORKBOOK_DATA_DEMO());

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}

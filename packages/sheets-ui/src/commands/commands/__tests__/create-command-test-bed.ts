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
import type { IRenderContext } from '@univerjs/engine-render';
import {
    BooleanNumber,
    CellValueType,
    DisposableCollection,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';

import { LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    BorderStyleManagerService,
    IRefSelectionsService,
    RangeProtectionRuleModel,
    SheetInterceptorService,

    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import enUS from '../../../locale/en-US';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';

const getTestWorkbookDataDemo = (): IWorkbookData => {
    return {
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
                    // 20 test merge cell, do not change value here
                    20: {
                        1: {
                            v: 2,
                            t: CellValueType.NUMBER,
                            s: {
                                n: {
                                    pattern: '0%',
                                },
                            },
                        },
                    },
                },
                columnData: {
                    1: {
                        hd: BooleanNumber.FALSE,
                    },
                },
                rowData: {
                    1: {
                        hd: BooleanNumber.FALSE,
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

export function createCommandTestBed(
    workbookData?: IWorkbookData,
    dependencies?: Dependency[],
    renderDependencies?: Dependency[]
): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

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
            injector.add([SheetsSelectionsService]);
            injector.add([BorderStyleManagerService]);
            injector.add([SheetInterceptorService]);
            injector.add([LexerTreeBuilder]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([IRefSelectionsService, { useClass: SheetsSelectionsService }]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const snapshot = Tools.deepClone(workbookData || getTestWorkbookDataDemo());
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot);

    if (!dependencies || !dependencies.find((d) => d[0] === ISheetSelectionRenderService)) {
        const context: IRenderContext<Workbook> = {
            unitId: sheet.getUnitId(),
            unit: sheet,
            type: UniverInstanceType.UNIVER_SHEET,
            engine: new DisposableCollection() as any,
            scene: new DisposableCollection() as any,
            mainComponent: null as any,
            components: new Map(),
            isMainScene: true,
            activated$: new BehaviorSubject(true),
            activate: () => { },
            deactivate: () => { },
        };

        injector.add([ISheetSelectionRenderService, { useFactory: () => injector.createInstance(SheetSelectionRenderService, context) }]);
    }

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.VERBOSE); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const localeService = injector.get(LocaleService);
    localeService.load({ enUS });

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}

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

/* eslint-disable max-lines-per-function */

import type { Dependency, IWorkbookData, Nullable, UnitModel } from '@univerjs/core';
import type { IRender } from '@univerjs/engine-render';
import type { ICellPosWithEvent, IHoverCellPosition, IHoverRichTextInfo, IHoverRichTextPosition } from '@univerjs/sheets-ui';
import type { IHoverHeaderPosition } from '@univerjs/sheets-ui/services/hover-manager.service.js';
import {
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { ActiveDirtyManagerService, DefinedNamesService, FormulaDataModel, FunctionService, IActiveDirtyManagerService, IDefinedNamesService, IFunctionService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ISocketService, WebSocketService } from '@univerjs/network';
import {
    RangeProtectionRuleModel,
    RefRangeService,
    SheetInterceptorService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { ConditionalFormattingFormulaService, ConditionalFormattingRuleModel, ConditionalFormattingService, ConditionalFormattingViewModel } from '@univerjs/sheets-conditional-formatting';
import { DataValidationCacheService, DataValidationCustomFormulaService, DataValidationFormulaService, SheetDataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import {
    DescriptionService,
    IDescriptionService,
    IRegisterFunctionService,
    RegisterFunctionService,
    RegisterOtherFormulaService,
} from '@univerjs/sheets-formula';
import enUS from '@univerjs/sheets-formula-ui/locale/en-US';
import zhCN from '@univerjs/sheets-formula-ui/locale/zh-CN';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { DragManagerService, HoverManagerService, ISheetSelectionRenderService, SheetRenderController, SheetScrollManagerService, SheetSelectionRenderService, SheetSkeletonManagerService, SheetsRenderService } from '@univerjs/sheets-ui';
import { IThreadCommentDataSourceService, ThreadCommentDataSourceService, ThreadCommentModel } from '@univerjs/thread-comment';
import { IPlatformService, IShortcutService, PlatformService, ShortcutService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { FUniver } from '../everything';

function getTestWorkbookDataDemo(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        3: {
                            f: '=SUM(A1)',
                            si: '3e4r5t',
                        },
                        4: {
                            v: 123,
                            t: 2,
                        },
                    },
                    1: {
                        3: {
                            f: '=SUM(A2)',
                            si: 'OSPtzm',
                        },
                    },
                    2: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
        resources: [
            {
                name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
                data: '{"sheet1":[{"cfId":"AEGZdW8C","ranges":[{"startRow":2,"startColumn":1,"endRow":5,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"4ICEXdJj","ranges":[{"startRow":4,"startColumn":1,"endRow":7,"endColumn":7,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"geCv018z","ranges":[{"startRow":11,"startColumn":1,"endRow":12,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false}]}',
            },
        ],
    };
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: UnitModel<IWorkbookData>;
    univerAPI: FUniver;
    injector: Injector;
}

class RenderManagerServiceTestBed extends RenderManagerService {
    override createRender(unitId: string): IRender {
        const renderer = this._createRender(unitId, new Engine(100, 100));
        return renderer;
    }
}

export function createFacadeTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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
            injector.add([SheetInterceptorService]);
            injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
            injector.add([
                IDescriptionService,
                {
                    useFactory: () => this._injector.createInstance(DescriptionService),
                },
            ]);

            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([ISocketService, { useClass: WebSocketService }]);
            injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerServiceTestBed }]);
            injector.add([ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
            injector.add([SheetsRenderService]);
            injector.add([IShortcutService, { useClass: ShortcutService }]);
            injector.add([IPlatformService, { useClass: PlatformService }]);
            injector.add([SheetSkeletonManagerService]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            // Create a mock HoverManagerService with currentCell$
            const mockHoverManagerService = {
                currentCell$: new Subject<Nullable<IHoverCellPosition>>().asObservable(),
                currentRichText$: new Subject<Nullable<IHoverRichTextPosition>>().asObservable(),
                currentClickedCell$: new Subject<IHoverRichTextInfo>().asObservable(),
                currentDbClickedCell$: new Subject<IHoverRichTextInfo>().asObservable(),
                currentCellPosWithEvent$: new Subject<Nullable<ICellPosWithEvent>>().asObservable(),
                currentPointerDownCell$: new Subject<ICellPosWithEvent>().asObservable(),
                currentPointerUpCell$: new Subject<ICellPosWithEvent>().asObservable(),
                currentPosition$: new Subject<Nullable<IHoverCellPosition>>().asObservable(),
                currentHoveredRowHeader$: new Subject<Nullable<IHoverHeaderPosition>>().asObservable(),
                currentHoveredColHeader$: new Subject<Nullable<IHoverHeaderPosition>>().asObservable(),
                currentRowHeaderClick$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentColHeaderClick$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentRowHeaderDbClick$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentColHeaderDbClick$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentRowHeaderPointerDown$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentColHeaderPointerDown$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentRowHeaderPointerUp$: new Subject<IHoverHeaderPosition>().asObservable(),
                currentColHeaderPointerUp$: new Subject<IHoverHeaderPosition>().asObservable(),
            };
            injector.add([HoverManagerService, { useValue: mockHoverManagerService as unknown as HoverManagerService }]);
            injector.add([DragManagerService, { useValue: mockHoverManagerService as unknown as DragManagerService }]);

            const renderManagerService = injector.get(IRenderManagerService);
            renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService] as Dependency);
            renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetRenderController] as Dependency);
            renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetScrollManagerService] as Dependency);

            // register feature modules
            ([
                // conditional formatting
                [ConditionalFormattingService],
                [ConditionalFormattingFormulaService],
                [ConditionalFormattingRuleModel],
                [ConditionalFormattingViewModel],

                // data validation
                [DataValidationCacheService],
                [DataValidationFormulaService],
                [DataValidationCustomFormulaService],
                [RegisterOtherFormulaService],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [SheetsDataValidationValidatorService],
                [SheetDataValidationModel],

                // sheets filter
                // comment
                [SheetsThreadCommentModel],
                [ThreadCommentModel],
                [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
            ] as Dependency[]).forEach((d) => {
                injector.add(d);
            });

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
            this._injector.get(ConditionalFormattingService);
            this._injector.get(ConditionalFormattingViewModel);
        }

        override onReady(): void {
            this._injector.get(SheetsRenderService);
        }
    }

    // load i18n
    injector.get(LocaleService).load({ zhCN, enUS });

    // load theme service
    const themeService = injector.get(ThemeService);
    themeService.setTheme({ colorBlack: '#35322b' });

    // register builtin plugins
    // note that UI plugins are not registered here, because the unit test environment does not have a UI
    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(UniverDataValidationPlugin);

    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData || getTestWorkbookDataDemo());
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    // set log level
    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // NOTE: change this to `LogLevel.VERBOSE` to debug tests via logs

    // init data validation
    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
        injector,
    };
}

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

import type { Dependency, IDisposable, IRange, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    BooleanNumber,
    Disposable,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    toDisposable,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    IActiveDirtyManagerService,
    OtherFormulaMarkDirty,
    RegisterOtherFormulaService,
    RemoveOtherFormulaMutation,
    SetOtherFormulaMutation,
} from '@univerjs/engine-formula';
import {
    BorderStyleManagerService,
    RangeProtectionRuleModel,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SheetInterceptorService,
    SheetLazyExecuteScheduleService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import {
    AddConditionalRuleMutation,
    ClearRangeCfCommand,
    ClearWorksheetCfCommand,
    ConditionalFormattingFormulaService,
    ConditionalFormattingRangeIndexModel,
    ConditionalFormattingRangeTransformService,
    ConditionalFormattingRuleModel,
    ConditionalFormattingViewModel,
    DeleteConditionalRuleMutation,
    MoveConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { ISheetClipboardService } from '@univerjs/sheets-ui';
import { ComponentManager, ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';

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

class TestSidebarService extends Disposable {
    private _sidebarOptions = { id: '', visible: false } as any;
    readonly sidebarOptions$ = new BehaviorSubject(this._sidebarOptions);
    readonly scrollEvent$ = new Subject<Event>();
    private _container?: HTMLElement;
    private _width?: number;

    get visible(): boolean {
        return Boolean(this._sidebarOptions.visible);
    }

    get options() {
        return this._sidebarOptions;
    }

    get width(): number | undefined {
        return this._width;
    }

    setWidth(value: number): void {
        this._width = value;
    }

    open(params: any): IDisposable {
        this._sidebarOptions = {
            ...params,
            visible: true,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        params.onOpen?.();

        return toDisposable(() => {
            this.close(params.id);
        });
    }

    close(id?: string): void {
        if (id && this._sidebarOptions.id !== id) {
            return;
        }

        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose?.();
    }

    getContainer() {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }
}

class TestSheetClipboardService extends Disposable {
    private _clipboardHooks: any[] = [];
    private readonly _showMenu$ = new BehaviorSubject(false);
    readonly showMenu$ = this._showMenu$.asObservable();
    private readonly _pasteOptionsCache$ = new BehaviorSubject<any>(null);
    readonly pasteOptionsCache$ = this._pasteOptionsCache$.asObservable();

    setShowMenu(show: boolean): void {
        this._showMenu$.next(show);
    }

    getPasteMenuVisible(): boolean {
        return this._showMenu$.getValue();
    }

    getPasteOptionsCache(): any {
        return this._pasteOptionsCache$.getValue();
    }

    updatePasteOptionsCache(cache: any): void {
        this._pasteOptionsCache$.next(cache);
    }

    async copy(): Promise<boolean> {
        return false;
    }

    async cut(): Promise<boolean> {
        return false;
    }

    async paste(): Promise<boolean> {
        return false;
    }

    async pasteByCopyId(): Promise<boolean> {
        return false;
    }

    async legacyPaste(): Promise<boolean> {
        return false;
    }

    rePasteWithPasteType(): boolean {
        return false;
    }

    disposePasteOptionsCache(): void {
        this._pasteOptionsCache$.next(null);
    }

    generateCopyContent(_workbookId: string, _worksheetId: string, _range: IRange): Nullable<unknown> {
        return null;
    }

    copyContentCache(): any {
        return null;
    }

    addClipboardHook(hook: any): IDisposable {
        this._clipboardHooks.push(hook);

        return toDisposable(() => {
            const hooks = [];
            for (const item of this._clipboardHooks) {
                if (item !== hook) {
                    hooks.push(item);
                }
            }
            this._clipboardHooks = hooks;
        });
    }

    getClipboardHooks(): any[] {
        return this._clipboardHooks;
    }

    removeMarkSelection(): void {
        // Mark selections are not created in these UI command tests.
    }

    override dispose(): void {
        super.dispose();
        this._showMenu$.complete();
        this._pasteOptionsCache$.complete();
        this._clipboardHooks = [];
    }
}

function createLocalSheetsTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
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

            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([SheetsSelectionsService]);
            injector.add([BorderStyleManagerService]);
            injector.add([SheetInterceptorService]);
            injector.add([SheetSkeletonService]);
            injector.add([SheetLazyExecuteScheduleService]);

            dependencies?.forEach((dependency) => injector.add(dependency));

            injector.get(SheetInterceptorService);
            injector.get(SheetSkeletonService);
            injector.get(WorkbookPermissionService);
            injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(TestPlugin);

    const sheet = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(workbookData || TEST_WORKBOOK_DATA_DEMO)
    );
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {},
    });
    return {
        univer,
        injector,
        get: injector.get.bind(injector),
        sheet,
    };
}

export function createCfUiTestBed() {
    const testBed = createLocalSheetsTestBed();
    const { univer, get, injector } = testBed;
    const commandService = get(ICommandService);
    const selectionsService = get(SheetsSelectionsService);

    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([RegisterOtherFormulaService]);
    injector.add([ConditionalFormattingRuleModel]);
    injector.add([ConditionalFormattingRangeIndexModel]);
    injector.add([ConditionalFormattingFormulaService]);
    injector.add([ConditionalFormattingRangeTransformService]);
    injector.add([ConditionalFormattingViewModel]);
    injector.add([ComponentManager]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([ISheetClipboardService, { useClass: TestSheetClipboardService as never }]);

    [
        AddConditionalRuleMutation,
        DeleteConditionalRuleMutation,
        SetConditionalRuleMutation,
        MoveConditionalRuleMutation,
        ClearRangeCfCommand,
        ClearWorksheetCfCommand,
        OtherFormulaMarkDirty,
        RemoveOtherFormulaMutation,
        SetRangeValuesCommand,
        SetRangeValuesMutation,
        SetOtherFormulaMutation,
    ].forEach((command) => commandService.registerCommand(command));

    const setSelection = (range: ISelectionWithStyle['range']) => {
        selectionsService.addSelections([{
            range: {
                ...range,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: null,
            style: null,
        }]);
    };

    return {
        univer,
        get,
        injector,
        commandService,
        selectionsService,
        ruleModel: injector.get(ConditionalFormattingRuleModel),
        viewModel: injector.get(ConditionalFormattingViewModel),
        componentManager: injector.get(ComponentManager),
        sidebarService: injector.get(ISidebarService) as unknown as TestSidebarService,
        sidebarOptions$: (injector.get(ISidebarService) as unknown as TestSidebarService).sidebarOptions$,
        sheetClipboardService: injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService,
        getClipboardHook: () => (injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService).getClipboardHooks()[0] as
            | {
                onBeforeCopy: (unitId: string, subUnitId: string, range: ISelectionWithStyle['range']) => void;
                onPasteCells: (...args: any[]) => { redos: Array<{ id: string; params: unknown }>; undos: Array<{ id: string; params: unknown }> };
            }
            | undefined,
        unitId: 'test',
        subUnitId: 'sheet1',
        setSelection,
    };
}

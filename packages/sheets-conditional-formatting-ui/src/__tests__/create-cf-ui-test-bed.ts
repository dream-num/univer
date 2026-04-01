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

/* eslint-disable max-lines-per-function */

import type { Dependency, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    BooleanNumber,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IActiveDirtyManagerService, RegisterOtherFormulaService } from '@univerjs/engine-formula';
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
    ConditionalFormattingRuleModel,
    ConditionalFormattingViewModel,
    DeleteConditionalRuleMutation,
    MoveConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { ISheetClipboardService } from '@univerjs/sheets-ui';
import { ComponentManager, ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { vi } from 'vitest';

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

    const formulaResult$ = new Subject<Record<string, Record<string, unknown[]>>>();
    const componentManager = {
        register: vi.fn((): IDisposable => ({
            dispose: vi.fn(),
        })),
    };
    const sidebarOptions$ = new BehaviorSubject({ id: '', visible: false } as any);
    const sidebarService = {
        open: vi.fn((): IDisposable => ({
            dispose: vi.fn(),
        })),
        sidebarOptions$,
    };
    let clipboardHook: {
        onBeforeCopy: (unitId: string, subUnitId: string, range: ISelectionWithStyle['range']) => void;
        onPasteCells: (...args: any[]) => { redos: Array<{ id: string; params: unknown }>; undos: Array<{ id: string; params: unknown }> };
    } | undefined;
    const sheetClipboardService = {
        addClipboardHook: vi.fn((hook) => {
            clipboardHook = hook;
            return {
                dispose: vi.fn(),
            };
        }),
    };

    injector.add([RegisterOtherFormulaService, {
        useValue: {
            formulaResult$,
            registerFormulaWithRange: vi.fn(() => 'formula-1'),
            deleteFormula: vi.fn(),
            getFormulaValueSync: vi.fn(() => null),
        } as unknown as RegisterOtherFormulaService,
    }]);
    injector.add([IActiveDirtyManagerService, {
        useValue: {
            register: vi.fn(),
        } as unknown as IActiveDirtyManagerService,
    }]);
    injector.add([ConditionalFormattingRuleModel]);
    injector.add([ConditionalFormattingFormulaService]);
    injector.add([ConditionalFormattingViewModel]);
    injector.add([ComponentManager, { useValue: componentManager as unknown as ComponentManager }]);
    injector.add([ISidebarService, { useValue: sidebarService as unknown as ISidebarService }]);
    injector.add([ISheetClipboardService, { useValue: sheetClipboardService as unknown as ISheetClipboardService }]);

    [
        AddConditionalRuleMutation,
        DeleteConditionalRuleMutation,
        SetConditionalRuleMutation,
        MoveConditionalRuleMutation,
        ClearRangeCfCommand,
        ClearWorksheetCfCommand,
        SetRangeValuesCommand,
        SetRangeValuesMutation,
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
        componentManager,
        sidebarService,
        sidebarOptions$,
        sheetClipboardService,
        getClipboardHook: () => clipboardHook,
        unitId: 'test',
        subUnitId: 'sheet1',
        setSelection,
    };
}

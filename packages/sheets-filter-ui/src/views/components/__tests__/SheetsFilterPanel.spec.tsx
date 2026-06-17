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

import type { Dependency, IDisposable, IOperation, IWorkbookData, Workbook } from '@univerjs/core';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { Root } from 'react-dom/client';
import {
    awaitTime,
    CommandType,
    ICommandService,
    IContextService,
    ILogService,
    Inject,
    Injector,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    IActiveDirtyManagerService,
    ISheetRowFilteredService,
    SheetRowFilteredService,
} from '@univerjs/engine-formula';
import {
    MarkDirtyFilterChangeMutation,
    RefRangeService,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetsSelectionsService,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { FilterBy, SheetsFilterService, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { ILayoutService, IMessageService, IUIPartsService, RediContext, UIPartsService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { WithValuesAndEmptyFilterModelFactory, WithValuesFilterModelFactory } from '../../../__testing__/data';
import {
    ChangeFilterByOperation,
    CloseFilterPanelOperation,
    FILTER_PANEL_OPENED_KEY,
    OpenFilterPanelOperation,
} from '../../../commands/operations/sheets-filter.operation';
import enUS from '../../../locale/en-US';
import { SheetsFilterPanelService } from '../../../services/sheets-filter-panel.service';
import { FilterPanel } from '../SheetsFilterPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';

const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: () => true,
};

class TestLayoutService {
    private _focused = false;
    readonly rootContainerElement = document.body;

    get isFocused() {
        return this._focused;
    }

    focus() {
        this._focused = true;
    }

    registerFocusHandler(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerRootContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContentElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    getContentElement() {
        return document.body;
    }

    checkElementInCurrentContainers() {
        return true;
    }

    checkContentIsFocused() {
        return this._focused;
    }
}

class TestMessageService {
    readonly messages: unknown[] = [];

    show(options: unknown): IDisposable {
        this.messages.push(options);
        return toDisposable(() => undefined);
    }

    remove() {
        // The switch UI is not the behavior under test here.
    }

    removeAll() {
        this.messages.length = 0;
    }
}

function createFilterPanelViewTestBed(workbookData: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'sheets-filter-ui-panel-view-test-plugin';

        constructor(
            _config: unknown,
            @Inject(Injector) protected readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetInterceptorService],
                [SheetsFilterPanelService],
                [RefRangeService],
                [SheetsSelectionsService],
                [SheetRangeThemeModel],
                [ZebraCrossingCacheController],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
                [ILayoutService, { useClass: TestLayoutService as never }],
                [IMessageService, { useClass: TestMessageService as never }],
                [IUIPartsService, { useClass: UIPartsService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }
    }

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [
        OpenFilterPanelOperation,
        CloseFilterPanelOperation,
        ChangeFilterByOperation,
        SetCellEditVisibleOperation,
        MarkDirtyFilterChangeMutation,
    ].forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        injector,
        workbook,
        commandService,
        contextService: injector.get(IContextService),
        filterService: injector.get(SheetsFilterService),
        panelService: injector.get(SheetsFilterPanelService),
    };
}

async function openPanel(testBed: ReturnType<typeof createFilterPanelViewTestBed>) {
    expect(testBed.commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        col: 0,
    })).toBe(true);
    await awaitTime(20);
}

async function renderPanel(root: Root, testBed: ReturnType<typeof createFilterPanelViewTestBed>) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <FilterPanel />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

describe('FilterPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createFilterPanelViewTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('clears existing value criteria and closes the panel from the footer action', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesAndEmptyFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        const filterColumnBefore = currentTestBed.filterService.activeFilterModel?.getFilterColumn(0);
        expect(filterColumnBefore?.getColumnData().filters).toBeDefined();

        const clearButton = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
            .find((button) => button.textContent === 'Clear Filter') as HTMLElement;

        await act(async () => {
            clearButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.filterService.activeFilterModel?.getFilterColumn(0)).toBeNull();
        expect(currentTestBed.contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBe(false);
        expect(currentTestBed.panelService.col).toBe(-1);
    });

    it('switches from values to conditions through the segmented control', async () => {
        currentTestBed = createFilterPanelViewTestBed(WithValuesFilterModelFactory());
        await openPanel(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderPanel(root, currentTestBed);

        expect(currentTestBed.panelService.filterBy).toBe(FilterBy.VALUES);

        const conditionButton = Array.from(container.querySelectorAll('[data-u-comp="segmented"] button'))
            .find((button) => button.textContent === 'By Conditions') as HTMLElement;

        await act(async () => {
            conditionButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(currentTestBed.panelService.filterBy).toBe(FilterBy.CONDITIONS);
        expect(container.querySelector('[data-u-comp="sheets-filter-panel-conditions-container"]')).toBeTruthy();
    });
});

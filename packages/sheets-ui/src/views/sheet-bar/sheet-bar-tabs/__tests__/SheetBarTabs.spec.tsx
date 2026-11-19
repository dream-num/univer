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

/**
 * @vitest-environment jsdom
 */

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import {
    getSheetsEmptySnapshot,
    ICommandService,
    IConfigService,
    IConfirmService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    mergeWorksheetSnapshotWithDefault,
    SheetTypes,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    InsertSheetMutation,
    RangeProtectionRuleModel,
    RemoveSheetMutation,
    SetWorksheetActiveOperation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SheetInterceptorService,
    WorkbookRenameSheetPermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { DesktopConfirmService, DesktopLayoutService, ILayoutService, IUIPartsService, RediContext, UI_PLUGIN_CONFIG_KEY, UIPartsService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../../locale/en-US';
import { ISheetBarService, SheetBarService } from '../../../../services/sheet-bar/sheet-bar.service';
import { SheetBarTabs } from '../SheetBarTabs';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const disposals: Array<() => void> = [];

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
    });
});

function renderSheetTabs() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ISheetBarService, { useClass: SheetBarService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IConfirmService, { useClass: DesktopConfirmService as never }]);
    injector.add([RangeProtectionRuleModel]);
    injector.add([WorksheetProtectionRuleModel]);
    injector.add([SheetInterceptorService]);
    injector.get(IConfigService).setConfig(UI_PLUGIN_CONFIG_KEY, { contextMenu: false });
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        ...getSheetsEmptySnapshot('rename-tabs'),
        sheetOrder: ['first', 'second'],
        sheets: {
            first: { id: 'first', name: 'Sheet1' },
            second: { id: 'second', name: 'Sheet2' },
        },
    });
    injector.get(IPermissionService).addPermissionPoint(new WorkbookRenameSheetPermission(workbook.getUnitId()));
    const commandService = injector.get(ICommandService);
    [SetWorksheetActiveOperation, SetWorksheetNameCommand, SetWorksheetNameMutation]
        .forEach((command) => commandService.registerCommand(command));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    disposals.push(() => {
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    });
    act(() => root.render(<RediContext.Provider value={{ injector }}><SheetBarTabs /></RediContext.Provider>));
    return { container, workbook, injector };
}

afterEach(() => {
    disposals.splice(0).forEach((dispose) => dispose());
    window.getSelection()?.removeAllRanges();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('SheetBarTabs name validation', () => {
    it.each(['', '   ', 'Sheet2', 'invalid/name'])(
        'keeps the original sheet active until the invalid name %j is corrected',
        async (name) => {
            vi.useFakeTimers();
            const { container, workbook, injector } = renderSheetTabs();
            const sheetBarService = injector.get(ISheetBarService);
            const confirmService = injector.get(IConfirmService) as DesktopConfirmService;
            const firstTab = container.querySelector<HTMLElement>('[data-id="first"]')!;
            const secondTab = container.querySelector<HTMLElement>('[data-id="second"]')!;
            const editor = firstTab.querySelector('span')!;
            act(() => sheetBarService.setRenameId('first'));
            act(() => vi.runOnlyPendingTimers());
            editor.textContent = name;

            await act(async () => {
                secondTab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                editor.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: secondTab }));
                secondTab.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
                secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            });
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('first');
            expect(workbook.getSheetBySheetId('first')?.getName()).toBe('Sheet1');
            const dialog = confirmService.confirmOptions$.getValue().find((option) => option.visible)!;
            expect(dialog).toBeDefined();
            await act(async () => dialog.onConfirm?.());
            act(() => vi.runOnlyPendingTimers());
            expect(editor.contains(window.getSelection()?.anchorNode ?? null)).toBe(true);
            expect(editor.getAttribute('contenteditable')).toBe('true');

            editor.textContent = 'Renamed';
            await act(async () => editor.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
            await act(async () => secondTab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('second');
            expect(workbook.getSheetBySheetId('first')?.getName()).toBe('Renamed');
            expect(firstTab.textContent).toBe('Renamed');
        }
    );
});

describe('Chart Sheet tabs', () => {
    it('shows the sheet name without a chart decoration and preserves click and keyboard activation', async () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const providers: Dependency[] = [
            [IRenderManagerService, { useClass: RenderManagerService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [IUIPartsService, { useClass: UIPartsService }],
            [IConfirmService, { useClass: DesktopConfirmService }],
            [ISheetBarService, { useClass: SheetBarService }],
            [WorksheetProtectionRuleModel],
            [RangeProtectionRuleModel],
            [SheetInterceptorService],
        ];
        providers.forEach((provider) => injector.add(provider));
        injector.get(IConfigService).setConfig(UI_PLUGIN_CONFIG_KEY, { contextMenu: false });
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'tabs-workbook',
            appVersion: 'test',
            locale: LocaleType.EN_US,
            name: 'Tabs',
            styles: {},
            sheetOrder: ['grid', 'chart'],
            sheets: {
                grid: { id: 'grid', name: 'Sheet1' },
                chart: { id: 'chart', name: 'Chart1', type: SheetTypes.CHART },
            },
        });
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        const commands = injector.get(ICommandService);
        commands.registerCommand(InsertSheetMutation);
        commands.registerCommand(RemoveSheetMutation);
        commands.registerCommand(SetWorksheetActiveOperation);
        commands.registerCommand(SetWorksheetNameCommand);
        commands.registerCommand(SetWorksheetNameMutation);
        injector.get(IPermissionService).addPermissionPoint(new WorkbookRenameSheetPermission(workbook.getUnitId()));
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => root.render(<RediContext value={{ injector }}><SheetBarTabs /></RediContext>));
            await act(async () => {
                expect(commands.syncExecuteCommand(InsertSheetMutation.id, {
                    unitId: 'tabs-workbook',
                    index: 2,
                    sheet: mergeWorksheetSnapshotWithDefault({ id: 'remote', name: 'Remote Charts', type: SheetTypes.CHART }),
                }, { fromCollab: true })).toBe(true);
            });
            expect(container.querySelector('[role=tab][data-id=remote]')?.textContent).toBe('Remote Charts');
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('grid');
            await act(async () => {
                expect(commands.syncExecuteCommand(RemoveSheetMutation.id, { unitId: 'tabs-workbook', subUnitId: 'remote' }, { fromCollab: true })).toBe(true);
            });
            expect(container.querySelector('[role=tab][data-id=remote]')).toBeNull();
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('grid');
            const chartTab = container.querySelector<HTMLElement>('[role=tab][data-id=chart]')!;
            const gridTab = container.querySelector<HTMLElement>('[role=tab][data-id=grid]')!;
            expect(chartTab.textContent).toBe('Chart1');
            expect(chartTab.querySelector('svg')).toBeNull();
            await act(async () => {
                chartTab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
                chartTab.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
            });
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('chart');
            await act(async () => injector.get(ISheetBarService).setRenameId('chart'));
            const editor = chartTab.querySelector<HTMLElement>('[contenteditable=true]')!;
            expect(editor).not.toBeNull();
            await act(async () => {
                editor.textContent = 'Dashboard';
                editor.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
            });
            expect(workbook.getActiveSheet()?.getName()).toBe('Dashboard');
            expect(chartTab.textContent).toBe('Dashboard');
            await act(async () => chartTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })));
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('grid');
            expect(gridTab.getAttribute('aria-selected')).toBe('true');
        } finally {
            await act(async () => root.unmount());
            container.remove();
            univer.dispose();
        }
    });
});

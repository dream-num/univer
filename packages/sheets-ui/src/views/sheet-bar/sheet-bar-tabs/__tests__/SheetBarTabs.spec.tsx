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
import {
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
    RangeProtectionRuleModel,
    SetWorksheetActiveOperation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SheetInterceptorService,
    WorkbookRenameSheetPermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import {
    DesktopConfirmService,
    DesktopLayoutService,
    ILayoutService,
    IUIPartsService,
    RediContext,
    UI_PLUGIN_CONFIG_KEY,
    UIPartsService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import enUS from '../../../../locale/en-US';
import { ISheetBarService, SheetBarService } from '../../../../services/sheet-bar/sheet-bar.service';
import { SheetBarTabs } from '../SheetBarTabs';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
                workbook.addWorksheet('remote', 2, mergeWorksheetSnapshotWithDefault({ id: 'remote', name: 'Remote Charts', type: SheetTypes.CHART }));
            });
            expect(container.querySelector('[role=tab][data-id=remote]')?.textContent).toBe('Remote Charts');
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('grid');
            await act(async () => {
                workbook.removeSheet('remote');
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

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

import type { Dependency, Injector, IWorkbookData, IWorksheetData, Workbook } from '@univerjs/core';
import {
    FOCUSING_SHEET,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    SheetTypes,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import {
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { onTestFinished, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../../../services/editor-bridge.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SheetsRenderService } from '../../../services/sheets-render.service';
import { SheetRenderController } from '../sheet.render-controller';

export function registerChartEditorProviders(injector: Injector): void {
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
    injector.add([DocSelectionManagerService]);
}

export function createChartRenderTestBed(modules: Dependency[] = [], initialChart = false, gridConfig: Partial<IWorksheetData> = {}, chartConfig: Partial<IWorksheetData> = {}) {
    vi.useFakeTimers();
    onTestFinished(() => {
        vi.useRealTimers();
    });
    // Happy DOM has no Canvas backend. Keep all document and render providers real.
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return new Proxy({
            canvas: this,
            getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
            webkitBackingStorePixelRatio: 1,
            mozBackingStorePixelRatio: 1,
            msBackingStorePixelRatio: 1,
            oBackingStorePixelRatio: 1,
            backingStorePixelRatio: 1,
            measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 3 }),
        }, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
    });
    onTestFinished(() => canvas.mockRestore());
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    [
        [ICanvasColorService, { useClass: CanvasColorService }],
        [IRenderManagerService, { useClass: RenderManagerService }],
        [IPlatformService, { useClass: PlatformService }],
        [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
        [IShortcutService, { useClass: ShortcutService }],
        [SheetSkeletonService],
        [SheetInterceptorService],
        [SheetsSelectionsService],
        [SheetsRenderService],
    ].forEach((dependency) => injector.add(dependency as Dependency));
    registerChartEditorProviders(injector);
    injector.get(SheetSkeletonService);
    injector.get(SheetInterceptorService);
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetSelectionsOperation);
    commands.registerCommand(SetWorksheetActiveOperation);
    const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'chart-render',
        sheetOrder: initialChart ? ['chart', 'grid'] : ['grid', 'chart'],
        sheets: {
            grid: { id: 'grid', rowCount: 50, columnCount: 20, zoomRatio: 1.25, freeze: { startRow: 4, startColumn: 4, xSplit: 2, ySplit: 2 }, ...gridConfig },
            chart: { id: 'chart', type: SheetTypes.CHART, zoomRatio: 0.75, ...chartConfig },
        },
    }, { skipAutoRender: true });
    const renderManager = injector.get(IRenderManagerService);
    const renderModules: Dependency[] = [[SheetSkeletonManagerService], [SheetRenderController], ...modules];
    renderModules.forEach((dependency) => renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dependency));
    const render = renderManager.createRender(workbook.getUnitId());
    render.engine.resizeBySize(800, 600);
    const manager = render.with(SheetSkeletonManagerService);
    injector.get(IContextService).setContextValue(FOCUSING_SHEET, true);
    const activate = (sheetId: string) => {
        const activated = commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: workbook.getUnitId(), subUnitId: sheetId });
        if (activated) {
            manager.setCurrent({ sheetId, commandId: SetWorksheetActiveOperation.id });
        }
        return activated;
    };
    return { univer, injector, workbook, render, manager, commands, activate };
}

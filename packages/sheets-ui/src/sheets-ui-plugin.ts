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

import type { Workbook } from '@univerjs/core';
import { DependentOn, IUniverInstanceService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverUIPlugin } from '@univerjs/ui';
import { ActiveWorksheetController } from './controllers/active-worksheet/active-worksheet.controller';
import { AutoHeightController } from './controllers/auto-height.controller';
import { SheetClipboardController } from './controllers/clipboard/clipboard.controller';
import { FormulaEditorController } from './controllers/editor/formula-editor.controller';
import { EditingRenderController } from './controllers/editor/editing.render-controller';
import { FormatPainterRenderController } from './controllers/render-controllers/format-painter.render-controller';
import { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
import { HeaderMenuRenderController } from './controllers/render-controllers/header-menu.render-controller';
import { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
import { HeaderResizeRenderController } from './controllers/render-controllers/header-resize.render-controller';
import { HeaderUnhideRenderController } from './controllers/render-controllers/header-unhide.render-controller';
import { MarkSelectionRenderController } from './controllers/mark-selection.controller';
import { SelectionRenderController } from './controllers/render-controllers/selection.render-controller';
import { SheetsRenderService } from './services/sheets-render.service';
import type { IUniverSheetsUIConfig } from './controllers/sheet-ui.controller';
import { DefaultSheetUiConfig, SheetUIController } from './controllers/sheet-ui.controller';
import { StatusBarController } from './controllers/status-bar.controller';
import { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
import {
    FormulaEditorManagerService,
    IFormulaEditorManagerService,
} from './services/editor/formula-editor-manager.service';
import { EditorBridgeService, IEditorBridgeService } from './services/editor-bridge.service';
import { FormatPainterService, IFormatPainterService } from './services/format-painter/format-painter.service';
import { IMarkSelectionService, MarkSelectionService } from './services/mark-selection/mark-selection.service';
import { SheetScrollManagerService } from './services/scroll-manager.service';
import { ISelectionRenderService, SelectionRenderService } from './services/selection/selection-render.service';
import { ISheetBarService, SheetBarService } from './services/sheet-bar/sheet-bar.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { ShortcutExperienceService } from './services/shortcut-experience.service';
import { IStatusBarService, StatusBarService } from './services/status-bar.service';
import { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
import { HoverRenderController } from './controllers/hover-render.controller';
import { HoverManagerService } from './services/hover-manager.service';
import { CellAlertManagerService } from './services/cell-alert-manager.service';
import { CellAlertRenderController } from './controllers/cell-alert.controller';
import { CellCustomRenderController } from './controllers/cell-custom-render.controller';
import { SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
import { ForceStringRenderController } from './controllers/force-string-render.controller';
import { ForceStringAlertRenderController } from './controllers/force-string-alert-render.controller';
import { SheetsZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
import { SheetContextMenuRenderController } from './controllers/render-controllers/contextmenu.render-controller';
import { EditorBridgeRenderController } from './controllers/render-controllers/editor-bridge.render-controller';
import { AutoFillController } from './controllers/auto-fill.controller';
import { FormatPainterController } from './controllers/format-painter/format-painter.controller';
import { DragRenderController } from './controllers/drag-render.controller';
import { DragManagerService } from './services/drag-manager.service';
import { SheetPermissionInterceptorClipboardController } from './controllers/permission/sheet-permission-interceptor-clipboard.controller';
import { SheetPermissionInterceptorBaseController } from './controllers/permission/sheet-permission-interceptor-base.controller';
import { SheetPermissionInitController } from './controllers/permission/sheet-permission-init.controller';
import { SheetPermissionRenderController, SheetPermissionRenderManagerController } from './controllers/permission/sheet-permission-render.controller';
import { SheetPermissionInterceptorCanvasRenderController } from './controllers/permission/sheet-permission-interceptor-canvas-render.controller';
import { SheetPermissionInterceptorFormulaRenderController } from './controllers/permission/sheet-permission-interceptor-formula-render.controller';
import { SheetPermissionPanelModel } from './services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from './services/permission/sheet-permission-user-list.service';
import { WorksheetProtectionRenderService } from './services/permission/worksheet-permission-render.service';
import { SheetPrintInterceptorService } from './services/print-interceptor.service';

@DependentOn(UniverSheetsPlugin, UniverUIPlugin)
export class UniverSheetsUIPlugin extends Plugin {
    static override pluginName = 'SHEET_UI_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsUIConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetUiConfig, this._config);
    }

    override onStarting(injector: Injector): void {
        (
            [
                // services
                [ShortcutExperienceService],
                [IEditorBridgeService, { useClass: EditorBridgeService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                [IFormatPainterService, { useClass: FormatPainterService }],
                [ICellEditorManagerService, { useClass: CellEditorManagerService }],
                [IFormulaEditorManagerService, { useClass: FormulaEditorManagerService }],
                [IAutoFillService, { useClass: AutoFillService }],
                [SheetPrintInterceptorService],

                // This would be removed from global injector and moved into RenderUnit provider.
                // [SheetSkeletonManagerService],
                [ISelectionRenderService, { useClass: SelectionRenderService }],
                [IStatusBarService, { useClass: StatusBarService }],
                [IMarkSelectionService, { useClass: MarkSelectionService }],
                [HoverManagerService],
                [DragManagerService],
                [SheetCanvasPopManagerService],
                [CellAlertManagerService],

                // controllers
                [ActiveWorksheetController],
                [AutoHeightController],
                [FormulaEditorController],
                [HeaderFreezeRenderController],
                [SheetClipboardController],
                [SheetsRenderService],
                [
                    SheetUIController,
                    {
                        useFactory: () => this._injector.createInstance(SheetUIController, this._config),
                    },
                ],
                [StatusBarController],
                [AutoFillController],
                [FormatPainterController],

                // permission
                [SheetPermissionPanelModel],
                [SheetPermissionUserManagerService],
                [WorksheetProtectionRenderService],
                [SheetPermissionInterceptorClipboardController],
                [SheetPermissionInterceptorBaseController],
                [SheetPermissionInitController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));

        this._injector.add(
            [
                SheetPermissionRenderManagerController,
                {
                    useFactory: () => this._injector.createInstance(SheetPermissionRenderManagerController, this._config),
                },
            ]

        );
    }

    override onReady(): void {
        this._markSheetAsFocused();
        this._registerRenderBasics();
    }

    override onRendered(): void {
        this._registerRenderModules();
    }

    private _registerRenderBasics(): void {
        ([
            SheetSkeletonManagerService,
            SheetRenderController,
        ]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }

    // We have to let render basics get bootstrapped before. Because some render controllers relies on
    // a correct skeleton when they get loaded.
    private _registerRenderModules(): void {
        ([
            SheetScrollManagerService,

            // https://github.com/dream-num/univer-pro/issues/669
            // HeaderMoveRenderController(HMRC) must be initialized before SelectionRenderController(SRC).
            // Before HMRC expected selections remain unchanged when user clicks on the header. If we don't initialize HMRC before SRC,
            // the selections will be changed by SRC first. Maybe we should merge row/col header related render controllers to one class.
            HeaderMoveRenderController,
            SelectionRenderController,
            HeaderFreezeRenderController,
            HeaderUnhideRenderController,
            HeaderResizeRenderController,
            // Caution: ScrollRenderController should placed before ZoomRenderController
            // because ZoomRenderController ---> viewport.resize --> setScrollInfo, but ScrollRenderController needs scrollInfo
            SheetsScrollRenderController,
            SheetsZoomRenderController,
            FormatPainterRenderController,
            HeaderMenuRenderController,
            CellAlertRenderController,
            ForceStringAlertRenderController,
            MarkSelectionRenderController,
            HoverRenderController,
            DragRenderController,
            ForceStringRenderController,
            CellCustomRenderController,
            SheetContextMenuRenderController,

            // editor
            EditorBridgeRenderController,
            EditingRenderController,

            // permission
            SheetPermissionInterceptorCanvasRenderController,
            SheetPermissionInterceptorFormulaRenderController,
            SheetPermissionRenderController,
        ]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }

    private _markSheetAsFocused() {
        const univerInstanceService = this._univerInstanceService;
        univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(filter((v) => !!v))
            .subscribe((workbook) => univerInstanceService.focusUnit(workbook!.getUnitId()));
    }
}

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

import type { Dependency, Workbook } from '@univerjs/core';
import type { IUniverSheetsUIConfig } from './controllers/config.schema';
import { DependentOn, Inject, Injector, IUniverInstanceService, Plugin, UniverInstanceType } from '@univerjs/core';

import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';

import { UniverMobileUIPlugin } from '@univerjs/ui';
import { filter } from 'rxjs/operators';
import { ActiveWorksheetController } from './controllers/active-worksheet/active-worksheet.controller';
import { AutoHeightController } from './controllers/auto-height.controller';
import { CellAlertRenderController } from './controllers/cell-alert.controller';
import { CellCustomRenderController } from './controllers/cell-custom-render.controller';
import { SheetClipboardController } from './controllers/clipboard/clipboard.controller';
import { defaultPluginConfig } from './controllers/config.schema';
// import { SheetContextMenuRenderController } from './controllers/render-controllers/contextmenu.render-controller';
import { DragRenderController } from './controllers/drag-render.controller';
import { ForceStringAlertRenderController } from './controllers/force-string-alert-render.controller';
import { ForceStringRenderController } from './controllers/force-string-render.controller';
import { HoverRenderController } from './controllers/hover-render.controller';
import { MarkSelectionRenderController } from './controllers/mark-selection.controller';
import { SheetUIMobileController } from './controllers/mobile/mobile-sheet-ui.controller';
import { SheetPermissionCheckUIController } from './controllers/permission/sheet-permission-check-ui.controller';
import { SheetPermissionInterceptorCanvasRenderController } from './controllers/permission/sheet-permission-interceptor-canvas-render.controller';
import { SheetPermissionInterceptorClipboardController } from './controllers/permission/sheet-permission-interceptor-clipboard.controller';
import { SheetPermissionInterceptorFormulaRenderController } from './controllers/permission/sheet-permission-interceptor-formula-render.controller';
import { SheetPermissionRenderController, SheetPermissionRenderManagerController, WorksheetProtectionRenderController } from './controllers/permission/sheet-permission-render.controller';
import { FormatPainterRenderController } from './controllers/render-controllers/format-painter.render-controller';
import { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
import { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
import { SheetContextMenuMobileRenderController } from './controllers/render-controllers/mobile/mobile-contextmenu.render-controller';
import { MobileSheetsScrollRenderController } from './controllers/render-controllers/mobile/mobile-scroll.render-controller';
import { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
import { SheetsZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { StatusBarController } from './controllers/status-bar.controller';
import { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
import { SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
import { CellAlertManagerService } from './services/cell-alert-manager.service';
import { ISheetCellDropdownManagerService, SheetCellDropdownManagerService } from './services/cell-dropdown-manager.service';
import { CellPopupManagerService } from './services/cell-popup-manager.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { DragManagerService } from './services/drag-manager.service';
import { EditorBridgeService, IEditorBridgeService } from './services/editor-bridge.service';
import { FormatPainterService, IFormatPainterService } from './services/format-painter/format-painter.service';
import { HoverManagerService } from './services/hover-manager.service';
import { IMarkSelectionService, MarkSelectionService } from './services/mark-selection/mark-selection.service';
import { SheetPermissionPanelModel } from './services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from './services/permission/sheet-permission-user-list.service';
import { SheetPrintInterceptorService } from './services/print-interceptor.service';
import { SheetScrollManagerService } from './services/scroll-manager.service';
import { SelectAllService } from './services/select-all/select-all.service';
import { ISheetSelectionRenderService } from './services/selection/base-selection-render.service';
import { MobileSheetsSelectionRenderService } from './services/selection/mobile-selection-render.service';
import { ISheetBarService, SheetBarService } from './services/sheet-bar/sheet-bar.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { SheetsRenderService } from './services/sheets-render.service';
import { ShortcutExperienceService } from './services/shortcut-experience.service';
import { IStatusBarService, StatusBarService } from './services/status-bar.service';

/**
 * @ignore
 */
@DependentOn(UniverSheetsPlugin, UniverMobileUIPlugin)
export class UniverSheetsMobileUIPlugin extends Plugin {
    static override pluginName = 'SHEET_UI_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsUIConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    override onStarting(): void {
        (
            [
                [ShortcutExperienceService],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                [IFormatPainterService, { useClass: FormatPainterService }],
                [IAutoFillService, { useClass: AutoFillService }],
                [SheetPrintInterceptorService],
                [ISheetSelectionRenderService, { useClass: MobileSheetsSelectionRenderService }],
                [IStatusBarService, { useClass: StatusBarService }],
                [IMarkSelectionService, { useClass: MarkSelectionService }],
                [IEditorBridgeService, { useClass: EditorBridgeService }],
                [HoverManagerService],
                [DragManagerService],
                [SheetCanvasPopManagerService],
                [CellPopupManagerService],
                [CellAlertManagerService],
                [SelectAllService],
                [ISheetCellDropdownManagerService, { useClass: SheetCellDropdownManagerService }],

                [ActiveWorksheetController],
                [AutoHeightController],
                [SheetClipboardController],
                [SheetsRenderService],
                [SheetUIMobileController],
                [StatusBarController],
                [IRefSelectionsService, { useClass: RefSelectionsService }],

                // permission
                [SheetPermissionPanelModel],
                [SheetPermissionUserManagerService],
                [WorksheetProtectionRenderController],
                [SheetPermissionInterceptorClipboardController],
                [SheetPermissionCheckUIController],
                [SheetPermissionRenderManagerController],
            ] as Dependency[]
        ).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        this._markSheetAsFocused();
        this._registerRenderBasics();

        this._injector.get(SheetUIMobileController);
    }

    override onRendered(): void {
        this._registerRenderModules();
    }

    private _registerRenderBasics(): void {
        ([
            [SheetSkeletonManagerService],
            [SheetRenderController],
            [ISheetSelectionRenderService, { useClass: MobileSheetsSelectionRenderService }],
            [SheetScrollManagerService],
        ] as Dependency[]).forEach((renderDep) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, renderDep));
        });
    }

    // We have to let render basics get bootstrapped before. Because some render controllers relies on
    // a correct skeleton when they get loaded.
    private _registerRenderModules(): void {
        ([
            // https://github.com/dream-num/univer-pro/issues/669
            // HeaderMoveRenderController(HMRC) must be initialized before SelectionRenderController(SRC).
            // Before HMRC expected selections remain unchanged when user clicks on the header. If we don't initialize HMRC before SRC,
            // the selections will be changed by SRC first. Maybe we should merge row/col header related render controllers to one class.
            [HeaderMoveRenderController],
            [HeaderFreezeRenderController],
            // Caution: ScrollRenderController should placed before ZoomRenderController
            // because ZoomRenderController would change scrollInfo in currentSkeletonBefore$.
            [MobileSheetsScrollRenderController],
            [SheetsZoomRenderController],
            [FormatPainterRenderController],
            [CellAlertRenderController],
            [ForceStringAlertRenderController],
            [MarkSelectionRenderController],
            [HoverRenderController],
            [DragRenderController],
            [ForceStringRenderController],
            [CellCustomRenderController],
            [SheetContextMenuMobileRenderController],

            [SheetPermissionInterceptorCanvasRenderController],
            [SheetPermissionInterceptorFormulaRenderController],
            [SheetPermissionRenderController],
        ] as Dependency[]).forEach((renderModule) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, renderModule));
        });
    }

    private _markSheetAsFocused(): void {
        const univerInstanceService = this._univerInstanceService;
        this.disposeWithMe(univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(filter((v) => !!v))
            .subscribe((workbook) => {
                if (this._univerInstanceService.getFocusedUnit() === workbook) return;
                univerInstanceService.focusUnit(workbook!.getUnitId());
            }));
    }
}

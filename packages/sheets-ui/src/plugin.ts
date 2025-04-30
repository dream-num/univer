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
import type { IUniverUIConfig } from '@univerjs/ui';
import type { IUniverSheetsUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, IUniverInstanceService, merge, mergeOverrideWithDependencies, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { ComponentManager, UI_PLUGIN_CONFIG_KEY } from '@univerjs/ui';
import { filter } from 'rxjs/operators';
import { UNIVER_SHEET_PERMISSION_BACKGROUND, UNIVER_SHEET_PERMISSION_USER_PART } from './consts/permission';
import { ActiveWorksheetController } from './controllers/active-worksheet/active-worksheet.controller';
import { AutoFillController } from './controllers/auto-fill.controller';
import { AutoHeightController } from './controllers/auto-height.controller';
import { AutoWidthController } from './controllers/auto-width.controller';
import { CellAlertRenderController } from './controllers/cell-alert.controller';
import { CellCustomRenderController } from './controllers/cell-custom-render.controller';
import { SheetCheckboxController } from './controllers/checkbox.controller';
import { SheetClipboardController } from './controllers/clipboard/clipboard.controller';
import { defaultPluginConfig, SHEETS_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsDefinedNameController } from './controllers/defined-name/defined-name.controller';
import { DragRenderController } from './controllers/drag-render.controller';
import { EditorDataSyncController } from './controllers/editor/data-sync.controller';
import { EditingRenderController } from './controllers/editor/editing.render-controller';
import { FormulaEditorController } from './controllers/editor/formula-editor.controller';
import { ForceStringAlertRenderController } from './controllers/force-string-alert-render.controller';
import { ForceStringRenderController } from './controllers/force-string-render.controller';
import { FormatPainterController } from './controllers/format-painter/format-painter.controller';
import { HoverRenderController } from './controllers/hover-render.controller';
import { MarkSelectionRenderController } from './controllers/mark-selection.controller';
import { MoveRangeRenderController } from './controllers/move-range.controller';
import { SheetPermissionCheckUIController } from './controllers/permission/sheet-permission-check-ui.controller';
import { SheetPermissionInitUIController } from './controllers/permission/sheet-permission-init-ui.controller';
import { SheetPermissionInterceptorCanvasRenderController } from './controllers/permission/sheet-permission-interceptor-canvas-render.controller';
import { SheetPermissionInterceptorClipboardController } from './controllers/permission/sheet-permission-interceptor-clipboard.controller';
import { SheetPermissionInterceptorFormulaRenderController } from './controllers/permission/sheet-permission-interceptor-formula-render.controller';
import { SheetPermissionRenderController, SheetPermissionRenderManagerController, WorksheetProtectionRenderController } from './controllers/permission/sheet-permission-render.controller';
import { ClipboardRenderController } from './controllers/render-controllers/clipboard.render-controller';
import { SheetContextMenuRenderController } from './controllers/render-controllers/contextmenu.render-controller';
import { EditorBridgeRenderController } from './controllers/render-controllers/editor-bridge.render-controller';
import { FormatPainterRenderController } from './controllers/render-controllers/format-painter.render-controller';
import { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
import { HeaderMenuRenderController } from './controllers/render-controllers/header-menu.render-controller';
import { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
import { HeaderResizeRenderController } from './controllers/render-controllers/header-resize.render-controller';
import { HeaderUnhideRenderController } from './controllers/render-controllers/header-unhide.render-controller';
import { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
import { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
import { SheetSkeletonRenderController } from './controllers/render-controllers/skeleton.render-controller';
import { SheetsZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { SheetUIController } from './controllers/sheet-ui.controller';
import { StatusBarController } from './controllers/status-bar.controller';
import { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
import { SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
import { CellAlertManagerService } from './services/cell-alert-manager.service';
import { ISheetCellDropdownManagerService, SheetCellDropdownManagerService } from './services/cell-dropdown-manager.service';
import { CellPopupManagerService } from './services/cell-popup-manager.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { DragManagerService } from './services/drag-manager.service';
import { EditorBridgeService, IEditorBridgeService } from './services/editor-bridge.service';
import { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from './services/editor/cell-editor-resize.service';
import {
    FormulaEditorManagerService,
    IFormulaEditorManagerService,
} from './services/editor/formula-editor-manager.service';
import { FormatPainterService, IFormatPainterService } from './services/format-painter/format-painter.service';
import { HoverManagerService } from './services/hover-manager.service';
import { IMarkSelectionService, MarkSelectionService } from './services/mark-selection/mark-selection.service';
import { SheetPermissionPanelModel } from './services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from './services/permission/sheet-permission-user-list.service';
import { SheetPrintInterceptorService } from './services/print-interceptor.service';
import { SheetScrollManagerService } from './services/scroll-manager.service';
import { SelectAllService } from './services/select-all/select-all.service';
import { ISheetSelectionRenderService } from './services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from './services/selection/selection-render.service';
import { ISheetBarService, SheetBarService } from './services/sheet-bar/sheet-bar.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { SheetsRenderService } from './services/sheets-render.service';
import { ShortcutExperienceService } from './services/shortcut-experience.service';
import { IStatusBarService, StatusBarService } from './services/status-bar.service';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsUIPlugin extends Plugin {
    static override pluginName = 'SHEET_UI_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    /** @ignore */
    constructor(
        private readonly _config: Partial<IUniverSheetsUIConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );

        const { customComponents = new Set() } = rest;
        if (rest.protectedRangeShadow === false) {
            customComponents.add(UNIVER_SHEET_PERMISSION_BACKGROUND);
        }

        if (rest.protectedRangeUserSelector) {
            customComponents.add(UNIVER_SHEET_PERMISSION_USER_PART);
            this._componentManager.register(
                UNIVER_SHEET_PERMISSION_USER_PART,
                rest.protectedRangeUserSelector.component,
                {
                    framework: rest.protectedRangeUserSelector.framework,
                }
            );
        }

        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }

        this._configService.setConfig(SHEETS_UI_PLUGIN_CONFIG_KEY, { ...rest, customComponents });
    }

    override onStarting(): void {
        registerDependencies(this._injector, mergeOverrideWithDependencies([
            [ShortcutExperienceService],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [ISheetClipboardService, { useClass: SheetClipboardService }],
            [ISheetBarService, { useClass: SheetBarService }],
            [IFormatPainterService, { useClass: FormatPainterService }],
            [ICellEditorManagerService, { useClass: CellEditorManagerService }],
            [IFormulaEditorManagerService, { useClass: FormulaEditorManagerService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [IAutoFillService, { useClass: AutoFillService }],
            [SheetPrintInterceptorService],
            [IStatusBarService, { useClass: StatusBarService }],
            [IMarkSelectionService, { useClass: MarkSelectionService }],
            [HoverManagerService],
            [DragManagerService],
            [SheetCanvasPopManagerService],
            [CellPopupManagerService],
            [CellAlertManagerService],
            [SelectAllService],
            [ISheetCellDropdownManagerService, { useClass: SheetCellDropdownManagerService }],
            [SheetCellEditorResizeService],

            // controllers
            [ActiveWorksheetController],
            [AutoHeightController],
            [AutoWidthController],
            [FormulaEditorController],
            [SheetsRenderService],
            [SheetUIController],
            [StatusBarController],
            [AutoFillController],
            [FormatPainterController],
            [SheetsDefinedNameController],
            [EditorDataSyncController],
            [SheetCheckboxController],
            [EditingRenderController],

            // permission
            [SheetPermissionPanelModel],
            [SheetPermissionInitUIController],
            [SheetPermissionUserManagerService],
            [SheetPermissionInterceptorClipboardController],
            [SheetPermissionCheckUIController],
            [SheetPermissionRenderManagerController],
        ] as Dependency[], this._config.override));
    }

    override onReady(): void {
        if (!this._config.disableAutoFocus) {
            this._initAutoFocus();
        }

        registerDependencies(this._injector, [
            [SheetClipboardController],
        ]);

        this._registerRenderBasics();

        touchDependencies(this._injector, [
            [SheetUIController],
            [SheetsRenderService],
            [ActiveWorksheetController],
            [SheetPermissionCheckUIController],
            [SheetPermissionInitUIController],
        ]);
    }

    override onRendered(): void {
        this._registerRenderModules();

        touchDependencies(this._injector, [
            [SheetPermissionRenderManagerController],
            [SheetPermissionPanelModel],
            [SheetClipboardController],
            [FormulaEditorController],
            [SheetsDefinedNameController],
            [StatusBarController],
            [AutoHeightController],
            [AutoWidthController],
            [EditorDataSyncController],
            [SheetCheckboxController],
            [EditingRenderController],
        ]);
    }

    override onSteady(): void {
        touchDependencies(this._injector, [
            [FormatPainterController],
            [AutoFillController],
            [SheetPermissionInterceptorClipboardController],
        ]);
    }

    private _registerRenderBasics(): void {
        ([
            [SheetSkeletonManagerService],
            [SheetSkeletonRenderController],
            [SheetRenderController],
            [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
        ] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }

    // We have to let render basics get bootstrapped before. Because some render controllers relies on
    // a correct skeleton when they get loaded.
    private _registerRenderModules(): void {
        const modules: Dependency[] = [
            [HeaderMoveRenderController],
            [HeaderUnhideRenderController],
            [HeaderResizeRenderController],
            // Caution: ScrollRenderController should placed before ZoomRenderController.
            [SheetScrollManagerService],
            [SheetsScrollRenderController],
            [HeaderFreezeRenderController],
            [SheetsZoomRenderController],

            [FormatPainterRenderController],
            [ClipboardRenderController],
            [CellAlertRenderController],
            [ForceStringAlertRenderController],
            [MarkSelectionRenderController],
            [HoverRenderController],
            [DragRenderController],
            [ForceStringRenderController],
            [CellCustomRenderController],
            [SheetContextMenuRenderController],
            [MoveRangeRenderController],

            // editor
            [EditorBridgeRenderController],

            // permission
            [SheetPermissionInterceptorCanvasRenderController],
            [SheetPermissionInterceptorFormulaRenderController],
            [SheetPermissionRenderController],
            [WorksheetProtectionRenderController],
        ];

        // If the context menu is disabled, we don't need to register the context menu render controller.
        const config = this._configService.getConfig<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
        const showContextMenu = config?.contextMenu ?? true;
        if (showContextMenu) {
            modules.push([HeaderMenuRenderController]);
        }

        modules.forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }

    private _initAutoFocus(): void {
        const univerInstanceService = this._univerInstanceService;
        this.disposeWithMe(univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(filter((v) => !!v))
            .subscribe((workbook) => univerInstanceService.focusUnit(workbook!.getUnitId())));
    }
}

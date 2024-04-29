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
import { IUniverInstanceService, LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { IRenderManagerService } from '@univerjs/engine-render';
import { ActiveWorksheetController } from './controllers/active-worksheet/active-worksheet.controller';
import { AutoFillController } from './controllers/auto-fill.controller';
import { AutoHeightController } from './controllers/auto-height.controller';
import { SheetClipboardController } from './controllers/clipboard/clipboard.controller';
import { SheetContextMenuController } from './controllers/contextmenu/contextmenu.controller';
import { EditingController } from './controllers/editor/editing.controller';
import { EndEditController } from './controllers/editor/end-edit.controller';
import { FormulaEditorController } from './controllers/editor/formula-editor.controller';
import { StartEditController } from './controllers/editor/start-edit.controller';
import { EditorBridgeController } from './controllers/editor-bridge.controller';
import { FormatPainterRenderController } from './controllers/format-painter/format-painter.controller';
import { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
import { HeaderMenuController } from './controllers/header-menu.controller';
import { HeaderMoveController } from './controllers/header-move.controller';
import { HeaderResizeController } from './controllers/render-controllers/header-resize.render-controller';
import { HeaderUnhideRenderController } from './controllers/render-controllers/header-unhide.render-controller';
import { MarkSelectionController } from './controllers/mark-selection.controller';
import { SelectionRenderController } from './controllers/render-controllers/selection.render-controller';
import { SheetRenderController } from './controllers/sheet-render.controller';
import { SheetUIController } from './controllers/sheet-ui.controller';
import { StatusBarController } from './controllers/status-bar.controller';
import { zhCN } from './locale';
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
import { ScrollManagerService } from './services/scroll-manager.service';
import { ISelectionRenderService, SelectionRenderService } from './services/selection/selection-render.service';
import { ISheetBarService, SheetBarService } from './services/sheet-bar/sheet-bar.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { ShortcutExperienceService } from './services/shortcut-experience.service';
import { IStatusBarService, StatusBarService } from './services/status-bar.service';
import { SheetCanvasView } from './views/sheet-canvas-view';
import { HoverController } from './controllers/hover.controller';
import { HoverManagerService } from './services/hover-manager.service';
import { CellAlertManagerService } from './services/cell-alert-manager.service';
import { CellAlertController } from './controllers/cell-alert.controller';
import { CellCustomRenderController } from './controllers/cell-custom-render.controller';
import { SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
import { ForceStringRenderController } from './controllers/force-string-render.controller';
import { ForceStringAlertController } from './controllers/force-string-alert.controller';
import { SheetsZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';

export class UniverSheetsUIPlugin extends Plugin {
    static override pluginName = 'SHEET_UI_PLUGIN_NAME';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        _config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._localeService.load({
            zhCN,
        });
    }

    override onStarting(injector: Injector): void {
        (
            [
                // views
                [SheetCanvasView],

                // services
                [ShortcutExperienceService],
                [IEditorBridgeService, { useClass: EditorBridgeService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                [IFormatPainterService, { useClass: FormatPainterService }],
                [ICellEditorManagerService, { useClass: CellEditorManagerService }],
                [IFormulaEditorManagerService, { useClass: FormulaEditorManagerService }],
                [IAutoFillService, { useClass: AutoFillService }],

                [ScrollManagerService],
                [SheetSkeletonManagerService],
                [
                    ISelectionRenderService,
                    {
                        useClass: SelectionRenderService,
                    },
                ],
                [IStatusBarService, { useClass: StatusBarService }],
                [IMarkSelectionService, { useClass: MarkSelectionService }],
                [HoverManagerService],
                [SheetCanvasPopManagerService],
                [CellAlertManagerService],

                // controllers
                // TODO@wzhudev: lots of controllers here should be refactored to RenderController
                [ActiveWorksheetController],
                [AutoHeightController],
                [EditorBridgeController],
                [EndEditController],
                [FormulaEditorController],
                [HeaderFreezeRenderController],
                [HeaderMenuController],
                [HeaderMoveController],
                [HeaderResizeController],
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetRenderController],
                [SheetUIController],
                [StartEditController],
                [AutoFillController],
                [StatusBarController],
                [EditingController],
                [MarkSelectionController],
                [HoverController],
                [CellAlertController],
                [CellCustomRenderController],
                [ForceStringRenderController],
                [ForceStringAlertController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));
    }

    override onReady(): void {
        this._markSheetAsFocused();
        this._registerRenderControllers();
    }

    private _registerRenderControllers(): void {
        ([
            HeaderFreezeRenderController,
            HeaderUnhideRenderController,
            HeaderResizeController,
            SheetsZoomRenderController,
            SheetsScrollRenderController,
            SelectionRenderController,
            FormatPainterRenderController,
        ]).forEach((controller) => {
            this.disposeWithMe(this._renderManagerService.registerRenderController(UniverInstanceType.UNIVER_SHEET, controller));
        });
    }

    private _markSheetAsFocused() {
        const univerInstanceService = this._univerInstanceService;
        univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(filter((v) => !!v))
            .subscribe((workbook) => {
                univerInstanceService.focusUnit(workbook!.getUnitId());
            });
    }
}

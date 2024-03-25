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

import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from './basics';
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
import { FormatPainterController } from './controllers/format-painter/format-painter.controller';
import { FreezeController } from './controllers/freeze.controller';
import { HeaderMenuController } from './controllers/header-menu.controller';
import { HeaderMoveController } from './controllers/header-move.controller';
import { HeaderResizeController } from './controllers/header-resize.controller';
import { HeaderUnhideController } from './controllers/header-unhide.controller';
import { MarkSelectionController } from './controllers/mark-selection.controller';
import { MoveRangeController } from './controllers/move-range.controller';
import { ScrollController } from './controllers/scroll.controller';
import { SelectionController } from './controllers/selection.controller';
import { SheetRenderController } from './controllers/sheet-render.controller';
import { SheetUIController } from './controllers/sheet-ui.controller';
import { StatusBarController } from './controllers/status-bar.controller';
import { ZoomController } from './controllers/zoom.controller';
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
import { SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';

export class UniverSheetsUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(SHEET_UI_PLUGIN_NAME);

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
                [SheetCanvasPopManagerService],

                // controllers
                [ActiveWorksheetController],
                [AutoHeightController],
                [EditorBridgeController],
                [EndEditController],
                [FormulaEditorController],
                [FormatPainterController],
                [FreezeController],
                [HeaderMenuController],
                [HeaderMoveController],
                [HeaderResizeController],
                [HeaderUnhideController],
                // [InitializeEditorController],
                [MoveRangeController],
                [ScrollController],
                [SelectionController],
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetRenderController],
                [SheetUIController],
                [StartEditController],
                [ZoomController],
                [AutoFillController],
                [StatusBarController],
                [EditingController],
                [MarkSelectionController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));
    }

    override onReady(): void {
        this._markSheetAsFocused();
    }

    private _markSheetAsFocused() {
        const univerInstanceService = this._currentUniverService;
        univerInstanceService.currentSheet$.pipe(filter((v) => !!v)).subscribe((workbook) => {
            univerInstanceService.focusUniverInstance(workbook!.getUnitId());
        });
    }
}

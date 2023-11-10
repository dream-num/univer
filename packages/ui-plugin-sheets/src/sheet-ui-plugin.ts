import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from './basics';
import { AutoFillController } from './controllers/auto-fill.controller';
import { AutoHeightController } from './controllers/auto-height.controller';
import { SheetClipboardController } from './controllers/clipboard/clipboard.controller';
import { SheetContextMenuController } from './controllers/contextmenu/contextmenu.controller';
import { EditingController } from './controllers/editor/editing.controller';
import { EndEditController } from './controllers/editor/end-edit.controller';
import { InitializeEditorController } from './controllers/editor/initialize-editor.controller';
import { StartEditController } from './controllers/editor/start-edit.controller';
import { EditorBridgeController } from './controllers/editor-bridge.controller';
import { FormatPainterController } from './controllers/format-painter/format-painter.controller';
import { FreezeController } from './controllers/freeze.controller';
import { HeaderMenuController } from './controllers/header-menu.controller';
import { HeaderMoveController } from './controllers/header-move.controller';
import { HeaderResizeController } from './controllers/header-resize.controller';
import { HeaderUnhideController } from './controllers/header-unhide.controller';
import { MoveRangeController } from './controllers/move-range.controller';
import { SheetNavigationController } from './controllers/navigation/navigation.controller';
import { ScrollController } from './controllers/scroll.controller';
import { SelectionController } from './controllers/selection.controller';
import { SheetRenderController } from './controllers/sheet-render.controller';
import { SheetUIController } from './controllers/sheet-ui.controller';
import { ZoomController } from './controllers/zoom.controller';
import { enUS } from './locale';
import { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
import { EditorBridgeService, IEditorBridgeService } from './services/editor-bridge.service';
import { FormatPainterService, IFormatPainterService } from './services/format-painter/format-painter.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { ISelectionRenderService, SelectionRenderService } from './services/selection/selection-render.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { ISheetBarService, SheetBarService } from './services/sheetbar/sheetbar.service';
import { SheetCanvasView } from './views/sheet-canvas-view';

export class SheetUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(SHEET_UI_PLUGIN_NAME);

        this._localeService.load({
            enUS,
        });
    }

    override onStarting(injector: Injector): void {
        (
            [
                // views
                [SheetCanvasView],

                // services
                [IEditorBridgeService, { useClass: EditorBridgeService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                [IFormatPainterService, { useClass: FormatPainterService }],
                [ICellEditorManagerService, { useClass: CellEditorManagerService }],
                [IAutoFillService, { useClass: AutoFillService }],
                [ScrollManagerService],
                [SheetSkeletonManagerService],
                [
                    ISelectionRenderService,
                    {
                        useClass: SelectionRenderService,
                    },
                ],
                [FormulaEngineService],

                // controllers
                [AutoHeightController],
                [EditingController],
                [EditorBridgeController],
                [EndEditController],
                [FormatPainterController],
                [FreezeController],
                [HeaderMenuController],
                [HeaderMoveController],
                [HeaderResizeController],
                [HeaderUnhideController],
                [InitializeEditorController],
                [MoveRangeController],
                [ScrollController],
                [SelectionController],
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetNavigationController],
                [SheetRenderController],
                [SheetUIController],
                [StartEditController],
                [ZoomController],
                [AutoFillController],
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

import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from './Basics';
import { SheetClipboardController } from './controller/clipboard/clipboard.controller';
import { SheetContextMenuController } from './controller/contextmenu/contextmenu.controller';
import { EditingController } from './controller/editor/editing.controller';
import { EndEditController } from './controller/editor/end-edit.controller';
import { InitializeEditorController } from './controller/editor/initialize-editor.controller';
import { StartEditController } from './controller/editor/start-edit.controller';
import { EditorBridgeController } from './controller/editor-bridge.controller';
import { SheetUIController } from './controller/sheet-ui.controller';
import { en } from './Locale';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
import { EditorBridgeService, IEditorBridgeService } from './services/editor-bridge.service';
import { ISheetBarService, SheetBarService } from './services/sheetbar/sheetbar.service';

export class SheetUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(SHEET_UI_PLUGIN_NAME);

        this._localeService.getLocale().load({
            en,
        });
    }

    override onStarting(injector: Injector): void {
        (
            [
                // services
                // [ICellEditorService, { useClass: DesktopCellEditorService }],
                [IEditorBridgeService, { useClass: EditorBridgeService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                // [ITextSelectionRenderManager, { useClass: TextSelectionRenderManager }],
                // [TextSelectionManagerService],
                [ICellEditorManagerService, { useClass: CellEditorManagerService }],

                // controllers
                [EditorBridgeController],
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetUIController],
                [InitializeEditorController],
                [StartEditController],
                [EditingController],
                [EndEditController],
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

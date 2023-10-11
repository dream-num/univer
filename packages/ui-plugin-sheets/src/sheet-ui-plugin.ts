import { TextSelectionManagerService } from '@univerjs/base-docs';
import { ITextSelectionRenderManager, TextSelectionRenderManager } from '@univerjs/base-render';
import { ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { filter } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from './Basics';
import { SheetClipboardController } from './controller/clipboard/clipboard.controller';
import { SheetContextMenuController } from './controller/contextmenu/contextmenu.controller';
import { SheetUIController } from './controller/sheet-ui.controller';
import { en } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { ISheetBarService, SheetBarService } from './services/sheetbar/sheetbar.service';

export class SheetUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        super(SHEET_UI_PLUGIN_NAME);

        this._localeService.getLocale().load({
            en,
        });
    }

    override onStarting(injector: Injector): void {
        (
            [
                // legacy managers
                [ZIndexManager],

                // services
                [ICellEditorService, { useClass: DesktopCellEditorService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],
                [ISheetBarService, { useClass: SheetBarService }],
                [ITextSelectionRenderManager, { useClass: TextSelectionRenderManager }],
                [TextSelectionManagerService],

                // controllers
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetUIController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));
    }

    override onReady(): void {
        this._markSheetAsFocused();
    }

    private _markSheetAsFocused() {
        const currentUniverService = this._currentUniverService;
        currentUniverService.currentSheet$.pipe(filter((v) => !!v)).subscribe((workbook) => {
            currentUniverService.focusUniverInstance(workbook!.getUnitId());
        });
    }
}

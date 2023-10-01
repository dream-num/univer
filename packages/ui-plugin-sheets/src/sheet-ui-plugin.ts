import { DragManager, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SHEET_UI_PLUGIN_NAME } from './Basics';
import { SheetClipboardController } from './controller/clipboard/clipboard.controller';
import { SheetContextMenuController } from './controller/contextmenu/contextmenu.controller';
import { SheetUIController } from './controller/sheet-ui.controller';
import { en } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';

export class SheetUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
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
                [DragManager],
                [ZIndexManager],
                [SlotManager],

                // services
                [ICellEditorService, { useClass: DesktopCellEditorService }],
                [ISheetClipboardService, { useClass: SheetClipboardService }],

                // controllers
                [SheetClipboardController],
                [SheetContextMenuController],
                [SheetUIController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._markSheetAsFocused();
    }

    private _markSheetAsFocused() {
        const currentService = this._injector.get(ICurrentUniverService);
        const c = currentService.getCurrentUniverSheetInstance();
        currentService.focusUniverInstance(c.getUnitId());
    }
}

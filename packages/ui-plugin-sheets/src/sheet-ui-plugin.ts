import { DragManager, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SHEET_UI_PLUGIN_NAME, SheetUIPluginObserve } from './Basics';
import { SheetClipboardController } from './controller/clipboard/clipboard.controller';
import { SheetUIController } from './controller/sheet-ui.controller';
import { en } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    constructor(
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(SHEET_UI_PLUGIN_NAME);
    }

    override onStarting(injector: Injector): void {
        this._localeService.getLocale().load({
            en,
        });

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
                [SheetUIController],
            ] as Dependency[]
        ).forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._markSheetAsFocused();
    }

    // NOTE: should set from fx service

    /**
     * Formula Bar API
     * @param str
     */
    // setFormulaContent(str: string) {
    //     this._appUIController
    //         .getSheetContainerController()
    //         .getFormulaBarUIController()
    //         .getFormulaBar()
    //         .setFormulaContent(str);
    // }

    // setFx(fx: Fx) {
    //     this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFx(fx);
    // }

    private _markSheetAsFocused() {
        const currentService = this._injector.get(ICurrentUniverService);
        const c = currentService.getCurrentUniverSheetInstance();
        currentService.focusUniverInstance(c.getUnitId());
    }
}

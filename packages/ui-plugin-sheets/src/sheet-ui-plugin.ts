import { DragManager, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultSheetUIConfig, ISheetUIPluginConfig, SHEET_UI_PLUGIN_NAME, SheetUIPluginObserve } from './Basics';
import { SheetClipboardController } from './controller/clipboard/clipboard.controller';
import { SheetUIController } from './controller/sheet-ui.controller';
import { en } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _dragManager: DragManager;

    constructor(
        config: ISheetUIPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    override onStarting(): void {
        /**
         * load more Locale object
         *
         * TODO 异步加载
         */
        this._localeService.getLocale().load({
            en,
        });

        this._initDependencies();
        this._initModules();
    }

    override onRendered(): void {
        this._markSheetAsFocused();
    }

    /**
     * @deprecated
     */
    getZIndexManager() {
        return this._zIndexManager;
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

    private _initDependencies(): void {
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
        ).forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._zIndexManager = this._injector.get(ZIndexManager);
    }

    private _initModules(): void {
        this._injector.get(SheetClipboardController).initialize();
    }
}

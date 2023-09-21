import { DragManager, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultSheetUIConfig, ISheetUIPluginConfig, SHEET_UI_PLUGIN_NAME, SheetUIPluginObserve } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { SheetClipboardController } from './Controller/clipboard/clipboard.controller';
import { DesktopSheetShortcutController } from './Controller/shortcut.controller';
import { en } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { ISheetClipboardService, SheetClipboardService } from './services/clipboard/clipboard.service';
import { Fx } from './View/FormulaBar';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _appUIController: AppUIController;

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
        this._markSheetAsFocused();
    }

    override onDestroy(): void {}

    getAppUIController() {
        return this._appUIController;
    }

    getZIndexManager() {
        return this._zIndexManager;
    }

    /**
     * Formula Bar API
     * @param str
     */
    setFormulaContent(str: string) {
        this._appUIController
            .getSheetContainerController()
            .getFormulaBarUIController()
            .getFormulaBar()
            .setFormulaContent(str);
    }

    setFx(fx: Fx) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFx(fx);
    }

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
                [DesktopSheetShortcutController],
                [SheetClipboardController],
                [AppUIController, { useFactory: () => this._injector.createInstance(AppUIController, this._config) }],
            ] as Dependency[]
        ).forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._zIndexManager = this._injector.get(ZIndexManager);
    }

    private _initModules(): void {
        this._injector.get(SheetClipboardController).initialize();
    }
}

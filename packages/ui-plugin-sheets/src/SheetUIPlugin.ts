import { DragManager, SharedController, SlotManager, ZIndexManager } from '@univerjs/base-ui';
import { ICurrentUniverService, IUndoRedoService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultSheetUIConfig, installObserver, ISheetUIPluginConfig, SHEET_UI_PLUGIN_NAME, SheetUIPluginObserve } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { DesktopSheetShortcutController } from './Controller/shortcut.controller';
import { en, zh } from './Locale';
import { ICellEditorService } from './services/cell-editor/cell-editor.service';
import { DesktopCellEditorService } from './services/cell-editor/cell-editor-desktop.service';
import { SheetBarService } from './services/sheet-bar.service';
import { Fx } from './View/FormulaBar';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _appUIController: AppUIController;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _dragManager: DragManager;

    constructor(config: ISheetUIPluginConfig, @Inject(Injector) override readonly _injector: Injector, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    override onMounted(): void {
        installObserver(this);

        /**
         * load more Locale object
         *
         * TODO 异步加载
         */
        this._localeService.getLocale().load({
            zh,
            en,
        });

        this.initDependencies();
        this.markSheetAsFocused();
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
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFormulaContent(str);
    }

    setFx(fx: Fx) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFx(fx);
    }

    /**
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    private UIDidMount(cb: Function) {
        this._appUIController.getSheetContainerController().UIDidMount(cb);
    }

    private markSheetAsFocused() {
        const currentService = this._injector.get(ICurrentUniverService);
        const c = currentService.getCurrentUniverSheetInstance();
        currentService.focusUniverInstance(c.getUnitId());
    }

    private initDependencies(): void {
        (
            [
                [DragManager],
                [ZIndexManager],
                [SlotManager],
                [DesktopSheetShortcutController],
                [SheetBarService],
                [ICellEditorService, { useClass: DesktopCellEditorService }],
            ] as Dependency[]
        ).forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._zIndexManager = this._injector.get(ZIndexManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
        this._injector.add([AppUIController, { useValue: this._appUIController }]);

        this._injector.get(IUndoRedoService);
        this._injector.get(SharedController);
        this._injector.get(DesktopSheetShortcutController);

        this._injector.get(ICellEditorService).initialize();
    }
}

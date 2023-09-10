import { IRenderingEngine } from '@univerjs/base-render';
import { DragManager, KeyboardManager, SharedController, SlotManager, ZIndexManager } from '@univerjs/base-ui';
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

    private _keyboardManager: KeyboardManager;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _dragManager: DragManager;

    constructor(config: ISheetUIPluginConfig, @Inject(Injector) override readonly _injector: Injector, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    initialize(): void {
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

        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
            this.markSheetAsFocused();
        });
    }

    initRender() {
        const engine = this._injector.get(IRenderingEngine);
        const container = this._appUIController.getSheetContainerController().getContentRef().current;

        if (!container) {
            throw new Error('container is not ready');
        }

        // mount canvas to DOM container
        engine.setContainer(container);

        window.addEventListener('resize', () => {
            engine.resize();
        });

        // should be clear
        setTimeout(() => {
            engine.resize();
        }, 0);
    }

    initUI() {}

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    getAppUIController() {
        return this._appUIController;
    }

    getZIndexManager() {
        return this._zIndexManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getKeyboardManager(): KeyboardManager {
        return this._keyboardManager;
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
                [KeyboardManager],
                [ZIndexManager],
                [SlotManager],
                [DesktopSheetShortcutController],
                [SheetBarService],
                [ICellEditorService, { useClass: DesktopCellEditorService }],
            ] as Dependency[]
        ).forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._keyboardManager = this._injector.get(KeyboardManager);
        this._zIndexManager = this._injector.get(ZIndexManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
        this._injector.add([AppUIController, { useValue: this._appUIController }]);

        this._injector.get(IUndoRedoService);
        this._injector.get(SharedController);
        this._injector.get(DesktopSheetShortcutController);

        this._injector.get(ICellEditorService).initialize();
    }
}

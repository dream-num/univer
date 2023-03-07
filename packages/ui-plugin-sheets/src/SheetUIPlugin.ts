import { Plugin, UniverSheet, Tools, PLUGIN_NAMES } from '@univerjs/core';
import { Context } from '@univerjs/core/src/Basics/Context';
import { ComponentManager, getRefElement, RegisterManager } from '@univerjs/base-ui';
import { RenderEngine } from '@univerjs/base-render';
import { DefaultSheetUiConfig, installObserver, ISheetUIPluginConfig, SheetUIPluginObserve, SHEET_UI_PLUGIN_NAME } from './Basics';
import { zh, en } from './Locale';
import { AppUIController } from './Controller/AppUIController';
import { Fx } from './View/FormulaBar';
import { SlotComponentProps } from './Controller/SlotController';
import { IToolbarItemProps } from './Controller';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve, Context> {
    private _appUIController: AppUIController;

    private _registerManager: RegisterManager;

    private _config: ISheetUIPluginConfig;

    private _componentManager: ComponentManager;

    constructor(config?: ISheetUIPluginConfig) {
        super(SHEET_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSheetUiConfig, config);
    }

    static create(config?: ISheetUIPluginConfig) {
        return new SheetUIPlugin(config);
    }

    installTo(univerInstance: UniverSheet) {
        univerInstance.installPlugin(this);
    }

    initialize(ctx: Context): void {
        installObserver(this);
        /**
         * load more Locale object
         */
        this.getLocale().load({
            zh,
            en,
        });

        this._componentManager = new ComponentManager();
        this._registerManager = new RegisterManager(this);
        this._appUIController = new AppUIController(this);
        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
        });
    }

    getConfig() {
        return this._config;
    }

    initRender() {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        let container = getRefElement(this._appUIController.getSheetContainerController().getContentRef());

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

    onMounted(ctx: Context): void {
        this.initialize(ctx);
    }

    onDestroy(): void {}

    getAppUIController() {
        return this._appUIController;
    }

    getComponentManager() {
        return this._componentManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
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
    UIDidMount(cb: Function) {
        this._appUIController.getSheetContainerController().UIDidMount(cb);
    }

    addSlot(name: string, slot: SlotComponentProps, cb?: () => void) {
        this._appUIController.getSheetContainerController().getMainSlotController().addSlot(name, slot, cb);
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController.getSheetContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController.getSheetContainerController().getToolbarController().deleteToolbarConfig(name);
    }
}

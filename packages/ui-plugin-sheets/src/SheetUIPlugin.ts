import { Plugin, Tools, PLUGIN_NAMES, Context, Univer } from '@univerjs/core';
import { ComponentManager, getRefElement, RegisterManager, KeyboardManager, SlotComponent, ZIndexManager } from '@univerjs/base-ui';
import { RenderEngine } from '@univerjs/base-render';
import { DefaultSheetUIConfig, installObserver, ISheetUIPluginConfig, SheetUIPluginObserve, SHEET_UI_PLUGIN_NAME } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { Fx } from './View/FormulaBar';
import { SlotComponentProps } from './Controller/SlotController';
import { IToolbarItemProps } from './Controller';
import { zh, en } from './Locale';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve, Context> {
    private _appUIController: AppUIController;

    private _keyboardManager: KeyboardManager;

    private _registerManager: RegisterManager;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _componentManager: ComponentManager;

    constructor(config?: ISheetUIPluginConfig) {
        super(SHEET_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    static create(config?: ISheetUIPluginConfig) {
        return new SheetUIPlugin(config);
    }

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
    }

    initialize(ctx: Context): void {
        installObserver(this);
        /**
         * load more Locale object
         *
         * TODO 异步加载
         */
        this.getLocale().load({
            zh,
            en,
        });
        // const locale = this.getGlobalContext().getLocale().getCurrentLocale();
        // console.info(`./Locale/${locale}`);
        // if (locale === LocaleType.ZH) {
        //     import(`./Locale/zh`).then((module) => {
        //         this.loadLocale(locale, module);
        //     });
        // } else if (locale === LocaleType.EN) {
        //     import(`./Locale/en`).then((module) => {
        //         this.loadLocale(locale, module);
        //     });
        // }

        this._componentManager = new ComponentManager();
        this._zIndexManager = new ZIndexManager();
        this._keyboardManager = new KeyboardManager(this);
        this._registerManager = new RegisterManager(this);
        this._appUIController = new AppUIController(this);
        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
        });
    }

    // loadLocale(locale: LocaleType, module: IKeyValue) {
    //     // import(`./Locale/${locale}`).then((module) => {
    //     // Do something with the module.
    //     const localObject: IKeyValue = {};
    //     localObject[locale] = module.default;

    //     console.log('localObject===', locale, localObject);

    //     this.getLocale().load(localObject);

    //     this._componentManager = new ComponentManager();
    //     this._keyboardManager = new KeyboardManager(this);
    //     this._registerManager = new RegisterManager(this);
    //     this._appUIController = new AppUIController(this);
    //     // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
    //     this.UIDidMount(() => {
    //         this.initRender();
    //     });
    // }

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

    getZIndexManager() {
        return this._zIndexManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
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
    UIDidMount(cb: Function) {
        this._appUIController.getSheetContainerController().UIDidMount(cb);
    }

    setSlot(slotName: string, component: SlotComponent, cb?: () => {}) {
        this._appUIController.getSheetContainerController().getSlotManager().setSlotComponent(slotName, component, cb);
    }

    addSlot(name: string, slot: SlotComponentProps, cb?: () => void) {
        this._appUIController.getSheetContainerController().getMainSlotController().addSlot(name, slot, cb);
    }

    getSlot(name: string) {
        return this._appUIController.getSheetContainerController().getMainSlotController().getSlot(name);
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController.getSheetContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController.getSheetContainerController().getToolbarController().deleteToolbarConfig(name);
    }
}

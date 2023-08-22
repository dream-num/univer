import { Plugin, Tools, LocaleService, PluginType } from '@univerjs/core';
import { RegisterManager, ComponentManager, getRefElement } from '@univerjs/base-ui';
import { IRenderingEngine } from '@univerjs/base-render';
import { Inject, Injector } from '@wendellhu/redi';
import { zh, en } from './Locale';
import { SLIDE_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { AppUIController } from './Controller/AppUIController';
import { DefaultSlideUIConfig, installObserver, ISlideUIPluginConfig, SlideUIPluginObserve } from './Basics';
import { IToolbarItemProps } from './Controller';

export class SlideUIPlugin extends Plugin<SlideUIPluginObserve> {
    static override type = PluginType.Slide;

    private _appUIController: AppUIController;

    private _registerManager: RegisterManager;

    private _config: ISlideUIPluginConfig;

    private _componentManager: ComponentManager;

    constructor(
        config: Partial<ISlideUIPluginConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(SLIDE_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSlideUIConfig, config);

        this.initializeDependencies();
    }

    initialize(): void {
        installObserver(this);
        /**
         * load more Locale object
         */
        this._localeService.getLocale().load({
            zh,
            en,
        });

        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
        });
    }

    getConfig() {
        return this._config;
    }

    initRender() {
        const engine = this._injector.get(IRenderingEngine);
        const container = getRefElement(this._appUIController.getSlideContainerController().getContentRef());

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

    initUI() { }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void { }

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
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    UIDidMount(cb: Function) {
        this._appUIController.getSlideContainerController().UIDidMount(cb);
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController.getSlideContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController.getSlideContainerController().getToolbarController().deleteToolbarConfig(name);
    }

    private initializeDependencies(): void {
        this._injector.add([RegisterManager]);
        this._injector.add([ComponentManager]);

        // TODO: maybe we don't have to instantiate these dependencies manually
        this._componentManager = this._injector.get(ComponentManager);
        this._registerManager = this._injector.get(RegisterManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
    }
}

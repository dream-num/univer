import { Plugin, Context, Tools, PLUGIN_NAMES, Univer } from '@univerjs/core';
import { RegisterManager, ComponentManager, getRefElement } from '@univerjs/base-ui';
import { RenderEngine } from '@univerjs/base-render';
import { SlidePlugin } from '@univerjs/base-slides';
import { zh, en } from './Locale';
import { SLIDE_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { AppUIController } from './Controller/AppUIController';
import { DefaultSlideUIConfig, installObserver, ISlideUIPluginConfig, SlideUIPluginObserve } from './Basics';
import { IToolbarItemProps } from './Controller';

export class SlideUIPlugin extends Plugin<SlideUIPluginObserve, Context> {
    private _appUIController: AppUIController;

    private _registerManager: RegisterManager;

    private _config: ISlideUIPluginConfig;

    private _componentManager: ComponentManager;

    constructor(config?: ISlideUIPluginConfig) {
        super(SLIDE_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSlideUIConfig, config);
    }

    static create(config?: ISlideUIPluginConfig) {
        return new SlideUIPlugin(config);
    }

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
    }

    initialize(ctx: Context): void {
        installObserver(this);
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
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
        let container = getRefElement(this._appUIController.getSlideContainerController().getContentRef());

        // mount canvas to DOM container
        engine.setContainer(container);

        this.getUniver().getCurrentUniverSlideInstance().context.getPluginManager().getRequirePluginByName<SlidePlugin>(PLUGIN_NAMES.SLIDE).getCanvasView().scrollToCenter();

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
}

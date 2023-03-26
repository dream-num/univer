import { Plugin, Context, UniverDoc, PLUGIN_NAMES, Tools } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { ComponentManager, getRefElement, RegisterManager } from '@univerjs/base-ui';
import { zh, en } from './Locale';
import { DOC_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { DefaultDocUiConfig, IDocUIPluginConfig } from './Basics';
import { AppUIController } from './Controller';

export class DocUIPlugin extends Plugin<any, Context> {
    private _appUIController: AppUIController;

    private _config: IDocUIPluginConfig;

    private _registerManager: RegisterManager;

    private _componentManager: ComponentManager;

    constructor(config?: IDocUIPluginConfig) {
        super(DOC_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultDocUiConfig, config);
    }

    static create(config?: IDocUIPluginConfig) {
        return new DocUIPlugin(config);
    }

    installTo(universheetInstance: UniverDoc) {
        universheetInstance.installPlugin(this);
    }

    initialize(ctx: Context): void {
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        this._componentManager = new ComponentManager();
        this._appUIController = new AppUIController(this);

        this.UIDidMount(() => {
            this.initRender();
        });
    }

    getConfig() {
        return this._config;
    }

    initRender() {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        let container = getRefElement(this._appUIController.getDocContainerController().getContentRef());

        // mount canvas to DOM container
        engine.setContainer(container);

        // this.getUniver().getCurrentUniverDocInstance().context.getPluginManager().getRequirePluginByName<DocPlugin>(PLUGIN_NAMES.DOCUMENT).calculatePagePosition();

        window.addEventListener('resize', () => {
            engine.resize();
        });

        // should be clear
        setTimeout(() => {
            engine.resize();
        }, 0);
    }

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
        this._appUIController.getDocContainerController().UIDidMount(cb);
    }

    onMounted(ctx: Context): void {
        this.initialize(ctx);
    }

    onDestroy(): void {}
}

import { IRenderingEngine } from '@univerjs/base-render';
import { CanvasView } from '@univerjs/base-slides';
import { ComponentManager, DragManager } from '@univerjs/base-ui';
import { LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { DefaultSlideUIConfig, installObserver, ISlideUIPluginConfig, SlideUIPluginObserve } from './Basics';
import { SLIDE_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { IToolbarItemProps } from './Controller';
import { AppUIController } from './Controller/AppUIController';
import { en } from './Locale';

export class SlideUIPlugin extends Plugin<SlideUIPluginObserve> {
    static override type = PluginType.Slide;

    private _appUIController: AppUIController;

    private _config: ISlideUIPluginConfig;

    private _dragManager: DragManager;

    private _componentManager: ComponentManager;

    constructor(
        config: Partial<ISlideUIPluginConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(CanvasView) private readonly _canvasView: CanvasView
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
        const container = this._appUIController.getSlideContainerController().getContentRef().current;
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
            this._canvasView.scrollToCenter();
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

    getComponentManager() {
        return this._componentManager;
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
        this._injector.add([DragManager]);
        this._injector.add([ComponentManager]);

        // TODO: maybe we don't have to instantiate these dependencies manually
        this._dragManager = this._injector.get(DragManager);
        this._componentManager = this._injector.get(ComponentManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
    }
}

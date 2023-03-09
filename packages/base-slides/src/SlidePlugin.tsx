import { SlideContext, Plugin, PLUGIN_NAMES, UniverSlide } from '@univerjs/core';
import { Engine, RenderEngine } from '@univerjs/base-render';
import { zh, en } from './Locale';
import { install, SlidePluginObserve, uninstall } from './Basics/Observer';
import { CanvasView } from './View/Render';

export interface ISlidePluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

export class SlidePlugin extends Plugin<SlidePluginObserve, SlideContext> {
    private _config: ISlidePluginConfig;

    private _canvasEngine: Engine;

    private _canvasView: CanvasView;

    constructor(config: Partial<ISlidePluginConfig> = {}) {
        super(PLUGIN_NAMES.SLIDE);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
    }

    static create(config?: ISlidePluginConfig) {
        return new SlidePlugin(config);
    }

    installTo(universlideInstance: UniverSlide) {
        universlideInstance.installPlugin(this);
    }

    initialize(context: SlideContext): void {
        this.context = context;

        this.getGlobalContext().getLocale().load({
            en,
            zh,
        });
        install(this);
        this.initConfig();
        this.initController();
        this.initCanvasView();
        this.registerExtension();
    }

    getConfig() {
        return this._config;
    }

    initConfig() {}

    initController() {}

    initCanvasView() {
        const engine = this.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine();

        this._canvasEngine = engine;

        if (this._canvasView == null) {
            this._canvasView = new CanvasView(engine, this);
        }
    }

    onMounted(ctx: SlideContext): void {
        this.initialize(ctx);
    }

    onDestroy(): void {
        super.onDestroy();
        uninstall(this);
    }

    registerExtension() {}

    listenEventManager() {}

    getCanvasEngine() {
        return this._canvasEngine;
    }

    getCanvasView() {
        return this._canvasView;
    }
}

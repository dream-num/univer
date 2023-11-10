import { Engine, IRenderingEngine } from '@univerjs/base-render';
import { IUniverInstanceService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { enUS } from './locale';
import { CanvasView } from './views/render';

export interface ISlidePluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

export class SlidePlugin extends Plugin {
    static override type = PluginType.Slide;

    private _config: ISlidePluginConfig;

    private _canvasEngine: Engine | null = null;

    private _canvasView: CanvasView | null = null;

    constructor(
        config: Partial<ISlidePluginConfig> = {},
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAMES.SLIDE);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._initializeDependencies(this._injector);
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });
        this.initCanvasEngine();
    }

    getConfig() {
        return this._config;
    }

    initCanvasEngine() {
        this._canvasEngine = this._injector.get(IRenderingEngine);
    }

    override onRendered(): void {
        this.initialize();
    }

    override onDestroy(): void {
        super.onDestroy();
    }

    getCanvasEngine() {
        return this._canvasEngine;
    }

    getCanvasView() {
        return this._canvasView;
    }

    private _initializeDependencies(slideInjector: Injector) {
        const dependencies: Dependency[] = [[CanvasView]];

        dependencies.forEach((d) => {
            slideInjector.add(d);
        });
    }
}

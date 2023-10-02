import { Engine, IRenderingEngine } from '@univerjs/base-render';
import { ICurrentUniverService, ILanguagePack, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { ToolbarController } from './Controller';
import { en } from './Locale';
import { CanvasView } from './View/Render';

export interface ISlidePluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

export class SlidePlugin extends Plugin {
    static override type = PluginType.Slide;

    private _config: ISlidePluginConfig;

    private _canvasEngine: Engine | null = null;

    private _canvasView: CanvasView | null = null;

    private _toolbarController: ToolbarController | null = null;

    constructor(
        config: Partial<ISlidePluginConfig> = {},
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAMES.SLIDE);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._initializeDependencies(this._injector);
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en: en as unknown as ILanguagePack,
        });
        this.initController();
        this.initCanvasEngine();
    }

    getConfig() {
        return this._config;
    }

    initController() {
        this._toolbarController = this._injector.get(ToolbarController);
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
        const dependencies: Dependency[] = [[CanvasView], [ToolbarController]];

        dependencies.forEach((d) => {
            slideInjector.add(d);
        });
    }
}

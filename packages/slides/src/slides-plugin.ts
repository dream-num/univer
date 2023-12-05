import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Engine } from '@univerjs/engine-render';
import { IRenderingEngine } from '@univerjs/engine-render';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { enUS } from './locale';
import { CanvasView } from './views/render';

export interface ISlidesPluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

const PLUGIN_NAME = 'slides';

export class SlidesPlugin extends Plugin {
    static override type = PluginType.Slide;

    private _config: ISlidesPluginConfig;

    private _canvasEngine: Engine | null = null;

    private _canvasView: CanvasView | null = null;

    constructor(
        config: Partial<ISlidesPluginConfig> = {},
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAME);

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

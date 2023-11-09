import { Ctor, Inject, Injector } from '@wendellhu/redi';

import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../shared/lifecycle';
import { Slide } from '../slides/domain/slide-model';
import { ISlideData } from '../types/interfaces/i-slide-data';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide extends Disposable {
    private readonly _pluginStore = new PluginStore();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) private readonly _initializerService: LifecycleInitializerService
    ) {
        super();
    }

    start(): void {
        this._pluginStore.forEachPlugin((p) => p.onStarting(this._injector));
        this._initializerService.initModulesOnStage(LifecycleStages.Starting);
    }

    ready(): void {
        this.disposeWithMe(
            toDisposable(
                this._lifecycleService.subscribeWithPrevious().subscribe((stage) => {
                    if (stage === LifecycleStages.Ready) {
                        this._pluginStore.forEachPlugin((p) => p.onReady());
                        this._initializerService.initModulesOnStage(LifecycleStages.Ready);
                        return;
                    }

                    if (stage === LifecycleStages.Rendered) {
                        this._pluginStore.forEachPlugin((p) => p.onRendered());
                        this._initializerService.initModulesOnStage(LifecycleStages.Rendered);
                        return;
                    }

                    if (stage === LifecycleStages.Steady) {
                        this._pluginStore.forEachPlugin((p) => p.onSteady());
                        this._initializerService.initModulesOnStage(LifecycleStages.Steady);
                    }
                })
            )
        );
    }

    createSlide(data: Partial<ISlideData>): Slide {
        const slide = this._injector.createInstance(Slide, data);
        return slide;
    }

    /**
     * Add a plugin into UniverSlide. UniverSlide should add dependencies exposed from this plugin to its DI system.
     *
     * @param plugin constructor of the plugin class
     * @param options options to this plugin
     *
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        this._pluginStore.addPlugin(pluginInstance);
    }
}

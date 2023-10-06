import { Ctor, Dependency, Injector, Optional } from '@wendellhu/redi';

import { ISlideData, SlideModel } from '..';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { GenName } from '../Shared';
import { Disposable, toDisposable } from '../Shared/lifecycle';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide extends Disposable {
    private readonly _injector: Injector;

    private readonly _pluginStore = new PluginStore();

    constructor(@Optional(Injector) parentInjector: Injector) {
        super();

        this._injector = this._initDependencies(parentInjector);
        // this._slideModel = this._injector.createInstance(SlideModel, UniverSlideData);

        // this._lifecycleService.lifecycle$.subscribe((stage) => {
        //     if (stage === LifecycleStages.Rendered) {
        //         this._pluginStore.forEachPlugin((p) => p.onRendered());
        //     }
        // });

        // this._injector.get(LifecycleInitializerService).start();
    }

    init(): void {
        this.disposeWithMe(
            toDisposable(
                this._injector
                    .get(LifecycleService)
                    .subscribeWithPrevious()
                    .subscribe((stage) => {
                        if (stage === LifecycleStages.Starting) {
                            this._pluginStore.forEachPlugin((p) => p.onStarting(this._injector));
                            return;
                        }

                        if (stage === LifecycleStages.Ready) {
                            this._pluginStore.forEachPlugin((p) => p.onReady());
                            return;
                        }

                        if (stage === LifecycleStages.Rendered) {
                            this._pluginStore.forEachPlugin((p) => p.onRendered());
                            return;
                        }

                        if (stage === LifecycleStages.Steady) {
                            this._pluginStore.forEachPlugin((p) => p.onSteady());
                        }
                    })
            )
        );

        this._injector.get(LifecycleInitializerService).start();
    }

    createSlide(data: Partial<ISlideData>): SlideModel {
        const slide = this._injector.createInstance(SlideModel, data);
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
    addPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        this._pluginStore.addPlugin(pluginInstance);
    }

    private _initDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [GenName],
            [LifecycleInitializerService],
            [ICommandService, { useClass: CommandService }],
        ];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

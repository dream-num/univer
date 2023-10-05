import { Ctor, Dependency, Inject, Injector, Optional } from '@wendellhu/redi';

import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { GenName } from '../Shared';
import { SlideModel } from '../Slides/Domain';
import { ISlideData } from '../Types/Interfaces';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide {
    _univerSlideConfig: Partial<ISlideData>;

    private readonly _injector: Injector;

    private readonly _slideModel: SlideModel;

    private readonly _pluginStore = new PluginStore();

    constructor(
        UniverSlideData: Partial<ISlideData> = {},
        @Optional(Injector) parentInjector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        this._univerSlideConfig = UniverSlideData;
        this._injector = this._initializeDependencies(parentInjector);
        this._slideModel = this._injector.createInstance(SlideModel, UniverSlideData);

        this._lifecycleService.lifecycle$.subscribe((stage) => {
            if (stage === LifecycleStages.Rendered) {
                this._pluginStore.forEachPlugin((p) => p.onRendered());
            }
        });

        this._injector.get(LifecycleInitializerService).start();
    }

    getUnitId(): string {
        return this._slideModel.getUnitId();
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

        pluginInstance.onRendered();
        this._pluginStore.addPlugin(pluginInstance);
    }

    onReady(): void {
        this._pluginStore.forEachPlugin((p) => p.onReady());
    }

    getSlideModel() {
        return this._slideModel;
    }

    private _initializeDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [GenName],
            [LifecycleInitializerService],
            [ICommandService, { useClass: CommandService }],
        ];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

import { Ctor, Dependency, Injector, Optional } from '@wendellhu/redi';

import { ObserverManager } from '../Observer';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { GenName, IOHttp, IOHttpConfig, Logger } from '../Shared';
import { ColorBuilder } from '../Sheets/Domain/ColorBuilder';
import { SlideModel } from '../Slides/Domain';
import { ISlideData } from '../Types/Interfaces';
import { VersionCode, VersionEnv } from './Version';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide {
    UniverSlideConfig: Partial<ISlideData>;

    private readonly _slideInjector: Injector;

    private readonly _slideModel: SlideModel;

    private readonly _pluginStore = new PluginStore();

    constructor(UniverSlideData: Partial<ISlideData> = {}, @Optional(Injector) parentInjector?: Injector) {
        this.UniverSlideConfig = UniverSlideData;

        this._slideInjector = this._initializeDependencies(parentInjector);

        this._slideModel = this._slideInjector.createInstance(SlideModel, UniverSlideData);
    }

    static newInstance(UniverSlideData: Partial<ISlideData> = {}): UniverSlide {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: UniverSlide :: ');
        return new UniverSlide(UniverSlideData);
    }

    /**
     *
     * Request data
     *
     * @example
     * Get data for all tables, including core and plugin data
     *
     * @param config
     */
    static get<T = void>(config: Omit<IOHttpConfig, 'type'>): Promise<T> {
        return IOHttp({ ...config, type: 'GET' });
    }

    /**
     * Submit data
     * @param config
     */
    static post<T = void>(config: Omit<IOHttpConfig, 'type'>): Promise<T> {
        return IOHttp({ ...config, type: 'POST' });
    }

    static newColor(): ColorBuilder {
        return new ColorBuilder();
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
        const pluginInstance: Plugin = this._slideInjector.createInstance(plugin as unknown as Ctor<any>, options);

        pluginInstance.onRendered();
        this._pluginStore.addPlugin(pluginInstance);
    }

    getSlideModel() {
        return this._slideModel;
    }

    private _initializeDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [[ObserverManager], [GenName]];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

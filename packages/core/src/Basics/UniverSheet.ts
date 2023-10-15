/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ctor, Dependency, IDisposable, Inject, Injector } from '@wendellhu/redi';

import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleService } from '../services/lifecycle/lifecycle.service';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';
import { GenName } from '../Shared/GenName';
import { Disposable, toDisposable } from '../Shared/lifecycle';
import { Workbook } from '../sheets/workbook';
import { IWorkbookConfig } from '../Types/Interfaces/IWorkbookData';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet extends Disposable implements IDisposable {
    private readonly _pluginStore = new PluginStore();

    constructor(@Inject(Injector) private readonly _injector: Injector) {
        super();

        this._initDependencies(_injector);
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
    }

    createSheet(workbookConfig: Partial<IWorkbookConfig>): Workbook {
        const workbook = this._injector.createInstance(Workbook, workbookConfig);
        return workbook;
    }

    override dispose(): void {
        super.dispose();

        this._pluginStore.removePlugins();
    }

    /**
     * Add a plugin into UniverSheet. UniverSheet should add dependencies exposed from this plugin to its DI system.
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

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [[GenName], [SheetInterceptorService]];

        dependencies.forEach((d) => injector.add(d));
    }
}

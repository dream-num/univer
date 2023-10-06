/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ctor, Dependency, IDisposable, Inject, Injector } from '@wendellhu/redi';

import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { GenName } from '../Shared/GenName';
import { Disposable, toDisposable } from '../Shared/lifecycle';
import { Workbook } from '../Sheets/Domain';
import { IWorkbookConfig } from '../Types/Interfaces/IWorkbookData';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet extends Disposable implements IDisposable {
    private readonly _injector: Injector;

    private readonly _workbooks: Workbook[] = [];

    private readonly _pluginStore = new PluginStore();

    constructor(@Inject(Injector) parentInjector: Injector) {
        super();

        this._injector = this._initDependencies(parentInjector);
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

    createSheet(workbookConfig: Partial<IWorkbookConfig>): Workbook {
        const workbook = this._injector.createInstance(Workbook, workbookConfig);
        this._workbooks.push(workbook);
        return workbook;
    }

    override dispose(): void {
        super.dispose();

        this._workbooks.length = 0;
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

        // TODO: should replay lifecycle staged to newly added plugins
    }

    private _initDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [GenName],
            [LifecycleInitializerService],
            [
                ICommandService,
                {
                    useClass: CommandService,
                },
            ],
        ];

        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

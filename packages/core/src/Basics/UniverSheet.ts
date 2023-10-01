import { Ctor, Dependency, IDisposable, Injector, Optional } from '@wendellhu/redi';

import { ObserverManager } from '../Observer';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleInitializerService } from '../services/lifecycle/lifecycle.service';
import { GenName } from '../Shared/GenName';
import { Logger } from '../Shared/Logger';
import { Workbook } from '../Sheets/Domain';
import { IWorkbookConfig } from '../Types/Interfaces';
import { VersionCode, VersionEnv } from './Version';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet implements IDisposable {
    univerSheetConfig: Partial<IWorkbookConfig>;

    private readonly _sheetInjector: Injector;

    // TODO@wzhudev: maybe we should support multiple workbooks in the future?
    private readonly _workbook: Workbook;

    private readonly _pluginStore = new PluginStore();

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}, @Optional(Injector) parentInjector?: Injector) {
        this.univerSheetConfig = univerSheetData;

        this._sheetInjector = this._initDependencies(parentInjector);
        this.setObserver();
        this._workbook = this._sheetInjector.createInstance(Workbook, univerSheetData);
        this._sheetInjector.get(LifecycleInitializerService).start();
    }

    static newInstance(univerSheetData: Partial<IWorkbookConfig> = {}): UniverSheet {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: universheet :: ');
        return new UniverSheet(univerSheetData);
    }

    /**
     * get unit id
     */
    getUnitId(): string {
        return this.getWorkBook().getUnitId();
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    onReady(): void {
        this._pluginStore.forEachPlugin((p) => p.onReady());
    }

    dispose(): void {}

    /**
     * Add a plugin into UniverSheet. UniverSheet should add dependencies exposed from this plugin to its DI system.
     *
     * @param plugin constructor of the plugin class
     * @param options options to this plugin
     *
     * @internal
     */
    addPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._sheetInjector.createInstance(plugin as unknown as Ctor<any>, options);
        pluginInstance.onStarting(this._sheetInjector);
        this._pluginStore.addPlugin(pluginInstance);
    }

    private _initDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [ObserverManager],
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

    /**
     * @deprecated
     */
    private setObserver(): void {
        new WorkBookObserverImpl().install(this._sheetInjector.get(ObserverManager));
    }
}

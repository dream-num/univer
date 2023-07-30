import { Ctor, Injector, Optional, Disposable, Dependency } from '@wendellhu/redi';
import { Workbook, ColorBuilder } from '../Sheets/Domain';
import { IWorkbookConfig } from '../Types/Interfaces';
import { BasePlugin, Plugin, PluginCtor, PluginStore } from '../Plugin';
import { IOHttp, IOHttpConfig, Logger } from '../Shared';
import { SheetContext } from './SheetContext';
import { VersionCode, VersionEnv } from './Version';
import { Observer, ObserverManager } from 'src/Observer';

interface IComposedConfig {
    [key: string]: any;

    workbookConfig: IWorkbookConfig;
}

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet implements Disposable {
    univerSheetConfig: Partial<IWorkbookConfig>;

    private readonly _sheetInjector: Injector;

    private readonly _pluginStore = new PluginStore();

    /**
     * @deprecated this is a temporary solution, migrate modules to `sheetInjector`
     */
    private _context: SheetContext;

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}, @Optional(Injector) parentInjector?: Injector) {
        this.univerSheetConfig = univerSheetData;

        this._context = new SheetContext(univerSheetData);

        // Initialize injector after constructoring context
        this._sheetInjector = this.initializeInjector(parentInjector);
    }

    /**
     * get SheetContext
     */
    get context() {
        return this._context;
    }

    static newInstance(univerSheetData: Partial<IWorkbookConfig> = {}): UniverSheet {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: universheet :: ');
        return new UniverSheet(univerSheetData);
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

    /**
     * Load data
     *
     * @example
     * UniverSheet.get gets all the core and plug-in data, UniverSheet.load(univerSheetInstance,data) internally calls the load API of each plug-in to centrally load the core and plug-in data
     *
     * @param sheet
     * @param data
     */
    static load<T extends IComposedConfig>(sheet: UniverSheet, data: T) {
        sheet.getWorkBook().load(data.workbookConfig);
        sheet.context
            .getPluginManager()
            .getPlugins()
            .forEach((plugin: BasePlugin) => {
                plugin.load(data[`${plugin.getPluginName()}Config`]);
            });
    }

    static newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    /**
     * Save data
     *
     * @example
     * get all the core and plug-in data
     *
     * @param univerSheet
     */
    static toJson(univerSheet: UniverSheet): IComposedConfig {
        const workbookConfig = univerSheet.getWorkBook().save();
        const pluginConfig: Partial<IComposedConfig> = {};
        univerSheet.context
            .getPluginManager()
            .getPlugins()
            .forEach((plugin: BasePlugin) => {
                pluginConfig[`${plugin.getPluginName()}Config`] = plugin.save();
            });

        return { workbookConfig, ...pluginConfig };
    }

    dispose(): void {}

    /**
     * get unit id
     */
    getUnitId(): string {
        return this.getWorkBook().getUnitId();
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
        const pluginInstance: Plugin = this._sheetInjector.createInstance(plugin as unknown as Ctor<any>, options);

        // TODO: remove context passed in here
        pluginInstance.onCreate(this._context);

        this._pluginStore.addPlugin(pluginInstance);

        // FIXME: this is temporary. Will be removed in the future.
        this._context.getPluginManager().install(pluginInstance);
    }

    /**
     * install plugin
     *
     * @param plugin - install plugin
     * @deprecated Use addPlugin instead
     */
    installPlugin(plugin: Plugin): void {
        this._context.getPluginManager().install(plugin);
    }

    /**
     * uninstall plugin
     *
     * @param name - plugin name
     */
    uninstallPlugin(name: string): void {
        this._context.getPluginManager().uninstall(name);
    }

    /**
     * get WorkBook
     *
     * @returns Workbook
     */
    getWorkBook(): Workbook {
        return this._context.getWorkBook();
    }

    refreshWorkbook(univerSheetData: Partial<IWorkbookConfig> = {}) {
        this._context.refreshWorkbook(univerSheetData);
    }

    private initializeInjector(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [[ObserverManager, { useValue: this.context.getObserverManager() }]];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}
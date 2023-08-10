import { Injector, Ctor } from '@wendellhu/redi';

import { CommandManager } from 'src/Command';
import { LocaleService } from 'src/Service/Locale.service';
import { UniverSheet } from './UniverSheet';
import { UniverDoc } from './UniverDoc';
import { UniverSlide } from './UniverSlide';
import { Nullable } from '../Shared';
import { Context } from './Context';
import { Plugin, PluginCtor, PluginRegistry, PluginStore, PluginType } from '../Plugin';
import { IUniverData, IWorkbookConfig } from '../Types/Interfaces';
import { UniverObserverImpl } from './UniverObserverImpl';
import { ObserverManager } from '../Observer';
import { CurrentUniverService, ICurrentUniverService } from '../Service/Current.service';

/**
 * Univer.
 */
export class Univer {
    private readonly _univerInjector: Injector;

    private readonly _univerPluginStore = new PluginStore();

    private readonly _univerPluginRegistry = new PluginRegistry();

    /**
     * @deprecated
     */
    private _context: Context;

    constructor(univerData: Partial<IUniverData> = {}) {
        this._context = new Context(univerData);
        this._setObserver();
        this._context.onUniver(this);

        this._univerInjector = this.initializeDependencies();

        // initialize localization info
        const { locale } = univerData;
        if (locale) {
            this._univerInjector.get(LocaleService).setLocale(locale);
        }
    }

    private get _currentUniverService(): ICurrentUniverService {
        return this._univerInjector.get(ICurrentUniverService);
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends Plugin>(plugin: PluginCtor<T>, configs?: any): void {
        // TODO: type of `configs` could be optimized here using typescript infer

        if (plugin.type === PluginType.Univer) {
            this.registerUniverPlugin(plugin, configs);
        } else if (plugin.type === PluginType.Sheet) {
            this.registerSheetPlugin(plugin, configs);
        } else {
            throw new Error(`Unimplemented plugin system for business: "${plugin.type}".`);
        }
    }

    /** Create a univer sheet instance with internal dependency injection. */
    createUniverSheet(config: Partial<IWorkbookConfig>): UniverSheet {
        const sheet = this._univerInjector.createInstance(UniverSheet, config);

        // TODO@wzhudev: clean this
        sheet.getWorkBook().onUniver();

        this.initializePluginsForSheet(sheet);
        this._currentUniverService.addSheet(sheet);

        return sheet;
    }

    addUniverSheet(univerSheet: UniverSheet): void {
        this._currentUniverService.addSheet(univerSheet);
    }

    addUniverDoc(univerDoc: UniverDoc): void {
        univerDoc.context.onUniver(this);
        this._currentUniverService.addDoc(univerDoc);
    }

    addUniverSlide(univerSlide: UniverSlide): void {
        univerSlide.context.onUniver(this);
        this._currentUniverService.addSlide(univerSlide);
    }

    getUniverSheetInstance(id: string): Nullable<UniverSheet> {
        return this._currentUniverService.getUniverSheetInstance(id);
    }

    getUniverDocInstance(id: string): Nullable<UniverDoc> {
        return this._currentUniverService.getUniverDocInstance(id);
    }

    getUniverSlideInstance(id: string): Nullable<UniverSheet> {
        return null;
    }

    getAllUniverSheetsInstance() {
        return this._currentUniverService.getAllUniverSheetsInstance();
    }

    getAllUniverDocsInstance() {
        return this._currentUniverService.getAllUniverDocsInstance();
    }

    getAllUniverSlidesInstance() {
        return this._currentUniverService.getAllUniverSlidesInstance();
    }

    /**
     * get active universheet
     * @returns
     */
    getCurrentUniverSheetInstance() {
        return this._currentUniverService.getCurrentUniverSheetInstance();
    }

    getCurrentUniverDocInstance() {
        return this._currentUniverService.getCurrentUniverDocInstance();
    }

    getCurrentUniverSlideInstance() {
        return this._currentUniverService.getCurrentUniverSlideInstance();
    }

    /**
     * @deprecated
     */
    getGlobalContext() {
        return this._context;
    }

    /**
     * install plugin
     *
     * @param plugin - install plugin
     */
    install(plugin: Plugin): void {
        this._context.getPluginManager().install(plugin);
    }

    /**
     * uninstall plugin
     *
     * @param name - plugin name
     */
    uninstall(name: string): void {
        this._context.getPluginManager().uninstall(name);
    }

    protected _setObserver(): void {
        const manager = this._context.getObserverManager();
        new UniverObserverImpl().install(manager);
    }

    private initializeDependencies(): Injector {
        return new Injector([
            [ObserverManager, { useFactory: () => this._context.getObserverManager() }],
            [ICurrentUniverService, { useClass: CurrentUniverService }],
            [CommandManager, { useFactory: () => this._context.getCommandManager() }],
            [LocaleService],
        ]);
    }

    private registerUniverPlugin<T extends Plugin>(plugin: PluginCtor<T>, options?: any): void {
        // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
        const pluginInstance: Plugin = this._univerInjector.createInstance(plugin as unknown as Ctor<any>, options);

        // TODO: remove these two lines later
        pluginInstance.onCreate(this._context);
        this._context.getPluginManager().install(pluginInstance);

        this._univerPluginStore.addPlugin(pluginInstance);
    }

    private registerSheetPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        // Add plugins to the plugin registration. And for each initialized UniverSheet, instantiate these dependencies immediately.
        const sheets = this._currentUniverService.getAllUniverSheetsInstance();
        if (sheets.length) {
            sheets.forEach((sheet) => {
                sheet.addPlugin(pluginCtor, options);
            });
        } else {
            this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        }
    }

    private initializePluginsForSheet(sheet: UniverSheet): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Sheet);
        plugins.forEach((p) => {
            sheet.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
    }
}

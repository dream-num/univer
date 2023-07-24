import { Injector, Ctor } from '@wendellhu/redi';

import { UniverSheet } from './UniverSheet';
import { UniverDoc } from './UniverDoc';
import { UniverSlide } from './UniverSlide';
import { Nullable } from '../Shared';
import { Context } from './Context';
import { Plugin, PluginType } from '../Plugin';
import { IUniverData, IWorkbookConfig } from '../Types/Interfaces';
import { UniverObserverImpl } from './UniverObserverImpl';

interface IPluginRegistryItem {
    plugin: typeof Plugin;
    options: any;
}

class PluginRegistry {
    private readonly pluginsRegisteredByBusiness = new Map<PluginType, [IPluginRegistryItem]>();

    registerPlugin(plugin: typeof Plugin, options: any) {
        const type = plugin.type;
        if (!this.pluginsRegisteredByBusiness.has(type)) {
            this.pluginsRegisteredByBusiness.set(type, [] as unknown[] as [IPluginRegistryItem]);
        }

        this.pluginsRegisteredByBusiness.get(type)!.push({ plugin, options });
    }

    getRegisterPlugins(type: PluginType): [IPluginRegistryItem] {
        return this.pluginsRegisteredByBusiness.get(type) || ([] as unknown[] as [IPluginRegistryItem]);
    }
}

class PluginStore {
    private readonly plugins: Plugin[] = [];

    addPlugin(plugin: Plugin): void {
        this.plugins.push(plugin);
    }

    removePlugins(): Plugin[] {
        const plugins = this.plugins.slice();
        this.plugins.length = 0;
        return plugins;
    }
}

/**
 * Univer.
 */
export class Univer {
    private readonly _univerInjector: Injector;

    private readonly _univerPluginStore = new PluginStore();

    private readonly _univerPluginRegistry = new PluginRegistry();

    private _univerSheets: UniverSheet[];

    private _univerDocs: UniverDoc[];

    private _univerSlides: UniverSlide[];

    /**
     * @deprecated
     */
    private _context: Context;

    constructor(univerData: Partial<IUniverData> = {}) {
        this._univerSheets = [];
        this._univerDocs = [];
        this._univerSlides = [];

        this._context = new Context(univerData);
        this._setObserver();
        this._context.onUniver(this);

        this._univerInjector = this.initializeInjector();
    }

    /** Register a plugin into univer. */
    registerPlugin<T>(plugin: Ctor<T>, configs?: any): void {
        // TODO: type of `configs` could be optimized here using typescript infer
        if (plugin.type === PluginType.Univer) {
            this.registerUniverPlugin(plugin);
        } else if (plugin.type === PluginType.Sheet) {
            this.registerSheetPlugin(plugin, configs);
        } else {
            throw new Error(`Unimplemented plugin system for business: "${plugin.type}".`);
        }
    }

    /** Create a univer sheet instance with internal dependency injection. */
    createUniverSheet(config: Partial<IWorkbookConfig>): UniverSheet {
        const sheet = this._univerInjector.createInstance(UniverSheet, config);
        sheet.context.onUniver(this);
        this._univerSheets.push(sheet);

        this.initializePluginsForSheet(sheet);
        // TODO: initialize pligins for sheet

        return sheet;
    }

    private initializePluginsForSheet(sheet: UniverSheet): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Sheet);
        plugins.forEach(p => {
            const pluginInstance: Plugin = this._univerInjector.createInstance(p.plugin as unknown as Ctor<any>, p.options);
            sheet.installPlugin(pluginInstance);
        });
    }

    addUniverSheet(univerSheet: UniverSheet): void {
        univerSheet.context.onUniver(this);
        this._univerSheets.push(univerSheet);
    }

    addUniverDoc(univerDoc: UniverDoc): void {
        univerDoc.context.onUniver(this);
        this._univerDocs.push(univerDoc);
    }

    addUniverSlide(univerSlide: UniverSlide): void {
        univerSlide.context.onUniver(this);
        this._univerSlides.push(univerSlide);
    }

    getUniverSheetInstance(id: string): Nullable<UniverSheet> {
        return this._univerSheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<UniverDoc> {
        return this._univerDocs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<UniverSheet> {
        return null;
    }

    getAllUniverSheetsInstance() {
        return this._univerSheets;
    }

    getAllUniverDocsInstance() {
        return this._univerDocs;
    }

    getAllUniverSlidesInstance() {
        return this._univerSlides;
    }

    /**
     * get active universheet
     * @returns
     */
    getCurrentUniverSheetInstance() {
        return this._univerSheets[0];
    }

    getCurrentUniverDocInstance() {
        return this._univerDocs[0];
    }

    getCurrentUniverSlideInstance() {
        return this._univerSlides[0];
    }

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

    private initializeInjector(): Injector {
        return new Injector();
    }

    private registerUniverPlugin<T>(plugin: Ctor<T>, options?: any): void {
        // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
        const pluginInstance: Plugin = this._univerInjector.createInstance(plugin as unknown as Ctor<any>, options);
        pluginInstance.onCreate(this._context); // TODO: remove this later
        this._univerPluginStore.addPlugin(pluginInstance);
    }

    private registerSheetPlugin(plugin: typeof Plugin, options?: any) {
        // Add plugins to the plugin registration. And for each initialized UniverSheet, instantiate these dependencies immediately.
        if (this._univerSheets.length) {
            // TODO: add plugin to these already instantiated UniverSheet instances.
        } else {
            this._univerPluginRegistry.registerPlugin(plugin, options);
        }
    }
}
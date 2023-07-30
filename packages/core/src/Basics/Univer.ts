import { Injector, Ctor } from '@wendellhu/redi';

import { UniverSheet } from './UniverSheet';
import { UniverDoc } from './UniverDoc';
import { UniverSlide } from './UniverSlide';
import { Nullable } from '../Shared';
import { Context } from './Context';
import { Plugin, PluginCtor, PluginRegistry, PluginStore, PluginType } from '../Plugin';
import { IUniverData, IWorkbookConfig } from '../Types/Interfaces';
import { UniverObserverImpl } from './UniverObserverImpl';

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
    registerPlugin<T extends Ctor<Plugin> & { type: PluginType }>(plugin: T, configs?: any): void {
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
        sheet.context.onUniver(this);
        this._univerSheets.push(sheet);

        this.initializePluginsForSheet(sheet);
        // TODO: initialize pligins for sheet

        return sheet;
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
        if (this._univerSheets.length) {
            this._univerSheets.forEach((sheet) => {
                sheet.addPlugin(pluginCtor, options);
            });
        } else {
            this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        }
    }

    private initializePluginsForSheet(sheet: UniverSheet): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Sheet);
        plugins.forEach((p) => {
            const pluginInstance: Plugin = this._univerInjector.createInstance(p.plugin as unknown as Ctor<any>, p.options);
            sheet.installPlugin(pluginInstance);
        });
    }
}
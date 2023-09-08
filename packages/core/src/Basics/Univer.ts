import { Ctor, Injector } from '@wendellhu/redi';

import { ObserverManager } from '../Observer';
import { Plugin, PluginCtor, PluginRegistry, PluginStore, PluginType } from '../Plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { CurrentUniverService, ICurrentUniverService } from '../services/current.service';
import { LocaleService } from '../services/locale.service';
import { DesktopLogService, ILogService } from '../services/log/log.service';
import { DesktopPermissionService, IPermissionService } from '../services/permission/permission.service';
import { IUndoRedoService, LocalUndoRedoService } from '../services/undoredo/undoredo.service';
import { Nullable } from '../Shared';
import { IDocumentData, ISlideData, IUniverData, IWorkbookConfig } from '../Types/Interfaces';
import { UniverDoc } from './UniverDoc';
import { UniverObserverImpl } from './UniverObserverImpl';
import { UniverSheet } from './UniverSheet';
import { UniverSlide } from './UniverSlide';

/**
 * Univer.
 */
export class Univer {
    private readonly _univerInjector: Injector;

    private readonly _univerPluginStore = new PluginStore();

    private readonly _univerPluginRegistry = new PluginRegistry();

    constructor(univerData: Partial<IUniverData> = {}) {
        this._univerInjector = this.initializeDependencies();
        this._setObserver();

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
        } else if (plugin.type === PluginType.Doc) {
            this.registerDocPlugin(plugin, configs);
        } else if (plugin.type === PluginType.Slide) {
            this.registerSlidePlugin(plugin, configs);
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

    createUniverDoc(config: Partial<IDocumentData>): UniverDoc {
        const doc = this._univerInjector.createInstance(UniverDoc, config);

        this.initializePluginsForDoc(doc);
        this._currentUniverService.addDoc(doc);

        return doc;
    }

    createUniverSlide(config: Partial<ISlideData>): UniverSlide {
        const slide = this._univerInjector.createInstance(UniverSlide, config);

        this.initializePluginsForSlide(slide);
        this._currentUniverService.addSlide(slide);

        return slide;
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

    protected _setObserver(): void {
        new UniverObserverImpl().install(this._univerInjector.get(ObserverManager));
    }

    private initializeDependencies(): Injector {
        return new Injector([
            [ObserverManager],
            [ICurrentUniverService, { useClass: CurrentUniverService }],
            [LocaleService],
            [ILogService, { useClass: DesktopLogService, lazy: true }],
            [ICommandService, { useClass: CommandService, lazy: true }],
            [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
            [IPermissionService, { useClass: DesktopPermissionService }],
        ]);
    }

    private registerUniverPlugin<T extends Plugin>(plugin: PluginCtor<T>, options?: any): void {
        // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
        const pluginInstance: Plugin = this._univerInjector.createInstance(plugin as unknown as Ctor<any>, options);

        // TODO: remove these two lines later
        pluginInstance.onCreate();

        this._univerPluginStore.addPlugin(pluginInstance);
    }

    private registerSheetPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        // Add plugins to the plugin registration. And for each initialized UniverSheet, instantiate these dependencies immediately.
        const sheets = this._currentUniverService.getAllUniverSheetsInstance();
        if (sheets.length) {
            sheets.forEach((sheet) => {
                sheet.addPlugin(pluginCtor, options);
            });
        }
    }

    private registerDocPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        const docs = this._currentUniverService.getAllUniverDocsInstance();
        if (docs.length) {
            docs.forEach((doc) => {
                doc.addPlugin(pluginCtor, options);
            });
        }
    }

    private registerSlidePlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        const slides = this._currentUniverService.getAllUniverSlidesInstance();
        if (slides.length) {
            slides.forEach((slide) => {
                slide.addPlugin(pluginCtor, options);
            });
        }
    }

    private initializePluginsForSheet(sheet: UniverSheet): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Sheet);
        plugins.forEach((p) => {
            sheet.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
    }

    private initializePluginsForDoc(doc: UniverDoc): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Doc);
        plugins.forEach((p) => {
            doc.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
        doc.mount();
    }

    private initializePluginsForSlide(slide: UniverSlide): void {
        const plugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Slide);
        plugins.forEach((p) => {
            slide.addPlugin(p.plugin as unknown as PluginCtor<any>, p.options);
        });
    }
}

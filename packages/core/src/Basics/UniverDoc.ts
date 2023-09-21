import { Ctor, Dependency, Injector, Optional } from '@wendellhu/redi';

import { DocumentModel } from '../Docs';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { IDocumentData } from '../Types/Interfaces';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc {
    univerDocConfig: Partial<IDocumentData>;

    private readonly _document: DocumentModel;

    private readonly _pluginStore = new PluginStore();

    private readonly _injector: Injector;

    constructor(docData: Partial<IDocumentData> = {}, @Optional(Injector) _injector: Injector) {
        this.univerDocConfig = docData;
        this._injector = this._initializeDependencies(_injector);
        this._document = this._injector.createInstance(DocumentModel, docData);
    }

    getDocument(): DocumentModel {
        return this._document;
    }

    /**
     * get unit id
     */
    getUnitId(): string {
        return this._document.getUnitId();
    }

    addPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(pluginCtor as unknown as Ctor<any>, options);

        pluginInstance.onRendered();
        this._pluginStore.addPlugin(pluginInstance);
    }

    mount(): void {
        // this._pluginStore.forEachPlugin((plugin) => {
        //     plugin.onRendered();
        // });
    }

    private _initializeDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [[ICommandService, { useClass: CommandService }]];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

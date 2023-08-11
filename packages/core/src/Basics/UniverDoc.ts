import { DocumentModel } from '../Docs';
import { IDocumentData } from '../Types/Interfaces';
import { Plugin, PluginCtor, PluginStore } from '../Plugin';
import { Logger } from '../Shared';
import { VersionCode, VersionEnv } from './Version';
import { Ctor, Injector, Optional } from '@wendellhu/redi';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc {
    univerDocConfig: Partial<IDocumentData>;

    private readonly _document: DocumentModel;

    private readonly _pluginStore = new PluginStore();

    constructor(docData: Partial<IDocumentData> = {}, @Optional(Injector) private readonly _injector: Injector) {
        this.univerDocConfig = docData;
        this._document = new DocumentModel(docData);
    }

    static newInstance(UniverDocData: Partial<IDocumentData> = {}): UniverDoc {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: UniverDoc :: ');
        return new UniverDoc(UniverDocData);
    }

    /**
     * get unit id
     */
    getUnitId(): string {
        return this._document.getUnitId();
    }

    addPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(pluginCtor as unknown as Ctor<any>, options);

        pluginInstance.onCreate();
        pluginInstance.onMounted();
        this._pluginStore.addPlugin(pluginInstance);
    }
}
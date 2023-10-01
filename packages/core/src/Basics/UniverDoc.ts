import { Ctor, Dependency, Inject, Injector, Optional } from '@wendellhu/redi';

import { DocumentModel } from '../Docs/Domain/DocumentModel';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { IDocumentData } from '../Types/Interfaces';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc {
    univerDocConfig: Partial<IDocumentData>;

    private readonly _document: DocumentModel;

    private readonly _pluginStore = new PluginStore();

    private readonly _injector: Injector;

    constructor(
        docData: Partial<IDocumentData> = {},
        @Optional(Injector) _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        this.univerDocConfig = docData;
        this._injector = this._initializeDependencies(_injector);
        this._document = this._injector.createInstance(DocumentModel, docData);

        this._lifecycleService.lifecycle$.subscribe((stage) => {
            if (stage === LifecycleStages.Rendered) {
                this._pluginStore.forEachPlugin((p) => p.onRendered());
            }
        });

        this._injector.get(LifecycleInitializerService).start();
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
        pluginInstance.onStarting(this._injector);
        this._pluginStore.addPlugin(pluginInstance);
    }

    onReady(): void {
        this._pluginStore.forEachPlugin((p) => p.onReady());
    }

    private _initializeDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [ICommandService, { useClass: CommandService }],
            [LifecycleInitializerService],
        ];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

import { Ctor, Dependency, Injector, Optional } from '@wendellhu/redi';

import { DocumentModel } from '../Docs/Domain/DocumentModel';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../Shared/lifecycle';
import { IDocumentData } from '../Types/Interfaces/IDocumentData';
/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc extends Disposable {
    private readonly _pluginStore = new PluginStore();

    private readonly _injector: Injector;

    constructor(@Optional(Injector) _injector: Injector) {
        super();

        this._injector = this._initDependencies(_injector);
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

    createDoc(docData: Partial<IDocumentData>): DocumentModel {
        return this._injector.createInstance(DocumentModel, docData);
    }

    addPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(pluginCtor as unknown as Ctor<any>, options);
        pluginInstance.onStarting(this._injector);
        this._pluginStore.addPlugin(pluginInstance);
    }

    private _initDependencies(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [
            [ICommandService, { useClass: CommandService }],
            [LifecycleInitializerService],
        ];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }
}

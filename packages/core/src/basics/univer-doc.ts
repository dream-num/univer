import type { Ctor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { DocumentDataModel } from '../docs/data-model/document-data-model';
import type { Plugin, PluginCtor } from '../plugin/plugin';
import { PluginStore } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../shared/lifecycle';
import type { IDocumentData } from '../types/interfaces/i-document-data';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc extends Disposable {
    private readonly _pluginStore = new PluginStore();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleInitializerService) private readonly _initService: LifecycleInitializerService
    ) {
        super();
    }

    start(): void {
        this._pluginStore.forEachPlugin((p) => p.onStarting(this._injector));
        this._initService.initModulesOnStage(LifecycleStages.Starting);
    }

    ready(): void {
        this.disposeWithMe(
            toDisposable(
                this._injector
                    .get(LifecycleService)
                    .subscribeWithPrevious()
                    .subscribe((stage) => {
                        if (stage === LifecycleStages.Ready) {
                            this._pluginStore.forEachPlugin((p) => p.onReady());
                            this._initService.initModulesOnStage(LifecycleStages.Ready);
                            return;
                        }

                        if (stage === LifecycleStages.Rendered) {
                            this._pluginStore.forEachPlugin((p) => p.onRendered());
                            this._initService.initModulesOnStage(LifecycleStages.Rendered);
                            return;
                        }

                        if (stage === LifecycleStages.Steady) {
                            this._pluginStore.forEachPlugin((p) => p.onSteady());
                            this._initService.initModulesOnStage(LifecycleStages.Steady);
                        }
                    })
            )
        );
    }

    createDoc(docData: Partial<IDocumentData>): DocumentDataModel {
        return this._injector.createInstance(DocumentDataModel, docData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options: any): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginInstance: Plugin = this._injector.createInstance(pluginCtor as unknown as Ctor<any>, options);
        pluginInstance.onStarting(this._injector);
        this._pluginStore.addPlugin(pluginInstance);
    }
}

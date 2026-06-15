import type { IResourceManagerService } from '@univerjs/core';
import type { EmbedResource } from '../types/embed';
import { Disposable, IResourceManagerService as IResourceManagerServiceToken, UniverInstanceType } from '@univerjs/core';
import { EMBED_RESOURCE_PLUGIN_NAME } from '../common/const';
import { EmbedModelService } from '../services/embed-model.service';

export class EmbedResourceController extends Disposable {
    constructor(
        @IResourceManagerServiceToken private readonly _resourceManagerService: IResourceManagerService,
        private readonly _embedModelService: EmbedModelService
    ) {
        super();

        this._initResource();
    }

    private _initResource(): void {
        this.disposeWithMe(this._resourceManagerService.registerPluginResource<EmbedResource>({
            pluginName: EMBED_RESOURCE_PLUGIN_NAME,
            businesses: [
                UniverInstanceType.UNIVER_DOC,
                UniverInstanceType.UNIVER_SHEET,
                UniverInstanceType.UNIVER_BASE,
                UniverInstanceType.UNIVER_SLIDE,
            ],
            toJson: (unitId) => this._embedModelService.toJson(unitId),
            parseJson: (json) => this._embedModelService.parseJson(json),
            onLoad: (unitId, resource) => this._embedModelService.loadUnit(unitId, resource),
            onUnLoad: (unitId) => this._embedModelService.unloadUnit(unitId),
        }));
    }
}

/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IEmbedResource } from '../types/embed';
import { Disposable, Inject, IReferencedUnitManagerService, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { EMBED_RESOURCE_PLUGIN_NAME } from '../common/const';
import { EmbedModelService } from '../services/embed-model.service';
import { EmbedUnitLeaseService } from '../services/embed-unit-lease.service';

export class EmbedResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @Inject(IReferencedUnitManagerService) private readonly _referencedUnitManagerService: IReferencedUnitManagerService,
        @Inject(EmbedModelService)
        private readonly _embedModelService: EmbedModelService,
        @Inject(EmbedUnitLeaseService) private readonly _unitLeaseService: EmbedUnitLeaseService
    ) {
        super();

        this._initResource();
    }

    private _initResource(): void {
        this.disposeWithMe(this._resourceManagerService.registerPluginResource<IEmbedResource>({
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
            onUnLoad: (unitId) => this._unloadUnit(unitId),
        }));
    }

    private _unloadUnit(unitId: string): void {
        this._embedModelService.unloadUnit(unitId);
        this._unitLeaseService.releaseUnit(unitId);
        this._referencedUnitManagerService.releaseUnit(unitId);
    }
}

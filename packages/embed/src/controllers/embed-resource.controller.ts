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

import type { IResourceManagerService } from '@univerjs/core';
import type { EmbedModelService } from '../services/embed-model.service';
import type { IEmbedResource } from '../types/embed';
import { Disposable, IResourceManagerService as IResourceManagerServiceToken, UniverInstanceType } from '@univerjs/core';
import { EMBED_RESOURCE_PLUGIN_NAME } from '../common/const';

export class EmbedResourceController extends Disposable {
    constructor(
        @IResourceManagerServiceToken private readonly _resourceManagerService: IResourceManagerService,
        private readonly _embedModelService: EmbedModelService
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
            onUnLoad: (unitId) => this._embedModelService.unloadUnit(unitId),
        }));
    }
}

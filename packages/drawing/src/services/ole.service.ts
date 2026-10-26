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

import type { IOleResource } from '../models/ole-model';
import { Disposable, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { OLE_RESOURCE_NAME, parseOleResource } from '../models/ole-model';

/** Registered by the model plugin so headless save/export preserves original files too. */
export class OleService extends Disposable {
    private readonly _resources = new Map<string, IOleResource>();

    constructor(@IResourceManagerService resourceManager: IResourceManagerService) {
        super();
        this.disposeWithMe(resourceManager.registerPluginResource<IOleResource>({
            pluginName: OLE_RESOURCE_NAME,
            businesses: [UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE],
            onLoad: (unitId, resource) => this._resources.set(unitId, resource),
            onUnLoad: (unitId) => this._resources.delete(unitId),
            toJson: (unitId) => JSON.stringify(this._resources.get(unitId) ?? { version: 1, files: {}, objects: {} }),
            parseJson: parseOleResource,
        }));
    }

    getResource(unitId: string): IOleResource | undefined {
        return this._resources.get(unitId);
    }

    override dispose(): void {
        this._resources.clear();
        super.dispose();
    }
}

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

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedHostAnchorRecord } from '../types/host-anchor';
import { Inject } from '@univerjs/core';
import { EmbedModelService } from '@univerjs/embed';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from './embed-host-anchor-model.service';

export interface IEmbedHostRestoreContext {
    descriptor: IEmbedDescriptor;
    hostAnchorRecord?: IEmbedHostAnchorRecord;
    hostContext?: Record<string, unknown>;
}

export class EmbedHostRestoreService {
    constructor(
        @Inject(EmbedModelService) private readonly _modelService: EmbedModelService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService
    ) {
        // noop
    }

    restoreEmbed(context: IEmbedHostRestoreContext): IEmbedDescriptor {
        const descriptor = context.descriptor;
        const record = context.hostAnchorRecord ?? this._hostAdapterRegistry.restoreAnchor({
            embedId: descriptor.embedId,
            hostUnitId: descriptor.hostUnitId,
            hostType: descriptor.hostType,
            entry: descriptor.entry,
            hostAnchorId: descriptor.hostAnchorId,
            hostContext: context.hostContext,
            descriptor,
        });

        this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
        this._anchorModelService.setAnchor(record);

        return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
    }
}

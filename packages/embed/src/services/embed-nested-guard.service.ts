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

import type { IEmbedCreateContext } from '../types/embed';
import { Inject } from '@univerjs/core';
import { EmbedCapabilityRegistryService } from './embed-capability-registry.service';

export class EmbedNestedGuardService {
    constructor(
        @Inject(EmbedCapabilityRegistryService)
        private readonly _capabilityRegistry: EmbedCapabilityRegistryService
    ) {
        // noop
    }

    assertCanCreate(context: IEmbedCreateContext): void {
        if (context.parentEmbedId) {
            throw new Error('NESTED_EMBED_NOT_SUPPORTED');
        }

        const childType = context.source.kind === 'empty'
            ? context.source.unitType
            : undefined;

        if (childType && !this._capabilityRegistry.getCapability({
            hostType: context.hostType,
            childType,
            entry: context.entry,
        })) {
            throw new Error('EMBED_CAPABILITY_NOT_SUPPORTED');
        }
    }
}

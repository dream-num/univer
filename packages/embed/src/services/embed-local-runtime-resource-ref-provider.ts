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

import type { Injector, UniverInstanceType } from '@univerjs/core';
import type { ResourceRefInput } from '../types/resource-ref';
import type { IEmbedResourceRefProviderRegistration } from './embed-resource-ref-provider-registry.service';
import { IUniverInstanceService } from '@univerjs/core';
import { getResourceRefInputUnitSelector } from '../common/resource-ref-input';
import { toResourceRefUnitType } from '../common/unit-type';

export const LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_ID = 'local-runtime-resource-ref-provider';
export const LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY = -100;

export function createLocalRuntimeResourceRefProvider(injector: Injector): IEmbedResourceRefProviderRegistration {
    return {
        registrationId: LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_ID,
        match: {
            uriReference: true,
            fileKinds: ['self'],
            unitTypes: ['sheet', 'doc', 'slide', 'base'],
        },
        priority: LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY,
        provider: {
            ensure: (input) => {
                assertLocalRuntimeRef(input.ref);
                if (typeof input.ref !== 'string') {
                    assertLocalRuntimeRefUnitType(input.ref, input.unitType);
                }

                const unit = injector.get(IUniverInstanceService).getUnit(getResourceRefInputUnitSelector(input.ref), input.unitType);
                if (!unit) {
                    throw new Error('LOCAL_RUNTIME_RESOURCE_REF_UNIT_NOT_FOUND');
                }

                return {
                    unitId: unit.getUnitId(),
                    unitType: input.unitType,
                };
            },
        },
    };
}

function assertLocalRuntimeRef(ref: ResourceRefInput): asserts ref is ResourceRefInput {
    if (typeof ref !== 'string' && ref.file.kind !== 'self') {
        throw new Error('LOCAL_RUNTIME_RESOURCE_REF_UNSUPPORTED');
    }
}

function assertLocalRuntimeRefUnitType(ref: Exclude<ResourceRefInput, string>, unitType: UniverInstanceType): void {
    if (ref.unit.type !== toResourceRefUnitType(unitType)) {
        throw new Error('LOCAL_RUNTIME_RESOURCE_REF_UNIT_TYPE_MISMATCH');
    }
}

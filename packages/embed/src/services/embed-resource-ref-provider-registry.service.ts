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

import type { ICreateUnitOptions, IDisposable, UniverInstanceType } from '@univerjs/core';
import type { IReferencedUnitOwner } from '../types/referenced-unit';
import type { ResourceRefFile, ResourceRefInput, ResourceRefUnitType } from '../types/resource-ref';
import { toDisposable } from '@univerjs/core';
import { parseResourceRef } from '../common/resource-ref-uri';

export interface IEmbedResourceRefEnsureInput {
    ref: string;
    refKey: string;
    owner?: IReferencedUnitOwner;
    unitType: UniverInstanceType;
    createOptions: ICreateUnitOptions;
    signal?: AbortSignal;
}

export interface IReferencedUnitLoadResult {
    unitId: string;
    unitType: UniverInstanceType;
}

export interface IEmbedResourceRefProvider {
    ensure: (input: IEmbedResourceRefEnsureInput) => IReferencedUnitLoadResult | Promise<IReferencedUnitLoadResult>;
}

export interface IEmbedResourceRefProviderMatch {
    uriReference?: boolean;
    fileKinds?: readonly ResourceRefFile['kind'][];
    uriSchemes?: readonly string[];
    unitTypes?: readonly ResourceRefUnitType[];
}

export interface IEmbedResourceRefProviderRegistration {
    registrationId: string;
    match: IEmbedResourceRefProviderMatch;
    priority?: number;
    provider: IEmbedResourceRefProvider;
}

export class EmbedResourceRefProviderRegistryService {
    private readonly _registrations: IEmbedResourceRefProviderRegistration[] = [];

    register(registration: IEmbedResourceRefProviderRegistration): IDisposable {
        if (this._registrations.some((item) => item.registrationId === registration.registrationId)) {
            throw new Error(`Embed IResourceRef provider already registered: ${registration.registrationId}`);
        }

        this._registrations.push(registration);
        return toDisposable(() => {
            const index = this._registrations.indexOf(registration);
            if (index >= 0) {
                this._registrations.splice(index, 1);
            }
        });
    }

    get(ref: ResourceRefInput, unitType?: ResourceRefUnitType): IEmbedResourceRefProviderRegistration | undefined {
        const matches = this._registrations.filter((registration) => this._matches(registration.match, ref, unitType));
        if (matches.length === 0) {
            return undefined;
        }

        const maxPriority = Math.max(...matches.map((registration) => registration.priority ?? 0));
        const topMatches = matches.filter((registration) => (registration.priority ?? 0) === maxPriority);
        if (topMatches.length > 1) {
            throw new Error('REFERENCED_UNIT_PROVIDER_CONFLICT');
        }

        return topMatches[0];
    }

    list(): IEmbedResourceRefProviderRegistration[] {
        return [...this._registrations];
    }

    private _matches(match: IEmbedResourceRefProviderMatch, ref: ResourceRefInput, unitType?: ResourceRefUnitType): boolean {
        if (typeof ref === 'string') {
            if (!match.uriReference) {
                return false;
            }

            return this._matches(match, parseResourceRef(ref), unitType);
        }

        if (match.fileKinds && !match.fileKinds.includes(ref.file.kind)) {
            return false;
        }

        if (match.uriSchemes) {
            if (ref.file.kind !== 'uri') {
                return false;
            }

            const scheme = getUriScheme(ref.file.uri);
            if (!scheme || !match.uriSchemes.some((item) => item.toLowerCase() === scheme)) {
                return false;
            }
        }

        if (match.unitTypes && !match.unitTypes.includes(ref.unit.type)) {
            return false;
        }

        return true;
    }
}

function getUriScheme(uri: string): string | undefined {
    return /^([a-z][a-z0-9+.-]*):/i.exec(uri)?.[1]?.toLowerCase();
}

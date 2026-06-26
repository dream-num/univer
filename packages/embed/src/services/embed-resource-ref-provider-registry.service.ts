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
import type { IResourceRef, ResourceRefFile, ResourceRefUnitType } from '../types/resource-ref';
import { toDisposable } from '@univerjs/core';

export type EmbedResourceRefMaterializationProfile = 'embed-child';

export interface IEmbedResourceRefEnsureInput {
    ref: IResourceRef;
    hostUnitId?: string;
    embedId?: string;
    expectedType: UniverInstanceType;
    profile: EmbedResourceRefMaterializationProfile;
    createOptions: ICreateUnitOptions;
}

export interface IEmbedResourceRefEnsureResult {
    unitId: string;
    unitType: UniverInstanceType;
}

export interface IEmbedResourceRefProvider {
    ensure: (input: IEmbedResourceRefEnsureInput) => IEmbedResourceRefEnsureResult | Promise<IEmbedResourceRefEnsureResult>;
}

export interface IEmbedResourceRefProviderMatch {
    fileKinds?: readonly ResourceRefFile['kind'][];
    uriSchemes?: readonly string[];
    unitTypes?: readonly ResourceRefUnitType[];
}

export interface IEmbedResourceRefProviderRegistration {
    registrationId: string;
    match: IEmbedResourceRefProviderMatch;
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

    get(ref: IResourceRef): IEmbedResourceRefProviderRegistration | undefined {
        const matches = this._registrations.filter((registration) => this._matches(registration.match, ref));
        if (matches.length > 1) {
            throw new Error('PROVIDER_CONFLICT');
        }

        return matches[0];
    }

    list(): IEmbedResourceRefProviderRegistration[] {
        return [...this._registrations];
    }

    private _matches(match: IEmbedResourceRefProviderMatch, ref: IResourceRef): boolean {
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

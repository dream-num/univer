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

import type {
    ICreateUnitOptions,
    IDisposable,
    IReferencedUnitReadDataResult,
    ReferencedUnitDataType,
    ResourceRef,
    ResourceRefFile,
    ResourceRefPart,
    ResourceRefUnitType,
    UniverInstanceType,
} from '@univerjs/core';
import { ReferencedUnitError, ReferencedUnitErrorCode, toDisposable } from '@univerjs/core';

export interface IEmbedResourceRefEnsureUnitInput {
    ref: ResourceRef;
    unitType: UniverInstanceType;
    createOptions: ICreateUnitOptions;
    signal?: AbortSignal;
}

export interface IReferencedUnitLoadResult {
    unitId: string;
    unitType: UniverInstanceType;
}

export interface IEmbedResourceRefUnitProvider {
    ensureUnit: (input: IEmbedResourceRefEnsureUnitInput) => IReferencedUnitLoadResult | Promise<IReferencedUnitLoadResult>;
}

export interface IEmbedResourceRefReadDataInput {
    ref: ResourceRef;
    unitType: UniverInstanceType;
    dataType: ReferencedUnitDataType;
    selector: ResourceRefPart;
    signal?: AbortSignal;
}

export interface IEmbedResourceRefDataProvider {
    readData: (input: IEmbedResourceRefReadDataInput) => IReferencedUnitReadDataResult | Promise<IReferencedUnitReadDataResult>;
}

export interface IEmbedResourceRefProviderMatch {
    fileKinds?: readonly ResourceRefFile['kind'][];
    uriSchemes?: readonly string[];
    unitTypes?: readonly ResourceRefUnitType[];
}

export interface IEmbedResourceRefUnitProviderRegistration {
    registrationId: string;
    match: IEmbedResourceRefProviderMatch;
    priority?: number;
    provider: IEmbedResourceRefUnitProvider;
}

export interface IEmbedResourceRefDataProviderRegistration {
    registrationId: string;
    match: IEmbedResourceRefProviderMatch;
    priority?: number;
    provider: IEmbedResourceRefDataProvider;
}

export class EmbedResourceRefProviderRegistryService {
    private readonly _unitRegistrations: IEmbedResourceRefUnitProviderRegistration[] = [];
    private readonly _dataRegistrations: IEmbedResourceRefDataProviderRegistration[] = [];

    registerUnitProvider(registration: IEmbedResourceRefUnitProviderRegistration): IDisposable {
        return this._register(this._unitRegistrations, registration, 'unit');
    }

    registerDataProvider(registration: IEmbedResourceRefDataProviderRegistration): IDisposable {
        return this._register(this._dataRegistrations, registration, 'data');
    }

    getUnitProvider(ref: ResourceRef, unitType?: ResourceRefUnitType): IEmbedResourceRefUnitProviderRegistration | undefined {
        return this._get(this._unitRegistrations, ref, unitType, 'unit');
    }

    getDataProvider(ref: ResourceRef, unitType?: ResourceRefUnitType): IEmbedResourceRefDataProviderRegistration | undefined {
        return this._get(this._dataRegistrations, ref, unitType, 'data');
    }

    listUnitProviders(): IEmbedResourceRefUnitProviderRegistration[] {
        return [...this._unitRegistrations];
    }

    listDataProviders(): IEmbedResourceRefDataProviderRegistration[] {
        return [...this._dataRegistrations];
    }

    private _register<TRegistration extends { registrationId: string }>(
        registrations: TRegistration[],
        registration: TRegistration,
        capability: 'unit' | 'data'
    ): IDisposable {
        if (registrations.some((item) => item.registrationId === registration.registrationId)) {
            throw new Error(`Embed ResourceRef ${capability} provider already registered: ${registration.registrationId}`);
        }

        registrations.push(registration);
        return toDisposable(() => {
            const index = registrations.indexOf(registration);
            if (index >= 0) {
                registrations.splice(index, 1);
            }
        });
    }

    private _get<TRegistration extends { match: IEmbedResourceRefProviderMatch; priority?: number }>(
        registrations: TRegistration[],
        ref: ResourceRef,
        unitType: ResourceRefUnitType | undefined,
        capability: 'unit' | 'data'
    ): TRegistration | undefined {
        const matches = registrations.filter((registration) => this._matches(registration.match, ref, unitType));
        if (matches.length === 0) {
            return undefined;
        }

        const maxPriority = Math.max(...matches.map((registration) => registration.priority ?? 0));
        const topMatches = matches.filter((registration) => (registration.priority ?? 0) === maxPriority);
        if (topMatches.length > 1) {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.ProviderConflict, {
                capability,
                registrationIds: topMatches.map((registration) => 'registrationId' in registration ? registration.registrationId : undefined),
            });
        }

        return topMatches[0];
    }

    private _matches(match: IEmbedResourceRefProviderMatch, ref: ResourceRef, unitType?: ResourceRefUnitType): boolean {
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

        if (match.unitTypes && !match.unitTypes.includes(unitType ?? ref.unit.type)) {
            return false;
        }

        return true;
    }
}

function getUriScheme(uri: string): string | undefined {
    return /^([a-z][a-z0-9+.-]*):/i.exec(uri)?.[1]?.toLowerCase();
}

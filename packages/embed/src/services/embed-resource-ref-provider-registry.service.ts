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

import type { UniverInstanceType } from '@univerjs/core';
import type { IResourceRef, ResourceRefFile } from '../types/resource-ref';

export interface IEmbedResourceRefResolveResult {
    unitId: string;
    unitType: UniverInstanceType;
    ref?: IResourceRef;
}

export interface IEmbedResourceRefProvider {
    fileKind: ResourceRefFile['kind'];
    resolve: (ref: IResourceRef) => IEmbedResourceRefResolveResult | Promise<IEmbedResourceRefResolveResult>;
}

export class EmbedResourceRefProviderRegistryService {
    private readonly _providers = new Map<ResourceRefFile['kind'], IEmbedResourceRefProvider>();

    register(provider: IEmbedResourceRefProvider): void {
        if (this._providers.has(provider.fileKind)) {
            throw new Error(`Embed IResourceRef provider already registered: ${provider.fileKind}`);
        }

        this._providers.set(provider.fileKind, provider);
    }

    get(fileKind: ResourceRefFile['kind']): IEmbedResourceRefProvider | undefined {
        return this._providers.get(fileKind);
    }

    list(): IEmbedResourceRefProvider[] {
        return [...this._providers.values()];
    }
}

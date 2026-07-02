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

import type { IReferencedUnitApiResolverRegistration } from '../services/embed-referenced-unit-api-resolver-registry.service';
import type { IEmbedResourceRefProviderRegistration } from '../services/embed-resource-ref-provider-registry.service';
import type { IEmbedCapability } from '../types/embed';
import type { IEmbedHostAdapterContribution } from '../types/host-adapter';

export const EMBED_PLUGIN_CONFIG_KEY = 'embed.config';

export const configSymbol = Symbol(EMBED_PLUGIN_CONFIG_KEY);

export interface IUniverEmbedPluginConfig {
    useDefaultCapabilities?: boolean;
    capabilities?: readonly IEmbedCapability[];
    hostAdapters?: readonly IEmbedHostAdapterContribution[];
    resourceRefProviderRegistrations?: readonly IEmbedResourceRefProviderRegistration[];
    referencedUnitApiResolvers?: readonly IReferencedUnitApiResolverRegistration[];
}

export type EmbedProductPluginConfig = Partial<IUniverEmbedPluginConfig>;

export const defaultPluginConfig: IUniverEmbedPluginConfig = {};

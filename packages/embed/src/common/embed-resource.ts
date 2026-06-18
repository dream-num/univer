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

import type { IResources } from '@univerjs/core';
import type { IEmbedResource } from '../types/embed';
import { EMBED_RESOURCE_PLUGIN_NAME } from './const';

export function createEmptyEmbedResource(): IEmbedResource {
    return {
        version: 1,
        embeds: {},
    };
}

export function cloneEmbedResource(resource: IEmbedResource | undefined | null): IEmbedResource {
    return JSON.parse(JSON.stringify(resource ?? createEmptyEmbedResource())) as IEmbedResource;
}

export function createEmbedResourceEntry(resource: IEmbedResource): IResources[number] {
    return {
        name: EMBED_RESOURCE_PLUGIN_NAME,
        data: JSON.stringify(resource),
    };
}

export function getEmbedResourceEntry(resources: IResources | undefined | null): IResources[number] | undefined {
    return resources?.find((resource) => resource.name === EMBED_RESOURCE_PLUGIN_NAME);
}

export function parseEmbedResourceEntry(entry: IResources[number] | undefined | null): IEmbedResource | undefined {
    if (!entry?.data) {
        return undefined;
    }

    const parsed = JSON.parse(entry.data) as Partial<IEmbedResource>;
    return {
        version: 1,
        embeds: { ...parsed.embeds },
    };
}

export function upsertEmbedResourceEntry(resources: IResources | undefined | null, resource: IEmbedResource): IResources {
    const next = [...(resources ?? [])].filter((entry) => entry.name !== EMBED_RESOURCE_PLUGIN_NAME);
    next.push(createEmbedResourceEntry(resource));
    return next;
}

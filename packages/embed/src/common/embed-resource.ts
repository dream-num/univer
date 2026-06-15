import type { IResources } from '@univerjs/core';
import type { EmbedResource } from '../types/embed';
import { EMBED_RESOURCE_PLUGIN_NAME } from './const';

export function createEmptyEmbedResource(): EmbedResource {
    return {
        version: 1,
        embeds: {},
    };
}

export function cloneEmbedResource(resource: EmbedResource | undefined | null): EmbedResource {
    return JSON.parse(JSON.stringify(resource ?? createEmptyEmbedResource())) as EmbedResource;
}

export function createEmbedResourceEntry(resource: EmbedResource): IResources[number] {
    return {
        name: EMBED_RESOURCE_PLUGIN_NAME,
        data: JSON.stringify(resource),
    };
}

export function getEmbedResourceEntry(resources: IResources | undefined | null): IResources[number] | undefined {
    return resources?.find((resource) => resource.name === EMBED_RESOURCE_PLUGIN_NAME);
}

export function parseEmbedResourceEntry(entry: IResources[number] | undefined | null): EmbedResource | undefined {
    if (!entry?.data) {
        return undefined;
    }

    const parsed = JSON.parse(entry.data) as Partial<EmbedResource>;
    return {
        version: 1,
        embeds: { ...(parsed.embeds ?? {}) },
    };
}

export function upsertEmbedResourceEntry(resources: IResources | undefined | null, resource: EmbedResource): IResources {
    const next = [...(resources ?? [])].filter((entry) => entry.name !== EMBED_RESOURCE_PLUGIN_NAME);
    next.push(createEmbedResourceEntry(resource));
    return next;
}

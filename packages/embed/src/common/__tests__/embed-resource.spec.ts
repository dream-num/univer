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
import { describe, expect, it } from 'vitest';
import { EMBED_RESOURCE_PLUGIN_NAME } from '../const';
import {
    createEmbedResourceEntry,
    createEmptyEmbedResource,
    getEmbedResourceEntry,
    parseEmbedResourceEntry,
    upsertEmbedResourceEntry,
} from '../embed-resource';

describe('embed resource helpers', () => {
    it('creates a single canonical embed resource entry', () => {
        const resource = createEmptyEmbedResource();
        const entry = createEmbedResourceEntry(resource);

        expect(entry.name).toBe(EMBED_RESOURCE_PLUGIN_NAME);
        expect(JSON.parse(entry.data)).toEqual(resource);
    });

    it('finds and parses the canonical embed resource entry', () => {
        const resources: IResources = [
            { name: 'OTHER_PLUGIN', data: '{}' },
            createEmbedResourceEntry({
                version: 1,
                embeds: {
                    'embed-1': { embedId: 'embed-1' } as never,
                },
            }),
        ];

        const entry = getEmbedResourceEntry(resources);

        expect(entry?.name).toBe(EMBED_RESOURCE_PLUGIN_NAME);
        expect(parseEmbedResourceEntry(entry)).toEqual({
            version: 1,
            embeds: {
                'embed-1': { embedId: 'embed-1' },
            },
        });
    });

    it('upserts the canonical embed resource without duplicating plugin entries', () => {
        const next = upsertEmbedResourceEntry([
            createEmbedResourceEntry({ version: 1, embeds: { old: { embedId: 'old' } as never } }),
            { name: 'OTHER_PLUGIN', data: '{}' },
        ], {
            version: 1,
            embeds: {
                next: { embedId: 'next' } as never,
            },
        });

        expect(next.map((entry) => entry.name)).toEqual(['OTHER_PLUGIN', EMBED_RESOURCE_PLUGIN_NAME]);
        expect(parseEmbedResourceEntry(getEmbedResourceEntry(next))).toEqual({
            version: 1,
            embeds: {
                next: { embedId: 'next' },
            },
        });
    });
});

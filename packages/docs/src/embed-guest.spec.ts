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

import { DocumentFlavor, UniverInstanceType } from '@univerjs/core';
import { EmbedCapabilityRegistryService, EmbedGuestContributionRegistryService } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { createDocsEmbedEmptySnapshot, registerDocsEmbedGuestContribution, registerDocsEmbedHostCapabilities } from './embed-guest';

describe('docs embed guest', () => {
    it('creates modern default docs snapshots with config overrides', () => {
        const snapshot = createDocsEmbedEmptySnapshot({
            documentStyle: { pageSize: { width: 800 } },
            id: 'doc-1',
            title: 'Embedded Doc',
        });

        expect(snapshot).toMatchObject({
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 800 },
            },
            id: 'doc-1',
            title: 'Embedded Doc',
        });
    });

    it('registers docs host capabilities', () => {
        const capabilityRegistry = new EmbedCapabilityRegistryService();
        registerDocsEmbedHostCapabilities(createInjector([
            [EmbedCapabilityRegistryService, capabilityRegistry],
        ]) as never);

        expect(capabilityRegistry.list().map(({ childType, entry, layout, mode }) => ({ childType, entry, layout, mode }))).toEqual([
            { childType: UniverInstanceType.UNIVER_SHEET, entry: 'docs-custom-block', layout: 'docs-sticky-sheet', mode: 'float' },
            { childType: UniverInstanceType.UNIVER_BASE, entry: 'docs-custom-block', layout: 'docs-sticky-base', mode: 'float' },
            { childType: UniverInstanceType.UNIVER_SLIDE, entry: 'docs-custom-block', layout: 'aspect-fit', mode: 'float' },
        ]);
    });

    it('registers docs guest marker', () => {
        const guestRegistry = new EmbedGuestContributionRegistryService();
        registerDocsEmbedGuestContribution(createInjector([
            [EmbedGuestContributionRegistryService, guestRegistry],
        ]) as never);

        expect(guestRegistry.get(UniverInstanceType.UNIVER_DOC)).toEqual({
            childType: UniverInstanceType.UNIVER_DOC,
        });
    });
});

function createInjector(entries: Array<[unknown, unknown]>) {
    const map = new Map(entries);
    return {
        get: vi.fn((token: unknown) => map.get(token)),
        has: vi.fn((token: unknown) => map.has(token)),
    };
}

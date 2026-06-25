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

import { BooleanNumber, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedCapabilityRegistryService, EmbedGuestContributionRegistryService } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsEmbedEmptySnapshot, registerSheetsEmbedGuestContribution, registerSheetsEmbedHostCapabilities } from './embed-guest';

describe('sheets embed guest', () => {
    it('creates default workbook snapshots with one visible worksheet', () => {
        const snapshot = createSheetsEmbedEmptySnapshot({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetId: 'sheet-child-grid',
            sheetName: 'Budget',
        });

        expect(snapshot).toMatchObject({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetOrder: ['sheet-child-grid'],
            sheets: {
                'sheet-child-grid': {
                    columnCount: 20,
                    columnHeader: { hidden: BooleanNumber.FALSE },
                    id: 'sheet-child-grid',
                    name: 'Budget',
                    rowCount: 100,
                    rowHeader: { hidden: BooleanNumber.FALSE },
                    showGridlines: BooleanNumber.TRUE,
                },
            },
        });
    });

    it('registers sheets host capabilities for floating objects and sheet tabs', () => {
        const capabilityRegistry = new EmbedCapabilityRegistryService();
        registerSheetsEmbedHostCapabilities(createInjector([
            [EmbedCapabilityRegistryService, capabilityRegistry],
        ]) as never);

        expect(capabilityRegistry.list().map(({ childType, entry, layout, mode }) => ({ childType, entry, layout, mode }))).toEqual([
            { childType: UniverInstanceType.UNIVER_DOC, entry: 'sheets-floating-object', layout: 'doc-width-scale', mode: 'float' },
            { childType: UniverInstanceType.UNIVER_SLIDE, entry: 'sheets-floating-object', layout: 'aspect-fit', mode: 'float' },
            { childType: UniverInstanceType.UNIVER_BASE, entry: 'sheets-floating-object', layout: 'scroll-contained', mode: 'float' },
            { childType: UniverInstanceType.UNIVER_BASE, entry: 'sheets-sheet-tab', layout: 'tab-peer', mode: 'tab' },
            { childType: UniverInstanceType.UNIVER_DOC, entry: 'sheets-sheet-tab', layout: 'tab-peer', mode: 'tab' },
            { childType: UniverInstanceType.UNIVER_SLIDE, entry: 'sheets-sheet-tab', layout: 'tab-peer', mode: 'tab' },
        ]);
    });

    it('registers sheets guest creation when instance service is available', () => {
        const guestRegistry = new EmbedGuestContributionRegistryService();
        const createUnit = vi.fn(() => ({ getUnitId: () => 'sheet-child' }));
        registerSheetsEmbedGuestContribution(createInjector([
            [EmbedGuestContributionRegistryService, guestRegistry],
            [IUniverInstanceService, { createUnit }],
        ]) as never);

        const contribution = guestRegistry.get(UniverInstanceType.UNIVER_SHEET);
        expect(contribution).toBeDefined();
        expect(contribution?.createEmptyUnit!({ id: 'sheet-child' }, { from: 'embed' } as never)).toEqual({
            unitId: 'sheet-child',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(createUnit).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_SHEET,
            expect.objectContaining({ id: 'sheet-child' }),
            { from: 'embed' }
        );

        const emptyRegistry = new EmbedGuestContributionRegistryService();
        registerSheetsEmbedGuestContribution(createInjector([
            [EmbedGuestContributionRegistryService, emptyRegistry],
        ]) as never);
        expect(emptyRegistry.list()).toEqual([]);
    });
});

function createInjector(entries: Array<[unknown, unknown]>) {
    const map = new Map(entries);
    return {
        get: vi.fn((token: unknown) => map.get(token)),
        has: vi.fn((token: unknown) => map.has(token)),
    };
}

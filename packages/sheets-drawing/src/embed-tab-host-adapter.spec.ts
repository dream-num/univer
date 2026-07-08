import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsSheetTabHostAdapterContribution, registerSheetsSheetTabEmbedHostAdapters } from './embed-tab-host-adapter';

describe('sheets sheet-tab embed host adapter compatibility', () => {
    it('keeps old registration API as a no-op', () => {
        expect(() => registerSheetsSheetTabEmbedHostAdapters()).not.toThrow();
    });

    it('keeps the old factory export while moving the implementation to pro embed', () => {
        const adapter = createSheetsSheetTabHostAdapterContribution();

        expect(adapter).toMatchObject({
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
        });
        expect(() => adapter.createAnchorPlan()).toThrow('EMBED_SHEETS_TAB_ANCHOR_MOVED_TO_PRO_EMBED');
    });
});

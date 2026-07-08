import { UniverInstanceType } from '@univerjs/core';

export function registerSheetsSheetTabEmbedHostAdapters(): void {}

export function createSheetsSheetTabHostAdapterContribution(..._args: unknown[]): {
    hostType: UniverInstanceType;
    entry: 'sheets-sheet-tab';
    createAnchorPlan: (..._args: unknown[]) => never;
} {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        createAnchorPlan: () => {
            throw new Error('EMBED_SHEETS_TAB_ANCHOR_MOVED_TO_PRO_EMBED');
        },
    };
}

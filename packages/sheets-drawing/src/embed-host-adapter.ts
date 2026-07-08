import { UniverInstanceType } from '@univerjs/core';

export function registerSheetsDrawingEmbedHostAdapters(): void {}

export function createSheetsFloatingObjectHostAdapterContribution(..._args: unknown[]): {
    hostType: UniverInstanceType;
    entry: 'sheets-floating-object';
    createAnchorPlan: (..._args: unknown[]) => never;
} {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        createAnchorPlan: () => {
            throw new Error('EMBED_SHEETS_FLOATING_ANCHOR_MOVED_TO_PRO_EMBED');
        },
    };
}

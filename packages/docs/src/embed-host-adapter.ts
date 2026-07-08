import { UniverInstanceType } from '@univerjs/core';

export function createDocsCustomBlockHostAdapterContribution(..._args: unknown[]): {
    hostType: UniverInstanceType;
    entry: 'docs-custom-block';
    createAnchorPlan: (..._args: unknown[]) => never;
} {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        createAnchorPlan: () => {
            throw new Error('EMBED_DOCS_CUSTOM_BLOCK_ANCHOR_MOVED_TO_PRO_EMBED');
        },
    };
}

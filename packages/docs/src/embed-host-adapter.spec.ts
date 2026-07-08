import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createDocsCustomBlockHostAdapterContribution } from './embed-host-adapter';

describe('docs custom block host adapter compatibility', () => {
    it('keeps the old factory export while moving the implementation to pro embed', () => {
        const adapter = createDocsCustomBlockHostAdapterContribution();

        expect(adapter).toMatchObject({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        });
        expect(() => adapter.createAnchorPlan()).toThrow('EMBED_DOCS_CUSTOM_BLOCK_ANCHOR_MOVED_TO_PRO_EMBED');
    });
});

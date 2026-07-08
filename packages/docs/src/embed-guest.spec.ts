import { DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createDocsEmbedEmptySnapshot, registerDocsEmbedHostCapabilities } from './embed-guest';

describe('docs embed guest compatibility', () => {
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

    it('keeps the old capability registration API as a no-op', () => {
        expect(() => registerDocsEmbedHostCapabilities({} as never)).not.toThrow();
    });
});

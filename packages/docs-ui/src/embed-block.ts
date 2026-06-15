import type { EmbedBlockContribution, EmbedChildViewContribution } from '@univerjs/embed-ui';
import { createEmbedRenderChildViewContribution, createEmbedRibbonBlockContribution } from '@univerjs/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';

export function createDocsEmbedBlockContribution(): EmbedBlockContribution {
    return createEmbedRibbonBlockContribution({
        childType: UniverInstanceType.UNIVER_DOC,
        productName: 'Docs',
    });
}

export function createDocsEmbedChildViewContribution(): EmbedChildViewContribution {
    return createEmbedRenderChildViewContribution({
        childType: UniverInstanceType.UNIVER_DOC,
        supportedLayouts: ['tab-peer', 'doc-width-scale', 'scroll-contained'],
        renderManagerService: IRenderManagerService,
    });
}

import type { EmbedBlockContribution, EmbedChildViewContribution, EmbedProductMenuContribution } from '@univerjs/embed-ui';
import { createEmbedRenderChildViewContribution, createEmbedRibbonBlockContribution } from '@univerjs/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { menuSchema } from './menu/schema';

export function createDocsEmbedBlockContribution(): EmbedBlockContribution {
    return createEmbedRibbonBlockContribution({
        childType: UniverInstanceType.UNIVER_DOC,
        productName: 'Docs',
        menuSchema,
    });
}

export function createDocsEmbedProductMenuContribution(): EmbedProductMenuContribution {
    return {
        childType: UniverInstanceType.UNIVER_DOC,
        id: '@univerjs/docs-ui',
        menuSchema,
    };
}

export function createDocsEmbedChildViewContribution(): EmbedChildViewContribution {
    return createEmbedRenderChildViewContribution({
        childType: UniverInstanceType.UNIVER_DOC,
        supportedLayouts: ['tab-peer', 'doc-width-scale', 'scroll-contained'],
        renderManagerService: IRenderManagerService,
    });
}

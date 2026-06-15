import type { EmbedBlockContribution, EmbedChildViewContribution } from '@univerjs/embed-ui';
import { createEmbedRibbonBlockContribution, mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';

export function createSheetsEmbedBlockContribution(): EmbedBlockContribution {
    return createEmbedRibbonBlockContribution({
        childType: UniverInstanceType.UNIVER_SHEET,
        productName: 'Sheets',
    });
}

export function createSheetsEmbedChildViewContribution(): EmbedChildViewContribution {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        supportedLayouts: ['tab-peer', 'docs-sticky-sheet', 'scroll-contained'],
        mount: (context) => {
            let disposed = false;
            let frame = 0;
            let renderDisposable = toDisposable(() => {});
            const rootElement = context.renderScope.rootElement;

            rootElement.dataset.embedChildRenderUnitId = context.childUnitId;
            rootElement.dataset.embedChildRenderMode = 'sheet-workbench';

            const remount = () => {
                if (disposed) {
                    return;
                }

                const canvas = rootElement.querySelector('canvas[data-u-comp="render-canvas"]');
                if (!canvas || canvas.parentElement !== rootElement) {
                    renderDisposable.dispose();
                    renderDisposable = mountEmbedRenderChildUnit(context, IRenderManagerService, rootElement) ?? toDisposable(() => {});
                }

                frame = window.requestAnimationFrame(remount);
            };
            frame = window.requestAnimationFrame(remount);

            return toDisposable(() => {
                disposed = true;
                window.cancelAnimationFrame(frame);
                renderDisposable.dispose();
                if (rootElement.isConnected) {
                    rootElement.removeAttribute('data-embed-child-render-unit-id');
                    rootElement.removeAttribute('data-embed-child-render-mode');
                }
            });
        },
    };
}

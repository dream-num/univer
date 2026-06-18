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

import type { EmbedBlockContribution, EmbedChildViewContribution } from '@univerjs/embed-ui';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { createEmbedRibbonBlockContribution, mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
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
            const rootElement = context.runtimeScope.roots.canvas
                ?? context.renderScope.canvasRoot
                ?? context.renderScope.contentRoot
                ?? context.renderScope.rootElement;

            rootElement.dataset.embedChildRenderUnitId = context.childUnitId;
            rootElement.dataset.embedChildRenderMode = 'sheet-workbench';

            const remount = () => {
                if (disposed) {
                    return;
                }

                const canvas = rootElement.querySelector('canvas');
                if (!canvas || !rootElement.contains(canvas)) {
                    renderDisposable.dispose();
                    renderDisposable = mountEmbedRenderChildUnit(context, IRenderManagerService, rootElement) ?? toDisposable(() => {});
                    const mountedCanvas = rootElement.querySelector('canvas');
                    if (!mountedCanvas || !rootElement.contains(mountedCanvas)) {
                        frame = window.requestAnimationFrame(remount);
                    }
                }
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

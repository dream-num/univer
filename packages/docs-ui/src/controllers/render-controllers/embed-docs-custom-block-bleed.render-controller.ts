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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, UniverInstanceType } from '@univerjs/core';
import { setDocsCustomBlockRenderViewportProvider } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { resolveDocsCustomBlockRenderViewport } from '../../embed-host-anchor';

export class EmbedDocsCustomBlockBleedRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>
    ) {
        super();

        setDocsCustomBlockRenderViewportProvider((unitId, blockId, input) => {
            if (unitId !== this._context.unitId) {
                return null;
            }

            const drawing = this._context.unit.getSnapshot().drawings?.[blockId] as Nullable<{
                data?: { childType?: UniverInstanceType };
            }>;
            const childType = drawing?.data?.childType;
            if (childType !== UniverInstanceType.UNIVER_SHEET && childType !== UniverInstanceType.UNIVER_BASE) {
                return null;
            }

            const visibleCanvas = this._getVisibleCanvasDocumentRect();

            return resolveDocsCustomBlockRenderViewport({
                childType,
                docsLeft: this._getDocsLeft(),
                documentFlavor: this._context.unit.getSnapshot().documentStyle?.documentFlavor,
                fallbackHeight: input.fallbackHeight,
                fallbackWidth: input.fallbackWidth,
                pageMarginLeft: input.pageMarginLeft,
                pageMarginRight: input.pageMarginRight,
                pageWidth: input.pageWidth,
                scale: this._context.scene.getAncestorScale().scaleX || 1,
                visibleCanvasLeft: visibleCanvas?.left,
                visibleCanvasWidth: visibleCanvas?.width,
            });
        });

        this.disposeWithMe({
            dispose: () => setDocsCustomBlockRenderViewportProvider(null),
        });
    }

    private _getDocsLeft(): number {
        return (this._context.mainComponent as Nullable<{ getOffsetConfig?: () => { docsLeft?: number } }>)
            ?.getOffsetConfig?.()
            ?.docsLeft ?? 0;
    }

    private _getVisibleCanvasDocumentRect(): Nullable<{ left: number; width: number }> {
        const scaleX = this._context.scene.getAncestorScale().scaleX || 1;
        const viewportLeft = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)?.viewportScrollX ?? 0;
        const canvasWidth = this._context.engine.getCanvasElement?.()?.getBoundingClientRect?.()?.width;
        const fallbackWidth = (this._context.mainComponent as Nullable<{ width?: number }>)?.width ?? this._context.scene.width;
        const visibleWidth = (canvasWidth ?? fallbackWidth ?? 0) / scaleX;

        if (!visibleWidth || !Number.isFinite(visibleWidth) || visibleWidth <= 0) {
            return null;
        }

        return {
            left: viewportLeft,
            width: visibleWidth,
        };
    }
}

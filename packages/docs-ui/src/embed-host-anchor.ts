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

import type { UniverInstanceType } from '@univerjs/core';
import { DocumentFlavor } from '@univerjs/core';
import { isSheetLikeDocsCustomBlockChildType, resolveDocsCustomBlockSize } from '@univerjs/docs';

const MODERN_DOCS_CUSTOM_BLOCK_VIEWPORT_INSET = 10;

export interface IDocsCustomBlockRenderViewportParams {
    childType?: UniverInstanceType;
    contentHeight?: number;
    contentWidth?: number;
    docsLeft?: number;
    documentFlavor?: DocumentFlavor;
    fallbackHeight?: number;
    fallbackWidth?: number;
    pageMarginLeft?: number;
    pageMarginRight?: number;
    pageWidth?: number;
    scale?: number;
    visibleCanvasHeight?: number;
    visibleCanvasLeft?: number;
    visibleCanvasWidth?: number;
}

export interface IDocsCustomBlockLayoutViewport {
    bleedLeft?: number;
    bleedWidth?: number;
    contentHeight?: number;
    contentWidth?: number;
    height: number;
    layoutWidth?: number;
    offsetLeft?: number;
    viewportHeight?: number;
    width: number;
}

export function resolveDocsCustomBlockRenderViewport(params: IDocsCustomBlockRenderViewportParams): IDocsCustomBlockLayoutViewport {
    const defaultSize = resolveDocsCustomBlockSize(params.childType);
    const fallbackWidth = params.fallbackWidth ?? defaultSize.width;
    const fallbackHeight = params.fallbackHeight ?? defaultSize.height;
    const sheetLike = isSheetLikeDocsCustomBlockChildType(params.childType);
    const contentHeight = Number.isFinite(params.contentHeight) && (params.contentHeight ?? 0) > 0
        ? params.contentHeight!
        : fallbackHeight;
    const visibleCanvasHeight = Number.isFinite(params.visibleCanvasHeight) && (params.visibleCanvasHeight ?? 0) > 0
        ? params.visibleCanvasHeight!
        : undefined;
    const height = sheetLike ? contentHeight : fallbackHeight;
    const viewportHeight = sheetLike && visibleCanvasHeight != null ? Math.min(contentHeight, visibleCanvasHeight) : height;

    if (!sheetLike) {
        return {
            height,
            width: fallbackWidth,
        };
    }

    const pageWidth = params.pageWidth;
    const pageMarginLeft = params.pageMarginLeft ?? 0;
    const pageMarginRight = params.pageMarginRight ?? 0;
    const pageContentWidth = Number.isFinite(pageWidth)
        ? Math.max(0, pageWidth! - pageMarginLeft - pageMarginRight)
        : fallbackWidth;
    const contentWidth = Number.isFinite(params.contentWidth) && (params.contentWidth ?? 0) > 0
        ? params.contentWidth!
        : fallbackWidth;

    if (params.documentFlavor !== DocumentFlavor.MODERN || !Number.isFinite(pageWidth)) {
        const layoutWidth = Math.min(contentWidth, pageContentWidth || contentWidth);
        return {
            contentHeight,
            contentWidth,
            height,
            layoutWidth,
            offsetLeft: 0,
            viewportHeight,
            width: layoutWidth,
        };
    }

    const scale = params.scale && params.scale > 0 ? params.scale : 1;
    const inset = MODERN_DOCS_CUSTOM_BLOCK_VIEWPORT_INSET / scale;
    const docsLeft = params.docsLeft ?? 0;
    const fallbackViewportLeft = docsLeft + inset;
    const fallbackViewportWidth = Math.max(0, pageWidth! - inset * 2);
    const hasVisibleCanvas = Number.isFinite(params.visibleCanvasLeft) &&
        Number.isFinite(params.visibleCanvasWidth) &&
        (params.visibleCanvasWidth ?? 0) > 0;
    const viewportLeft = hasVisibleCanvas ? params.visibleCanvasLeft! + inset : fallbackViewportLeft;
    const viewportWidth = hasVisibleCanvas ? Math.max(0, params.visibleCanvasWidth! - inset * 2) : fallbackViewportWidth;
    const paragraphTextStart = docsLeft + pageMarginLeft;
    const leadingInsetLeft = Math.max(0, paragraphTextStart - viewportLeft);

    const layoutWidth = Math.min(contentWidth, pageContentWidth || contentWidth);

    return {
        bleedLeft: leadingInsetLeft,
        bleedWidth: viewportWidth,
        contentHeight,
        contentWidth,
        height,
        layoutWidth,
        offsetLeft: 0,
        viewportHeight,
        width: layoutWidth,
    };
}

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

import { DocumentFlavor, PositionedObjectLayoutType, UniverInstanceType } from '@univerjs/core';
import {
    createDocsCustomBlockDrawing,
    resolveDocsCustomBlockSize,
    shouldUseInlineTextSelectionForDocsCustomBlockDrawing,
} from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import { resolveDocsCustomBlockRenderViewport } from '../embed-host-anchor';

describe('resolveDocsCustomBlockSize', () => {
    it('uses a taller default size for docs custom blocks', () => {
        expect(resolveDocsCustomBlockSize(UniverInstanceType.UNIVER_DOC)).toEqual({ width: 720, height: 360 });
    });

    it('uses a wider and taller viewport for sheet-like content in docs', () => {
        expect(resolveDocsCustomBlockSize(UniverInstanceType.UNIVER_SHEET)).toEqual({ width: 960, height: 480 });
        expect(resolveDocsCustomBlockSize(UniverInstanceType.UNIVER_BASE)).toEqual({ width: 960, height: 480 });
    });

    it('keeps slide docs blocks at a 16:9 aspect size', () => {
        expect(resolveDocsCustomBlockSize(UniverInstanceType.UNIVER_SLIDE)).toEqual({ width: 720, height: 405 });
    });
});

describe('createDocsCustomBlockDrawing', () => {
    it('writes the resolved size to both doc transform and drawing transform', () => {
        const drawing = createDocsCustomBlockDrawing({
            unitId: 'doc-1',
            blockId: 'block-1',
            startIndex: 0,
            childType: UniverInstanceType.UNIVER_BASE,
        });

        expect(drawing.docTransform?.size).toEqual({ width: 960, height: 480 });
        expect(drawing.transform).toMatchObject({ width: 960, height: 480 });
    });

    it('disables host transformer and text-selection semantics for block embeds by default', () => {
        const drawing = createDocsCustomBlockDrawing({
            unitId: 'doc-1',
            blockId: 'block-1',
            startIndex: 0,
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(drawing.allowTransform).toBe(false);
        expect(drawing.layoutType).toBe(PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM);
        expect(shouldUseInlineTextSelectionForDocsCustomBlockDrawing(drawing)).toBe(false);
    });

    it('allows explicit inline embeds to keep text-selection semantics', () => {
        const drawing = createDocsCustomBlockDrawing({
            unitId: 'doc-1',
            blockId: 'block-1',
            startIndex: 0,
            interactionMode: 'inline',
        });

        expect(drawing.layoutType).toBe(PositionedObjectLayoutType.INLINE);
        expect(shouldUseInlineTextSelectionForDocsCustomBlockDrawing(drawing)).toBe(true);
    });
});

describe('resolveDocsCustomBlockRenderViewport', () => {
    it('keeps non sheet-like custom blocks at their fallback size', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_DOC,
            contentHeight: 1200,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 360,
            fallbackWidth: 720,
            visibleCanvasHeight: 900,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual({ width: 720, height: 360 });
    });

    it('uses the modern visible canvas viewport for sheet-like docs blocks', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_SHEET,
            docsLeft: 120,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            scale: 1,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual({
            bleedLeft: 206,
            bleedWidth: 1420,
            contentHeight: 480,
            contentWidth: 960,
            height: 480,
            layoutWidth: 960,
            offsetLeft: 0,
            viewportHeight: 480,
            width: 960,
        });
    });

    it('uses actual table height for sheet-like docs blocks so docs owns vertical scrolling', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_BASE,
            contentHeight: 720,
            docsLeft: 120,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            scale: 1,
            visibleCanvasHeight: 900,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual(expect.objectContaining({
            contentHeight: 720,
            height: 720,
            viewportHeight: 720,
        }));

        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_BASE,
            contentHeight: 1200,
            docsLeft: 120,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            scale: 1,
            visibleCanvasHeight: 900,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual(expect.objectContaining({
            contentHeight: 1200,
            height: 1200,
            viewportHeight: 900,
        }));
    });

    it('keeps sheet-like layout within page content while the modern docs viewport bleeds', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_SHEET,
            contentWidth: 1600,
            docsLeft: 120,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            scale: 1,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual(expect.objectContaining({
            bleedWidth: 1420,
            contentWidth: 1600,
            layoutWidth: 1008,
            width: 1008,
        }));
    });

    it('keeps narrow sheet-like docs blocks at their actual content width', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_SHEET,
            contentWidth: 420,
            docsLeft: 120,
            documentFlavor: DocumentFlavor.MODERN,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 96,
            pageMarginRight: 96,
            pageWidth: 1200,
            scale: 1,
            visibleCanvasLeft: 0,
            visibleCanvasWidth: 1440,
        })).toEqual(expect.objectContaining({
            contentWidth: 420,
            layoutWidth: 420,
            width: 420,
        }));
    });

    it('falls back to page content width outside modern docs', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_BASE,
            contentWidth: 1600,
            documentFlavor: DocumentFlavor.TRADITIONAL,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 120,
            pageMarginRight: 120,
            pageWidth: 840,
        })).toEqual({
            contentHeight: 480,
            contentWidth: 1600,
            height: 480,
            layoutWidth: 600,
            offsetLeft: 0,
            viewportHeight: 480,
            width: 600,
        });
    });

    it('keeps narrow sheet-like docs blocks at their actual content width outside modern docs', () => {
        expect(resolveDocsCustomBlockRenderViewport({
            childType: UniverInstanceType.UNIVER_BASE,
            contentWidth: 420,
            documentFlavor: DocumentFlavor.TRADITIONAL,
            fallbackHeight: 480,
            fallbackWidth: 960,
            pageMarginLeft: 120,
            pageMarginRight: 120,
            pageWidth: 840,
        })).toEqual({
            contentHeight: 480,
            contentWidth: 420,
            height: 480,
            layoutWidth: 420,
            offsetLeft: 0,
            viewportHeight: 480,
            width: 420,
        });
    });
});

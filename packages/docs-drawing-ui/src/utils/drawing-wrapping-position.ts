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

import type { IDocDrawingPosition, IDocumentData, LocaleService } from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonPage,
} from '@univerjs/engine-render';
import {
    DocumentDataModel,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    Tools,
} from '@univerjs/core';
import { findDocDrawing } from '@univerjs/docs-drawing';
import { DocumentEditArea, DocumentSkeleton, DocumentViewModel } from '@univerjs/engine-render';
import {
    getDocsDrawingBehindText,
    getDocsDrawingClipPage,
    getDocsPageRelativeDrawingAnchorPage,
    getDocsPageRelativeDrawingLeft,
    getDocsPageRelativeDrawingTop,
    getDocsTableCellDrawingOffset,
} from '../controllers/render-controllers/doc-drawing-transform-update.controller';

export interface IDrawingAnchorInPage {
    skeDrawing: IDocumentSkeletonDrawing;
    page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter;
    hostPage?: IDocumentSkeletonPage;
    pageMarginTop: number;
    pageMarginLeft: number;
}

export function findDrawingAnchor(
    unitId: string,
    drawingId: string,
    skeleton: IDocumentSkeletonCached,
    editArea: DocumentEditArea,
    currentDrawing?: IDocumentSkeletonDrawing['drawingOrigin']
): IDrawingAnchorInPage | null {
    function findInPage(
        page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
        pageMarginLeft: number,
        pageMarginTop: number,
        hostPage?: IDocumentSkeletonPage
    ): IDrawingAnchorInPage | null {
        const cachedDrawing = page.skeDrawings.get(drawingId);
        const skeDrawing = cachedDrawing && currentDrawing
            ? { ...cachedDrawing, drawingOrigin: currentDrawing }
            : cachedDrawing;
        if (skeDrawing) {
            return { skeDrawing, page, hostPage, pageMarginLeft, pageMarginTop };
        }
        for (const table of page.skeTables.values()) {
            for (const row of table.rows) {
                for (const cell of row.cells) {
                    const offset = getDocsTableCellDrawingOffset(unitId, table, row, cell);
                    const found = findInPage(cell, pageMarginLeft + offset.left, pageMarginTop + offset.top);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        for (const group of page.skeColumnGroups?.values() ?? []) {
            for (const column of group.columns) {
                const found = findInPage(column.page, pageMarginLeft + group.left + column.left + column.page.marginLeft, pageMarginTop + group.top + column.top + column.page.marginTop);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    for (const page of skeleton.pages) {
        const { headerId, footerId, marginLeft, marginTop, pageWidth, pageHeight } = page;
        let found: IDrawingAnchorInPage | null = null;
        if (editArea === DocumentEditArea.HEADER) {
            const header = skeleton.skeHeaders.get(headerId)?.get(pageWidth);
            if (header) {
                found = findInPage(header, marginLeft, header.marginTop, page);
            }
        } else if (editArea === DocumentEditArea.FOOTER) {
            const footer = skeleton.skeFooters.get(footerId)?.get(pageWidth);
            if (footer) {
                found = findInPage(footer, marginLeft, pageHeight - footer.height - footer.marginBottom, page);
            }
        } else {
            found = findInPage(page, marginLeft, marginTop);
            if (!found) {
                for (const note of page.notes ?? []) {
                    found = findInPage(note.page, note.left, note.top);
                    if (found) {
                        break;
                    }
                }
            }
        }
        if (found) {
            return found;
        }
    }
    return null;
}

function getColumnOrigin(anchor: IDrawingAnchorInPage, relativeFromV: ObjectRelativeFromV): number {
    const { skeDrawing, page } = anchor;
    let origin = skeDrawing.isPageBreak ? 0 : skeDrawing.columnLeft;
    if ((skeDrawing.blockAnchorLeft ?? 0) > 0 && relativeFromV !== ObjectRelativeFromV.LINE) {
        origin += skeDrawing.blockAnchorLeft! - (skeDrawing.isPageBreak ? 0 : (skeDrawing.columnLeft || page.marginLeft));
        if (skeDrawing.normalizeTraditionalColumnAnchor && relativeFromV === ObjectRelativeFromV.PARAGRAPH) {
            origin -= page.marginLeft;
        }
    }

    return origin;
}

/** Resolve a text-relative origin before committing a wrapping reference change. */
export function resolveDrawingWrappingPosition(
    anchor: IDrawingAnchorInPage,
    position: IDocDrawingPosition,
    snapshot: IDocumentData,
    localeService: LocaleService,
    editArea: DocumentEditArea
): IDocDrawingPosition | null {
    const drawing = anchor.skeDrawing.drawingOrigin;
    const relativeFrom = position.positionV.relativeFrom;
    if ((drawing.layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM &&
        drawing.layoutType !== PositionedObjectLayoutType.WRAP_SQUARE) ||
        (relativeFrom !== ObjectRelativeFromV.PARAGRAPH && relativeFrom !== ObjectRelativeFromV.LINE) ||
        drawing.docTransform.positionV.relativeFrom === relativeFrom) {
        return position;
    }

    // Changing the reference can move the anchor paragraph through the drawing's
    // own exclusion. Calculate on a disposable model so history contains one edit
    // and imported document layout remains governed by the existing engine.
    const model = new DocumentDataModel(Tools.deepClone(snapshot));
    const previewDrawing = findDocDrawing(model.getSnapshot(), drawing.drawingId)?.drawing;
    if (!previewDrawing) {
        model.dispose();
        return null;
    }
    const viewModel = new DocumentViewModel(model);
    const skeleton = DocumentSkeleton.create(viewModel, localeService);
    let candidate: IDocDrawingPosition = {
        ...position,
        positionV: { relativeFrom, posOffset: 0 },
    };
    const targetTop = anchor.skeDrawing.aTop + anchor.pageMarginTop;
    let previous: { offset: number; delta: number } | undefined;
    try {
        for (let attempt = 0; attempt < 8; attempt++) {
            // Only drawing metadata changes; the parsed text and reference trees remain valid.
            previewDrawing.docTransform = candidate;
            skeleton.makeDirty(true);
            skeleton.calculate();
            const resolved = findDrawingAnchor(snapshot.id, drawing.drawingId, skeleton.getSkeletonData()!, editArea, previewDrawing);
            if (!resolved) {
                return null;
            }
            const delta = targetTop - resolved.skeDrawing.aTop - resolved.pageMarginTop;
            if (Math.abs(delta) < 0.01) {
                return candidate;
            }
            const offset = candidate.positionV.posOffset ?? 0;
            // The anchor itself can move with the exclusion. Use the observed
            // slope instead of assuming one offset unit moves it by one pixel.
            const nextOffset = previous && Math.abs(previous.delta - delta) > 0.01
                ? offset - delta * (offset - previous.offset) / (delta - previous.delta)
                : offset + delta;
            previous = { offset, delta };
            candidate = {
                ...candidate,
                positionV: { relativeFrom, posOffset: nextOffset },
            };
        }
        return null;
    } finally {
        skeleton.dispose();
        viewModel.dispose();
        model.dispose();
    }
}

/** Preserve the rendered position when text wrapping or a positioning reference changes. */
export function getDrawingWrappingPosition(
    anchor: IDrawingAnchorInPage,
    layoutType: PositionedObjectLayoutType,
    relativeFromH = anchor.skeDrawing.drawingOrigin.docTransform.positionH.relativeFrom,
    relativeFromV = anchor.skeDrawing.drawingOrigin.docTransform.positionV.relativeFrom,
    offset?: { left: number; top: number }
): IDocDrawingPosition {
    const { skeDrawing, page, hostPage, pageMarginLeft, pageMarginTop } = anchor;
    const { drawingOrigin, width, height, aLeft, aTop } = skeDrawing;
    const { positionH, positionV } = drawingOrigin.docTransform;
    const clipPage = getDocsDrawingClipPage({
        drawing: { behindText: getDocsDrawingBehindText({ drawingOrigin, hostPage }), transform: { width, height } },
        page,
        hostPage,
    });
    const anchorPage = getDocsPageRelativeDrawingAnchorPage({ page, clipPage, hostPage });
    const wasPageRelative = drawingOrigin.layoutType !== PositionedObjectLayoutType.INLINE && anchorPage != null;
    const isPageRelative = layoutType !== PositionedObjectLayoutType.INLINE && anchorPage != null;
    const wasInline = drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE;
    const result = { ...drawingOrigin.docTransform };
    const columnOriginChanged = relativeFromH === ObjectRelativeFromH.COLUMN &&
        (skeDrawing.blockAnchorLeft ?? 0) > 0 && relativeFromV !== positionV.relativeFrom;

    // Floating drawings keep their alignment, percentage and anchor offsets when the origin is unchanged.
    if (offset?.left || wasInline || columnOriginChanged || relativeFromH !== positionH.relativeFrom || (positionH.relativeFrom === ObjectRelativeFromH.PAGE && wasPageRelative !== isPageRelative)) {
        const left = (wasPageRelative ? getDocsPageRelativeDrawingLeft({ hostPage: anchorPage!, positionH, width }) : undefined)
            ?? aLeft + pageMarginLeft;
        const origins: Partial<Record<ObjectRelativeFromH, number>> = {
            [ObjectRelativeFromH.PAGE]: isPageRelative ? 0 : pageMarginLeft - (skeDrawing.pageAnchorLeft ?? 0),
            [ObjectRelativeFromH.MARGIN]: pageMarginLeft + page.marginLeft - (skeDrawing.pageAnchorLeft ?? 0),
            [ObjectRelativeFromH.COLUMN]: pageMarginLeft + getColumnOrigin(anchor, relativeFromV),
        };
        result.positionH = { relativeFrom: relativeFromH, posOffset: left + (offset?.left ?? 0) - (origins[relativeFromH] ?? pageMarginLeft) };
    }

    if (offset?.top || wasInline || relativeFromV !== positionV.relativeFrom || (positionV.relativeFrom === ObjectRelativeFromV.PAGE && wasPageRelative !== isPageRelative)) {
        const top = (wasPageRelative ? getDocsPageRelativeDrawingTop({ hostPage: anchorPage!, positionV, height }) : undefined)
            ?? aTop + pageMarginTop;
        const origins: Partial<Record<ObjectRelativeFromV, number>> = {
            [ObjectRelativeFromV.PAGE]: isPageRelative ? 0 : pageMarginTop - page.marginTop,
            [ObjectRelativeFromV.LINE]: pageMarginTop + skeDrawing.lineTop,
            [ObjectRelativeFromV.PARAGRAPH]: pageMarginTop + (skeDrawing.isPageBreak ? 0 : skeDrawing.blockAnchorTop),
        };
        result.positionV = { relativeFrom: relativeFromV, posOffset: top + (offset?.top ?? 0) - (origins[relativeFromV] ?? pageMarginTop) };
    }

    return result;
}

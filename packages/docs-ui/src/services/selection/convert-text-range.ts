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

import type { IPosition, ITextRange, Nullable } from '@univerjs/core';
import type {
    DocumentSkeleton,
    IDocumentOffsetConfig,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonSection,
    INodePosition,
    IPoint,
} from '@univerjs/engine-render';
import { TextDirection } from '@univerjs/core';
import { computeDocumentPageAlignOffset, DocumentSkeletonPageType, getDocsTableRenderViewport, getPageFromPath, getTableIdAndSliceIndex, GlyphType, Liquid } from '@univerjs/engine-render';

export enum NodePositionStateType {
    NORMAL,
    START,
    END,
}

export enum NodePositionType {
    page,
    section,
    column,
    line,
    divide,
    glyph,
}

export interface ICurrentNodePositionState {
    page: NodePositionStateType;
    section: NodePositionStateType;
    column: NodePositionStateType;
    line: NodePositionStateType;
    divide: NodePositionStateType;
    glyph: NodePositionStateType;
}

export const NodePositionMap = {
    page: 0,
    section: 1,
    column: 2,
    line: 3,
    divide: 4,
    glyph: 5,
};

export function compareNodePositionLogic(pos1: INodePosition, pos2: INodePosition) {
    if (pos1.page > pos2.page) {
        return false;
    }

    if (pos1.page < pos2.page) {
        return true;
    }

    if (pos1.section > pos2.section) {
        return false;
    }

    if (pos1.section < pos2.section) {
        return true;
    }

    if (pos1.column > pos2.column) {
        return false;
    }

    if (pos1.column < pos2.column) {
        return true;
    }

    if (pos1.line > pos2.line) {
        return false;
    }

    if (pos1.line < pos2.line) {
        return true;
    }

    if (pos1.divide > pos2.divide) {
        return false;
    }

    if (pos1.divide < pos2.divide) {
        return true;
    }

    if (pos1.glyph > pos2.glyph) {
        return false;
    }

    if (pos1.glyph < pos2.glyph) {
        return true;
    }

    return true;
}

export function compareNodePosition(pos1: INodePosition, pos2: INodePosition) {
    const compare = compareNodePositionLogic(pos1, pos2);

    if (compare) {
        return {
            start: pos1,
            end: pos2,
        };
    }

    return {
        start: pos2,
        end: pos1,
    };
}

export function getOneTextSelectionRange(rangeList: ITextRange[]): Nullable<ITextRange> {
    const rangeCount = rangeList.length;
    if (rangeCount === 0) {
        return;
    }

    const firstCursor = rangeList[0];

    const lastCursor = rangeList[rangeCount - 1];

    const collapsed = rangeList.length === 1 && firstCursor.collapsed;

    return {
        startOffset: firstCursor.startOffset,
        endOffset: lastCursor.endOffset,
        collapsed,
    };
}

function getOffsetInDivide(
    glyphGroup: IDocumentSkeletonGlyph[],
    startGlyphIndex: number,
    endGlyphIndex: number,
    st: number
) {
    let startOffset = st;
    let endOffset = st;

    for (let i = 0; i < glyphGroup.length; i++) {
        const glyph = glyphGroup[i];
        const contentLength = glyph.count;

        if (i < startGlyphIndex) {
            startOffset += contentLength;
        }

        if (i < endGlyphIndex) {
            endOffset += contentLength;
        }
    }

    return {
        startOffset,
        endOffset,
    };
}

export function pushToPoints(position: IPosition) {
    const { startX, startY, endX, endY } = position;
    const points: Array<{ x: number; y: number }> = [];

    points.push({
        x: startX,
        y: startY,
    });

    points.push({
        x: endX,
        y: startY,
    });

    points.push({
        x: endX,
        y: endY,
    });

    points.push({
        x: startX,
        y: endY,
    });

    points.push({
        x: startX,
        y: startY,
    });

    return points;
}

export class NodePositionConvertToCursor {
    private _liquid = new Liquid();
    private _horizontalClip: Nullable<{ left: number; right: number }> = null;

    private _currentStartState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        glyph: NodePositionStateType.NORMAL,
    };

    private _currentEndState: ICurrentNodePositionState = {
        page: NodePositionStateType.NORMAL,
        section: NodePositionStateType.NORMAL,
        column: NodePositionStateType.NORMAL,
        line: NodePositionStateType.NORMAL,
        divide: NodePositionStateType.NORMAL,
        glyph: NodePositionStateType.NORMAL,
    };

    constructor(
        private _documentOffsetConfig: IDocumentOffsetConfig,
        private _docSkeleton: DocumentSkeleton
    ) {
        // super
    }

    // eslint-disable-next-line max-lines-per-function
    getRangePointData(startOrigin: Nullable<INodePosition>, endOrigin: Nullable<INodePosition>) {
        const borderBoxPointGroup: IPoint[][] = [];
        const contentBoxPointGroup: IPoint[][] = [];
        const cursorList: ITextRange[] = [];

        if (startOrigin == null || endOrigin == null) {
            return {
                borderBoxPointGroup,
                contentBoxPointGroup,
                cursorList,
            };
        }

        const isValid = this._isValidPosition(startOrigin, endOrigin);

        if (!isValid) {
            throw new Error(`
                Invalid positions in NodePositionConvertToCursor,
                they are not in the same segment page when in header or footer.`
            );
        }

        const { start, end } = compareNodePosition(startOrigin, endOrigin);

        // eslint-disable-next-line complexity
        this._selectionIterator(start, end, (start_sp, end_sp, isFirst, isLast, divide, line) => {
            const { lineHeight, asc, paddingTop, paddingBottom, contentHeight, marginTop, marginBottom } = line;
            const { glyphGroup, st } = divide;
            if (glyphGroup.length === 0) {
                // The divide is empty, and no need to set selection.
                // Handle the drawing which split the line, and the second divide is empty.
                return;
            }
            const { x: startX, y: startY } = this._liquid;

            let borderBoxPosition: IPosition;
            let contentBoxPosition: IPosition;

            const firstGlyph = glyphGroup[start_sp];
            const lastGlyph = glyphGroup[end_sp];
            const preGlyph = glyphGroup[start_sp - 1];

            const isCurrentList = firstGlyph?.glyphType === GlyphType.LIST;

            const { startOffset, endOffset } = getOffsetInDivide(glyphGroup, start_sp, end_sp, st);

            const isStartBack = start.glyph === start_sp && isFirst ? start.isBack : true;

            const isEndBack = end.glyph === end_sp && isLast ? end.isBack : false;

            const collapsed = start === end;
            const anchorGlyph = isStartBack ? (preGlyph ?? firstGlyph) : firstGlyph;
            const borderBoxStartY = startY;
            const borderBoxEndY = contentHeight == null
                ? startY + lineHeight - marginTop - marginBottom
                : startY + paddingTop + contentHeight + paddingBottom;

            // Caret position anchor for the start edge.
            //
            // `(firstGlyph, isStartBack=true)` ("caret *before* firstGlyph")
            // and `(preGlyph, isStartBack=false)` ("caret *after* preGlyph")
            // describe the same *logical* offset. For homogeneous-direction
            // runs they render at identical X coords because
            // `preGlyph.left + preGlyph.width === firstGlyph.left`.
            //
            // At a direction boundary they describe **two different visual
            // positions** — this is the classic UAX#9 "caret affinity"
            // problem (W3C css-text §8). The Univer text-range model has no
            // affinity field yet (see docs/rtl/12-implementation-actual.md
            // for the planned model), so we apply a deterministic
            // tiebreaker: prefer the `preGlyph` anchor whenever it exists.
            // `preGlyph` is the glyph the user just interacted with (the
            // freshly inserted character, the one to the left of an arrow
            // press, etc.), so anchoring "after preGlyph" matches the
            // user's mental model in the common cases:
            //
            //   * just typed an Arabic char on an LTR line → caret stays
            //     next to that char (its left edge, since it's RTL), not
            //     at the trailing `\r`'s visual position.
            //   * arrow-leftward from the start of an embedded LTR run
            //     into RTL → caret sits on the RTL boundary glyph's "after"
            //     edge, visually adjacent to where it came from.
            //
            // Fall back to `firstGlyph` when there's no preGlyph (caret at
            // the divide head) or we're inside a list bullet (the bullet
            // glyph itself anchors the caret).
            const isInsideCurrentCluster = isFirst
                && start.glyph === start_sp
                && start.subOffset != null
                && start.subOffset > 0;
            const useStartFromPre = isStartBack && preGlyph != null && !isCurrentList && !isInsideCurrentCluster;
            const startAnchor = useStartFromPre ? preGlyph : firstGlyph;
            const startAnchorBack = useStartFromPre ? false : isStartBack;

            const firstGlyphLeft = startAnchor?.left || 0;
            const firstGlyphWidth = startAnchor?.width || 0;

            const lastGlyphLeft = lastGlyph?.left || 0;
            const lastGlyphWidth = lastGlyph?.width || 0;

            // In RTL paragraphs the bidi-reorder step assigned visual `left`
            // values so that logical-first glyphs render at the visual right
            // (see `applyBidiReorderToLine`). Caret math must therefore
            // *invert* the standard "isBack → left edge / !isBack → right
            // edge" rule for the affected glyphs: visually, the right edge of
            // an RTL glyph is its `left + width` *minus the inversion* — i.e.
            // for a logical glyph that has been "visually reversed", "before"
            // and "after" swap.
            //
            // Concretely, for an RTL glyph:
            //   isBack === true  (caret *before* the logical char) → right edge
            //                                                         = left + width
            //   isBack === false (caret *after* the logical char)  → left edge
            //                                                         = left
            // For LTR glyphs the original rule (`isBack → left`, `!isBack → right`)
            // still holds.
            // Per-glyph bidi direction takes precedence over the line's
            // baseline direction so mixed runs work correctly:
            //   "Hello كتاب" on an LTR baseline → the Arabic glyphs carry
            //                                       odd bidiLevel and flip on
            //                                       their own.
            //   "كتاب Hello" on an RTL baseline → the English glyphs carry
            //                                       even level (≥2) and keep
            //                                       their LTR caret rule.
            // Fall back to the line baseline when `bidiLevel` is undefined
            // (bidi pass skipped or not yet run).
            const lineBaselineLevel = line.direction === TextDirection.RIGHT_TO_LEFT ? 1 : 0;
            const isRtlAtLevel = (level: number | undefined) =>
                (level ?? lineBaselineLevel) % 2 === 1;

            const isStartGlyphRTL = isRtlAtLevel(startAnchor?.bidiLevel);
            const isEndGlyphRTL = isRtlAtLevel(lastGlyph?.bidiLevel);

            // Caret-edge X offset relative to `glyph.left`.
            // LTR glyph:  `isBack` → left edge (0),         `!isBack` → right edge (width).
            // RTL glyph:  `isBack` → right edge (width),    `!isBack` → left edge (0).
            // After bidi-reorder, RTL glyphs have `left` pointing at their visual *left*
            // edge with `width` extending to the visual *right* — but logical "before"
            // (isBack=true) sits on the visual right, hence the inversion.
            const edgeOffset = (back: boolean, width: number, rtl: boolean) =>
                rtl ? (back ? width : 0) : (back ? 0 : width);

            // Sub-glyph caret placement for cluster glyphs (multi-char
            // glyphs such as the merged Arabic word). When the position
            // carries a `subOffset`, place the caret at the char boundary
            // inside the cluster using its `charAdvances` (cumulative
            // logical-order widths). For RTL clusters we mirror because
            // visual x grows leftwards through logical indices.
            //
            // Returns the in-glyph x offset (relative to `glyph.left`) or
            // `undefined` if the cluster path doesn't apply, in which
            // case callers fall back to `edgeOffset`.
            const subOffsetWithin = (
                glyph: typeof firstGlyph | undefined,
                subOff: number | undefined,
                rtl: boolean
            ): number | undefined => {
                if (glyph == null || subOff == null || glyph.count <= 1 || glyph.charAdvances == null) {
                    return undefined;
                }
                const adv = glyph.charAdvances;
                // logical prefix advance: 0 at sub=0, adv[i-1] otherwise.
                const logicalX = subOff <= 0 ? 0 : adv[Math.min(subOff, adv.length) - 1];
                return rtl ? glyph.width - logicalX : logicalX;
            };

            // Cluster sub-glyph offsets only apply when this is the
            // single-divide partial path; `start_sp` and `end_sp` here
            // are glyph indices, so we read `subOffset` off the
            // corresponding original position. `start === end` for
            // collapsed cursors so reusing `start.subOffset` /
            // `end.subOffset` works for both anchor and focus edges.
            const startSubX = isFirst && start.glyph === start_sp
                ? subOffsetWithin(firstGlyph, start.subOffset, isStartGlyphRTL)
                : undefined;
            const endSubX = isLast && end.glyph === end_sp
                ? subOffsetWithin(lastGlyph, end.subOffset, isEndGlyphRTL)
                : undefined;

            if (start_sp === 0 && end_sp === glyphGroup.length - 1) {
                // Full-divide selection: start at the divide's logical
                // beginning, end at its logical end. Use each end's own
                // glyph direction (in a homogeneous-direction line they
                // both match `isRTLLine`; in mixed lines the boundary
                // glyph governs).
                const fullStartX = startX + firstGlyphLeft + (
                    isCurrentList
                        ? firstGlyphWidth // bullet stays on the start side
                        : startSubX != null
                            ? startSubX
                            : isStartGlyphRTL ? firstGlyphWidth : 0
                );
                const fullEndX = startX + lastGlyphLeft
                    + (endSubX != null ? endSubX : edgeOffset(isEndBack, lastGlyphWidth, isEndGlyphRTL));

                borderBoxPosition = {
                    startX: fullStartX,
                    startY: borderBoxStartY,
                    endX: fullEndX,
                    endY: borderBoxEndY,
                };

                contentBoxPosition = {
                    startX: fullStartX,
                    startY: startY + paddingTop + asc - anchorGlyph.bBox.ba,
                    endX: fullEndX,
                    endY: startY + paddingTop + asc + anchorGlyph.bBox.bd,
                };
            } else {
                const isStartBackFin = startAnchorBack && !isCurrentList;

                // Sub-glyph offset takes precedence over `isStartBackFin`
                // when the caret position points *inside* a cluster
                // glyph. `startSubX` was computed using `firstGlyph` and
                // `start.subOffset`, but the actual paint anchor may be
                // `preGlyph` (the start ambiguity resolution above). The
                // sub-glyph caret only matters when we're rendering on
                // `firstGlyph`, so guard on `startAnchor === firstGlyph`.
                const startSubXForAnchor =
                    startAnchor === firstGlyph ? startSubX : undefined;

                // Use per-glyph direction here so the caret sits on the
                // correct visual side at script boundaries (the partial
                // selection branch is what fires during typing / arrow-key
                // navigation, so mixed-direction caret accuracy lives here).
                // `startAnchor` may point at the *previous* glyph (see the
                // ambiguity-resolution comment above), in which case
                // `startAnchorBack` is `false` and we correctly land on its
                // "after" edge.
                const partialStartX = startX + firstGlyphLeft
                    + (startSubXForAnchor != null
                        ? startSubXForAnchor
                        : edgeOffset(isStartBackFin, firstGlyphWidth, isStartGlyphRTL));
                const partialEndX = startX + lastGlyphLeft
                    + (endSubX != null
                        ? endSubX
                        : edgeOffset(isEndBack, lastGlyphWidth, isEndGlyphRTL));

                borderBoxPosition = {
                    startX: partialStartX,
                    startY: borderBoxStartY,
                    endX: partialEndX,
                    endY: borderBoxEndY,
                };

                contentBoxPosition = {
                    startX: partialStartX,
                    startY: startY + paddingTop + asc - anchorGlyph.bBox.ba,
                    endX: partialEndX,
                    endY: startY + paddingTop + asc + anchorGlyph.bBox.bd,
                };
            }

            const clippedBorderBoxPosition = clipPositionToHorizontalRange(borderBoxPosition, this._horizontalClip);
            const clippedContentBoxPosition = clipPositionToHorizontalRange(contentBoxPosition, this._horizontalClip);

            if (clippedBorderBoxPosition) {
                borderBoxPointGroup.push(pushToPoints(clippedBorderBoxPosition));
            }
            if (clippedContentBoxPosition) {
                contentBoxPointGroup.push(pushToPoints(clippedContentBoxPosition));
            }

            // Cluster-aware logical offsets: when the caret position
            // refers to a char inside a cluster glyph (e.g. between two
            // Arabic letters of a merged word) the offset is
            // `startOffset + subOffset` rather than the legacy
            // glyph-coarse `startOffset` / `startOffset + count`. This
            // keeps `cursorList` consistent with what
            // `findCharIndexByPosition` returns for the same position.
            const startSubInCluster = isFirst && start.glyph === start_sp ? start.subOffset : undefined;
            const endSubInCluster = isLast && end.glyph === end_sp ? end.subOffset : undefined;

            const finalStartOffset = (startSubInCluster != null && firstGlyph && firstGlyph.count > 1)
                ? startOffset + startSubInCluster
                : (isStartBack ? startOffset : startOffset + firstGlyph.count);
            const finalEndOffset = (endSubInCluster != null && lastGlyph && lastGlyph.count > 1)
                ? endOffset + endSubInCluster
                : (isEndBack ? endOffset : endOffset + lastGlyph.count);

            cursorList.push({
                startOffset: finalStartOffset,
                endOffset: finalEndOffset,
                collapsed,
            });
        });

        return {
            borderBoxPointGroup,
            contentBoxPointGroup,
            cursorList,
        };
    }

    private _isValidPosition(startOrigin: INodePosition, endOrigin: INodePosition) {
        const { segmentPage: startPage, pageType: startPageType } = startOrigin;
        const { segmentPage: endPage, pageType: endPageType } = endOrigin;

        if (startPageType !== endPageType) {
            return false;
        }

        if (startPageType === DocumentSkeletonPageType.HEADER || startPageType === DocumentSkeletonPageType.FOOTER) {
            return startPage === endPage;
        }

        return true;
    }

    private _resetCurrentNodePositionState() {
        this._currentStartState = {
            page: NodePositionStateType.NORMAL,
            section: NodePositionStateType.NORMAL,
            column: NodePositionStateType.NORMAL,
            line: NodePositionStateType.NORMAL,
            divide: NodePositionStateType.NORMAL,
            glyph: NodePositionStateType.NORMAL,
        };

        this._currentEndState = {
            page: NodePositionStateType.NORMAL,
            section: NodePositionStateType.NORMAL,
            column: NodePositionStateType.NORMAL,
            line: NodePositionStateType.NORMAL,
            divide: NodePositionStateType.NORMAL,
            glyph: NodePositionStateType.NORMAL,
        };
    }

    private _setNodePositionState(type = NodePositionType.page, start: number, end: number, current: number) {
        if (current === start) {
            this._currentStartState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.START;
        } else {
            this._currentStartState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.NORMAL;
        }

        if (current === end) {
            this._currentEndState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.END;
        } else {
            this._currentEndState[type as unknown as keyof ICurrentNodePositionState] = NodePositionStateType.NORMAL;
        }
    }

    private _checkPreviousNodePositionState(typeIndex: number, isStart = true) {
        let index = typeIndex;
        let resultState: Nullable<NodePositionStateType>;
        while (index >= 0) {
            const type = NodePositionType[index] as keyof ICurrentNodePositionState;
            let state;
            if (isStart) {
                state = this._currentStartState[type];
            } else {
                state = this._currentEndState[type];
            }

            if (state === undefined) {
                return;
            }
            if (resultState === undefined) {
                resultState = state;
            }
            if (state !== resultState) {
                return NodePositionStateType.NORMAL;
            }

            index--;
        }

        return resultState;
    }

    private _getSelectionRuler(
        typeIndex: number,
        startPosition: INodePosition,
        endPosition: INodePosition,
        nextLength: number,
        current: number
    ) {
        let start_next = 0;
        let end_next = nextLength;

        const type = NodePositionType[typeIndex] as keyof INodePosition;

        const nextType = NodePositionType[typeIndex + 1] as keyof INodePosition;

        if (nextType === null || type === null) {
            return {
                start_next,
                end_next,
            };
        }

        const start = startPosition[type] as number;

        const end = endPosition[type] as number;

        this._setNodePositionState(type as unknown as NodePositionType, start, end, current);

        const preStartNestType = this._checkPreviousNodePositionState(typeIndex);

        const preEndNestType = this._checkPreviousNodePositionState(typeIndex, false);

        if (preStartNestType === NodePositionStateType.START) {
            start_next = startPosition[nextType] as number;
        }

        if (preEndNestType === NodePositionStateType.END) {
            end_next = endPosition[nextType] as number;
        }

        return {
            start_next,
            end_next,
        };
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _selectionIterator(
        startPosition: INodePosition,
        endPosition: INodePosition,
        func: (
            startGlyphIndex: number,
            endGlyphIndex: number,
            isFirst: boolean,
            isLast: boolean,
            divide: IDocumentSkeletonDivide,
            line: IDocumentSkeletonLine,
            column: IDocumentSkeletonColumn,
            section: IDocumentSkeletonSection,
            page: IDocumentSkeletonPage
        ) => void
    ) {
        const skeleton = this._docSkeleton;
        if (!skeleton) {
            return [];
        }

        const { pageType, path } = startPosition; // startPosition and endPosition must has the same pageType, path and in the same segment page.

        this._liquid.reset();

        const skeletonData = skeleton.getSkeletonData();

        if (skeletonData == null) {
            return [];
        }

        const { pages, skeHeaders, skeFooters } = skeletonData;

        const { page: pageIndex, segmentPage } = startPosition;
        const { page: endPageIndex, segmentPage: endSegmentPage } = endPosition;

        this._resetCurrentNodePositionState();

        if (this._documentOffsetConfig == null) {
            return [];
        }

        const { pageLayoutType, pageMarginLeft, pageMarginTop, docsWidth, docsHeight } = this._documentOffsetConfig;

        const skipPageIndex = (pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL) ? pageIndex : segmentPage;
        for (let p = 0; p < skipPageIndex; p++) {
            const page = pages[p];
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const endIndex = (pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL) ? endPageIndex : endSegmentPage;

        for (let p = skipPageIndex; p <= endIndex; p++) {
            const page = pages[p];
            const { headerId, footerId, pageWidth } = page;
            let segmentPage: Nullable<IDocumentSkeletonPage> = page;

            if (pageType === DocumentSkeletonPageType.HEADER) {
                segmentPage = skeHeaders.get(headerId)?.get(pageWidth);
            } else if (pageType === DocumentSkeletonPageType.FOOTER) {
                segmentPage = skeFooters.get(footerId)?.get(pageWidth);
            } else if (pageType === DocumentSkeletonPageType.CELL) {
                segmentPage = getPageFromPath(skeletonData, path);
            }

            if (segmentPage == null) {
                this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

            const sections = segmentPage.sections;

            const { start_next: start_s, end_next: end_s } = this._getSelectionRuler(
                NodePositionMap.page,
                startPosition,
                endPosition,
                sections.length - 1,
                pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? p : 0
            );
            this._liquid.translateSave();
            const previousHorizontalClip = this._horizontalClip;
            this._horizontalClip = null;

            switch (pageType) {
                case DocumentSkeletonPageType.HEADER:
                    this._liquid.translatePagePadding({
                        ...segmentPage,
                        marginLeft: page.marginLeft, // Because header or footer margin Left is 0.
                    });
                    break;
                case DocumentSkeletonPageType.FOOTER: {
                    const footerTop = page.pageHeight - segmentPage.height - segmentPage.marginBottom;
                    this._liquid.translate(page.marginLeft, footerTop);
                    break;
                }
                case DocumentSkeletonPageType.CELL: {
                    this._liquid.translatePagePadding(page);
                    const rowSke = segmentPage.parent as IDocumentSkeletonRow;
                    const tableSke = rowSke.parent!;
                    const { left: cellLeft } = segmentPage;
                    const { top: tableTop, left: tableLeft } = tableSke;
                    const { top: rowTop } = rowSke;
                    const sourceTableId = getTableIdAndSliceIndex(tableSke.tableId).tableId;
                    const viewport = getDocsTableRenderViewport(getDocumentUnitId(skeleton), sourceTableId);
                    const hasHorizontalViewport = viewport && viewport.contentWidth > viewport.viewportWidth;
                    const scrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;

                    if (hasHorizontalViewport) {
                        const visibleLeft = this._liquid.x + tableLeft;
                        this._horizontalClip = {
                            left: visibleLeft,
                            right: visibleLeft + viewport.viewportWidth,
                        };
                    }

                    this._liquid.translate(tableLeft + cellLeft - scrollLeft, tableTop + rowTop);
                    this._liquid.translatePagePadding(segmentPage);
                    break;
                }
                default:
                    this._liquid.translatePagePadding(page);
                    break;
            }

            if (docsWidth > 0 && docsHeight > 0) {
                const alignPage = pageType === DocumentSkeletonPageType.CELL ? segmentPage : page;
                const { x: alignX, y: alignY } = computeDocumentPageAlignOffset(docsWidth, docsHeight, alignPage);
                // `translatePagePadding` already applied marginLeft/marginTop; for LEFT
                // `_horizontalHandler` only repeats those — apply the extra center/right
                // offset so the caret matches painted glyphs.
                const extraX = alignX - (alignPage.marginLeft ?? 0);
                const extraY = alignY - (alignPage.marginTop ?? 0);
                if (extraX !== 0 || extraY !== 0) {
                    this._liquid.translate(extraX, extraY);
                }
            }

            for (let s = start_s; s <= end_s; s++) {
                const section = sections[s];
                const columns = section.columns;
                const { start_next: start_c, end_next: end_c } = this._getSelectionRuler(
                    NodePositionMap.section,
                    startPosition,
                    endPosition,
                    columns.length - 1,
                    s
                );

                this._liquid.translateSection(section);

                for (let c = start_c; c <= end_c; c++) {
                    const column = columns[c];
                    const lines = column.lines;
                    const { start_next: start_l, end_next: end_l } = this._getSelectionRuler(
                        NodePositionMap.column,
                        startPosition,
                        endPosition,
                        lines.length - 1,
                        c
                    );

                    this._liquid.translateColumn(column);

                    for (let l = start_l; l <= end_l; l++) {
                        const line = lines[l];
                        const { divides } = line;
                        const { start_next: start_d, end_next: end_d } = this._getSelectionRuler(
                            NodePositionMap.line,
                            startPosition,
                            endPosition,
                            divides.length - 1,
                            l
                        );
                        this._liquid.translateSave();
                        this._liquid.translateLine(line, true, false);

                        for (let d = start_d; d <= end_d; d++) {
                            const divide = divides[d];

                            this._liquid.translateSave();
                            this._liquid.translateDivide(divide);

                            const { glyphGroup } = divide;

                            const { start_next: start_sp, end_next: end_sp } = this._getSelectionRuler(
                                NodePositionMap.divide,
                                startPosition,
                                endPosition,
                                glyphGroup.length - 1,
                                d
                            );

                            let isFirst = false;
                            let isLast = false;

                            if (p === skipPageIndex && s === start_s && c === start_c && l === start_l && d === start_d) {
                                isFirst = true;
                            }

                            if (p === endIndex && s === end_s && c === end_c && l === end_l && d === end_d) {
                                isLast = true;
                            }

                            func && func(start_sp, end_sp, isFirst, isLast, divide, line, column, section, segmentPage);

                            this._liquid.translateRestore();
                        }

                        this._liquid.translateRestore();
                    }
                }
            }
            this._liquid.translateRestore();
            this._horizontalClip = previousHorizontalClip;

            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }
    }
}

function clipPositionToHorizontalRange(position: IPosition, clip: Nullable<{ left: number; right: number }>): Nullable<IPosition> {
    if (!clip) {
        return position;
    }

    const startX = Math.max(position.startX, clip.left);
    const endX = Math.min(position.endX, clip.right);
    const collapsed = position.startX === position.endX;

    if (collapsed) {
        return position.startX >= clip.left && position.startX <= clip.right ? position : null;
    }

    if (endX <= startX) {
        return null;
    }

    return {
        ...position,
        startX,
        endX,
    };
}

function getDocumentUnitId(docSkeleton: DocumentSkeleton): string {
    const viewModel = docSkeleton.getViewModel() as {
        getDataModel?: () => {
            getUnitId?: () => string;
        };
    };

    return viewModel.getDataModel?.().getUnitId?.() ?? '';
}

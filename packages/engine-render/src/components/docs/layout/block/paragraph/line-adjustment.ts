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

import type { IParagraphStyle } from '@univerjs/core';
import type { ISectionBreakConfig } from '../../../../../basics';
import type { IDocumentSkeletonDivide, IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../../../../basics/i-document-skeleton-cached';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import { HorizontalAlign, TextDirection } from '@univerjs/core';
import { hasCJK, hasCJKText, isCjkLeftAlignedPunctuation, isCjkRightAlignedPunctuation } from '../../../../../basics/tools';
import { BreakPointType } from '../../line-breaker/break';
import { isLetter } from '../../line-breaker/enhancers/utils';
import { createHyphenDashGlyph, glyphShrinkLeft, glyphShrinkRight, setGlyphGroupLeft } from '../../model/glyph';
import { getFontConfigFromLastGlyph, getGlyphGroupWidth, lineIterator } from '../../tools';
import { applyBidiReorderToLine } from './bidi-reorder';

// How much a character should hang into the end margin.
// For more discussion, see:
// https://recoveringphysicist.com/21/
// https://www.w3.org/TR/clreq/#hanging_punctuation_marks_at_line_end
function overhang(c: string): number {
    switch (c) {
        // Dashes.
        case '–':
        case '—': {
            return 0.2;
        }
        // Punctuation.
        case '.':
        case ',': {
            return 0.8;
        }
        case ':':
        case ';': {
            return 0.3;
        }
        // Arabic
        case '\u{60C}':
        case '\u{6D4}': {
            return 0.4;
        }
        default: {
            return 0;
        }
    }
}

function getDivideShrinkability(divide: IDocumentSkeletonDivide): number {
    const { glyphGroup } = divide;
    let shrinkability = 0;

    for (const glyph of glyphGroup) {
        const [left, right] = glyph.adjustability.shrinkability;

        shrinkability += left + right;
    }

    return shrinkability;
}

function getDivideStretchability(divide: IDocumentSkeletonDivide): number {
    const { glyphGroup } = divide;
    let stretchability = 0;

    for (const glyph of glyphGroup) {
        const [left, right] = glyph.adjustability.stretchability;

        stretchability += left + right;
    }

    return stretchability;
}

function getJustifiables(divide: IDocumentSkeletonDivide): number {
    const justifiables = divide.glyphGroup.filter((glyph) => glyph.isJustifiable).length;
    const lastGlyph = divide.glyphGroup[divide.glyphGroup.length - 1];

    // CJK character at line end should not be adjusted.
    if (hasCJK(lastGlyph.content)) {
        return justifiables - 1;
    }

    return justifiables;
}

function adjustGlyphsInDivide(divide: IDocumentSkeletonDivide, justificationRatio: number, extraJustification: number) {
    for (const glyph of divide.glyphGroup) {
        const adjustabilityLeft = justificationRatio < 0
            ? glyph.adjustability.shrinkability[0]
            : glyph.adjustability.stretchability[0];
        const adjustabilityRight = justificationRatio < 0
            ? glyph.adjustability.shrinkability[1]
            : glyph.adjustability.stretchability[1];

        const justificationLeft = adjustabilityLeft * justificationRatio;
        let justificationRight = adjustabilityRight * justificationRatio;

        if (glyph.isJustifiable) {
            justificationRight += extraJustification;
        }

        glyph.width += justificationLeft + justificationRight;
        glyph.xOffset += justificationLeft;
    }

    setGlyphGroupLeft(divide.glyphGroup);
}

/**
 * Sum the natural widths of all glyphs across every divide of a line.
 * Used to derive a "line natural width" when `divide.width` is Infinity
 * (the common static-render path in sheet cells where the docs page size
 * hasn't been clamped). Multi-line RTL alignment needs this so short
 * lines can compute the right amount of `paddingRight` to pin to the
 * same right edge as the longest line.
 */
function getLineNaturalWidth(line: IDocumentSkeletonLine): number {
    let w = 0;
    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            w += glyph.width;
        }
    }
    return w;
}

/**
 * When aligning text horizontally within a document,
 * it may be ineffective if the total line width is not initially calculated.
 * Therefore, multiple calculations are performed, which may impact performance.
 * Needs optimization for efficiency.
 *
 * `pageMaxLineWidth` is the natural width of the widest line on the page
 * the line belongs to. It is only consulted on the **infinite divide**
 * path (static sheet render with `divide.width === Infinity`) to give
 * RTL lines a finite reference width — short lines on a multi-line cell
 * use `paddingRight = pageMaxLineWidth - thisLineWidth` to pin to the
 * same right edge as the longest line, while the page-level
 * `_horizontalHandler` does the outer "push the whole page to the cell's
 * right edge" anchor. When `pageMaxLineWidth` is undefined (single-page
 * docs use-cases that haven't computed it) we fall back to the finite
 * `divide.width` branch and skip on infinity, preserving legacy behavior.
 */
function horizontalAlignHandler(
    line: IDocumentSkeletonLine,
    horizontalAlign: HorizontalAlign,
    direction?: TextDirection,
    pageMaxLineWidth?: number
) {
    const isRTL = direction === TextDirection.RIGHT_TO_LEFT;
    const { divides } = line;

    for (let i = 0; i < divides.length; i++) {
        const divide = divides[i];
        let { width } = divide;
        let glyphGroupWidth = getGlyphGroupWidth(divide);

        divide.glyphGroupWidth = glyphGroupWidth;

        if (width === Number.POSITIVE_INFINITY) {
            // Static sheet-render path: divide.width is Infinity because
            // the docs pageSize was left at INFINITY (so OVERFLOW into the
            // neighbouring cells still works). The justification / LEFT /
            // CENTER / RIGHT branches below all need a finite reference
            // width to compute padding, so for RTL only we substitute
            // `pageMaxLineWidth` (the natural width of the widest line on
            // this page). With that substitution, short RTL lines get
            // `paddingRight = pageMaxLineWidth - glyphGroupWidth` and pin
            // to the same right anchor as the longest line. LTR keeps the
            // legacy "skip on infinity" behaviour.
            if (!isRTL || pageMaxLineWidth == null || !Number.isFinite(pageMaxLineWidth)) {
                continue;
            }
            width = pageMaxLineWidth;
        }

        if (divide.isFull) {
            let remaining = width - glyphGroupWidth;

            // Handle hanging punctuation. In LTR text the overhanging glyph
            // sits at the right edge of the line (last glyph); in RTL we mirror
            // it to the left edge (first glyph). Both budgets feed back into
            // `remaining` so justification math stays the same.
            if (divide.glyphGroup.length > 1) {
                const edgeGlyph = isRTL
                    ? divide.glyphGroup[0]
                    : divide.glyphGroup[divide.glyphGroup.length - 1];
                const amount = overhang(edgeGlyph.content) * edgeGlyph.width;

                remaining += amount;
            }

            let justificationRatio = 0;
            let extraJustification = 0;
            const shrink = getDivideShrinkability(divide);
            const stretch = getDivideStretchability(divide);

            if (remaining < 0 && shrink > 0) {
                // Attempt to reduce the length of the line, using shrinkability.
                justificationRatio = Math.max(remaining / shrink, -1.0);
                remaining = Math.min(remaining + shrink, 0);
            } else if (horizontalAlign === HorizontalAlign.JUSTIFIED) {
                // Attempt to increase the length of the line, using stretchability.
                if (stretch > 0) {
                    justificationRatio = Math.min(remaining / stretch, 1.0);
                    remaining = Math.max(remaining - stretch, 0);
                }

                const justifiables = getJustifiables(divide);

                if (justifiables > 0 && remaining > 0) {
                    extraJustification = remaining / justifiables;
                    remaining = 0;
                }
            }

            if (justificationRatio !== 0 || extraJustification !== 0) {
                // Extrude or stretch row so that they fit within a specified width,
                // or they can be squeezed or stretched to justify the row.
                adjustGlyphsInDivide(divide, justificationRatio, extraJustification);
                // Recalculate the glyph group width, because we adjust the width and xOffset of glyphs.
                glyphGroupWidth = getGlyphGroupWidth(divide);
                divide.glyphGroupWidth = glyphGroupWidth;
            }
        }

        if (isRTL) {
            // In RTL paragraphs the "natural" side is the right; we push
            // remaining whitespace to the right when the alignment asks for it.
            //   - LEFT                  → glyphs visually pinned to the left
            //                             edge (logical end).
            //   - RIGHT / UNSPECIFIED   → glyphs pinned to the right edge
            //                             (logical start). This is the default
            //                             for RTL, including the very common
            //                             "no horizontalAlign set on the cell"
            //                             case where `_horizontalHandler`
            //                             implicitly resolves to RIGHT for
            //                             string-valued RTL content.
            //   - CENTER                → halve the leftover space.
            // JUSTIFIED is handled by the justification math above and falls
            // back to the right-pinned default visually.
            //
            // IMPORTANT (multi-line cells): each line's `paddingRight` is
            // computed independently from *its own* `glyphGroupWidth`, so a
            // short Arabic line above a long one still pins to the divide's
            // right edge instead of sharing the long line's left anchor.
            // The page-level `_horizontalHandler` then pushes the whole page
            // to the cell's right side, giving "every short line right-flush"
            // instead of "all lines left-flush to the longest line".
            if (horizontalAlign === HorizontalAlign.CENTER) {
                divide.paddingLeft = (width - glyphGroupWidth) / 2;
                divide.paddingRight = 0;
            } else if (horizontalAlign === HorizontalAlign.LEFT) {
                // RTL paragraphs interpret HorizontalAlign.LEFT as "logical
                // start side" — which is the *visual* right edge in RTL
                // text. This matches W3C css-logical and Excel behaviour:
                // setting "left" on an Arabic paragraph pins it to the
                // start of the line (= visual right).
                divide.paddingLeft = 0;
                divide.paddingRight = Math.max(0, width - glyphGroupWidth);
            } else {
                // RIGHT or UNSPECIFIED — also pin glyphs to the visual
                // right edge of their divide. RIGHT is the "natural" RTL
                // alignment; UNSPECIFIED falls here too because RTL text
                // without an explicit `ht` should hug the right edge by
                // default. `translateDivide` adds paddingRight on top of
                // the layout-ruler's `glyph.left` (which is always left-
                // anchored from 0), so we route the leftover whitespace
                // into paddingRight to shift the whole glyph run flush
                // with the divide's right edge.
                //
                // Computing this per-line independently is what fixes the
                // "短行跟着长行左对齐" bug in multi-line Arabic cells: each
                // line's `paddingRight = divide.width - glyphGroupWidth`
                // varies with the line's own width, so short Arabic lines
                // sit at their own right edge regardless of how wide the
                // longest line is.
                divide.paddingLeft = 0;
                divide.paddingRight = Math.max(0, width - glyphGroupWidth);
            }
        } else {
            if (horizontalAlign === HorizontalAlign.CENTER) {
                divide.paddingLeft = (width - glyphGroupWidth) / 2;
            } else if (horizontalAlign === HorizontalAlign.RIGHT) {
                divide.paddingLeft = width - glyphGroupWidth;
            }
        }

        // To fix https://github.com/dream-num/univer-pro/issues/2930
        divide.paddingLeft = Math.max(divide.paddingLeft, 0);
        if (divide.paddingRight != null) {
            divide.paddingRight = Math.max(divide.paddingRight, 0);
        }
    }
}

// If the last glyph is a CJK character adjusted by [`addCJKLatinSpacing`],
// restore the original width.
function restoreLastCJKGlyphWidth(line: IDocumentSkeletonLine) {
    for (const divide of line.divides) {
        const lastGlyph = divide.glyphGroup[divide.glyphGroup.length - 1];

        if (
            lastGlyph &&
            divide.isFull &&
            hasCJKText(lastGlyph.content) &&
            lastGlyph.width - lastGlyph.xOffset > lastGlyph.bBox.width
        ) {
            const shrinkAmount = lastGlyph.width - lastGlyph.xOffset - lastGlyph.bBox.width;

            lastGlyph.width -= shrinkAmount;
            lastGlyph.adjustability.shrinkability[1] = 0;
        }
    }
}

// If the first or last glyph is a CJK punctuation, we want to shrink it.
// See Requirements for Chinese Text Layout, Section 3.1.6.3
// Compression of punctuation marks at line start or line end
function shrinkStartAndEndCJKPunctuation(line: IDocumentSkeletonLine) {
    for (const divide of line.divides) {
        const glyphGroupLength = divide.glyphGroup.length;
        if (glyphGroupLength < 2) {
            continue;
        }

        const firstGlyph = divide.glyphGroup[0];
        const lastGlyph = divide.glyphGroup[glyphGroupLength - 1];

        if (isCjkRightAlignedPunctuation(firstGlyph.content)) {
            const shrinkAmount = firstGlyph.adjustability.shrinkability[0];

            glyphShrinkLeft(firstGlyph, shrinkAmount);
        }

        if (isCjkLeftAlignedPunctuation(lastGlyph.content)) {
            const shrinkAmount = lastGlyph.adjustability.shrinkability[1];

            glyphShrinkRight(lastGlyph, shrinkAmount);
        }

        setGlyphGroupLeft(divide.glyphGroup);
    }
}

// Add dash to the end of divide when divide is break by Hyphen.
function addHyphenDash(
    line: IDocumentSkeletonLine,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    for (const divide of line.divides) {
        const { glyphGroup, breakType } = divide;
        const lastGlyph = glyphGroup[glyphGroup.length - 1];

        if (lastGlyph && isLetter(lastGlyph.content) && breakType === BreakPointType.Hyphen) {
            const config = getFontConfigFromLastGlyph(lastGlyph, sectionBreakConfig, paragraphStyle);

            const hyphenDashGlyph = createHyphenDashGlyph(config);
            hyphenDashGlyph.parent = lastGlyph.parent;
            hyphenDashGlyph.left = lastGlyph.left + lastGlyph.width;
            divide.glyphGroup.push(hyphenDashGlyph);
            // In latin paragraph layout, most lines end with spaces,
            // and when hyphens are added to some lines, the hyphens will bulge out,
            // and when the ends are aligned, they will not appear to be aligned,
            // so the hyphenated divide needs to be compressed
            divide.width -= hyphenDashGlyph.width;
        }
    }
}

/** Widest natural line on a page (sum of glyph widths per line). */
function getPageMaxLineWidth(page: IDocumentSkeletonPage): number {
    let max = 0;
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                const w = getLineNaturalWidth(line);
                if (w > max) max = w;
            }
        }
    }
    return max;
}

/**
 * Re-apply RTL horizontal alignment for every line on the page using a fresh
 * max line width. `lineAdjustment` runs once per paragraph; caching the max on
 * the first paragraph left shorter earlier lines pinned to a stale anchor when
 * a later paragraph grew wider (multi-line Arabic in the cell editor).
 */
function reapplyRtlHorizontalAlignmentOnPage(
    page: IDocumentSkeletonPage,
    viewModel: DocumentViewModel
) {
    const pageMaxLineWidth = getPageMaxLineWidth(page);
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                const para = viewModel.getParagraph(line.paragraphIndex);
                const { paragraphStyle = {} } = para || {};
                const { horizontalAlign = HorizontalAlign.UNSPECIFIED, direction } = paragraphStyle;
                if (direction !== TextDirection.RIGHT_TO_LEFT) {
                    continue;
                }
                horizontalAlignHandler(line, horizontalAlign, direction, pageMaxLineWidth);
                applyBidiReorderToLine(line, direction);
            }
        }
    }
}

export function lineAdjustment(
    pages: IDocumentSkeletonPage[],
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
) {
    const { endIndex } = paragraphNode;
    const paragraph = viewModel.getParagraph(endIndex) || { startIndex: 0 };

    // Walk the pages so we can pass each line its page's max natural line
    // width to `horizontalAlignHandler`. We keep the per-line work (CJK
    // shrinking, hyphenation, bidi reorder) right next to where it was so
    // sub-functions don't need extra plumbing.
    const { paragraphStyle = {} } = paragraph;
    const { horizontalAlign = HorizontalAlign.UNSPECIFIED, direction } = paragraphStyle;
    const isRtlParagraph = direction === TextDirection.RIGHT_TO_LEFT;

    for (const page of pages) {
        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    if (line.paragraphIndex !== paragraph.startIndex) {
                        continue;
                    }

                    shrinkStartAndEndCJKPunctuation(line);
                    restoreLastCJKGlyphWidth(line);
                    addHyphenDash(line, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
                    // RTL horizontal align runs once per page below so every line
                    // shares the same fresh `pageMaxLineWidth` anchor.
                    if (!isRtlParagraph) {
                        horizontalAlignHandler(line, horizontalAlign, direction);
                        applyBidiReorderToLine(line, direction);
                    }
                }
            }
        }
        reapplyRtlHorizontalAlignmentOnPage(page, viewModel);
    }
}

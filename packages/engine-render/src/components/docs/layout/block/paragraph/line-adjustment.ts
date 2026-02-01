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
import { HorizontalAlign } from '@univerjs/core';
import { hasArabic, hasCJK, hasCJKText, isCjkLeftAlignedPunctuation, isCjkRightAlignedPunctuation } from '../../../../../basics/tools';
import { BreakPointType } from '../../line-breaker/break';
import { isLetter } from '../../line-breaker/enhancers/utils';
import { createHyphenDashGlyph, glyphShrinkLeft, glyphShrinkRight, setGlyphGroupLeft } from '../../model/glyph';
import { getFontConfigFromLastGlyph, getGlyphGroupWidth, isRTLParagraph, lineIterator } from '../../tools';

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

type RunDirection = 'ltr' | 'rtl';

const HEBREW_REG = /[\u0590-\u05FF]/;
const LATIN_OR_DIGIT_REG = /[A-Za-z0-9]/;

function getStrongDirection(content: string): RunDirection | null {
    if (hasArabic(content) || HEBREW_REG.test(content)) {
        return 'rtl';
    }

    if (LATIN_OR_DIGIT_REG.test(content) || hasCJKText(content)) {
        return 'ltr';
    }

    return null;
}

function findNextStrongDirection(glyphs: IDocumentSkeletonDivide['glyphGroup'], index: number): RunDirection | null {
    for (let i = index; i < glyphs.length; i++) {
        const dir = getStrongDirection(glyphs[i].content);
        if (dir) {
            return dir;
        }
    }

    return null;
}

function buildDirectionalRuns(glyphs: IDocumentSkeletonDivide['glyphGroup'], baseDirection: RunDirection) {
    const runs: Array<{ dir: RunDirection; glyphs: IDocumentSkeletonDivide['glyphGroup'] }> = [];
    let currentDir: RunDirection | null = null;

    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        let dir = getStrongDirection(glyph.content);

        if (!dir) {
            dir = currentDir ?? findNextStrongDirection(glyphs, i + 1) ?? baseDirection;
        }

        const lastRun = runs[runs.length - 1];
        if (!lastRun || lastRun.dir !== dir) {
            runs.push({ dir, glyphs: [glyph] });
        } else {
            lastRun.glyphs.push(glyph);
        }

        currentDir = dir;
    }

    return runs;
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
 * When aligning text horizontally within a document,
 * it may be ineffective if the total line width is not initially calculated.
 * Therefore, multiple calculations are performed, which may impact performance.
 * Needs optimization for efficiency.
 */
function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign, isRTL: boolean) {
    const { divides } = line;

    for (let i = 0; i < divides.length; i++) {
        const divide = divides[i];
        const { width } = divide;
        let glyphGroupWidth = getGlyphGroupWidth(divide);

        if (width === Number.POSITIVE_INFINITY) {
            continue;
        }

        if (divide.isFull) {
            let remaining = width - glyphGroupWidth;

            // Handle hanging punctuation to the right (or left for RTL).
            if (divide.glyphGroup.length > 1) {
                const glyph = isRTL ? divide.glyphGroup[0] : divide.glyphGroup[divide.glyphGroup.length - 1];
                const amount = overhang(glyph.content) * glyph.width;

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
            }
        }

        if (horizontalAlign === HorizontalAlign.CENTER) {
            divide.paddingLeft = (width - glyphGroupWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            divide.paddingLeft = width - glyphGroupWidth;
        }

        // To fix https://github.com/dream-num/univer-pro/issues/2930
        divide.paddingLeft = Math.max(divide.paddingLeft, 0);
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

function applyBidiGlyphPositions(line: IDocumentSkeletonLine, baseDirection: RunDirection) {
    for (const divide of line.divides) {
        const runs = buildDirectionalRuns(divide.glyphGroup, baseDirection);
        const visualRuns = baseDirection === 'rtl' ? runs.slice().reverse() : runs;
        let cursor = baseDirection === 'rtl' ? getGlyphGroupWidth(divide) : 0;

        for (const run of visualRuns) {
            const runWidth = run.glyphs.reduce((sum, glyph) => sum + glyph.width, 0);
            const runStart = baseDirection === 'rtl' ? cursor - runWidth : cursor;

            if (run.dir === 'ltr') {
                let local = runStart;
                for (const glyph of run.glyphs) {
                    glyph.left = local;
                    local += glyph.width;
                }
            } else {
                let local = baseDirection === 'rtl' ? cursor : runStart + runWidth;
                for (const glyph of run.glyphs) {
                    local -= glyph.width;
                    glyph.left = local;
                }
            }

            cursor = baseDirection === 'rtl' ? runStart : runStart + runWidth;
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

    lineIterator(pages, (line) => {
        // Only need to adjust the current paragraph.
        if (line.paragraphIndex !== paragraph.startIndex) {
            return;
        }

        const { paragraphStyle = {} } = paragraph;
        const { horizontalAlign = HorizontalAlign.UNSPECIFIED } = paragraphStyle;
        const isRTL = isRTLParagraph(paragraphStyle, sectionBreakConfig);
        const effectiveAlign = horizontalAlign === HorizontalAlign.UNSPECIFIED && isRTL
            ? HorizontalAlign.RIGHT
            : horizontalAlign;
        // If the last glyph is a CJK punctuation, we want to shrink it.
        shrinkStartAndEndCJKPunctuation(line);
        // restore the original glyph width.
        restoreLastCJKGlyphWidth(line);
        // Add dash to the end of divide when divide is break by Hyphen.
        addHyphenDash(line, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
        // Handle horizontal align: left\center\right\justified.
        horizontalAlignHandler(line, effectiveAlign, isRTL);
        applyBidiGlyphPositions(line, isRTL ? 'rtl' : 'ltr');
    });
}

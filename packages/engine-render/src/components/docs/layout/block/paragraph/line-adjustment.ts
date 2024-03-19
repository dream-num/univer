/**
 * Copyright 2023-present DreamNum Inc.
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

import { HorizontalAlign, type IParagraphStyle } from '@univerjs/core';
import type { IDocumentSkeletonDivide, IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../../../../basics/i-document-skeleton-cached';
import { getGlyphGroupWidth, lineIterator } from '../../tools';
import { hasCJKText } from '../../../../..';
import { setGlyphGroupLeft } from '../../model/glyph';

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
    if (hasCJKText(lastGlyph.content)) {
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
function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign) {
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
    }
}

export function lineAdjustment(pages: IDocumentSkeletonPage[], paragraphStyle: IParagraphStyle) {
    const { horizontalAlign = HorizontalAlign.UNSPECIFIED } = paragraphStyle;
    lineIterator(pages, (line) => {
        // Handle horizontal align: left\center\right\justified.
        horizontalAlignHandler(line, horizontalAlign);
    });
}

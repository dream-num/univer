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

import type {
    IAdjustability,
    IDocumentSkeletonBoundingBox,
    IDocumentSkeletonBullet,
    IDocumentSkeletonDivide,
    IDocumentSkeletonGlyph,
} from '../../../../basics/i-document-skeleton-cached';
import type { IFontCreateConfig } from '../../../../basics/interfaces';
import type { IOpenTypeGlyphInfo } from '../shaping-engine/text-shaping';
import { BooleanNumber, BulletAlignment, DataStreamTreeTokenType, GridType } from '@univerjs/core';
import { cjk } from '../../../../basics/cjk-regexp';
import { GlyphType } from '../../../../basics/i-document-skeleton-cached';
import {
    isCjkCenterAlignedPunctuation,
    isCjkLeftAlignedPunctuation,
    isCjkRightAlignedPunctuation,
    ptToPixel,
} from '../../../../basics/tools';
import { applyFontMetricCompatibility, getDocumentCompatibilityPolicy } from '../../document-compatibility';
import { FontCache } from '../shaping-engine/font-cache';
import { validationGrid } from '../tools';

export function isSpace(char: string) {
    const SPACE_CHARS = [' ', '\u{00A0}', '　'];

    return SPACE_CHARS.includes(char);
}
// Whether the glyph is justifiable.
export function isJustifiable(
    content: string
) {
    // punctuation style is not relevant here.
    return isSpace(content)
        || cjk.hasCJKText(content)
        || isCjkLeftAlignedPunctuation(content)
        || isCjkRightAlignedPunctuation(content)
        || isCjkCenterAlignedPunctuation(content);
}

export function baseAdjustability(content: string, width: number): IAdjustability {
    if (isSpace(content)) {
        return {
            // The number for spaces is from Knuth-Plass' paper
            stretchability: [0, width / 2.0],
            shrinkability: [0, width / 3.0],
        };
    } else if (isCjkLeftAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [0, width / 2.0],
        };
    } else if (isCjkRightAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [width / 2.0, 0],
        };
    } else if (isCjkCenterAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [width / 4.0, width / 4.0],
        };
    } else {
        return {
            stretchability: [0, 0],
            shrinkability: [0, 0],
        };
    }
}

export function createSkeletonWordGlyph(
    content: string,
    config: IFontCreateConfig,
    glyphWidth?: number
): IDocumentSkeletonGlyph {
    return _createSkeletonWordOrLetter(GlyphType.WORD, content, config, glyphWidth);
}

export function createSkeletonLetterGlyph(
    content: string,
    config: IFontCreateConfig,
    glyphWidth?: number,
    glyphInfo?: IOpenTypeGlyphInfo
): IDocumentSkeletonGlyph {
    return _createSkeletonWordOrLetter(GlyphType.LETTER, content, config, glyphWidth, glyphInfo);
}

export function createSkeletonTabGlyph(config: IFontCreateConfig, glyphWidth?: number): IDocumentSkeletonGlyph {
    return _createSkeletonWordOrLetter(GlyphType.TAB, DataStreamTreeTokenType.TAB, config, glyphWidth);
}

export function createHyphenDashGlyph(config: IFontCreateConfig) {
    const dashLetterGlyph = _createSkeletonWordOrLetter(GlyphType.LETTER, '-', config);
    dashLetterGlyph.count = 0;

    return dashLetterGlyph;
}

// It is used to create inline custom blocks, such as inline images, to occupy placeholders in the layout.
export function createSkeletonCustomBlockGlyph(config: IFontCreateConfig, glyphWidth = 0, glyphHeight = 0, drawingId = ''): IDocumentSkeletonGlyph {
    const { fontStyle, textStyle } = config;
    const content = DataStreamTreeTokenType.CUSTOM_BLOCK;

    return {
        content: '',
        raw: content,
        ts: textStyle,
        fontStyle,
        width: glyphWidth,
        bBox: {
            width: 0,
            ba: glyphHeight, // Or 1/2 glyphHeight each for ba and bd.
            bd: 0,
            aba: 0,
            abd: 0,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        },
        xOffset: 0,
        left: 0,
        isJustifiable: false,
        adjustability: baseAdjustability(content, 0),
        glyphType: GlyphType.PLACEHOLDER,
        streamType: content as DataStreamTreeTokenType,
        count: 1,
        drawingId,
    };
}

export function _createSkeletonWordOrLetter(
    glyphType: GlyphType,
    content: string,
    config: IFontCreateConfig,
    glyphWidth?: number,
    glyphInfo?: IOpenTypeGlyphInfo
): IDocumentSkeletonGlyph {
    const { fontStyle, textStyle, charSpace = 1, gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE } = config;
    const skipWidthList: string[] = [
        DataStreamTreeTokenType.SECTION_BREAK,
        DataStreamTreeTokenType.TABLE_START,
        DataStreamTreeTokenType.TABLE_END,
        DataStreamTreeTokenType.TABLE_ROW_START,
        DataStreamTreeTokenType.TABLE_ROW_END,
        DataStreamTreeTokenType.TABLE_CELL_START,
        DataStreamTreeTokenType.TABLE_CELL_END,
        DataStreamTreeTokenType.COLUMN_GROUP_START,
        DataStreamTreeTokenType.COLUMN_START,
        DataStreamTreeTokenType.COLUMN_END,
        DataStreamTreeTokenType.COLUMN_GROUP_END,
        DataStreamTreeTokenType.BLOCK_START,
        DataStreamTreeTokenType.BLOCK_END,
        DataStreamTreeTokenType.CUSTOM_RANGE_START,
        DataStreamTreeTokenType.CUSTOM_RANGE_END,
        DataStreamTreeTokenType.COLUMN_BREAK,
        DataStreamTreeTokenType.PAGE_BREAK,
        DataStreamTreeTokenType.DOCS_END,
        DataStreamTreeTokenType.CUSTOM_BLOCK,
    ];
    let streamType = DataStreamTreeTokenType.LETTER;

    if (skipWidthList.indexOf(content) > -1) {
        return {
            content: '',
            raw: content,
            ts: textStyle,
            fontStyle,
            width: 0,
            bBox: {
                width: 0,
                ba: 0,
                bd: 0,
                aba: 0,
                abd: 0,
                sp: 0,
                sbr: 0,
                sbo: 0,
                spr: 0,
                spo: 0,
            },
            xOffset: 0,
            left: 0,
            isJustifiable: false,
            adjustability: baseAdjustability(content, 0),
            glyphType: GlyphType.PLACEHOLDER,
            streamType: content as DataStreamTreeTokenType,
            count: 1,
        };
    }

    if (content === DataStreamTreeTokenType.PARAGRAPH) {
        streamType = DataStreamTreeTokenType.PARAGRAPH;
    }

    let bBox = null;
    let xOffset = 0;

    if (glyphInfo && glyphInfo.boundingBox && glyphInfo.font) {
        bBox = FontCache.getBBoxFromGlyphInfo(glyphInfo, fontStyle);
    } else {
        bBox = FontCache.getTextSize(content, fontStyle);
    }
    bBox = applyFontMetricCompatibility(
        content,
        fontStyle,
        bBox,
        config.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
    );

    const { width: contentWidth = 0 } = bBox;
    let width = glyphWidth ?? contentWidth;

    if (validationGrid(gridType, snapToGrid)) {
        // When text also needs to align to the grid, process it
        // const multiple = Math.ceil(contentWidth / charSpace);
        width = contentWidth + (cjk.hasCJK(content) ? charSpace : charSpace / 2);
        if (gridType === GridType.SNAP_TO_CHARS) {
            xOffset = (width - contentWidth) / 2;
        }
    }

    // Handle kerning.
    if (glyphInfo && glyphInfo.kerning !== 0 && glyphInfo.font) {
        const radio = ptToPixel(fontStyle.fontSize) / glyphInfo.font.unitsPerEm;
        const delta = glyphInfo.kerning * radio;

        width += delta;
        xOffset += delta;
    }

    return {
        content,
        ts: textStyle,
        fontStyle,
        width,
        bBox,
        xOffset,
        left: 0,
        glyphType,
        streamType,
        isJustifiable: isJustifiable(content),
        adjustability: baseAdjustability(content, width),
        count: content.length,
        raw: content,
    };
}

export function createSkeletonBulletGlyph(
    glyph: IDocumentSkeletonGlyph,
    bulletSkeleton: IDocumentSkeletonBullet,
    charSpaceApply: number
): IDocumentSkeletonGlyph {
    const {
        // bBox: boundingBox,
        symbol: content,
        // ts: textStyle,
        // fontStyle,
        bulletAlign = BulletAlignment.START,
        bulletType = false,
    } = bulletSkeleton;
    const { fontStyle } = glyph;
    // glyph.fontStyle
    // getFontStyleString(fontStyle, localeService);
    const boundingBox = FontCache.getTextSize(content, fontStyle!);
    const contentWidth = boundingBox.width;
    // When text also needs to align to the grid, process it. LINES default reference is the global font size of the doc

    const multiple = Math.ceil(contentWidth / charSpaceApply);
    let width = (multiple < 2 ? 2 : multiple) * charSpaceApply; // Default bullet has 2 tabs

    let left = 0;

    if (bulletType) {
        // Ordered list processing, left=0 when left-aligned, otherwise adjusted based on contentWidth
        if (bulletAlign === BulletAlignment.CENTER) {
            left = -contentWidth / 2;
            width -= left;
        } else if (bulletAlign === BulletAlignment.END) {
            left = -contentWidth;
            width -= left;
        }
    }

    const bBox = _getMaxBoundingBox(glyph, boundingBox);

    return {
        content,
        ts: {
            ...glyph.ts,
            // ...textStyle,
            st: {
                s: BooleanNumber.FALSE,
            },
        },
        fontStyle,
        width,
        xOffset: 0,
        bBox,
        left,
        isJustifiable: isJustifiable(content),
        adjustability: baseAdjustability(content, width),
        glyphType: GlyphType.LIST,
        streamType: DataStreamTreeTokenType.LETTER,
        // Deliberately set to 0 so that there is no need to count when calculating the cursor.
        count: 0,
        raw: content,
    };
}

// Set the left value of the current glyph based on the width of pre glyph and the left value of the previous glyph.
export function setGlyphGroupLeft(glyphGroup: IDocumentSkeletonGlyph[], left: number = 0) {
    const spanGroupLen = glyphGroup.length;
    let preGlyph;

    for (let i = 0; i < spanGroupLen; i++) {
        const glyph = glyphGroup[i];
        glyph.left = preGlyph ? preGlyph.left + preGlyph.width : left;

        preGlyph = glyph;
    }
}

export function setGlyphLeft(glyph: IDocumentSkeletonGlyph, left: number = 0) {
    glyph.left = left;
}

export function addGlyphToDivide(
    divide: IDocumentSkeletonDivide,
    glyphGroup: IDocumentSkeletonGlyph[],
    offsetLeft: number = 0
) {
    setGlyphGroupLeft(glyphGroup, offsetLeft);

    // Set glyph parent pointer.
    for (const glyph of glyphGroup) {
        glyph.parent = divide;
    }

    divide.glyphGroup.push(...glyphGroup);
}

function _getMaxBoundingBox(glyph: IDocumentSkeletonGlyph, bulletBBox: IDocumentSkeletonBoundingBox) {
    const { ba: spanAscent, bd: spanDescent } = glyph.bBox;
    const { ba: bulletAscent, bd: bulletDescent } = bulletBBox;

    if (spanAscent + spanDescent > bulletAscent + bulletDescent) {
        return glyph.bBox;
    }

    return bulletBBox;
}

export function glyphShrinkRight(glyph: IDocumentSkeletonGlyph, amount: number) {
    glyph.width -= amount;
    glyph.adjustability.shrinkability[1] -= amount;
}

export function glyphShrinkLeft(glyph: IDocumentSkeletonGlyph, amount: number) {
    glyph.width -= amount;
    glyph.xOffset -= amount;
    glyph.adjustability.shrinkability[0] -= amount;
}

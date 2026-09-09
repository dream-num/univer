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
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonGlyph,
} from '../../../../basics/i-document-skeleton-cached';
import type { IFontCreateConfig } from '../../../../basics/interfaces';
import type { IDocumentCompatibilityPolicy } from '../../document-compatibility';
import { BooleanNumber, BulletAlignment, DataStreamTreeTokenType, GridType } from '@univerjs/core';
import { cjk } from '../../../../basics/cjk-regexp';
import { GlyphType } from '../../../../basics/i-document-skeleton-cached';
import {
    getFirstGrapheme,
    getFontStyleString,
    getTextWithCaps,
    hasArabic,
    isCjkCenterAlignedPunctuation,
    isCjkLeftAlignedPunctuation,
    isCjkRightAlignedPunctuation,
} from '../../../../basics/tools';
import { getCheckboxShapeSize, isCheckboxGlyph } from '../../../../shape/checkbox';
import {
    applyFontMetricCompatibility,
    getDocumentCompatibilityPolicy,
    getSmallCapsFontStyle,
    isTraditionalDocumentCompatibility,
} from '../../document-compatibility';
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

export function baseAdjustability(content: string, width: number, emWidth = width): IAdjustability {
    // CJK punctuation compression removes side spacing, not the half-em glyph itself.
    // Proportional fonts may already provide half-width punctuation with no spacing to remove.
    const punctuationSpacing = Math.min(width / 2, Math.max(0, width - emWidth / 2));
    if (isSpace(content)) {
        return {
            // The number for spaces is from Knuth-Plass' paper
            stretchability: [0, width / 2.0],
            shrinkability: [0, width / 3.0],
        };
    } else if (isCjkLeftAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [0, punctuationSpacing],
        };
    } else if (isCjkRightAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [punctuationSpacing, 0],
        };
    } else if (isCjkCenterAlignedPunctuation(content)) {
        return {
            stretchability: [0, 0],
            shrinkability: [punctuationSpacing / 2, punctuationSpacing / 2],
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
    glyphMetrics?: number | { ascent?: number; descent?: number; width?: number }
): IDocumentSkeletonGlyph {
    const glyphWidth = typeof glyphMetrics === 'number' ? glyphMetrics : glyphMetrics?.width;
    const glyph = _createSkeletonWordOrLetter(GlyphType.LETTER, content, config, glyphWidth);

    if (typeof glyphMetrics === 'object') {
        if (glyphMetrics.ascent != null) {
            glyph.bBox.ba = glyph.bBox.aba = glyphMetrics.ascent;
        }
        if (glyphMetrics.descent != null) {
            glyph.bBox.bd = glyph.bBox.abd = glyphMetrics.descent;
        }
    }

    return glyph;
}

const WHOLE_ENTITY_RENDER_MARKER = '\u200B';

/**
 * Creates one non-text skeleton glyph for a whole entity whose source spans
 * multiple model characters. `raw` and `count` retain the source mapping.
 *
 * The zero-width marker keeps the glyph in the document paint loop so a
 * component extension can render the entity, without painting its model
 * source as ordinary text.
 */
export function createSkeletonWholeEntityGlyph(
    raw: string,
    config: IFontCreateConfig,
    glyphMetrics: { ascent?: number; descent?: number; width?: number }
): IDocumentSkeletonGlyph {
    const glyph = createSkeletonLetterGlyph(raw, config, glyphMetrics);

    glyph.adjustability = baseAdjustability(WHOLE_ENTITY_RENDER_MARKER, glyph.width);
    glyph.bBox.width = glyph.width;
    glyph.content = WHOLE_ENTITY_RENDER_MARKER;
    glyph.count = raw.length;
    glyph.glyphType = GlyphType.PLACEHOLDER;
    glyph.isJustifiable = false;
    glyph.raw = raw;
    glyph.streamType = DataStreamTreeTokenType.LETTER;

    return glyph;
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

export function getPairKerningAdjustment(left: string, right: string, font: IDocumentSkeletonFontStyle): number {
    if (font.fontKerning !== 'normal' || !left || !right || /[\u0000-\u001F\u2028\u2029]/u.test(left + right)) {
        return 0;
    }
    // Subtract unkerned shaping to isolate kerning from ligatures and script shaping.
    const adjustment = (text: string) => FontCache.getMeasureText(text, font.fontString, 'normal').width -
        FontCache.getMeasureText(text, font.fontString, 'none').width;
    return adjustment(left + right) - adjustment(left) - adjustment(right);
}

export function applyGlyphKerning(glyphs: IDocumentSkeletonGlyph[]): void {
    for (const glyph of glyphs) {
        if (glyph.kerningAdjustment) {
            glyph.width -= glyph.kerningAdjustment;
            glyph.kerningAdjustment = 0;
        }
    }
    for (let i = 1; i < glyphs.length; i++) {
        const left = glyphs[i - 1];
        const right = glyphs[i];
        const adjustment = getGlyphPairKerningAdjustment(left, right);
        if (adjustment) {
            left.kerningAdjustment = adjustment;
            left.width += adjustment;
        }
    }
}

export function getGlyphPairKerningAdjustment(left?: IDocumentSkeletonGlyph, right?: IDocumentSkeletonGlyph): number {
    const font = left?.fontStyle;
    if (!left || !right || !font || font.fontKerning !== 'normal' || right.fontStyle?.fontKerning !== 'normal' ||
        font.fontString !== right.fontStyle.fontString ||
        left.glyphType !== GlyphType.LETTER || right.glyphType !== GlyphType.LETTER ||
        left.streamType !== DataStreamTreeTokenType.LETTER || right.streamType !== DataStreamTreeTokenType.LETTER ||
        getTextWithCaps(left.raw, left.ts?.caps || left.ts?.smallCaps) !== left.content ||
        getTextWithCaps(right.raw, right.ts?.caps || right.ts?.smallCaps) !== right.content ||
        left.xOffset !== 0 || right.xOffset !== 0 ||
        left.kerningAdjustment == null || right.kerningAdjustment == null) {
        return 0;
    }
    const adjustment = getPairKerningAdjustment(left.content, right.content, font);
    return Number.isFinite(adjustment) && left.width - left.kerningAdjustment + adjustment >= 0 ? adjustment : 0;
}

/** Shared by skeleton layout and lightweight host measurement; offsets also drive painting. */
export function measureTextWithCharacterSpacing(
    content: string,
    spacing: number | undefined,
    measure: (text: string) => number,
    pairAdjustment?: (left: string, right: string) => number
): { content: string; width: number; inkWidth: number; segments: Array<{ content: string; left: number }> } | undefined {
    if (!spacing || !Number.isFinite(spacing) || !content) {
        return;
    }

    const segments: Array<{ content: string; left: number }> = [];
    let width = 0;
    let inkWidth = 0;
    let index = 0;
    while (index < content.length) {
        let text = getFirstGrapheme(content.slice(index))!;
        index += text.length;
        // Keep cursive joins intact. Canvas cannot insert tracking inside an Arabic word without reshaping it.
        if (hasArabic(text)) {
            while (index < content.length) {
                const next = getFirstGrapheme(content.slice(index))!;
                if (!hasArabic(next)) {
                    break;
                }
                text += next;
                index += next.length;
            }
        }
        const measuredWidth = measure(text);
        const previous = segments[segments.length - 1];
        if (previous && pairAdjustment) {
            width += pairAdjustment(previous.content, text);
        }
        segments.push({ content: text, left: width });
        inkWidth = Math.max(inkWidth, width + measuredWidth);
        // Structural and zero-width formatting characters do not reserve a tracking interval.
        const extra = /^[\u0000-\u001F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]+$/u.test(text) ? 0 : spacing;
        width += Math.max(0, measuredWidth + extra);
    }
    return { content, width, inkWidth, segments };
}

export function _createSkeletonWordOrLetter(
    glyphType: GlyphType,
    raw: string,
    config: IFontCreateConfig,
    glyphWidth?: number
): IDocumentSkeletonGlyph {
    const { textStyle, charSpace = 1, gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE } = config;
    const documentCompatibilityPolicy = config.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const fontStyle = getSmallCapsFontStyle(raw, textStyle, config.fontStyle, documentCompatibilityPolicy);
    const content = getTextWithCaps(raw, textStyle.caps || textStyle.smallCaps);
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

    const isDrawingMLLineSeparator = glyphWidth == null && content === '\u2028' && documentCompatibilityPolicy.mode === 'drawingml';
    bBox = FontCache.getTextSize(content, fontStyle);
    if (fontStyle !== config.fontStyle) {
        bBox = {
            ...FontCache.getTextSize(content, config.fontStyle),
            width: bBox.width,
            aba: bBox.aba,
            abd: bBox.abd,
        };
    }
    bBox = applyFontMetricCompatibility(
        content,
        fontStyle,
        bBox,
        documentCompatibilityPolicy
    );
    // Canvas normalizes a line separator to a space; DrawingML breaks must not consume line width.
    if (isDrawingMLLineSeparator ||
        (content === DataStreamTreeTokenType.PARAGRAPH && isTraditionalDocumentCompatibility(documentCompatibilityPolicy))) {
        bBox = { ...bBox, width: 0 };
    }

    const unspacedWidth = bBox.width;
    const spacing = glyphWidth == null && !isDrawingMLLineSeparator && streamType === DataStreamTreeTokenType.LETTER && glyphType !== GlyphType.TAB
        ? measureTextWithCharacterSpacing(
            content,
            textStyle.sc,
            (text) => text === content
                ? unspacedWidth
                : applyFontMetricCompatibility(text, fontStyle, FontCache.getTextSize(text, fontStyle), documentCompatibilityPolicy).width,
            (left, right) => getPairKerningAdjustment(left, right, fontStyle)
        )
        : undefined;
    if (spacing) {
        bBox = { ...bBox, width: spacing.inkWidth };
    }
    const { width: contentWidth = 0 } = bBox;
    let width = glyphWidth ?? spacing?.width ?? contentWidth;

    if (!isDrawingMLLineSeparator && validationGrid(gridType, snapToGrid)) {
        // When text also needs to align to the grid, process it
        // const multiple = Math.ceil(contentWidth / charSpace);
        width = (spacing?.width ?? contentWidth) + (cjk.hasCJK(content) ? charSpace : charSpace / 2);
        if (gridType === GridType.SNAP_TO_CHARS) {
            xOffset = (width - contentWidth) / 2;
        }
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
        adjustability: baseAdjustability(content, width, documentCompatibilityPolicy.mode === 'drawingml' && glyphWidth == null
            ? fontStyle.fontSize * (96 / 72)
            : width),
        count: raw.length,
        raw,
        ...(glyphWidth == null && !validationGrid(gridType, snapToGrid) && fontStyle.fontKerning === 'normal'
            ? { kerningAdjustment: 0 }
            : {}),
        ...(spacing && spacing.segments.length > 1 ? { textSpacing: spacing } : {}),
    };
}

export function createSkeletonBulletGlyph(
    glyph: IDocumentSkeletonGlyph,
    bulletSkeleton: IDocumentSkeletonBullet,
    charSpaceApply: number,
    compatibilityPolicy?: IDocumentCompatibilityPolicy
): IDocumentSkeletonGlyph {
    const {
        symbol: content,
        ts: bulletTextStyle,
        bulletAlign = BulletAlignment.START,
        bulletType = false,
    } = bulletSkeleton;
    const textStyle = {
        ...glyph.ts,
        ...bulletTextStyle,
        st: {
            s: BooleanNumber.FALSE,
        },
    };
    const fontStyle = getFontStyleString(textStyle);
    const measuredBoundingBox = FontCache.getTextSize(content, fontStyle);
    const checkboxSize = isCheckboxGlyph(content) ? getCheckboxShapeSize(textStyle.fs) : null;
    const boundingBox = checkboxSize == null
        ? measuredBoundingBox
        : _getCheckboxBoundingBox(measuredBoundingBox, checkboxSize);
    const contentWidth = boundingBox.width;
    // When text also needs to align to the grid, process it. LINES default reference is the global font size of the doc

    const multiple = Math.ceil(contentWidth / charSpaceApply);
    // DrawingML uses paragraph indents for bullet spacing, not Word's default tab reservation.
    let width = compatibilityPolicy?.mode === 'drawingml'
        ? contentWidth
        : Math.max(2, multiple) * charSpaceApply;

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

    const bBox = checkboxSize == null ? _getMaxBoundingBox(glyph, boundingBox) : boundingBox;

    return {
        content,
        ts: textStyle,
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

function _getCheckboxBoundingBox(
    boundingBox: IDocumentSkeletonBoundingBox,
    size: number
): IDocumentSkeletonBoundingBox {
    const fontExtra = size - Math.abs(boundingBox.ba) - Math.abs(boundingBox.bd);
    const actualExtra = size - Math.abs(boundingBox.aba) - Math.abs(boundingBox.abd);

    // Expand equally above and below the measured glyph so its font-relative center stays stable.
    return {
        ...boundingBox,
        width: size,
        ba: Math.abs(boundingBox.ba) + fontExtra / 2,
        bd: Math.abs(boundingBox.bd) + fontExtra / 2,
        aba: Math.abs(boundingBox.aba) + actualExtra / 2,
        abd: Math.abs(boundingBox.abd) + actualExtra / 2,
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
    applyGlyphKerning(glyphGroup);
    let left = offsetLeft;
    const previous = divide.glyphGroup[divide.glyphGroup.length - 1];
    if (previous?.kerningAdjustment != null && glyphGroup.length) {
        const adjustment = getGlyphPairKerningAdjustment(previous, glyphGroup[0]);
        const delta = adjustment - previous.kerningAdjustment;
        previous.width += delta;
        previous.kerningAdjustment = adjustment;
        left += delta;
    }
    setGlyphGroupLeft(glyphGroup, left);

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

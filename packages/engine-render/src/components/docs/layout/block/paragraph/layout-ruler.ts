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

import type { INumberUnit, IParagraphProperties, ITabStop, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    IDocumentSkeletonTable,
} from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, IParagraphTableCache, ISectionBreakConfig } from '../../../../../basics/interfaces';
import type {
    IFloatObject,
    ILayoutContext,
} from '../../tools';
import {
    BooleanNumber,
    characterSpacingControlType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    GridType,
    HorizontalAlign,
    NAMED_STYLE_SPACE_MAP,
    NumberUnitType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    TableTextWrapType,
    TabStopAlignment,
    WrapStrategy,
} from '@univerjs/core';
import { cjk } from '../../../../../basics/cjk-regexp';
import {
    DocumentSkeletonPageType,
    GlyphType,
    LineType,
} from '../../../../../basics/i-document-skeleton-cached';
import { isCjkLeftAlignedPunctuation } from '../../../../../basics/tools';
import { getDocsCustomBlockRenderViewport } from '../../../custom-block-render-viewport';
import { getNominalFontLineHeight, isTraditionalDocumentCompatibility } from '../../../document-compatibility';
import { BreakPointType } from '../../line-breaker/break';
import {
    addGlyphToDivide,
    applyGlyphKerning,
    createSkeletonBulletGlyph,
    getGlyphGroupFontBoundingBox,
    getGlyphGroupShrinkability,
    getGlyphGroupStretchability,
    getGlyphPairKerningAdjustment,
    preserveLineStartPunctuationSpace,
} from '../../model/glyph';
import {
    calculateLineTopByDrawings,
    collisionDetection,
    createAndUpdateBlockAnchor,
    createSkeletonLine,
    setLineMarginBottom,
    TRADITIONAL_TABLE_WRAP_MIN_WIDTH,
    updateDivideInfo,
} from '../../model/line';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import {
    FloatObjectType,
    getCharSpaceApply,
    getCharSpaceConfig,
    getDrawingMLLineBaseline,
    getLastLineByColumn,
    getLastNotFullColumnInfo,
    getLastNotFullDivideInfo,
    getLastPage,
    getLastSection,
    getLineHeightConfig,
    getNumberUnitValue,
    getPositionHorizon,
    getPositionVertical,
    isBlankColumn,
    isColumnFull,
    lineIterator,
    reachesNextDocumentGridLine,
} from '../../tools';
import { cachePrecomputedTableSkeleton, createTableSkeletons, getTableLeft } from '../table';

const LINE_LAYOUT_OVERFLOW_TOLERANCE = 2;
const FLOAT_OBJECT_RELAYOUT_LIMIT = 5;
const MIN_LINE_WIDTH_TOLERANCE = 1;
const MAX_LINE_WIDTH_TOLERANCE = 3;
const RELATIVE_LINE_WIDTH_TOLERANCE = 0.01;

interface IDefaultSpanMetrics {
    lineHeight: number;
    hasInlineCustomBlock: boolean;
    normalLineHeight?: number;
    drawingMLLineHeight?: number;
}

function isBeyondDivideWidth(width: number, divideWidth: number, lineWrapTolerance?: number) {
    const defaultTolerance = Math.min(
        MAX_LINE_WIDTH_TOLERANCE,
        Math.max(MIN_LINE_WIDTH_TOLERANCE, divideWidth * RELATIVE_LINE_WIDTH_TOLERANCE)
    );

    const tolerance = lineWrapTolerance != null && Number.isFinite(lineWrapTolerance) && lineWrapTolerance >= 0
        ? lineWrapTolerance
        : defaultTolerance;

    return width - divideWidth > tolerance;
}

function isGlyphGroupBeyondDivideWidth(
    glyphGroup: IDocumentSkeletonGlyph[],
    offsetLeft: number,
    divideWidth: number,
    hangingPunctuation = false,
    precedingGlyphs?: IDocumentSkeletonGlyph[],
    preserveWordSpacing = false,
    lineWrapTolerance?: number,
    includeParagraphMark = false
) {
    let trailingIndex = glyphGroup.length - 1;
    while (trailingIndex >= 0 && (
        glyphGroup[trailingIndex].width === 0 ||
        glyphGroup[trailingIndex].content === DataStreamTreeTokenType.PARAGRAPH ||
        glyphGroup[trailingIndex].streamType === DataStreamTreeTokenType.SECTION_BREAK
    )) {
        trailingIndex--;
    }
    if (trailingIndex < 0) {
        // A paragraph terminator remains on its line even after an oversized inline object.
        return false;
    }
    // A candidate line has no adjacent Latin glyph beyond either outer edge.
    const trailingAutoSpacing = glyphGroup[trailingIndex].autoSpacing?.[1] ?? 0;
    const leadingAutoSpacing = offsetLeft === 0 ? glyphGroup[0].autoSpacing?.[0] ?? 0 : 0;
    const width = __getGlyphGroupWidth(glyphGroup, includeParagraphMark) - trailingAutoSpacing - leadingAutoSpacing;
    if (preserveWordSpacing) {
        let trailingSpace = 0;
        for (let index = trailingIndex; index >= 0 && glyphGroup[index].content === DataStreamTreeTokenType.SPACE; index--) {
            trailingSpace += glyphGroup[index].width;
        }
        // Word leaves trailing spaces outside the measure, but does not borrow whole-pixel
        // overflow tolerance or compressed word spaces to pull another Western word in.
        return offsetLeft + width - trailingSpace > divideWidth + 1e-6;
    }
    if (!isBeyondDivideWidth(offsetLeft + width, divideWidth, lineWrapTolerance)) {
        return false;
    }
    const trailingGlyph = glyphGroup[trailingIndex];
    const trailingShrinkability = Math.max(0, (trailingGlyph?.adjustability?.shrinkability?.[1] ?? 0) - trailingAutoSpacing / 2);
    const alternateLanguage = trailingGlyph?.ts?.altLang;
    // Office uses the alternate East Asian language for CJK punctuation in mixed-language runs.
    const punctuationLanguage = /^(?:ja|zh|ko)(?:-|$)/i.test(alternateLanguage ?? '')
        ? alternateLanguage
        : trailingGlyph?.ts?.lang;
    // JLREQ hanging punctuation covers full stops and commas, not closing brackets.
    // Keep punctuation compression and the legacy behavior for unspecified languages separate.
    const permitsHanging = trailingGlyph && (/^ja(?:-|$)/i.test(punctuationLanguage ?? '')
        ? /^[。．、，]$/.test(trailingGlyph.content)
        : isCjkLeftAlignedPunctuation(trailingGlyph.content));
    const trailingHangingWidth = hangingPunctuation && permitsHanging
        ? trailingGlyph.width
        : 0;
    const hangingExtra = Math.max(0, trailingHangingWidth - trailingShrinkability);
    // ponytail: Other scripts retain the closer-break rule until covered by matching source-document fixtures.
    const wordFitsWithPunctuationCompression = precedingGlyphs !== undefined
        && offsetLeft <= divideWidth
        && glyphGroup.some((glyph) => /[a-z\d]/i.test(glyph.content))
        && glyphGroup.every((glyph) => !cjk.hasCJKText(glyph.content))
        && offsetLeft + width - getGlyphGroupShrinkability(precedingGlyphs, true)
        - getGlyphGroupShrinkability(glyphGroup, true) - hangingExtra <= divideWidth + MIN_LINE_WIDTH_TOLERANCE;
    const precedingLineCanStretch = precedingGlyphs !== undefined
        && (glyphGroup[0].autoSpacing?.[0] ?? 0) > 0
        && offsetLeft < divideWidth
        && divideWidth - offsetLeft <= getGlyphGroupStretchability(precedingGlyphs);
    // ponytail: Native legacy-report fixtures allow a Han glyph after a Western
    // word's explicit space to use remaining punctuation compression. Other
    // already-compressed boundaries keep the closer-break rule until verified.
    const spacedWesternWordFits = precedingGlyphs !== undefined
        && offsetLeft > divideWidth
        && precedingGlyphs[precedingGlyphs.length - 1]?.content === ' '
        && /[a-z\d]/i.test(precedingGlyphs[precedingGlyphs.length - 2]?.content ?? '')
        && cjk.hasCJKText(glyphGroup[0].content)
        && offsetLeft + width - getGlyphGroupShrinkability(precedingGlyphs, true)
        - getGlyphGroupShrinkability(glyphGroup, true) - hangingExtra <= divideWidth + MIN_LINE_WIDTH_TOLERANCE;

    // Prefer the closer legal break: do not compress more than leaving the group on the next line would expand.
    // Keep a Western word when punctuation alone can accommodate it, without extending an already compressed line.
    // Line-end punctuation already sheds its trailing space before line-wide justification.
    // At a Western-to-Han boundary, retain a line that can fill using its existing adjustable gaps.
    // Fixed tab anchors cannot borrow space from text on their other side.
    const shrinkability = precedingGlyphs !== undefined
        && (wordFitsWithPunctuationCompression || spacedWesternWordFits
            || (!precedingLineCanStretch
                && offsetLeft + width - trailingShrinkability - hangingExtra - divideWidth <= divideWidth - offsetLeft))
        && !precedingGlyphs.some((glyph) => glyph.glyphType === GlyphType.TAB)
        && !glyphGroup.some((glyph) => glyph.glyphType === GlyphType.TAB)
        ? getGlyphGroupShrinkability(precedingGlyphs) + getGlyphGroupShrinkability(glyphGroup) - (trailingAutoSpacing + leadingAutoSpacing) / 2
        : trailingShrinkability;
    return isBeyondDivideWidth(offsetLeft + width - shrinkability - hangingExtra, divideWidth, lineWrapTolerance);
}

export function layoutParagraph(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    renderBullet = isParagraphFirstShapedText,
    startNewLine = false
) {
    paragraphConfig.documentCompatibilityPolicy ??= sectionBreakConfig.documentCompatibilityPolicy;
    if (isParagraphFirstShapedText || startNewLine) {
        // elementIndex === 0 means the first character at the beginning of a paragraph, needs a new line to distinguish from the previous paragraph
        if (renderBullet && paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            const directParagraphHanging = paragraphStyle.hanging;
            // If it is the beginning of a paragraph, bullet needs to be added
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 10.5 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
            const bulletGlyph = createSkeletonBulletGlyph(glyphGroup[0], bulletSkeleton, charSpaceApply, paragraphConfig.documentCompatibilityPolicy ?? sectionBreakConfig.documentCompatibilityPolicy);
            const paragraphProperties = bulletSkeleton.paragraphProperties || {};
            const bulletParagraphStyle = {
                ...paragraphProperties,
                hanging: paragraphProperties.hanging ?? { v: bulletGlyph.width },
            } as IParagraphProperties;

            paragraphConfig.paragraphStyle = {
                ...bulletParagraphStyle,
                ...paragraphConfig.paragraphStyle,
            };

            const hangingWidth = getNumberUnitValue(paragraphConfig.paragraphStyle.hanging, charSpaceApply);
            if (hangingWidth > 0) {
                // Word list-level indents are authored positions, not a minimum of two default tab stops.
                const hasAuthoredHanging = directParagraphHanging != null ||
                    (isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
                        paragraphProperties.hanging != null);
                bulletGlyph.width = hasAuthoredHanging
                    ? hangingWidth
                    : Math.max(bulletGlyph.width, hangingWidth);
            }

            _lineOperator(ctx, [bulletGlyph, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
        } else {
            _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
        }
    } else {
        _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
    }

    if (breakPointType === BreakPointType.Mandatory) {
        const divideInfo = getLastNotFullDivideInfo(getLastPage(pages));
        if (divideInfo) {
            updateDivideInfo(divideInfo.divide, { isFull: true, breakType: breakPointType });
        }
    }

    return [...pages];
}

function isGlyphGroupEndWithWhiteSpaces(glyphGroup: IDocumentSkeletonGlyph[], drawingML = false) {
    if (glyphGroup.length <= 1) {
        return false;
    }

    let isInWhiteSpace = false;

    for (const g of glyphGroup) {
        if (g.content === DataStreamTreeTokenType.SPACE || (drawingML && g.content === '\u3000')) {
            isInWhiteSpace = true;
        }

        if (isInWhiteSpace &&
            g.content !== DataStreamTreeTokenType.SPACE && !(drawingML && g.content === '\u3000') &&
            g.content !== DataStreamTreeTokenType.PARAGRAPH &&
            g.streamType !== DataStreamTreeTokenType.SECTION_BREAK && g.streamType !== DataStreamTreeTokenType.PAGE_BREAK) {
            return false;
        }
    }

    return isInWhiteSpace;
}

function isGlyphGroupBeyondContentBox(glyphGroup: IDocumentSkeletonGlyph[], left: number, divideWidth: number, drawingML = false) {
    if (glyphGroup.length <= 1) {
        return false;
    }

    let width = left;
    let isBeyondContentBox = false;

    for (const g of glyphGroup) {
        if (
            g.content === DataStreamTreeTokenType.SPACE ||
            (drawingML && g.content === '\u3000') ||
            g.content === DataStreamTreeTokenType.PARAGRAPH ||
            g.streamType === DataStreamTreeTokenType.SECTION_BREAK
        ) {
            break;
        }
        width += g.width;

        if (width > divideWidth) {
            isBeyondContentBox = true;
            break;
        }
    }

    return isBeyondContentBox;
}

function shouldKeepOverflowingTextOnLine(sectionBreakConfig: ISectionBreakConfig): boolean {
    const wrapStrategy = sectionBreakConfig.renderConfig?.wrapStrategy;

    return wrapStrategy === WrapStrategy.CLIP || wrapStrategy === WrapStrategy.OVERFLOW;
}

// Gets the number of consecutive lines ending with a hyphen.
function _getConsecutiveHyphenLineCount(divide: IDocumentSkeletonDivide) {
    const column = divide.parent?.parent;

    if (column == null) {
        return 0;
    }

    let count = 0;

    for (let i = column.lines.length - 1; i >= 0; i--) {
        const line = column.lines[i];
        const lastDivide = line.divides[line.divides.length - 1];
        if (lastDivide.breakType === BreakPointType.Hyphen) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

function _popHyphenSlice(divide: IDocumentSkeletonDivide) {
    const glyphGroup: IDocumentSkeletonGlyph[] = [];

    let lastGlyph = divide.glyphGroup.pop();

    while (lastGlyph && lastGlyph.content !== ' ') {
        glyphGroup.unshift(lastGlyph);

        lastGlyph = divide.glyphGroup.pop();
    }

    // The separator belongs to the source stream, even when the word moves.
    if (lastGlyph) {
        divide.glyphGroup.push(lastGlyph);
    }

    // If the hyphenated word slice is the first word slice of the divide,
    // ignore this rule and recovery divide.
    if (!divide.glyphGroup.some((glyph) => glyph.content !== ' ')) {
        divide.glyphGroup.push(...glyphGroup);

        glyphGroup.length = 0;
    }

    return glyphGroup;
}

function _divideOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanMetrics?: IDefaultSpanMetrics
) {
    const lastPage = getLastPage(pages);
    const divideInfo = getLastNotFullDivideInfo(lastPage); // Get the first divide in the latest line that is not full.
    ctx.footnoteLayout?.updateReferenceGlyphs(lastPage, glyphGroup, sectionBreakConfig, paragraphConfig);
    if (divideInfo) {
        const { divide, isLast } = divideInfo;
        const compressLineStart = paragraphConfig.paragraphStyle?.topLinePunct
            ?? (isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) ? BooleanNumber.FALSE : BooleanNumber.TRUE);
        if (divide.glyphGroup.length === 0 && glyphGroup.length > 0 && compressLineStart === BooleanNumber.FALSE) {
            // Set the same uncompressed width before fitting and before line-wide justification.
            preserveLineStartPunctuationSpace(glyphGroup[0]);
        }
        const tabStops = getParagraphTabStops(ctx, sectionBreakConfig, paragraphConfig);
        _adjustExplicitTabStop(divide, glyphGroup, paragraphConfig, tabStops);
        const lastGlyph = divide?.glyphGroup?.[divide.glyphGroup.length - 1];
        const lastWidth = lastGlyph?.width || 0;
        const lastLeft = lastGlyph?.left || 0;
        const preOffsetLeft = lastWidth + lastLeft;
        _adjustIncomingTabStops(divide, glyphGroup, preOffsetLeft, sectionBreakConfig, paragraphConfig, tabStops);
        const fitOffsetLeft = preOffsetLeft + getGlyphPairKerningAdjustment(lastGlyph, glyphGroup[0]) -
            (lastGlyph?.kerningAdjustment ?? 0);
        const { hyphenationZone } = sectionBreakConfig;
        const drawingML = sectionBreakConfig.documentCompatibilityPolicy?.mode === 'drawingml';
        const hangingPunctuation = paragraphConfig.paragraphStyle?.hangingPunctuation === BooleanNumber.TRUE;
        const lineWrapTolerance = sectionBreakConfig.renderConfig?.lineWrapTolerance ?? (drawingML ? 0 : undefined);
        const compression = sectionBreakConfig.characterSpacingControl ?? ctx.dataModel.documentStyle.characterSpacingControl;
        const horizontalAlign = paragraphConfig.paragraphStyle?.horizontalAlign;
        const westernLine = !glyphGroup.some((glyph) => cjk.hasCJKText(glyph.content))
            && !divide.glyphGroup.some((glyph) => cjk.hasCJKText(glyph.content));
        const preserveWordSpacing = isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
            && (horizontalAlign == null || horizontalAlign === HorizontalAlign.UNSPECIFIED || horizontalAlign === HorizontalAlign.LEFT)
            && preOffsetLeft + __getGlyphGroupWidth(glyphGroup) > divide.width
            && westernLine;
        // Word's character compression is independent of justification: left-aligned
        // report text also contracts punctuation to fit a closer legal line break.
        const allowLineCompression = isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
            && (compression !== characterSpacingControlType.doNotCompress ||
                (westernLine && (horizontalAlign === HorizontalAlign.JUSTIFIED || horizontalAlign === HorizontalAlign.BOTH)))
            && (horizontalAlign === HorizontalAlign.LEFT || horizontalAlign === HorizontalAlign.JUSTIFIED || horizontalAlign === HorizontalAlign.BOTH || horizontalAlign === HorizontalAlign.DISTRIBUTED);
        if (isGlyphGroupBeyondDivideWidth(
            glyphGroup,
            fitOffsetLeft,
            divide.width,
            hangingPunctuation,
            allowLineCompression ? divide.glyphGroup : undefined,
            preserveWordSpacing,
            lineWrapTolerance,
            !isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
        )) {
            if (
                divide?.glyphGroup.length === 0 &&
                glyphGroup.length > 0 &&
                glyphGroup[0].streamType === DataStreamTreeTokenType.CUSTOM_BLOCK
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
                return;
            }

            if (shouldKeepOverflowingTextOnLine(sectionBreakConfig)) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
                return;
            }

            // width exceeds divide width
            updateDivideInfo(divide, {
                isFull: true,
            });
            const hyphenLineCount = _getConsecutiveHyphenLineCount(divideInfo.divide);
            const { consecutiveHyphenLimit = Number.POSITIVE_INFINITY } = sectionBreakConfig;

            // There are two main ways to deal with word or number strings exceeding divide width
            // 1. If you end with a line break(\r), you need to append a line break(\r) to the end of divide, even if it exceeds the divide width.
            // 2. In a blank line, if the English word or consecutive number exceeds the width of the divide, the English word and number string will be split, and some of them will be added to the previous line, and the rest will be placed in the new line.
            // There is a boundary case, that is, the width of the English character exceeds the width of the divide, and this character needs to be appended to the previous line.
            if (
                divideInfo.isLast &&
                glyphGroup.length === 1 &&
                (glyphGroup[0].content === DataStreamTreeTokenType.SPACE ||
                    (drawingML && glyphGroup[0].content === '\u3000') ||
                    glyphGroup[0].content === DataStreamTreeTokenType.PARAGRAPH)
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            } else if (
                // If a line of text ends with consecutive spaces, the spaces should not be placed on the second line.
                divideInfo.isLast && !isGlyphGroupBeyondContentBox(glyphGroup, fitOffsetLeft, divide.width, drawingML) &&
                isGlyphGroupEndWithWhiteSpaces(glyphGroup, drawingML)
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            } else if (
                !isLast &&
                divide?.glyphGroup.length === 0 &&
                glyphGroup.length === 1 &&
                glyphGroup[0].streamType === DataStreamTreeTokenType.CUSTOM_BLOCK &&
                glyphGroup[0].width > divide.width
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
            } else if (!isLast && divide?.glyphGroup.length === 0) {
                // A wrap drawing can leave a sliver before another usable divide.
                // Preserve the shaped word and try the next divide instead of
                // forcing a single glyph into that sliver.
                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    isParagraphFirstShapedText,
                    breakPointType,
                    defaultSpanMetrics
                );
            } else if (divide?.glyphGroup.length === 0) {
                const line = divide.parent!;
                const column = line.parent!;
                const section = column.parent!;
                const wordWidth = __getGlyphGroupWidth(glyphGroup);
                if (
                    isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!) &&
                    wordWidth < column.width &&
                    calculateLineTopByDrawings(line.lineHeight, line.top, lastPage, null, null, column.left, column.width, section.top, wordWidth - 0.001) > line.top
                ) {
                    // Preserve the shaped word when the obstacle, rather than the
                    // column, is too narrow. Normal long-word breaking still applies.
                    _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanMetrics);
                    return;
                }
                const sliceGlyphGroup: IDocumentSkeletonGlyph[] = [];

                while (glyphGroup.length) {
                    sliceGlyphGroup.push(glyphGroup.shift()!);

                    if (isGlyphGroupBeyondDivideWidth(
                        sliceGlyphGroup,
                        0,
                        divide.width,
                        hangingPunctuation,
                        allowLineCompression ? [] : undefined,
                        preserveWordSpacing,
                        lineWrapTolerance,
                        !isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
                    )) {
                        // To avoid infinity loop when width is less than one char's width.
                        if (sliceGlyphGroup.length > 1) { // || (sliceGlyphGroup.length > 0 && sliceGlyphGroup[sliceGlyphGroup.length - 1].drawingId)) {
                            glyphGroup.unshift(sliceGlyphGroup.pop()!);
                        }
                        break;
                    }
                }

                if (sliceGlyphGroup.length > 0) {
                    // An oversized first glyph still owns its paragraph terminator;
                    // moving the terminator alone would create a spurious blank line.
                    if (glyphGroup.every(__isStructuralTerminatorGlyph)) {
                        sliceGlyphGroup.push(...glyphGroup.splice(0));
                    }
                    addGlyphToDivide(divide, sliceGlyphGroup, preOffsetLeft);
                }

                if (glyphGroup.length) {
                    // Only Divide in the first paragraph is the beginning of the paragraph
                    _divideOperator(
                        ctx,
                        glyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        false,

                        breakPointType,
                        defaultSpanMetrics
                    );
                }
            } else if (hyphenLineCount > consecutiveHyphenLimit) {
                const hyphenSliceGlyphGroup = _popHyphenSlice(divide);

                if (hyphenSliceGlyphGroup.length > 0) {
                    updateDivideInfo(divide, {
                        breakType: BreakPointType.Normal,
                    });

                    _divideOperator(ctx, hyphenSliceGlyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, BreakPointType.Hyphen);
                }

                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    isParagraphFirstShapedText,

                    breakPointType,
                    defaultSpanMetrics
                );
            } else {
                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    isParagraphFirstShapedText,

                    breakPointType,
                    defaultSpanMetrics
                );
            }
        } else if ( // Determine if first word slice appears inside the hyphenation zone.
            isLast &&
            hyphenationZone &&
            hyphenationZone > 0 &&
            preOffsetLeft >= divide.width - hyphenationZone &&
            breakPointType === BreakPointType.Hyphen &&
            divide.breakType === BreakPointType.Normal
        ) {
            updateDivideInfo(divide, {
                isFull: true,
            });

            _divideOperator(
                ctx,
                glyphGroup,
                pages,
                sectionBreakConfig,
                paragraphConfig,
                isParagraphFirstShapedText,

                breakPointType,
                defaultSpanMetrics
            );
        } else {
            // w does not exceed divide width, add it to divide
            const currentLine = divide.parent;
            if (currentLine?.parent?.parent && ctx.footnoteLayout && glyphGroup.some((glyph) => glyph.noteId)) {
                const bodyBottom = currentLine.parent.parent.top + currentLine.top + currentLine.lineHeight;
                const bodyLimit = ctx.footnoteLayout.getBodyLimit(lastPage, pages, sectionBreakConfig, bodyBottom, glyphGroup);
                if (bodyBottom > bodyLimit + LINE_LAYOUT_OVERFLOW_TOLERANCE) {
                    const column = currentLine.parent;
                    const cachedGlyphs = __getGlyphGroupByLine(currentLine);
                    column.lines.pop();
                    const previousLine = column.lines[column.lines.length - 1];
                    const previousBottom = column.parent!.top + (previousLine == null ? 0 : previousLine.top + previousLine.lineHeight);
                    ctx.footnoteLayout.getBodyLimit(lastPage, pages, sectionBreakConfig, previousBottom);
                    _pageOperator(ctx, [...cachedGlyphs, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, currentLine.paragraphStart, breakPointType, defaultSpanMetrics);
                    return;
                }
            }
            const lineGlyphs = currentLine ? __getGlyphGroupByLine(currentLine) : [];
            const maxBox = getGlyphGroupFontBoundingBox(paragraphConfig.documentCompatibilityPolicy, lineGlyphs, glyphGroup);

            if (currentLine?.parent &&
                isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
                __isPositionedCustomBlockOnlyLine(lineGlyphs, paragraphConfig.paragraphNonInlineSkeDrawings) &&
                glyphGroup.some((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH && glyph.bBox.ba + glyph.bBox.bd > 0) &&
                ctx.viewModel.getSelfOrHeaderFooterViewModel(lastPage.segmentId).getParagraph(paragraphConfig.paragraphIndex) != null) {
                // The mark can arrive after a heightless anchor fragment. Re-layout the
                // complete paragraph so its real height also participates in pagination.
                currentLine.parent.lines.pop();
                _lineOperator(ctx, [...lineGlyphs, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, currentLine.paragraphStart, breakPointType);
                return;
            }

            if (currentLine?.parent && __isNullLine(currentLine) && __hasFlowGlyph(glyphGroup)) {
                const cachedGlyphs = __getGlyphGroupByLine(currentLine);
                if (cachedGlyphs.length > 0 && cachedGlyphs.every((glyph) => glyph.streamType === DataStreamTreeTokenType.PAGE_BREAK)) {
                    // A skipped rendered-page hint has no font metrics. Let the first real text
                    // establish its line, including normal font leading and available page height.
                    currentLine.parent.lines.pop();
                    _lineOperator(ctx, [...cachedGlyphs, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, currentLine.paragraphStart, breakPointType, defaultSpanMetrics);
                    return;
                }
            }

            if (
                currentLine &&
                __isPositionedCustomBlockOnlyLine(lineGlyphs, paragraphConfig.paragraphNonInlineSkeDrawings) &&
                __hasFlowGlyph(glyphGroup)
            ) {
                for (const lineDivide of currentLine.divides) {
                    updateDivideInfo(lineDivide, {
                        isFull: true,
                    });
                }
                _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, false, breakPointType);
                return;
            }

            if (
                currentLine &&
                maxBox &&
                !__isNullLine(currentLine) &&
                __hasFlowGlyph(lineGlyphs) &&
                !isNonFlowFloatingAnchor(glyphGroup, paragraphConfig.paragraphNonInlineSkeDrawings)
            ) {
                const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } =
                    getLineHeightConfig(sectionBreakConfig, paragraphConfig);
                const { boundingBoxAscent, boundingBoxDescent } = maxBox;
                const { normalLineHeight } = getGlyphGroupFontBoundingBox(
                    paragraphConfig.documentCompatibilityPolicy,
                    lineGlyphs.filter((glyph) => !__isStructuralTerminatorGlyph(glyph)),
                    glyphGroup.filter((glyph) => !__isStructuralTerminatorGlyph(glyph))
                );
                const spanLineHeight = boundingBoxAscent + boundingBoxDescent;
                const hasInlineCustomBlock = [lineGlyphs, glyphGroup].some((group) => group.some((glyph) =>
                    glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0
                ));
                const drawingMLLineHeight = getDrawingMLNominalLineHeight([...lineGlyphs, ...glyphGroup], sectionBreakConfig, hasInlineCustomBlock);
                const { contentHeight, paddingTop, paddingBottom } = getLineHeightMetrics(
                    spanLineHeight,
                    paragraphLineGapDefault,
                    linePitch,
                    gridType,
                    lineSpacing,
                    spacingRule,
                    snapToGrid,
                    paragraphConfig.useWordStyleLineHeight,
                    !hasInlineCustomBlock,
                    hasInlineCustomBlock && !isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
                        ? undefined
                        : normalLineHeight || undefined,
                    false,
                    drawingMLLineHeight
                );

                // Extra font leading can change the line extent without changing its
                // font box. Keep the existing font-box tolerance for paragraph marks.
                const expandsAutoLeading = spacingRule === SpacingRule.AUTO && (normalLineHeight > spanLineHeight || hasInlineCustomBlock || drawingMLLineHeight != null) &&
                    contentHeight + paddingTop + paddingBottom - currentLine.contentHeight -
                    currentLine.paddingTop - currentLine.paddingBottom > 1e-6;
                if (contentHeight - currentLine.contentHeight > LINE_LAYOUT_OVERFLOW_TOLERANCE || expandsAutoLeading) {
                    // If the height of the new content exceeds the height of the line it joins, for mixed text and graphics layout, the entire line needs to be recalculated according to the new height
                    // If the height of the new content exceeds the height of the added row,
                    // the entire row needs to be recalculated according to the new height
                    // in order to handle the mixing of graphics and text
                    const spanGroupCached = lineGlyphs;
                    const spanGroupCachedLen = spanGroupCached.length;
                    let newGlyphGroup = [];
                    let startIndex = 1;

                    if (spanGroupCachedLen > 2 && spanGroupCached[0].glyphType === GlyphType.LIST) {
                        newGlyphGroup = [spanGroupCached[0], spanGroupCached[1]];
                        startIndex = 2;
                    } else {
                        newGlyphGroup = [spanGroupCached[0]];
                    }
                    const column = currentLine.parent!;

                    const { paragraphStart: lineIsStart } = column.lines.pop()!; // Delete the previous line and recalculate according to the maximum content height
                    const reflowMetrics: IDefaultSpanMetrics = {
                        lineHeight: boundingBoxAscent + boundingBoxDescent,
                        hasInlineCustomBlock,
                        normalLineHeight: normalLineHeight || undefined,
                        drawingMLLineHeight,
                    };

                    _lineOperator(
                        ctx,
                        newGlyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        lineIsStart,

                        breakPointType,
                        reflowMetrics
                    );

                    for (let i = startIndex; i < spanGroupCached.length; i++) {
                        // TODO: @jocs Here you may see non-breakpoints appearing at the end of the line.
                        _divideOperator(
                            ctx,
                            [spanGroupCached[i]],
                            pages,
                            sectionBreakConfig,
                            paragraphConfig,
                            isParagraphFirstShapedText,
                            BreakPointType.Normal,
                            reflowMetrics
                        );
                    }

                    // Replaying a zero-height page hint can rebuild the line again.
                    // Keep the complete mixed-run metrics throughout that replay.
                    _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, reflowMetrics);

                    return;
                }
            }
            if (currentLine?.parent) {
                const anchorDrawings = __getZeroWidthNonFlowFloatingAnchorDrawings(glyphGroup, paragraphConfig.paragraphNonInlineSkeDrawings);
                if (anchorDrawings.length > 0) {
                    const paragraphAnchorLeft = __getParagraphAnchorLeft(sectionBreakConfig, paragraphConfig, paragraphConfig.paragraphStyle?.indentStart);
                    const drawings = __getDrawingPosition(
                        ctx,
                        currentLine.top,
                        currentLine.lineHeight,
                        currentLine.parent,
                        true,
                        paragraphConfig.pDrawingAnchor?.get(paragraphConfig.paragraphIndex)?.top,
                        anchorDrawings,
                        paragraphAnchorLeft,
                        false
                    );
                    __updateDrawingPosition(currentLine.parent, drawings);
                    addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                    updateDivideInfo(divide, { breakType: breakPointType });
                    glyphGroup.length = 0;
                    return;
                }
            }

            addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            updateDivideInfo(divide, { breakType: breakPointType });
        }
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanMetrics);
    }
}

function getParagraphTabStops(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig
): ITabStop[] | undefined {
    const style = paragraphConfig.paragraphStyle;
    const stops = style?.tabStops;
    const noTabHangInd = ctx.dataModel.documentStyle.compatibilityFlags?.noTabHangInd;
    if (!isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) ||
        noTabHangInd === BooleanNumber.TRUE || !style?.hanging?.v) {
        return stops;
    }
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const step = getCharSpaceApply(charSpace, defaultTabStop, sectionBreakConfig.gridType, style.snapToGrid);
    const hanging = getNumberUnitValue(style.hanging, step);
    const offset = getNumberUnitValue(style.indentStart, step);
    if (hanging <= 0 || !Number.isFinite(offset) || stops?.some((stop) => !stop.clear && stop.offset === offset)) {
        return stops;
    }
    // Word treats the hanging-indent position as a custom stop, ahead of the default grid.
    return [...(stops ?? []), { offset, alignment: TabStopAlignment.START }];
}

function _adjustIncomingTabStops(
    divide: IDocumentSkeletonDivide,
    glyphs: IDocumentSkeletonGlyph[],
    offsetLeft: number,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    tabStops = paragraphConfig.paragraphStyle?.tabStops
): void {
    if (!isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) ||
        !glyphs.some((glyph) => glyph.glyphType === GlyphType.TAB)) {
        return;
    }
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const step = getCharSpaceApply(charSpace, defaultTabStop, sectionBreakConfig.gridType, paragraphConfig.paragraphStyle?.snapToGrid);
    if (!Number.isFinite(step) || step <= 0) {
        return;
    }
    let position = divide.left + divide.paddingLeft + offsetLeft;
    for (const glyph of glyphs) {
        const positionedWidth = glyph.ts?.positionedTab == null
            ? undefined
            : getPositionedTabWidth(divide, glyph, position - divide.left - divide.paddingLeft);
        if (positionedWidth != null && positionedWidth > 0) {
            glyph.width = positionedWidth;
            glyph.bBox.width = positionedWidth;
        } else if (glyph.glyphType === GlyphType.TAB && glyph.ts?.positionedTab == null) {
            const stop = tabStops?.filter((stop) => !stop.clear && stop.offset > position)
                .sort((left, right) => left.offset - right.offset)[0];
            // Resolve before fitting: a provisional default-width tab can create a false line break.
            if (stop) {
                const followingWidth = glyph.tabAlignedTextWidth ?? 0;
                let alignmentOffset = 0;
                if (stop.alignment === TabStopAlignment.END) {
                    alignmentOffset = followingWidth;
                } else if (stop.alignment === TabStopAlignment.CENTER) {
                    alignmentOffset = followingWidth / 2;
                }
                const width = Math.min(stop.offset, divide.left + divide.paddingLeft + divide.width)
                    - position - alignmentOffset;
                if (width > 0) {
                    glyph.width = width;
                    glyph.tabLeader = stop.leader;
                }
            } else {
                // Default stops are a grid measured from the column/cell origin, not fixed-width spaces.
                glyph.width = (Math.floor(position / step) + 1) * step - position;
            }
            glyph.bBox.width = glyph.width;
        }
        position += glyph.width;
    }
}

function getPositionedTabWidth(divide: IDocumentSkeletonDivide, tabGlyph: IDocumentSkeletonGlyph, offset: number): number | undefined {
    const positionedTab = tabGlyph.ts?.positionedTab;
    const line = divide.parent;
    if (positionedTab == null || line?.parent == null) {
        return;
    }
    const columnWidth = line.parent.width;
    const start = positionedTab.relativeTo === 'indent' ? line.paragraphPaddingLeft ?? 0 : 0;
    const end = columnWidth - (positionedTab.relativeTo === 'indent' ? line.paragraphPaddingRight ?? 0 : 0);
    const followingWidth = tabGlyph.tabAlignedTextWidth ?? 0;
    let target = start;
    if (positionedTab.alignment === TabStopAlignment.END) {
        target = end - followingWidth;
    } else if (positionedTab.alignment === TabStopAlignment.CENTER) {
        target = (start + end - followingWidth) / 2;
    }
    return target - divide.left - divide.paddingLeft - offset;
}

function _adjustExplicitTabStop(
    divide: IDocumentSkeletonDivide,
    followingGlyphs: IDocumentSkeletonGlyph[],
    paragraphConfig: IParagraphConfig,
    tabStops = paragraphConfig.paragraphStyle?.tabStops
): void {
    let tabIndex = divide.glyphGroup.length - 1;
    while (tabIndex >= 0 && isCustomRangeMarker(divide.glyphGroup[tabIndex])) {
        tabIndex -= 1;
    }
    const tabGlyph = divide.glyphGroup[tabIndex];
    if (tabGlyph?.glyphType !== GlyphType.TAB) {
        return;
    }
    const previousWidth = tabGlyph.width;

    const positionedTab = tabGlyph.ts?.positionedTab;
    if (positionedTab != null) {
        const width = getPositionedTabWidth(divide, tabGlyph, tabGlyph.left);
        if (width != null && width > 0) {
            tabGlyph.width = width;
            tabGlyph.bBox.width = width;
            tabGlyph.tabLeader = positionedTab.leader;
            shiftTrailingRangeMarkers(divide.glyphGroup, tabIndex, width - previousWidth);
        }
        return;
    }

    if (!tabStops?.length) {
        return;
    }

    const origin = isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
        ? divide.left + divide.paddingLeft
        : 0;
    const tabLeft = origin + tabGlyph.left;
    const tabStop = [...tabStops]
        .sort((left, right) => left.offset - right.offset)
        .find(({ offset, clear }) => !clear && offset > tabLeft);
    if (!tabStop) {
        return;
    }

    const followingWidth = tabGlyph.tabAlignedTextWidth
        ?? followingGlyphs.reduce((width, glyph) => width + glyph.width, 0);

    const alignmentOffset = tabStop.alignment === TabStopAlignment.END
        ? followingWidth
        : tabStop.alignment === TabStopAlignment.CENTER
            ? followingWidth / 2
            : 0;
    const targetOffset = Math.min(tabStop.offset, origin + divide.width);
    const width = targetOffset - tabLeft - alignmentOffset;
    if (width <= 0) {
        return;
    }

    tabGlyph.width = width;
    tabGlyph.bBox.width = width;
    tabGlyph.tabLeader = tabStop.leader;
    shiftTrailingRangeMarkers(divide.glyphGroup, tabIndex, width - previousWidth);
}

function isCustomRangeMarker(glyph: IDocumentSkeletonGlyph | undefined): boolean {
    return glyph?.width === 0 &&
        (glyph.raw === DataStreamTreeTokenType.CUSTOM_RANGE_START || glyph.raw === DataStreamTreeTokenType.CUSTOM_RANGE_END);
}

function shiftTrailingRangeMarkers(glyphs: IDocumentSkeletonGlyph[], tabIndex: number, delta: number): void {
    if (!delta) {
        return;
    }
    for (let index = tabIndex + 1; index < glyphs.length; index += 1) {
        glyphs[index].left += delta;
    }
}

function _getParagraphLineMetrics(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    lastPage: IDocumentSkeletonPage,
    column: IDocumentSkeletonColumn,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    defaultSpanMetrics?: IDefaultSpanMetrics
) {
    const preLine = getLastLineByColumn(column);

    const { boundingBoxAscent, boundingBoxDescent, normalLineHeight: glyphNormalLineHeight } = getGlyphGroupFontBoundingBox(
        paragraphConfig.documentCompatibilityPolicy,
        glyphGroup
    );
    const glyphLineHeight = defaultSpanMetrics?.lineHeight || (boundingBoxAscent + boundingBoxDescent);
    const normalLineHeight = Math.max(
        defaultSpanMetrics?.normalLineHeight ?? 0,
        glyphNormalLineHeight
    ) || undefined;
    const ascent = boundingBoxAscent;
    const descent = boundingBoxDescent;

    const {
        paragraphStyle: originParagraphStyle = {},
        paragraphNonInlineSkeDrawings,
        skeTablesInParagraph,
        paragraphIndex,
    } = paragraphConfig;
    // Floating objects do not consume a line, but their authored paragraph mark does.
    // A temporary anchor fragment preceding text in the same paragraph has no such mark.
    const hasAuthoredParagraphMark = isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
        glyphGroup.some((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH && glyph.bBox.ba + glyph.bBox.bd > 0) &&
        ctx.viewModel.getSelfOrHeaderFooterViewModel(lastPage.segmentId).getParagraph(paragraphIndex) != null;
    const isZeroWidthNonFlowFloatingAnchorLine = !hasAuthoredParagraphMark &&
        isNonFlowFloatingAnchor(glyphGroup, paragraphNonInlineSkeDrawings);
    // Imported tables have a structural terminator in addition to any authored following paragraph.
    const isStructuralTableAnchorLine = isParagraphFirstShapedText &&
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!) &&
        (skeTablesInParagraph?.length ?? 0) > 0 &&
        glyphGroup.length > 0 &&
        glyphGroup.every(__isStructuralTerminatorGlyph) &&
        ctx.viewModel.getSelfOrHeaderFooterViewModel(lastPage.segmentId).getParagraph(paragraphIndex) == null;
    // A frame's table continuation is structural, but authored blank paragraphs
    // elsewhere in the same frame still contribute their normal spacing.
    const isEmptyFramedParagraph = isParagraphFirstShapedText &&
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!) &&
        (originParagraphStyle.paragraphFrame === BooleanNumber.TRUE ||
            (originParagraphStyle.paragraphFrame != null && typeof originParagraphStyle.paragraphFrame === 'object' &&
                (skeTablesInParagraph?.length ?? 0) > 0)) &&
        glyphGroup.length > 0 &&
        glyphGroup.every(__isStructuralTerminatorGlyph);
    // A standalone manual page boundary must not overflow as an empty line
    // before the break is applied. Authored blank paragraphs remain normal lines.
    const isStandalonePageBoundary = isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
        !(lastPage.type === DocumentSkeletonPageType.CELL && preLine == null &&
            glyphGroup.some((glyph) => __isStructuralTerminatorGlyph(glyph) && glyph.bBox.ba + glyph.bBox.bd > 0)) &&
        paragraphConfig.bulletSkeleton == null &&
        glyphGroup.some((glyph) => glyph.raw === DataStreamTreeTokenType.PAGE_BREAK) &&
        glyphGroup.every((glyph) => glyph.raw === DataStreamTreeTokenType.PAGE_BREAK || __isStructuralTerminatorGlyph(glyph));
    const { namedStyleType } = originParagraphStyle;
    const namedStyle = namedStyleType !== undefined ? NAMED_STYLE_SPACE_MAP[namedStyleType] : null;
    const paragraphStyle = {
        ...originParagraphStyle,
        spaceAbove: originParagraphStyle.spaceAbove ?? namedStyle?.spaceAbove,
        spaceBelow: originParagraphStyle.spaceBelow ?? namedStyle?.spaceBelow,
    };

    const {
        spaceAbove,
        spaceBelow,
    } = paragraphStyle;

    const {
        paragraphLineGapDefault,
        linePitch,
        lineSpacing,
        spacingRule,
        snapToGrid,
        gridType,
    } = getLineHeightConfig(
        sectionBreakConfig,
        paragraphConfig
    );
    const hasInlineCustomBlock = defaultSpanMetrics?.hasInlineCustomBlock ||
        glyphGroup.some((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0);
    const snapMultilineParagraphToWholeGrid = snapToGrid === BooleanNumber.TRUE &&
        !isParagraphFirstShapedText &&
        !hasInlineCustomBlock &&
        reachesNextDocumentGridLine(lineSpacing, getNumberUnitValue(spaceBelow, lineSpacing), linePitch) &&
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!);
    const positionedCustomBlockOnly = !hasAuthoredParagraphMark && glyphGroup.length > 0 &&
        paragraphNonInlineSkeDrawings != null &&
        paragraphNonInlineSkeDrawings.size > 0 &&
        glyphGroup.every((glyph) => {
            if (!glyph) {
                return false;
            }

            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                return [...paragraphNonInlineSkeDrawings.values()].some((drawing) => drawing.drawingId === glyph.drawingId);
            }

            return glyph.streamType === DataStreamTreeTokenType.PARAGRAPH || glyph.raw === DataStreamTreeTokenType.PARAGRAPH;
        });
    const drawingMLLineHeight = defaultSpanMetrics?.drawingMLLineHeight ??
        getDrawingMLNominalLineHeight(glyphGroup, sectionBreakConfig, hasInlineCustomBlock);
    let { paddingTop, paddingBottom, contentHeight, lineSpacingApply } = getLineHeightMetrics(
        glyphLineHeight,
        paragraphLineGapDefault,
        linePitch,
        gridType,
        lineSpacing,
        spacingRule,
        snapToGrid,
        paragraphConfig.useWordStyleLineHeight,
        !hasInlineCustomBlock,
        hasInlineCustomBlock && !isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)
            ? undefined
            : normalLineHeight,
        snapMultilineParagraphToWholeGrid || (
            hasInlineCustomBlock && isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!)
        ),
        drawingMLLineHeight
    );
    const drawingMLBaselineHeight = !positionedCustomBlockOnly && !isZeroWidthNonFlowFloatingAnchorLine &&
        drawingMLLineHeight != null && (spacingRule === SpacingRule.EXACT || (spacingRule === SpacingRule.AUTO && lineSpacing > 1)) &&
        (snapToGrid === BooleanNumber.FALSE || (gridType !== GridType.LINES && gridType !== GridType.LINES_AND_CHARS))
        ? lineSpacingApply
        : undefined;
    if (drawingMLBaselineHeight != null) {
        paddingTop = getDrawingMLLineBaseline(drawingMLBaselineHeight, ascent, descent) - ascent;
        paddingBottom = lineSpacingApply - contentHeight - paddingTop;
    }

    if (snapMultilineParagraphToWholeGrid && preLine?.paragraphIndex === paragraphIndex) {
        const preLineGlyphs = __getGlyphGroupByLine(preLine);
        const preLineHasInlineCustomBlock = preLineGlyphs.some(
            (glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0
        );
        if (__hasFlowGlyph(preLineGlyphs) && !preLineHasInlineCustomBlock) {
            const preLineMetrics = getLineHeightMetrics(
                preLine.contentHeight,
                paragraphLineGapDefault,
                linePitch,
                gridType,
                lineSpacing,
                spacingRule,
                snapToGrid,
                paragraphConfig.useWordStyleLineHeight,
                true,
                undefined,
                true
            );
            const heightDelta = preLineMetrics.lineSpacingApply -
                (preLine.paddingTop + preLine.contentHeight + preLine.paddingBottom);
            if (heightDelta > LINE_LAYOUT_OVERFLOW_TOLERANCE) {
                preLine.paddingTop += heightDelta / 2;
                preLine.paddingBottom += heightDelta / 2;
                preLine.lineHeight += heightDelta;
            }
        }
    }

    if (positionedCustomBlockOnly) {
        paddingTop = 0;
        paddingBottom = 0;
        contentHeight = 0.01;
        lineSpacingApply = 0.01;
    }

    let { marginTop, spaceBelowApply } = __getParagraphSpace(
        sectionBreakConfig.documentCompatibilityPolicy?.mode === 'drawingml',
        lineSpacingApply,
        spaceAbove,
        spaceBelow,
        isParagraphFirstShapedText,
        preLine,
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!) &&
            lastPage.pageNumber > 1 &&
            lastPage.type !== DocumentSkeletonPageType.HEADER &&
            lastPage.type !== DocumentSkeletonPageType.FOOTER &&
            (!paragraphConfig.isInsideTable || lastPage.type === DocumentSkeletonPageType.CELL) &&
            (preLine == null || (preLine.top === 0 && preLine.lineHeight === 0 &&
                isNonFlowFloatingAnchor(__getGlyphGroupByLine(preLine), paragraphNonInlineSkeDrawings))) &&
            (column.parent?.top ?? 0) === 0,
        drawingMLLineHeight
    );

    if (positionedCustomBlockOnly) {
        spaceBelowApply = 0;
    }

    const isHiddenCellEndMark = lastPage.type === DocumentSkeletonPageType.CELL &&
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
        sectionBreakConfig.cellHiddenEndMarkIndex === paragraphIndex &&
        paragraphConfig.bulletSkeleton == null &&
        glyphGroup.length > 0 && glyphGroup.every(__isStructuralTerminatorGlyph);
    if (isZeroWidthNonFlowFloatingAnchorLine || isStructuralTableAnchorLine || isEmptyFramedParagraph || isStandalonePageBoundary || isHiddenCellEndMark) {
        paddingTop = 0;
        paddingBottom = 0;
        contentHeight = 0;
        lineSpacingApply = 0;
        marginTop = 0;
        spaceBelowApply = 0;
    }

    return {
        paragraphStyle,
        spacingRule,
        drawingMLLineHeight,
        drawingMLBaselineHeight,
        gridType,
        snapToGrid,
        hasInlineCustomBlock,
        positionedCustomBlockOnly,
        paddingTop,
        paddingBottom,
        contentHeight,
        marginTop,
        spaceBelowApply,
    };
}

function _positionLineDrawings(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    column: IDocumentSkeletonColumn,
    lastPage: IDocumentSkeletonPage,
    paragraphConfig: IParagraphConfig,
    lineTop: number,
    lineHeight: number,
    paragraphAnchorLeft: number,
    hasInlineCustomBlock: boolean,
    isParagraphFirstShapedText: boolean
) {
    const preLine = getLastLineByColumn(column);
    const { segmentId } = lastPage;
    const { paragraphNonInlineSkeDrawings, pDrawingAnchor, paragraphIndex } = paragraphConfig;
    const glyphGroupCustomBlockIds = new Set(glyphGroup
        .filter((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.drawingId != null)
        .map((glyph) => glyph.drawingId!));
    // Handle float object relative to line.
    // FIXME: @jocs, it will not update the last line's drawings.
    if (preLine) {
        const drawingsInLine = _getCustomBlockIdsInLine(preLine);
        if (drawingsInLine.length > 0) {
            const affectDrawings = ctx.paragraphConfigCache.get(segmentId)?.get(preLine.paragraphIndex)?.paragraphNonInlineSkeDrawings;
            const relativeLineDrawings = ([...(affectDrawings?.values() ?? [])])
                .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom === ObjectRelativeFromV.LINE)
                .filter((drawing) => drawingsInLine.includes(drawing.drawingId));

            if (relativeLineDrawings.length > 0) {
                __updateAndPositionDrawings(ctx, preLine.top, preLine.lineHeight, column, relativeLineDrawings, preLine.paragraphIndex, isParagraphFirstShapedText);
            }
        }
    }

    let deferredInlineGroupAnchorDrawings: IDocumentSkeletonDrawing[] = [];
    let deferredTopBottomAnchorDrawings: IDocumentSkeletonDrawing[] = [];

    if (paragraphNonInlineSkeDrawings != null && paragraphNonInlineSkeDrawings.size > 0) {
        let targetDrawings = [...paragraphNonInlineSkeDrawings.values()]
            .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom !== ObjectRelativeFromV.LINE);

        if (hasInlineCustomBlock) {
            deferredInlineGroupAnchorDrawings = targetDrawings.filter((drawing) =>
                glyphGroupCustomBlockIds.has(drawing.drawingId) &&
                drawing.drawingOrigin.docTransform.positionV.relativeFrom === ObjectRelativeFromV.LINE
            );
            targetDrawings = targetDrawings.filter((drawing) => !deferredInlineGroupAnchorDrawings.includes(drawing));
        }
        deferredTopBottomAnchorDrawings = targetDrawings.filter((drawing) =>
            glyphGroupCustomBlockIds.has(drawing.drawingId) &&
            drawing.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        );
        targetDrawings = targetDrawings.filter((drawing) =>
            drawing.drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        );

        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, targetDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, pDrawingAnchor?.get(paragraphIndex)?.top, paragraphAnchorLeft, false, deferredTopBottomAnchorDrawings.length > 0);
    }

    return { deferredInlineGroupAnchorDrawings, deferredTopBottomAnchorDrawings };
}

function _getOrCreateLineColumn(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    breakPointType: BreakPointType
) {
    let lastPage = getLastPage(pages);
    let columnInfo = getLastNotFullColumnInfo(lastPage);
    if (!columnInfo || !columnInfo.column) {
        const lastSection = getLastSection(lastPage);
        const lastColumnIndex = lastSection.columns.length - 1;
        const lastColumn = lastSection.columns[lastColumnIndex];
        if (lastColumn && isBlankColumn(lastColumn)) {
            setColumnFullState(lastColumn, false);
            columnInfo = {
                column: lastColumn,
                index: lastColumnIndex,
                isLast: true,
            };
        }
    }
    if (!columnInfo || !columnInfo.column) {
        // If the column does not exist, use a fallback strategy and add a new page.
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, true, breakPointType);
        lastPage = getLastPage(pages);
        columnInfo = getLastNotFullColumnInfo(lastPage);
    }
    return columnInfo;
}

function _clearOverflowedParagraphDrawings(
    ctx: ILayoutContext,
    lastPage: IDocumentSkeletonPage,
    paragraphNonInlineSkeDrawings: IParagraphConfig['paragraphNonInlineSkeDrawings'],
    isParagraphFirstShapedText: boolean
): void {
    const { segmentId } = lastPage;
    if (isParagraphFirstShapedText && paragraphNonInlineSkeDrawings && paragraphNonInlineSkeDrawings.size > 0) {
        for (const drawing of paragraphNonInlineSkeDrawings.values()) {
            if (lastPage.skeDrawings.has(drawing.drawingId)) {
                lastPage.skeDrawings.delete(drawing.drawingId);
            }

            if (ctx.floatObjectsCache.has(drawing.drawingId)) {
                ctx.floatObjectsCache.delete(drawing.drawingId);
                ctx.isDirty = false;
                ctx.layoutStartPointer[segmentId] = null;
            }
        }
    }
}

function _lineOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType: BreakPointType = BreakPointType.Normal,
    defaultSpanMetrics?: IDefaultSpanMetrics
) {
    let lastPage = getLastPage(pages);
    ctx.footnoteLayout?.updateReferenceGlyphs(lastPage, glyphGroup, sectionBreakConfig, paragraphConfig);
    const columnInfo = _getOrCreateLineColumn(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, breakPointType);
    lastPage = getLastPage(pages);
    // Todo: columnInfo does not exist when demo4 is imported, return first
    if (!columnInfo) {
        return;
    }

    const column = columnInfo.column;

    // If the page width < marginLeft + marginRight, will trigger infinity loop, so return it first.
    // The best solution is to do data checks and data repairs, and pass the correct data to the render layer.
    if (column.width <= 0) {
        console.error('The column width is less than 0, need to adjust page width to make it great than 0');
        return;
    }

    const preLine = getLastLineByColumn(column);

    const previousLineHeight = preLine?.lineHeight;
    const previousLineMarginBottom = preLine?.marginBottom;
    const {
        paragraphNonInlineSkeDrawings,
        skeTablesInParagraph,
        skeHeaders,
        skeFooters,
        pDrawingAnchor,
        paragraphIndex,
    } = paragraphConfig;
    const {
        paragraphStyle,
        spacingRule,
        drawingMLLineHeight,
        drawingMLBaselineHeight,
        gridType,
        snapToGrid,
        hasInlineCustomBlock,
        positionedCustomBlockOnly,
        paddingTop,
        paddingBottom,
        contentHeight,
        marginTop,
        spaceBelowApply,
    } = _getParagraphLineMetrics(ctx, glyphGroup, lastPage, column, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, defaultSpanMetrics);
    const { indentFirstLine, hanging, indentStart, indentEnd } = paragraphStyle;

    const lineHeight = marginTop + paddingTop + contentHeight + paddingBottom;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const paragraphAnchorLeft = __getParagraphAnchorLeft(sectionBreakConfig, paragraphConfig, indentStart);

    let section = column.parent;
    if (!section) {
        // Fallback, point to the last section of the current page
        section = getLastSection(lastPage);
    }
    const preLineHeight = preLine?.lineHeight || 0;
    const initialFootnoteTop = lastPage.type === DocumentSkeletonPageType.NOTE && lastPage.pageNumber === 1 && columnInfo.index === ctx.footnoteFirstColumn?.index
        ? ctx.footnoteFirstColumn.top
        : 0;
    const preTop = preLine?.top ?? initialFootnoteTop;
    const lineTop = preLineHeight + preTop;

    const { pageWidth, headerId, footerId } = lastPage;
    const headerPage = skeHeaders?.get(headerId)?.get(pageWidth);
    const footerPage = skeFooters?.get(footerId)?.get(pageWidth);

    let needOpenNewPageByTableLayout = false;

    const { deferredInlineGroupAnchorDrawings, deferredTopBottomAnchorDrawings } = _positionLineDrawings(
        ctx,
        glyphGroup,
        column,
        lastPage,
        paragraphConfig,
        lineTop,
        lineHeight,
        paragraphAnchorLeft,
        hasInlineCustomBlock,
        isParagraphFirstShapedText
    );

    if (skeTablesInParagraph != null && skeTablesInParagraph.length > 0) {
        needOpenNewPageByTableLayout = _updateAndPositionTable(ctx, lineTop, lineHeight, lastPage, pages, column, section, skeTablesInParagraph, paragraphConfig.paragraphIndex, sectionBreakConfig, pDrawingAnchor?.get(paragraphIndex)?.top);
    }

    const hasSameParagraphTopBottomDrawingWithInline = hasInlineCustomBlock &&
        paragraphNonInlineSkeDrawings != null &&
        [...paragraphNonInlineSkeDrawings.values()].some(
            (drawing) => drawing.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        );
    const calculatedLineTop = positionedCustomBlockOnly
        ? lineTop
        : calculateLineTopByDrawings(
            lineHeight,
            lineTop,
            lastPage,
            headerPage,
            footerPage,
            column.left,
            column.width,
            section.top,
            isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy!)
                ? Math.max(TRADITIONAL_TABLE_WRAP_MIN_WIDTH, Math.min(__getGlyphGroupWidth(glyphGroup) - 0.001, column.width - 1))
                : 0
        ); // WRAP_TOP_AND_BOTTOM drawing and WRAP NONE table will change the starting top of the line
    const previousTopBottomCustomBlockFlowBottom = deferredTopBottomAnchorDrawings.length > 0
        ? paragraphConfig.topBottomCustomBlockFlowBottom
        : undefined;
    const newLineTop = previousTopBottomCustomBlockFlowBottom == null
        ? calculatedLineTop
        : Math.max(calculatedLineTop, previousTopBottomCustomBlockFlowBottom);

    // Word keeps an inline drawing below a top-bottom floating drawing from the
    // same paragraph and clips the inline drawing at the physical page bottom.
    const clipsSameParagraphInlineDrawing = hasSameParagraphTopBottomDrawingWithInline && newLineTop < section.height;
    const footnoteBodyLimit = ctx.footnoteLayout?.getBodyLimit(
        lastPage,
        pages,
        sectionBreakConfig,
        section.top + newLineTop + lineHeight,
        glyphGroup
    );
    const availableSectionHeight = footnoteBodyLimit == null ? section.height : Math.min(section.height, footnoteBodyLimit - section.top);
    // An authored empty cell paragraph is spacing content. Its after-spacing
    // must fit with the paragraph mark, rather than disappearing at the page edge.
    const emptyCellParagraphSpace = lastPage.type === DocumentSkeletonPageType.CELL &&
        isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy) &&
        isParagraphFirstShapedText && glyphGroup.length > 0 &&
        glyphGroup.every((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH)
        ? Math.max(0, spaceBelowApply)
        : 0;
    const lineOverflowsSection = !clipsSameParagraphInlineDrawing &&
        lineHeight + emptyCellParagraphSpace + newLineTop - availableSectionHeight > LINE_LAYOUT_OVERFLOW_TOLERANCE;

    if (
        (lineOverflowsSection &&
            (column.lines.length > 0 || initialFootnoteTop > 0 || section.top > 0 || (lastPage.footnoteHeight ?? 0) > 0 || footnoteBodyLimit === -1) &&
            lastPage.sections.length > 0) ||
        needOpenNewPageByTableLayout
    ) {
        // Cell after-spacing contributes to the fragment's height when it fits.
        // Never let a trial next paragraph inflate the fragment beyond its capacity.
        const keepCellAfterSpacing = lastPage.type === DocumentSkeletonPageType.CELL && preLine != null &&
            preLine.top + preLine.lineHeight <= section.height + LINE_LAYOUT_OVERFLOW_TOLERANCE;
        if (!keepCellAfterSpacing && preLine && previousLineHeight != null &&
            isTraditionalDocumentCompatibility(paragraphConfig.documentCompatibilityPolicy)) {
            preLine.lineHeight = previousLineHeight;
            preLine.marginBottom = previousLineMarginBottom ?? 0;
        }
        // Line height exceeds column height, and there is more than one line in the column, and there is more than one section;
        // console.log('_lineOperator', { glyphGroup, pages, lineHeight, newLineTop, sectionHeight: section.height, lastPage });
        setColumnFullState(column, true);
        _columnOperator(
            ctx,
            glyphGroup,
            pages,
            sectionBreakConfig,
            paragraphConfig,
            isParagraphFirstShapedText,
            breakPointType,
            defaultSpanMetrics
        );

        _clearOverflowedParagraphDrawings(ctx, lastPage, paragraphNonInlineSkeDrawings, isParagraphFirstShapedText);

        return;
    }

    // Line does not exceed column height, or line exceeds column height but there is no other content in the column, or line exceeds page height but there is no other content on the page;
    const lineIndex = preLine ? preLine.lineIndex + 1 : 0;
    let { paddingLeft, paddingRight, paragraphPaddingLeft, paragraphPaddingRight } = __getIndentPadding(
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
        charSpaceApply,
        isParagraphFirstShapedText
    );

    // If the width is insufficient to accommodate the margin, leave 1px width for placeholder.
    if (paddingLeft + paddingRight >= column.width) {
        const leftPercent = paddingLeft / (paddingLeft + paddingRight);
        paddingLeft = column.width * leftPercent - 0.5;
        paddingRight = column.width - paddingLeft - 0.5;
    }

    if (paragraphPaddingLeft + paragraphPaddingRight >= column.width) {
        const leftPercent = paragraphPaddingLeft / (paragraphPaddingLeft + paragraphPaddingRight);
        paragraphPaddingLeft = column.width * leftPercent - 0.5;
        paragraphPaddingRight = column.width - paragraphPaddingLeft - 0.5;
    }

    const newLine = createSkeletonLine(
        paragraphIndex,
        LineType.PARAGRAPH,
        {
            lineHeight,
            contentHeight,
            lineTop: newLineTop,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
            marginTop,
            spaceBelowApply,
        },
        column.width,
        lineIndex,
        isParagraphFirstShapedText,
        paragraphConfig,
        lastPage,
        headerPage,
        footerPage,
        column.left,
        section.top
    );
    if (drawingMLBaselineHeight != null) {
        newLine.drawingMLBaselineHeight = drawingMLBaselineHeight;
        if (spacingRule === SpacingRule.AUTO) {
            newLine.drawingMLNormalLineHeight = drawingMLLineHeight;
        }
    }

    column.lines.push(newLine);
    newLine.parent = column;
    newLine.paragraphPaddingLeft = paragraphPaddingLeft;
    newLine.paragraphPaddingRight = paragraphPaddingRight;
    const blockAnchorTop = deferredTopBottomAnchorDrawings.length > 0 ? newLineTop : lineTop;
    createAndUpdateBlockAnchor(paragraphIndex, newLine, blockAnchorTop, pDrawingAnchor);
    if (deferredTopBottomAnchorDrawings.length > 0) {
        __updateAndPositionDrawings(ctx, newLineTop, lineHeight, column, deferredTopBottomAnchorDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, blockAnchorTop, paragraphAnchorLeft, false, true);
        __updateTopBottomCustomBlockFlowBottom(paragraphConfig, deferredTopBottomAnchorDrawings, section.top);
    }

    _divideOperator(
        ctx,
        glyphGroup,
        pages,
        sectionBreakConfig,
        paragraphConfig,
        isParagraphFirstShapedText,

        breakPointType,
        defaultSpanMetrics
    );

    if (deferredInlineGroupAnchorDrawings.length > 0) {
        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, deferredInlineGroupAnchorDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, pDrawingAnchor?.get(paragraphIndex)?.top, paragraphAnchorLeft, true);
    }
}

function __updateAndPositionDrawings(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    targetDrawings: IDocumentSkeletonDrawing[],
    paragraphIndex: number,
    isParagraphFirstShapedText: boolean,
    drawingAnchorTop?: number,
    drawingAnchorLeft = 0,
    skipRelayoutCheck = false,
    overwriteTopBottomPosition = false
): void {
    if (targetDrawings.length === 0) {
        return;
    }

    const drawings = __getDrawingPosition(
        ctx,
        lineTop,
        lineHeight,
        column,
        isParagraphFirstShapedText,
        drawingAnchorTop,
        targetDrawings,
        drawingAnchorLeft
    );

    if (drawings == null || drawings.size === 0) {
        return;
    }

    const floatObjects: IFloatObject[] = [...drawings.values()]
        .filter((drawing) => {
            const layoutType = drawing.drawingOrigin.layoutType;

            return layoutType !== PositionedObjectLayoutType.INLINE && layoutType !== PositionedObjectLayoutType.WRAP_NONE;
        })
        .map((drawing) => {
            const { drawingOrigin, drawingId: id, aTop: top, aLeft: left, width, height, angle } = drawing;
            const positionV = drawingOrigin.docTransform.positionV;

            return {
                id,
                top,
                left,
                width,
                height,
                angle,
                behindDoc: drawingOrigin.behindDoc,
                layoutType: drawingOrigin.layoutType,
                effectExtent: drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_SQUARE ||
                    drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
                    ? drawingOrigin.effectExtent
                    : undefined,
                type: FloatObjectType.IMAGE,
                positionV,
            };
        });

    if (!skipRelayoutCheck) {
        _reLayoutCheck(ctx, floatObjects, column, paragraphIndex);
    }

    __updateDrawingPosition(
        column,
        drawings,
        overwriteTopBottomPosition
    );
}

function __updateWrapTablePosition(
    ctx: ILayoutContext,
    table: IDocumentSkeletonTable,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    paragraphIndex: number,
    drawingAnchorTop?: number
) {
    const wrapTablePosition = __getWrapTablePosition(table, column, lineTop, lineHeight, drawingAnchorTop);

    if (wrapTablePosition == null) {
        return;
    }

    const { tableId: id, width, height, tableSource } = table;
    const { left, top } = wrapTablePosition;

    const floatObject: IFloatObject = {
        id,
        top,
        left,
        width,
        height,
        angle: 0,
        type: FloatObjectType.TABLE,
        positionV: tableSource.position.positionV,
    };

    _reLayoutCheck(ctx, [floatObject], column, paragraphIndex);

    table.top = top;
    table.left = left;
}

function __getWrapTablePosition(
    table: IDocumentSkeletonTable,
    column: IDocumentSkeletonColumn,
    lineTop: number,
    lineHeight: number,
    drawingAnchorTop?: number
) {
    const page = column.parent?.parent;
    const sectionTop = column.parent?.top ?? 0;
    if (page == null) {
        return;
    }

    const isPageBreak = __checkPageBreak(column);
    const { tableSource, width, height } = table;
    const { positionH, positionV } = tableSource.position;

    // An omitted table offset starts at its anchor, not at the physical page edge.
    const horizontalPosition = positionH.align == null && positionH.posOffset == null && positionH.percent == null
        ? { ...positionH, posOffset: 0 }
        : positionH;
    // Page and margin anchors use page coordinates; table skeletons use the content origin.
    const horizontalOrigin = positionH.relativeFrom === ObjectRelativeFromH.PAGE ||
        positionH.relativeFrom === ObjectRelativeFromH.MARGIN
        ? page.marginLeft
        : 0;
    const computedLeft = (getPositionHorizon(horizontalPosition, column, page, width, isPageBreak) ?? 0) - horizontalOrigin;
    // Word keeps an oversized, aligned nested table at the cell's content start.
    // Explicit offsets still allow authored positioning outside that cell.
    const left = page.type === DocumentSkeletonPageType.CELL && positionH.align != null
        ? Math.max(0, computedLeft)
        : computedLeft;
    const computedTop = getPositionVertical(
        positionV,
        page,
        sectionTop + lineTop,
        lineHeight,
        height,
        drawingAnchorTop == null ? undefined : sectionTop + drawingAnchorTop,
        isPageBreak
    ) ?? 0;
    const top =
        page.type === DocumentSkeletonPageType.CELL &&
        (positionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH ||
            positionV.relativeFrom === ObjectRelativeFromV.LINE)
            ? Math.max(0, computedTop)
            : computedTop;

    return { left, top };
}

function __avoidFlowAffectingDrawingsForTable(
    table: IDocumentSkeletonTable,
    page: IDocumentSkeletonPage,
    column: IDocumentSkeletonColumn
) {
    const columnLeft = column.left ?? 0;
    const tableTop = table.top;
    const tableBottom = table.top + table.height;
    const tableRight = table.left + table.width;

    for (const drawing of page.skeDrawings.values()) {
        const drawingOrigin = drawing.drawingOrigin;
        if (
            drawingOrigin == null ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        ) {
            continue;
        }

        const drawingTop = drawing.aTop;
        const drawingBottom = drawing.aTop + drawing.height;
        if (drawingTop >= tableBottom || drawingBottom <= tableTop) {
            continue;
        }

        const drawingRight = drawing.aLeft + drawing.width + (drawingOrigin.distR ?? 0);
        if (drawing.aLeft >= tableRight || drawingRight <= table.left) {
            continue;
        }

        if (drawingRight + table.width <= columnLeft + column.width) {
            table.left = Math.max(table.left, drawingRight);
        }
    }
}

function __avoidNonOverlappingFloatingTables(
    table: IDocumentSkeletonTable,
    page: IDocumentSkeletonPage
) {
    for (const floatingTable of page.skeTables.values()) {
        if (
            floatingTable.tableSource?.textWrap !== TableTextWrapType.WRAP ||
            floatingTable.tableSource.overlap !== BooleanNumber.FALSE
        ) {
            continue;
        }

        const tableRight = table.left + table.width;
        const floatingTableRight = floatingTable.left + floatingTable.width;
        if (table.left >= floatingTableRight || tableRight <= floatingTable.left) {
            continue;
        }

        table.top = Math.max(
            table.top,
            floatingTable.top +
                floatingTable.height +
                (floatingTable.tableSource.dist?.distB ?? 0)
        );
    }
}

function _updateAndPositionTable(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    page: IDocumentSkeletonPage,
    pages: IDocumentSkeletonPage[],
    column: IDocumentSkeletonColumn,
    section: IDocumentSkeletonSection,
    skeTablesInParagraph: IParagraphTableCache[],
    paragraphIndex: number,
    sectionBreakConfig: ISectionBreakConfig,
    drawingAnchorTop?: number
): boolean {
    if (skeTablesInParagraph.length === 0) {
        return false;
    }

    // Paragraph will only have one table, but will have multiple table slices.
    const firstUnPositionedTable = skeTablesInParagraph.find((table) => table.hasPositioned === false);

    if (firstUnPositionedTable == null) {
        return false;
    }

    const { tableId, table } = firstUnPositionedTable;
    const { tableSource } = table;

    if (firstUnPositionedTable.isSlideTable === false || tableSource.textWrap === TableTextWrapType.NONE) {
        switch (tableSource.textWrap) {
            case TableTextWrapType.NONE: {
                table.top = section.top + lineTop;
                table.left = column.left + getTableLeft(column.width, table.width, tableSource.align, tableSource.indent);
                __avoidFlowAffectingDrawingsForTable(table, page, column);
                __avoidNonOverlappingFloatingTables(table, page);
                break;
            }
            case TableTextWrapType.WRAP: {
                __updateWrapTablePosition(
                    ctx,
                    table,
                    lineTop,
                    lineHeight,
                    column,
                    paragraphIndex,
                    drawingAnchorTop
                );
                break;
            }
            default: {
                throw new Error(`Unsupported table text wrap type: ${tableSource.textWrap}`);
            }
        }
    }

    const { top, left, height } = table;
    const localTop = top - section.top;

    // A short table and its note must move together. Waiting until the trailing
    // paragraph overflows leaves the table on the old page without its note.
    // Tables that already exceed the remaining body space still use row pagination below.
    if (ctx.footnoteLayout && localTop + height <= section.height && (column.lines.length > 0 || firstUnPositionedTable.isSlideTable) &&
        tableSource.textWrap === TableTextWrapType.NONE) {
        const bodyLimit = ctx.footnoteLayout.getTableBodyLimit(page, pages, sectionBreakConfig, table);
        if (top + height > bodyLimit + LINE_LAYOUT_OVERFLOW_TOLERANCE) {
            const previousLine = column.lines[column.lines.length - 1];
            const bodyBottom = previousLine ? section.top + previousLine.top + previousLine.lineHeight : section.top;
            ctx.footnoteLayout.getBodyLimit(page, pages, sectionBreakConfig, bodyBottom);
            return true;
        }
    }

    const verticalPosition = tableSource.position?.positionV;
    const usesPhysicalPageBounds = tableSource.textWrap === TableTextWrapType.WRAP &&
        verticalPosition?.relativeFrom === ObjectRelativeFromV.PAGE &&
        (verticalPosition.posOffset != null || verticalPosition.align != null || verticalPosition.percent != null) &&
        top < 0;
    const fitsPhysicalPage = usesPhysicalPageBounds &&
        top + height <= page.pageHeight - page.marginTop + LINE_LAYOUT_OVERFLOW_TOLERANCE;
    if (
        (tableSource.textWrap === TableTextWrapType.NONE ||
            (page.type === DocumentSkeletonPageType.BODY &&
                isTraditionalDocumentCompatibility(sectionBreakConfig.documentCompatibilityPolicy))) &&
        ((localTop + height > section.height && !fitsPhysicalPage) || table.hasPageBreak === true) &&
        firstUnPositionedTable.isSlideTable === false
    ) {
        if (tableSource.textWrap === TableTextWrapType.WRAP &&
            (verticalPosition?.relativeFrom === ObjectRelativeFromV.PARAGRAPH ||
                verticalPosition?.relativeFrom === ObjectRelativeFromV.LINE) &&
            table.hasPageBreak !== true && column.lines.length > 0) {
            const nextPosition = __getWrapTablePosition(table, column, 0, lineHeight, 0);
            // A text-anchored float that fits a fresh column moves with its anchor;
            // only oversized floats need the row-slicing path below.
            if (nextPosition != null && nextPosition.top - section.top + height <= section.height + LINE_LAYOUT_OVERFLOW_TOLERANCE) {
                return true;
            }
        }
        // Need split table.
        skeTablesInParagraph.pop();
        // A page-edge float can occupy the margins, including when its content
        // requires slicing. Its first slice must use the same bounds as an intact float.
        const availableHeight = usesPhysicalPageBounds
            ? page.pageHeight - page.marginTop - top
            : section.height - localTop;
        const tableLayoutPage = usesPhysicalPageBounds ? { ...page, marginTop: 0, marginBottom: 0 } : page;
        // TODO: handle nested table.
        const { segmentId } = page;
        const viewModel = ctx.viewModel.getSelfOrHeaderFooterViewModel(segmentId);
        const tableNode = firstUnPositionedTable.tableNode;

        // Slicing reuses the measured paragraphs and their bullet cache. Keep the
        // corresponding list counters so numbering also continues after the table.
        cachePrecomputedTableSkeleton(ctx, tableNode, table);

        const {
            fromCurrentPage,
            skeTables,
        } = createTableSkeletons(
            ctx,
            tableLayoutPage,
            viewModel,
            tableNode,
            sectionBreakConfig,
            availableHeight
        );
        // Reset the position of the first table.
        skeTables.forEach((table, i) => {
            table.top = i === 0 && fromCurrentPage ? top : 0;
            table.left = left;
        });

        if (fromCurrentPage) {
            const firstTable = skeTables.shift()!;

            page.skeTables.set(firstTable.tableId, firstTable);
            firstTable.parent = page;
            ctx.footnoteLayout?.getTableBodyLimit(page, pages, sectionBreakConfig, firstTable);
            skeTablesInParagraph.push({
                table: firstTable,
                tableId: firstTable.tableId,
                hasPositioned: true,
                isSlideTable: true,
                tableNode,

            });
        }

        skeTablesInParagraph.push(...skeTables.map((table) => {
            return {
                table,
                tableId: table.tableId,
                hasPositioned: false,
                isSlideTable: true,
                tableNode,
            };
        }));

        return true;
    } else {
        page.skeTables.set(tableId, table);
        table.parent = page;
        ctx.footnoteLayout?.getTableBodyLimit(page, pages, sectionBreakConfig, table);
        firstUnPositionedTable.hasPositioned = true;

        if (
            tableSource.textWrap === TableTextWrapType.WRAP &&
            tableSource.overlap === BooleanNumber.FALSE &&
            top + height >= section.top + section.height
        ) {
            const nextParagraphEnd = ctx.viewModel.getBody()?.dataStream.indexOf(
                DataStreamTreeTokenType.PARAGRAPH,
                paragraphIndex + 1
            );
            if (nextParagraphEnd != null && nextParagraphEnd >= 0) {
                ctx.paragraphsOpenNewPage.add(nextParagraphEnd);
            }
        }

        const isLastTable = firstUnPositionedTable === skeTablesInParagraph[skeTablesInParagraph.length - 1];

        return !isLastTable;
    }
}

function _getCustomBlockIdsInLine(line: IDocumentSkeletonLine) {
    const customBlockIds: string[] = [];

    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                customBlockIds.push(glyph.drawingId!);
            }
        }
    }

    return customBlockIds;
}

function __updateTopBottomCustomBlockFlowBottom(
    paragraphConfig: IParagraphConfig,
    drawings: IDocumentSkeletonDrawing[],
    sectionTop: number
) {
    for (const drawing of drawings) {
        const { drawingOrigin } = drawing;
        if (
            drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM ||
            drawingOrigin.behindDoc === BooleanNumber.TRUE
        ) {
            continue;
        }

        const bottom = drawing.aTop + drawing.height + (drawingOrigin.distB ?? 0) - sectionTop;
        paragraphConfig.topBottomCustomBlockFlowBottom = Math.max(
            paragraphConfig.topBottomCustomBlockFlowBottom ?? Number.NEGATIVE_INFINITY,
            bottom
        );
    }
}

export function isNonFlowFloatingAnchor(
    glyphGroup: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
): boolean {
    return __getZeroWidthNonFlowFloatingAnchorDrawings(glyphGroup, paragraphNonInlineSkeDrawings).length > 0;
}

function __isPositionedCustomBlockOnlyLine(
    glyphGroup: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    let hasPositionedCustomBlock = false;

    for (const glyph of glyphGroup) {
        if (__isStructuralTerminatorGlyph(glyph) || __isIgnorableZeroSizeGlyph(glyph)) {
            continue;
        }

        if (glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK || glyph.drawingId == null) {
            return false;
        }

        const drawingOrigin = paragraphNonInlineSkeDrawings?.get(glyph.drawingId)?.drawingOrigin;
        if (drawingOrigin == null || drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
            return false;
        }

        hasPositionedCustomBlock = true;
    }

    return hasPositionedCustomBlock;
}

function __getZeroWidthNonFlowFloatingAnchorDrawings(
    glyphGroup: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    const drawings: IDocumentSkeletonDrawing[] = [];

    for (const glyph of glyphGroup) {
        if (__isStructuralTerminatorGlyph(glyph)) {
            continue;
        }

        if (__isIgnorableZeroSizeGlyph(glyph)) {
            continue;
        }

        if (glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK || glyph.width !== 0 || glyph.drawingId == null) {
            return [];
        }

        const drawing = paragraphNonInlineSkeDrawings?.get(glyph.drawingId);
        const drawingOrigin = drawing?.drawingOrigin;
        if (drawing == null || drawingOrigin == null) {
            return [];
        }

        if (drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_NONE) {
            return [];
        }

        drawings.push(drawing);
    }

    return drawings;
}

function __isIgnorableZeroSizeGlyph(glyph: IDocumentSkeletonGlyph) {
    return glyph.content === '' &&
        glyph.drawingId == null &&
        glyph.width === 0 &&
        glyph.bBox.ba + glyph.bBox.bd === 0;
}

function __isStructuralTerminatorGlyph(glyph: IDocumentSkeletonGlyph) {
    return (
        glyph.streamType === DataStreamTreeTokenType.PARAGRAPH ||
        glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK ||
        glyph.streamType === DataStreamTreeTokenType.DOCS_END
    );
}

function __hasFlowGlyph(glyphGroup: IDocumentSkeletonGlyph[]) {
    return glyphGroup.some((glyph) => {
        if (__isStructuralTerminatorGlyph(glyph)) {
            return false;
        }

        if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            return glyph.width !== 0;
        }

        return glyph.content !== '' || glyph.width > 0 || glyph.bBox.ba + glyph.bBox.bd > 0;
    });
}

function _reLayoutCheck(
    ctx: ILayoutContext,
    floatObjects: IFloatObject[],
    column: IDocumentSkeletonColumn,
    paragraphIndex: number
) {
    const page = column.parent?.parent;
    const flowAffectingFloatObjects = floatObjects.filter((floatObject) =>
        floatObject.behindDoc !== BooleanNumber.TRUE ||
        (
            floatObject.layoutType != null &&
            floatObject.layoutType !== PositionedObjectLayoutType.WRAP_NONE
        )
    );

    if (flowAffectingFloatObjects.length === 0 || page == null) {
        return;
    }

    let needBreakLineIterator = false;

    // Handle situations where an image anchor paragraph is squeezed to the next page.
    for (const floatObject of flowAffectingFloatObjects) {
        const floatObjectCache = ctx.floatObjectsCache.get(floatObject.id);
        if (floatObjectCache == null || floatObjectCache.page.segmentId !== page.segmentId) {
            continue;
        }
        if (floatObjectCache.count >= FLOAT_OBJECT_RELAYOUT_LIMIT) {
            continue;
        }
        if (floatObjectCache.page.pageNumber !== page.pageNumber) {
            floatObjectCache.page.skeDrawings.delete(floatObject.id);
            ctx.floatObjectsCache.delete(floatObject.id);

            lineIterator([floatObjectCache.page], (line) => {
                const { lineHeight } = line;
                const column = line.parent;

                if (needBreakLineIterator || column == null) {
                    return;
                }

                const { width: columnWidth, left: columnLeft } = column;
                const top = (column.parent?.top ?? 0) + line.top;
                const collision = collisionDetection(floatObjectCache.floatObject, lineHeight, top, columnLeft, columnWidth);
                if (collision) {
                    // No need to loop next line.
                    needBreakLineIterator = true;
                    ctx.isDirty = true;
                    ctx.layoutStartPointer[floatObjectCache.page.segmentId] = Math.min(line.paragraphIndex, ctx.layoutStartPointer[floatObjectCache.page.segmentId] ?? Number.POSITIVE_INFINITY);
                    ctx.paragraphsOpenNewPage.add(paragraphIndex);
                }
            });
        }
    }

    needBreakLineIterator = false;

    lineIterator([page], (line) => {
        const { lineHeight } = line;
        const lineColumn = line.parent;

        if (needBreakLineIterator || lineColumn == null) {
            return;
        }

        const { width: columnWidth, left: columnLeft } = lineColumn;
        const top = (lineColumn.parent?.top ?? 0) + line.top;

        for (const floatObject of flowAffectingFloatObjects.values()) {
            let targetObject = floatObject;

            if (ctx.floatObjectsCache.has(floatObject.id)) {
                const drawingCache = ctx.floatObjectsCache.get(floatObject.id);
                const needRePosition = checkRelativeDrawingNeedRePosition(ctx, floatObject);

                if (drawingCache?.page.segmentId !== page.segmentId) {
                    continue;
                }

                if (needRePosition) {
                    targetObject = drawingCache?.floatObject ?? floatObject;
                } else {
                    continue;
                }
            }

            const collision = collisionDetection(targetObject, lineHeight, top, columnLeft, columnWidth);
            if (collision) {
                // No need to loop next line.
                needBreakLineIterator = true;

                ctx.isDirty = true;
                ctx.layoutStartPointer[page.segmentId] = Math.min(line.paragraphIndex, ctx.layoutStartPointer[page.segmentId] ?? Number.POSITIVE_INFINITY);

                let drawingCache = ctx.floatObjectsCache.get(floatObject.id);
                if (drawingCache == null) {
                    drawingCache = {
                        count: 0,
                        floatObject,
                        page,
                    };

                    ctx.floatObjectsCache.set(floatObject.id, drawingCache);
                }

                drawingCache.count++;
                drawingCache.floatObject = floatObject;
                drawingCache.page = page;
            }
        }
    });
}

// Detect the relative positioning of the image, whether the position needs to be repositioned.
function checkRelativeDrawingNeedRePosition(ctx: ILayoutContext, floatObject: IFloatObject) {
    const { relativeFrom } = floatObject.positionV;
    const drawingCache = ctx.floatObjectsCache.get(floatObject.id);

    if (drawingCache == null) {
        return false;
    }

    if (relativeFrom === ObjectRelativeFromV.PARAGRAPH || relativeFrom === ObjectRelativeFromV.LINE) {
        const { count, floatObject: prevObject } = drawingCache;
        // Floating elements can be positioned no more than 5 times,
        // and when the error is within 5 pixels, there is no need to re-layout
        if (count < FLOAT_OBJECT_RELAYOUT_LIMIT && Math.abs(floatObject.top - prevObject.top) > 5) {
            return true;
        }
    }

    return false;
}

export const __testing = {
    reLayoutCheck: _reLayoutCheck,
    getWrapTablePosition: __getWrapTablePosition,
    avoidFlowAffectingDrawingsForTable: __avoidFlowAffectingDrawingsForTable,
    avoidNonOverlappingFloatingTables: __avoidNonOverlappingFloatingTables,
    isGlyphGroupBeyondDivideWidth,
    checkPageBreak: __checkPageBreak,
    updateAndPositionTable: _updateAndPositionTable,
    adjustExplicitTabStop: _adjustExplicitTabStop,
};

function _columnOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanMetrics?: IDefaultSpanMetrics
) {
    const lastPage = getLastPage(pages);
    const columnIsFull = isColumnFull(lastPage);

    if (columnIsFull === true) {
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanMetrics);
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanMetrics);
    }
}

function _pageOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanMetrics?: IDefaultSpanMetrics
) {
    const curSkeletonPage: IDocumentSkeletonPage = getLastPage(pages);
    const { skeHeaders, skeFooters } = paragraphConfig;

    const nextPage = createSkeletonPage(
        ctx,
        sectionBreakConfig,
        { skeHeaders, skeFooters },
        curSkeletonPage.pageNumber + 1,
        undefined,
        curSkeletonPage
    );
    nextPage.isNaturalPageOverflow = true;
    pages.push(nextPage);
    _columnOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanMetrics);
}

/**
 * 17.3.1.12 ind (Paragraph Indentation)
 */
function __getIndentPadding(
    indentFirstLine: Nullable<INumberUnit>,
    hanging: Nullable<INumberUnit>,
    indentStart: Nullable<INumberUnit>,
    indentEnd: Nullable<INumberUnit>,
    charSpaceApply: number,
    isParagraphFirstShapedText = false
) {
    const indentFirstLineNumber = getNumberUnitValue(indentFirstLine, charSpaceApply);
    const hangingNumber = getNumberUnitValue(hanging, charSpaceApply);
    const indentStartNumber = getNumberUnitValue(indentStart, charSpaceApply);
    const indentEndNumber = getNumberUnitValue(indentEnd, charSpaceApply);

    let paddingLeft = indentStartNumber;
    const paddingRight = indentEndNumber;

    if (isParagraphFirstShapedText) {
        if (indentFirstLineNumber > 0) {
            paddingLeft += indentFirstLineNumber;
        } else if (hangingNumber > 0) {
            paddingLeft -= hangingNumber;
        }
    }

    return {
        paddingLeft,
        paddingRight,
        paragraphPaddingLeft: indentStartNumber,
        paragraphPaddingRight: indentEndNumber,
    };
}

function __getParagraphSpace(
    isDrawingML: boolean,
    lineSpacing: number = 0,
    spaceAbove: Nullable<INumberUnit>,
    spaceBelow: Nullable<INumberUnit>,
    isParagraphFirstShapedText: boolean,
    preLine?: IDocumentSkeletonLine,
    suppressSpaceAbove = false,
    drawingMLLineHeight?: number
) {
    // Unable to read the paragraph information from the previous line,
    // So add the spaceBelowApply information to each line when creating a new line.
    // `SpaceBelowApply` will not participate in the current line height calculation.
    const spaceBelowApply = getParagraphSpaceValue(spaceBelow, lineSpacing, drawingMLLineHeight);

    if (isParagraphFirstShapedText) {
        let marginTop = suppressSpaceAbove ? 0 : getParagraphSpaceValue(spaceAbove, lineSpacing, drawingMLLineHeight);

        if (preLine) {
            const { spaceBelowApply: preSpaceBelowApply } = preLine;
            if (isDrawingML) {
                // DrawingML adds adjacent paragraph spacing; Word collapses it to the larger value.
                marginTop += preSpaceBelowApply;
            } else if (marginTop < preSpaceBelowApply) {
                const maxValue = Math.max(preSpaceBelowApply, marginTop);
                // spaceBelow and spaceAbove compare the size, the larger one takes effect
                // 17.3.1.33 spacing (Spacing Between Lines and Above/Below Paragraph)
                // Reflowing the following line can visit this paragraph boundary
                // again. Replace the applied spacing instead of accumulating it.
                preLine.lineHeight += maxValue - (preLine.marginBottom ?? 0);
                setLineMarginBottom(preLine, maxValue);
                // Remove the marginTop of the current line.
                marginTop = 0;
            }
        }
        return {
            marginTop,
            spaceBelowApply,
        };
    }

    return {
        marginTop: 0,
        spaceBelowApply,
    };
}

function getParagraphSpaceValue(value: Nullable<INumberUnit>, lineSpacing: number, drawingMLLineHeight?: number): number {
    // DrawingML paragraph percentages use a normal line, independent of the paragraph's line spacing.
    const relativeToNormalLine = drawingMLLineHeight != null &&
        (value?.u === NumberUnitType.LINE || value?.u === NumberUnitType.PERCENT);
    return getNumberUnitValue(value, relativeToNormalLine ? drawingMLLineHeight : lineSpacing);
}

function __getParagraphAnchorLeft(
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    indentStart: Nullable<INumberUnit>
) {
    const { paragraphStyle = {} } = paragraphConfig;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const { gridType = GridType.LINES } = sectionBreakConfig;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const paragraphAnchorLeft = getNumberUnitValue(indentStart, charSpaceApply);

    if (paragraphAnchorLeft > 0) {
        return paragraphAnchorLeft;
    }

    return getNumberUnitValue(paragraphConfig.docxFallbackAnchorLeft, charSpaceApply);
}

function getDrawingMLNominalLineHeight(
    glyphGroup: IDocumentSkeletonGlyph[],
    sectionBreakConfig: ISectionBreakConfig,
    hasInlineCustomBlock = false
): number | undefined {
    if (sectionBreakConfig.documentCompatibilityPolicy?.mode !== 'drawingml' || hasInlineCustomBlock ||
        glyphGroup.some((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0)) {
        return undefined;
    }
    const textGlyphs = glyphGroup.filter((glyph) =>
        glyph.content && glyph.streamType !== DataStreamTreeTokenType.PARAGRAPH && glyph.glyphType !== GlyphType.LIST
    );
    const fontSize = Math.max(0, ...(textGlyphs.length ? textGlyphs : glyphGroup)
        .map((glyph) => glyph.fontStyle?.originFontSize ?? 0)
        .filter((size) => Number.isFinite(size) && size > 0));
    return getNominalFontLineHeight(fontSize, sectionBreakConfig.documentCompatibilityPolicy);
}

export function getLineHeightMetrics(
    glyphLineHeight: number,
    paragraphLineGapDefault: number,
    linePitch: number,
    gridType: GridType,
    lineSpacing: number,
    spacingRule: SpacingRule,
    snapToGrid: BooleanNumber,
    useWordStyleLineHeight = true,
    scaleAutoLineSpacingByGlyphHeight = true,
    normalLineHeight?: number,
    snapAutoLineSpacingToWholeGridLines = false,
    drawingMLLineHeight?: number
) {
    const usesLineGridType = gridType === GridType.LINES || gridType === GridType.LINES_AND_CHARS;
    const hasNoLineGrid = !usesLineGridType || snapToGrid === BooleanNumber.FALSE;
    if (hasNoLineGrid && ((!useWordStyleLineHeight && spacingRule === SpacingRule.EXACT) ||
        (drawingMLLineHeight != null && spacingRule === SpacingRule.AUTO))) {
        const lineSpacingApply = spacingRule === SpacingRule.EXACT
            ? scaleAutoLineSpacingByGlyphHeight ? lineSpacing : Math.max(lineSpacing, glyphLineHeight)
            : lineSpacing * drawingMLLineHeight!;
        const padding = (lineSpacingApply - glyphLineHeight) / 2;
        return {
            paddingTop: padding,
            paddingBottom: padding,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }
    if (!useWordStyleLineHeight) {
        let paddingTop = paragraphLineGapDefault;
        let paddingBottom = paragraphLineGapDefault;

        if (!usesLineGridType || snapToGrid === BooleanNumber.FALSE) {
            if (spacingRule === SpacingRule.AUTO) {
                return {
                    paddingTop,
                    paddingBottom,
                    contentHeight: lineSpacing * glyphLineHeight,
                    lineSpacingApply: glyphLineHeight,
                };
            }

            return {
                paddingTop,
                paddingBottom,
                contentHeight: Math.max(lineSpacing, glyphLineHeight),
                lineSpacingApply: lineSpacing,
            };
        }

        let lineSpacingApply = 0;
        if (spacingRule === SpacingRule.AUTO) {
            lineSpacingApply = lineSpacing * linePitch;
        } else {
            lineSpacingApply = lineSpacing;
        }

        if (glyphLineHeight + paragraphLineGapDefault * 2 < lineSpacingApply) {
            paddingTop = paddingBottom = (lineSpacingApply - glyphLineHeight) / 2;
        } else {
            lineSpacingApply = glyphLineHeight;
        }

        return {
            paddingTop,
            paddingBottom,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    const usesDocumentGrid =
        spacingRule === SpacingRule.AUTO
        && snapToGrid === BooleanNumber.TRUE
        && usesLineGridType;

    if (spacingRule === SpacingRule.AUTO) {
        // Inline objects keep their physical extent, but adjacent text still
        // contributes the paragraph's additional multiple-line leading.
        const gridLineSpacing = snapAutoLineSpacingToWholeGridLines
            ? Math.ceil(lineSpacing - 1e-6) * linePitch
            : lineSpacing * linePitch;
        let lineSpacingApply = usesDocumentGrid
            ? scaleAutoLineSpacingByGlyphHeight || snapAutoLineSpacingToWholeGridLines
                ? glyphLineHeight > gridLineSpacing + 1e-6
                    ? Math.ceil((glyphLineHeight - 1e-6) / linePitch) * linePitch
                    : gridLineSpacing
                : Math.max(glyphLineHeight, gridLineSpacing)
            : scaleAutoLineSpacingByGlyphHeight
                ? lineSpacing * Math.max(glyphLineHeight, normalLineHeight ?? 0)
                : glyphLineHeight + Math.max(0, lineSpacing - 1) * (normalLineHeight ?? 0);
        if (
            !usesDocumentGrid
            && scaleAutoLineSpacingByGlyphHeight
            && normalLineHeight == null
            && lineSpacing <= 1.05
            && glyphLineHeight >= 30
        ) {
            lineSpacingApply *= 1.18;
        }
        const padding = (lineSpacingApply - glyphLineHeight) / 2;

        return {
            paddingTop: padding,
            paddingBottom: padding,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    if (spacingRule === SpacingRule.AT_LEAST) {
        const lineSpacingApply = Math.max(lineSpacing, glyphLineHeight);
        const padding = (lineSpacingApply - glyphLineHeight) / 2;

        return {
            paddingTop: padding,
            paddingBottom: padding,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    // An explicit Word EXACT line box overrides the document grid pitch.
    let exactLineSpacingApply = lineSpacing;
    if (!scaleAutoLineSpacingByGlyphHeight) {
        exactLineSpacingApply = Math.max(exactLineSpacingApply, glyphLineHeight);
    }

    // EXACT follows the requested line box height even when it is smaller than the glyph box.
    // Negative padding lets subsequent lines advance by the exact value, which is closer to Word.
    const exactPadding = (exactLineSpacingApply - glyphLineHeight) / 2;

    return {
        paddingTop: exactPadding,
        paddingBottom: exactPadding,
        contentHeight: glyphLineHeight,
        lineSpacingApply: exactLineSpacingApply,
    };
}

export function updateInlineDrawingPosition(
    line: IDocumentSkeletonLine,
    paragraphInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>,
    unitId = '',
    blockAnchorTop?: number,
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>,
    documentCompatibilityPolicy?: IParagraphConfig['documentCompatibilityPolicy']
) {
    const column = line.parent;
    const section = column?.parent;
    const page = line?.parent?.parent?.parent;

    if (page == null || column == null) {
        return;
    }

    const isPageBreak = __checkPageBreak(column);

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const { top, lineHeight, marginBottom = 0 } = line;
    const sectionTop = section?.top ?? 0;
    const lineTop = sectionTop + top;
    const baseline = isTraditionalDocumentCompatibility(documentCompatibilityPolicy)
        ? lineTop + line.marginTop + line.paddingTop +
            getGlyphGroupFontBoundingBox(documentCompatibilityPolicy, ...line.divides.map((divide) => divide.glyphGroup)).boundingBoxAscent
        : undefined;

    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0) {
                const { drawingId } = glyph;

                if (drawingId == null) {
                    continue;
                }

                const drawing = paragraphInlineSkeDrawings?.get(drawingId);

                const drawingOrigin = drawing?.drawingOrigin;

                if (drawingOrigin == null || drawing == null) {
                    continue;
                }

                const { docTransform } = drawingOrigin;

                const { size, angle } = docTransform;
                const { width = 0, height = 0 } = size;
                const glyphHeight = glyph.bBox.bd + glyph.bBox.ba;
                const glyphLeft = divide.left + divide.paddingLeft + glyph.left;
                const blockLeft = column.left + glyphLeft;
                const viewport = getDocsCustomBlockRenderViewport(unitId, drawingId, {
                    blockLeft,
                    fallbackHeight: height,
                    fallbackWidth: width,
                    pageMarginLeft: page.marginLeft,
                    pageMarginRight: page.marginRight,
                    pageWidth: page.pageWidth,
                });
                const drawingWidth = viewport?.width ?? width;
                const drawingHeight = viewport?.height ?? height;
                const extent = drawingOrigin.effectExtent;
                const effectOffsetX = ((extent?.left ?? 0) - (extent?.right ?? 0)) / 2;
                const effectOffsetY = ((extent?.top ?? 0) - (extent?.bottom ?? 0)) / 2;
                drawing.aLeft = viewport
                    ? blockLeft + (viewport.offsetLeft ?? 0) + (extent?.left ?? 0)
                    : blockLeft + 0.5 * glyph.width - 0.5 * drawingWidth + effectOffsetX || 0;
                if (glyph.width > divide.width) {
                    for (const positionedDrawing of paragraphNonInlineSkeDrawings?.values() ?? []) {
                        const positionedOrigin = positionedDrawing.drawingOrigin;
                        if (
                            positionedOrigin == null ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.INLINE ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
                        ) {
                            continue;
                        }

                        const positionedBottom = positionedDrawing.aTop + positionedDrawing.height;
                        const lineBottom = lineTop + lineHeight;
                        if (positionedDrawing.aTop >= lineBottom || positionedBottom <= lineTop) {
                            continue;
                        }

                        const positionedRight = positionedDrawing.aLeft + positionedDrawing.width;
                        const drawingRight = drawing.aLeft + drawingWidth;
                        if (positionedDrawing.aLeft < drawingRight && positionedRight > drawing.aLeft) {
                            drawing.aLeft = Math.max(
                                drawing.aLeft,
                                positionedDrawing.aLeft + positionedDrawing.width + (positionedOrigin.distR ?? 0)
                            );
                        }
                    }
                }
                drawing.width = drawingWidth;
                drawing.height = drawingHeight;
                // Inline pictures sit on the text baseline, not below its descenders or leading.
                drawing.aTop = baseline == null
                    ? lineTop + lineHeight - 0.5 * glyphHeight - 0.5 * drawingHeight - marginBottom + effectOffsetY
                    : baseline - glyph.bBox.ba + 0.5 * (glyphHeight - drawingHeight) + effectOffsetY;
                drawing.angle = angle;
                drawing.customBlockRenderViewport = viewport
                    ? {
                        bleedLeft: viewport.bleedLeft,
                        bleedWidth: viewport.bleedWidth,
                        contentHeight: viewport.contentHeight,
                        contentWidth: viewport.contentWidth,
                        height: viewport.height,
                        pageContentWidth: viewport.pageContentWidth,
                        viewScale: viewport.viewScale,
                        viewportHeight: viewport.viewportHeight,
                    }
                    : undefined;
                drawing.isPageBreak = isPageBreak;
                drawing.lineTop = lineTop;
                drawing.columnLeft = column.left;
                drawing.blockAnchorTop = blockAnchorTop == null ? lineTop : sectionTop + blockAnchorTop;
                drawing.lineHeight = line.lineHeight;

                drawings.set(drawing.drawingId, drawing);
            }
        }
    }
    const res = new Map([...page.skeDrawings, ...drawings]);
    page.skeDrawings = res;
}

function __getDrawingPosition(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    isParagraphFirstShapedText: boolean,
    blockAnchorTop?: number,
    needPositionDrawings: IDocumentSkeletonDrawing[] = [],
    blockAnchorLeft = 0,
    normalizeTraditionalColumnAnchor = true
) {
    const page = column.parent?.parent;
    if (
        page == null ||
        needPositionDrawings.length === 0
    ) {
        return;
    }

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const isPageBreak = __checkPageBreak(column);
    const sectionTop = column.parent?.top ?? 0;
    const absoluteLineTop = sectionTop + lineTop;
    const absoluteBlockAnchorTop = blockAnchorTop == null ? undefined : sectionTop + blockAnchorTop;

    // TODO: @jocs In paragraph cross-page scenario (one paragraph across two pages), default to placing drawing on the previous page, and do not process drawing on the next page?
    if (isPageBreak && !isParagraphFirstShapedText) {
        return;
    }

    for (const drawing of needPositionDrawings) {
        const { drawingOrigin } = drawing;

        if (!drawingOrigin) {
            continue;
        }

        const { docTransform } = drawingOrigin;
        const { positionH, positionV, size, angle } = docTransform;
        const { width, height } = size;
        const fallbackWidth = width ?? 0;
        const fallbackHeight = height ?? 0;
        const viewport = drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
            ? getDocsCustomBlockRenderViewport(ctx.dataModel.getUnitId?.() ?? '', drawing.drawingId, {
                fallbackHeight,
                fallbackWidth,
                pageMarginLeft: page.marginLeft,
                pageMarginRight: page.marginRight,
                pageWidth: page.pageWidth,
            })
            : null;
        const drawingWidth = viewport?.width ?? fallbackWidth;
        const drawingHeight = viewport?.height ?? fallbackHeight;

        let aLeft = getPositionHorizon(positionH, column, page, drawingWidth, isPageBreak) ?? 0;
        if (
            ctx.dataModel.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL &&
            (positionH.relativeFrom === ObjectRelativeFromH.PAGE || positionH.relativeFrom === ObjectRelativeFromH.MARGIN)
        ) {
            // Floating drawings and text wrapping share the content origin, not the physical page edge.
            aLeft -= page.marginLeft;
        }
        if (
            positionH.relativeFrom === ObjectRelativeFromH.COLUMN &&
            blockAnchorLeft > 0
        ) {
            const renderedColumnOrigin = isPageBreak ? 0 : (column.left || page.marginLeft);
            aLeft += blockAnchorLeft - renderedColumnOrigin;
            if (
                normalizeTraditionalColumnAnchor &&
                ctx.dataModel.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL &&
                positionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH
            ) {
                aLeft -= page.marginLeft;
            }
        }
        drawing.aLeft = aLeft;
        drawing.aTop = getPositionVertical(
            positionV,
            page,
            absoluteLineTop,
            lineHeight,
            drawingHeight,
            absoluteBlockAnchorTop,
            isPageBreak
        ) ?? 0;
        drawing.width = drawingWidth;
        drawing.height = drawingHeight;
        drawing.angle = angle;
        drawing.customBlockRenderViewport = viewport
            ? {
                bleedLeft: viewport.bleedLeft,
                bleedWidth: viewport.bleedWidth,
                contentHeight: viewport.contentHeight,
                contentWidth: viewport.contentWidth,
                height: viewport.height,
                pageContentWidth: viewport.pageContentWidth,
                viewScale: viewport.viewScale,
                viewportHeight: viewport.viewportHeight,
            }
            : undefined;
        drawing.initialState = true;
        drawing.columnLeft = column.left;
        drawing.lineTop = absoluteLineTop;
        drawing.lineHeight = lineHeight;
        drawing.isPageBreak = isPageBreak;
        drawing.blockAnchorTop = absoluteBlockAnchorTop ?? absoluteLineTop;

        drawings.set(drawing.drawingId, drawing);
    }

    return drawings;
}

// Update the absolute position of paragraphNonInlineSkeDrawings, relative to the first line layout of the paragraph
function __updateDrawingPosition(
    column: IDocumentSkeletonColumn,
    drawings?: Map<string, IDocumentSkeletonDrawing>,
    overwriteTopBottomPosition = false
) {
    const page = column.parent?.parent;
    if (drawings == null || drawings.size === 0 || page == null) {
        return;
    }

    for (const drawing of drawings.values()) {
        const originDrawing = page.skeDrawings.get(drawing.drawingId);

        if (originDrawing) {
            // If it's a layout that splits the text up and down,
            // choose an image that is closer to the bottom for the layout.
            if (originDrawing.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM) {
                if (overwriteTopBottomPosition) {
                    page.skeDrawings.set(drawing.drawingId, drawing);
                } else {
                    const lowerDrawing = originDrawing.aTop > drawing.aTop ? originDrawing : drawing;
                    page.skeDrawings.set(drawing.drawingId, lowerDrawing);
                }
            } else {
                page.skeDrawings.set(drawing.drawingId, drawing);
            }
        } else {
            page.skeDrawings.set(drawing.drawingId, drawing);
        }
    }
}

// Check whether there is a page-spreading scenario, if the line with paragraphStart === true cannot be searched upwards, it means a paragraph is spanning pages
// Cross-page requires pageBreak at critical point
function __checkPageBreak(column: IDocumentSkeletonColumn) {
    const section = column.parent;
    if (!section) {
        return false;
    }

    const pageSections = section.parent?.sections;
    if (pageSections && pageSections[0] !== section) {
        return false;
    }

    const columns = section?.columns;

    if (!columns) {
        return false;
    }

    const columnLength = columns.length;
    for (let c = columnLength - 1; c >= 0; c--) {
        const curColumn = columns[c];
        const lines = curColumn.lines;
        const lineLength = lines.length;
        if (lineLength <= 0) {
            continue;
        }
        for (let i = lineLength - 1; i >= 0; i--) {
            const line = lines[i];
            if (line.paragraphStart) {
                return false;
            }
        }
    }

    return true;
}

function __getGlyphGroupWidth(glyphGroup: IDocumentSkeletonGlyph[], includeParagraphMark = false) {
    applyGlyphKerning(glyphGroup);
    const glyphGroupLen = glyphGroup.length;
    let width = 0;

    for (let i = 0; i < glyphGroupLen; i++) {
        const glyph = glyphGroup[i];
        // Word end marks do not consume line width. Other hosts may request a visible advance.
        if (glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK ||
            (!includeParagraphMark && glyph.content === DataStreamTreeTokenType.PARAGRAPH)) {
            continue;
        }
        width += glyph.width;
    }
    return width;
}

function __getGlyphGroupByLine({ divides }: IDocumentSkeletonLine) {
    return divides.flatMap((divide) => divide.glyphGroup);
}

function __isNullLine(line: IDocumentSkeletonLine) {
    const glyphGroup = __getGlyphGroupByLine(line);

    return glyphGroup.every((glyph) => !glyph.content && !glyph.drawingId);
}

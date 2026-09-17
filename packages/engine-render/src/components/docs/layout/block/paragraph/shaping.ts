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

import type { ICustomRangeForInterceptor, IParagraph, IParagraphStyle, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { IBreakPoints } from '../../line-breaker/line-breaker';
import type { ILayoutContext } from '../../tools';
import {
    BaselineOffset,
    BooleanNumber,
    characterSpacingControlType,
    DataStreamTreeTokenType,
    DocxBreakType,
    GridType,
    PositionedObjectLayoutType,
    resolveDocumentParagraphStyle,
} from '@univerjs/core';
import { cjk } from '../../../../../basics/cjk-regexp';
import { GlyphType } from '../../../../../basics/i-document-skeleton-cached';
import {
    getFirstGrapheme,
    getFontStyleString,
    hasArabic,
    hasThai,
    hasTibetan,
    isCjkCenterAlignedPunctuation,
    isCjkLeftAlignedPunctuation,
    isCjkRightAlignedPunctuation,
    startWithEmoji,
} from '../../../../../basics/tools';
import { getDocsCustomBlockRenderViewport } from '../../../custom-block-render-viewport';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility } from '../../../document-compatibility';
import { Lang } from '../../hyphenation/lang';
import { BreakPointType } from '../../line-breaker/break';
import { LineBreakerHyphenEnhancer } from '../../line-breaker/enhancers/hyphen-enhancer';
import { LineBreakerLinkEnhancer } from '../../line-breaker/enhancers/link-enhancer';
import { LineBreakerWholeEntityEnhancer } from '../../line-breaker/enhancers/whole-entity-enhancer';
import { customBlockLineBreakExtension } from '../../line-breaker/extensions/custom-block-linebreak-extension';
import { eastAsianQuoteLineBreakExtension } from '../../line-breaker/extensions/east-asian-quote-linebreak-extension';
import { tabLineBreakExtension } from '../../line-breaker/extensions/tab-linebreak-extension';
import { LineBreaker } from '../../line-breaker/line-breaker';
import {
    createSkeletonCustomBlockGlyph,
    createSkeletonLetterGlyph,
    createSkeletonTabGlyph,
    createSkeletonWholeEntityGlyph,
    glyphShrinkLeft,
    glyphShrinkRight,
} from '../../model/glyph';
import { getBoundingBox } from '../../model/line';
import {
    getCharSpaceApply,
    getCustomRangeGlyphMetrics,
    getCustomRangeGlyphMetricsFromRange,
    getFontCreateConfig,
    isMeasuredWholeEntityRange,
} from '../../tools';
import { ArabicHandler, emojiHandler, otherHandler, ThaiHandler, TibetanHandler } from './language-ruler';

// Now we apply consecutive punctuation adjustment, specified in Chinese Layout
// Requirements, section 3.1.6.1 Punctuation Adjustment Space, and Japanese Layout
// Requirements, section 3.1 Line Composition Rules for Punctuation Marks
function punctuationSpaceAdjustment(shapedGlyphs: IDocumentSkeletonGlyph[], includeEastAsianQuotes = false) {
    const len = shapedGlyphs.length;
    for (let i = 0; i < len - 1; i++) {
        const curGlyph = shapedGlyphs[i];
        const nextGlyph = shapedGlyphs[i + 1];
        const { width, content } = curGlyph;
        const delta = width / 2;

        if (
            (cjk.hasCJKPunctuation(content) || (includeEastAsianQuotes && /^[“”‘’]$/.test(content))) &&
            (cjk.hasCJKPunctuation(nextGlyph.content) || (includeEastAsianQuotes && /^[“”‘’]$/.test(nextGlyph.content))) &&
            curGlyph.ts?.textAdvance === undefined &&
            nextGlyph.ts?.textAdvance === undefined &&
            curGlyph.adjustability.shrinkability[1] + nextGlyph.adjustability.shrinkability[0] >= delta
        ) {
            const leftDelta = Math.min(curGlyph.adjustability.shrinkability[1], delta);

            glyphShrinkRight(curGlyph, leftDelta);
            glyphShrinkLeft(nextGlyph, delta - leftDelta);
        }
    }
}

// Add some spacing between Han characters and western characters.
// See Requirements for Chinese Text Layout, Section 3.2.2 Mixed Text Composition in Horizontal
// Written Mode
function addCJKLatinSpacing(shapedTextList: IShapedText[]) {
    const shapedGlyphs = shapedTextList.flatMap((shapedText) => shapedText.glyphs);
    let prevGlyph = null;
    const len = shapedGlyphs.length;
    const LATIN_REG = /[a-z\d]/i;

    for (let i = 0; i < len; i++) {
        const curGlyph = shapedGlyphs[i];
        const nextGlyph = i < len - 1 ? shapedGlyphs[i + 1] : null;
        // Automatic mixed-script spacing is based on the character, not its explicit tracking interval.
        const width = curGlyph.ts?.sc && Number.isFinite(curGlyph.ts.sc) ? curGlyph.bBox.width : curGlyph.width;

        // Case 1: CJ followed by a Latin character.
        if (
            cjk.hasCJKText(curGlyph.content)
            && nextGlyph
            && LATIN_REG.test(nextGlyph.content)
            && curGlyph.ts?.textAdvance === undefined
            && nextGlyph.ts?.textAdvance === undefined
        ) {
            curGlyph.autoSpacing = [0, width / 4];
            curGlyph.width += width / 4;
            curGlyph.adjustability.shrinkability[1] += width / 8;
            curGlyph.adjustability.stretchability[1] += width / 8;
        }

        // Case 2: Latin followed by a CJ character.
        if (
            cjk.hasCJKText(curGlyph.content)
            && prevGlyph
            && LATIN_REG.test(prevGlyph.content)
            && curGlyph.ts?.textAdvance === undefined
            && prevGlyph.ts?.textAdvance === undefined
        ) {
            curGlyph.autoSpacing = [width / 4, curGlyph.autoSpacing?.[1] ?? 0];
            curGlyph.width += width / 4;
            curGlyph.xOffset += width / 4;
            curGlyph.adjustability.shrinkability[0] += width / 8;
            curGlyph.adjustability.stretchability[0] += width / 8;
        }

        prevGlyph = curGlyph;
    }
}

export function getHyphenationLanguage(
    ctx: ILayoutContext,
    content: string,
    paragraphStyle: IParagraphStyle,
    sectionBreakConfig: ISectionBreakConfig
): Lang {
    const { suppressHyphenation = BooleanNumber.FALSE } = paragraphStyle;
    const { autoHyphenation = BooleanNumber.FALSE } = sectionBreakConfig;

    return suppressHyphenation === BooleanNumber.FALSE && autoHyphenation === BooleanNumber.TRUE
        ? ctx.languageDetector.detect(content)
        : Lang.UNKNOWN;
}

export interface IShapedText {
    text: string;
    glyphs: IDocumentSkeletonGlyph[];
    breakPointType: BreakPointType;
}

function collectMeasuredWholeEntityRanges(
    content: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode
): ICustomRangeForInterceptor[] {
    const ranges: ICustomRangeForInterceptor[] = [];
    const contentStartIndex = paragraphNode.contentStartIndex;
    const contentEndIndex = contentStartIndex + content.length - 1;
    const customRanges = viewModel.getBody()?.customRanges ?? [];

    for (const customRange of customRanges) {
        if (
            !customRange.wholeEntity ||
            customRange.startIndex < contentStartIndex ||
            customRange.endIndex < customRange.startIndex ||
            customRange.endIndex > contentEndIndex
        ) {
            continue;
        }

        const interceptedRange = viewModel.getCustomRange(customRange.startIndex);
        if (
            interceptedRange?.rangeId === customRange.rangeId &&
            interceptedRange.startIndex === customRange.startIndex &&
            interceptedRange.endIndex === customRange.endIndex &&
            isMeasuredWholeEntityRange(interceptedRange)
        ) {
            ranges.push(interceptedRange);
        }
    }

    return ranges.sort((a, b) => a.startIndex - b.startIndex);
}

function createMeasuredWholeEntityGlyph(
    content: string,
    range: ICustomRangeForInterceptor,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
): IDocumentSkeletonGlyph | undefined {
    const relativeStartIndex = range.startIndex - paragraphNode.contentStartIndex;
    const relativeEndIndex = range.endIndex - paragraphNode.contentStartIndex + 1;
    const raw = content.slice(relativeStartIndex, relativeEndIndex);
    const config = getFontCreateConfig(relativeStartIndex, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const metrics = getCustomRangeGlyphMetricsFromRange(range, config);

    if (!raw || !metrics) {
        return undefined;
    }

    return createSkeletonWholeEntityGlyph(raw, config, metrics);
}

function getShapedGlyphText(glyph: IDocumentSkeletonGlyph): string {
    if (glyph.ts?.hidden === true) {
        return '';
    }
    if (
        glyph.glyphType === GlyphType.PLACEHOLDER &&
        glyph.streamType === DataStreamTreeTokenType.LETTER &&
        glyph.raw !== glyph.content
    ) {
        return glyph.raw;
    }

    return glyph.content;
}

function createShapedCustomBlockGlyph(
    i: number,
    char: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
): IDocumentSkeletonGlyph {
    const { drawings = {} } = sectionBreakConfig;
    const config = getFontCreateConfig(i, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    let newGlyph: Nullable<IDocumentSkeletonGlyph> = null;
    const customBlock = viewModel.getCustomBlockWithoutSetCurrentIndex(paragraphNode.contentStartIndex + i);

    if (customBlock != null) {
        const { blockId } = customBlock;
        const drawingOrigin = drawings[blockId];
        if (drawingOrigin?.layoutType === PositionedObjectLayoutType.INLINE) {
            const { angle } = drawingOrigin.docTransform;
            const { width = 0, height = 0 } = drawingOrigin.docTransform.size;
            const top = 0;
            const left = 0;
            const viewport = getDocsCustomBlockRenderViewport(
                viewModel.getDataModel().getUnitId?.() ?? '',
                drawingOrigin.drawingId,
                {
                    fallbackHeight: height,
                    fallbackWidth: width,
                }
            );

            const boundingBox = getBoundingBox(angle, left, viewport?.width ?? width, top, viewport?.height ?? height);
            const extent = drawingOrigin.effectExtent;
            newGlyph = createSkeletonCustomBlockGlyph(
                config,
                (viewport?.layoutWidth ?? boundingBox.width ?? 0) + (extent?.left ?? 0) + (extent?.right ?? 0),
                (boundingBox.height ?? 0) + (extent?.top ?? 0),
                drawingOrigin.drawingId
            );
            newGlyph.bBox.bd = extent?.bottom ?? 0;
        } else if (drawingOrigin != null) {
            newGlyph = createSkeletonCustomBlockGlyph(config, 0, 0, drawingOrigin.drawingId);
        }
    }

    if (newGlyph == null) {
        newGlyph = createSkeletonLetterGlyph(char, config);
    }
    return newGlyph;
}

function createWhitespaceGlyph(
    char: string,
    config: ReturnType<typeof getFontCreateConfig>,
    i: number,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    snapToGrid: BooleanNumber,
    traditionalLayout: boolean
): IDocumentSkeletonGlyph {
    const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 10.5 } = sectionBreakConfig;
    let newGlyph: IDocumentSkeletonGlyph;
    if (char === DataStreamTreeTokenType.TAB) {
        const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
        newGlyph = createSkeletonTabGlyph(config, charSpaceApply);
    } else if (char === DataStreamTreeTokenType.PARAGRAPH) {
        const zeroWidthParagraphBreak = sectionBreakConfig.renderConfig?.zeroWidthParagraphBreak;

        if (zeroWidthParagraphBreak === BooleanNumber.TRUE) {
            newGlyph = createSkeletonLetterGlyph(char, config, 0);
        } else {
            const defaultWidth = zeroWidthParagraphBreak == null && sectionBreakConfig.documentCompatibilityPolicy?.mode === 'drawingml'
                ? 0
                : undefined;
            newGlyph = createSkeletonLetterGlyph(
                char,
                config,
                getCustomRangeGlyphMetrics(i, viewModel, paragraphNode, config) ?? defaultWidth
            );
        }
    } else {
        const content = paragraphNode.content ?? '';
        const balanceSpaceWidth = char === ' ' && config.balanceSingleByteDoubleByteWidth === BooleanNumber.TRUE &&
            (i === 0 || i + 1 === content.length || /\s/.test(content[i - 1]) || /\s/.test(content[i + 1]));
        newGlyph = createSkeletonLetterGlyph(char, balanceSpaceWidth ? { ...config, balanceSpaceWidth } : config);
    }
    if (traditionalLayout && char === DataStreamTreeTokenType.COLUMN_BREAK &&
        viewModel.getCustomRange(paragraphNode.contentStartIndex + i)?.properties?.breakType !== DocxBreakType.COLUMN) {
        // DOCX soft breaks are widthless, but an authored blank line still has font height.
        newGlyph.bBox = { ...createSkeletonLetterGlyph(' ', config, 0).bBox, width: 0 };
    }

    if (char === DataStreamTreeTokenType.PARAGRAPH &&
        sectionBreakConfig.cellHiddenEndMarkIndex === paragraphNode.endIndex &&
        isTraditionalDocumentCompatibility(sectionBreakConfig.documentCompatibilityPolicy)) {
        newGlyph.bBox.ba = 0;
        newGlyph.bBox.bd = 0;
        newGlyph.bBox.normalLineHeight = 0;
    }
    return newGlyph;
}

function createNoteGlyph(
    ctx: ILayoutContext,
    index: number,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
): IDocumentSkeletonGlyph | undefined {
    const offset = paragraphNode.contentStartIndex + index;
    const fieldType = viewModel.getCustomRangeRaw(offset)?.properties?.fieldType;
    if (fieldType === 'FOOTNOTE_SEPARATOR' || fieldType === 'FOOTNOTE_CONTINUATION_SEPARATOR') {
        const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
        const textWidth = Math.max(0, (sectionBreakConfig.pageSize?.width ?? 192) -
            (sectionBreakConfig.marginLeft ?? 0) - (sectionBreakConfig.marginRight ?? 0));
        const width = fieldType === 'FOOTNOTE_SEPARATOR' ? Math.min(192, textWidth) : textWidth;
        const glyph = createSkeletonLetterGlyph(' ', config, width);
        glyph.raw = '\uFFFC';
        glyph.noteSeparator = true;
        return glyph;
    }

    const note = viewModel === ctx.viewModel ? ctx.noteReferences?.get(offset) : undefined;
    if (!note) {
        return undefined;
    }
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const glyph = createSkeletonLetterGlyph(note.label, config);
    glyph.raw = '\uFFFC';
    glyph.count = 1;
    glyph.noteId = note.noteId;
    return glyph;
}

function getScriptHandler(source: string, char: string): typeof otherHandler {
    if (startWithEmoji(source)) {
        return emojiHandler;
    }
    if (hasArabic(char)) {
        return ArabicHandler;
    }
    if (hasTibetan(char)) {
        return TibetanHandler;
    }
    if (hasThai(char)) {
        return ThaiHandler;
    }
    return otherHandler;
}

function createShapingLineBreaker(
    ctx: ILayoutContext,
    content: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph,
    traditionalLayout: boolean,
    measuredWholeEntityRanges: ICustomRangeForInterceptor[]
): IBreakPoints {
    const lineBreaker = new LineBreaker(content);
    const { paragraphStyle = {} } = paragraph;
    const { hyphen } = ctx;

    // Add custom extension for linebreak.
    tabLineBreakExtension(lineBreaker);
    customBlockLineBreakExtension(lineBreaker);
    if (cjk.hasCJKText(content)) {
        eastAsianQuoteLineBreakExtension(lineBreaker);
    }
    if (traditionalLayout) {
        // Word permits a signed value after CJK text or a list separator to
        // start a line; the Unicode default joins the entire numeric list.
        lineBreaker.addRule('break_before_cjk_signed_value', (codePoint, previous) => {
            return (codePoint === 0x2B || codePoint === 0x2D) && previous != null
                && (previous === 0x3001 || previous === 0xFF0C || cjk.hasCJKText(String.fromCodePoint(previous)));
        });
        if ((sectionBreakConfig.characterSpacingControl ?? ctx.dataModel.documentStyle.characterSpacingControl)
            === characterSpacingControlType.doNotCompress) {
            // With uncompressed punctuation, Word also permits a numeric hyphen
            // to end the line. A plus sign remains attached to its number.
            lineBreaker.addRule('break_after_uncompressed_numeric_hyphen', (codePoint, previous) => {
                return previous === 0x2D && codePoint >= 0x30 && codePoint <= 0x39;
            });
        }
    }

    const documentSnapshot = viewModel.getSnapshot();
    const { wordWrap } = resolveDocumentParagraphStyle(documentSnapshot.documentStyle, paragraphStyle, {
        styles: documentSnapshot.styles,
        paragraphStyleId: paragraph.styleId,
    });
    let breaker: IBreakPoints = new LineBreakerLinkEnhancer(lineBreaker, !traditionalLayout && wordWrap !== BooleanNumber.FALSE);

    const lang = getHyphenationLanguage(ctx, content, paragraphStyle, sectionBreakConfig);
    const doNotHyphenateCaps = sectionBreakConfig.doNotHyphenateCaps === BooleanNumber.TRUE;

    if (lang !== Lang.UNKNOWN) {
        // Use hyphen enhancer when the lang pattern is loaded.
        if (hyphen.hasPattern(lang)) {
            breaker = new LineBreakerHyphenEnhancer(breaker, hyphen, lang, doNotHyphenateCaps);
        } else {
            // Legacy synchronous layout cannot wait for a code-split dictionary.
            // Incremental layout prepares it before reaching this shaping boundary.
            hyphen.loadPattern(lang).catch((error: unknown) => console.error(error));
        }
    }
    return new LineBreakerWholeEntityEnhancer(
        breaker,
        measuredWholeEntityRanges,
        paragraphNode.contentStartIndex
    );
}

function createNoteLabelGlyph(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
): IDocumentSkeletonGlyph | undefined {
    if (ctx.noteLabel != null && viewModel === ctx.viewModel &&
        paragraphNode.endIndex === viewModel.getBody()?.paragraphs?.[0]?.startIndex) {
        const config = getFontCreateConfig(0, viewModel, paragraphNode, sectionBreakConfig, paragraph);
        const textStyle = { ...config.textStyle, va: BaselineOffset.SUPERSCRIPT, ...ctx.noteReferenceTextStyle };
        const marker = createSkeletonLetterGlyph(ctx.noteLabel, {
            ...config,
            textStyle,
            fontStyle: getFontStyleString({ ...textStyle, ff: [textStyle.ff, textStyle.eastAsiaFontFamily].filter(Boolean).join(', ') }),
        });
        marker.raw = '';
        marker.count = 0;
        return marker;
    }
}

function appendShapedText(
    shapedTextList: IShapedText[],
    shapedGlyphs: IDocumentSkeletonGlyph[],
    breakPointType: BreakPointType,
    fixedTabStops = false
): void {
    const shapedGlyphsList: IDocumentSkeletonGlyph[][] = [[]];

    for (let i = 0; i < shapedGlyphs.length; i++) {
        const lastList = shapedGlyphsList[shapedGlyphsList.length - 1];
        const glyph = shapedGlyphs[i];

        // Inline Custom Block can open a new line.
        if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0) {
            if (lastList.length === 0) {
                shapedGlyphsList.pop();
            }
            shapedGlyphsList.push([glyph]);
        } else {
            lastList.push(glyph);
        }
        if (fixedTabStops && glyph.glyphType === GlyphType.TAB && i < shapedGlyphs.length - 1) {
            shapedGlyphsList.push([]);
        }
    }

    const lastShapedGlyphs = shapedGlyphsList[shapedGlyphsList.length - 1];

    for (const shapedGlyphs of shapedGlyphsList) {
        const word = shapedGlyphs.map(getShapedGlyphText).join('');

        shapedTextList.push({
            text: word,
            glyphs: shapedGlyphs,
            breakPointType: shapedGlyphs === lastShapedGlyphs ? breakPointType : BreakPointType.Normal,
        });
    }
}

function setTabAlignedTextWidths(shapedTextList: IShapedText[]): void {
    // Alignment tabs measure the entire following field, not just the next word-break slice.
    let tabAlignedTextWidth = 0;
    for (let index = shapedTextList.length - 1; index >= 0; index--) {
        const glyphs = shapedTextList[index].glyphs;
        for (let glyphIndex = glyphs.length - 1; glyphIndex >= 0; glyphIndex--) {
            const glyph = glyphs[glyphIndex];
            if (glyph.glyphType === GlyphType.TAB) {
                glyph.tabAlignedTextWidth = tabAlignedTextWidth;
                tabAlignedTextWidth = 0;
            } else if (glyph.streamType === DataStreamTreeTokenType.PARAGRAPH || glyph.content === '\v') {
                tabAlignedTextWidth = 0;
            } else {
                tabAlignedTextWidth += glyph.width;
            }
        }
    }
}

export function shaping(
    ctx: ILayoutContext,
    content: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): IShapedText[] {
    const shapedTextList: IShapedText[] = [];
    const traditionalLayout = isTraditionalDocumentCompatibility(
        sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy(ctx.dataModel.documentStyle.documentFlavor)
    );
    const fixedPunctuationPairs = traditionalLayout
        && (sectionBreakConfig.characterSpacingControl ?? ctx.dataModel.documentStyle.characterSpacingControl)
        === characterSpacingControlType.doNotCompress;
    const { endIndex } = paragraphNode;
    const paragraph = viewModel.getParagraph(endIndex) || { startIndex: 0, paragraphId: 'para_render_fallback' };
    const { paragraphStyle = {} } = paragraph;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const measuredWholeEntityRanges = collectMeasuredWholeEntityRanges(content, viewModel, paragraphNode);
    const measuredWholeEntityRangeByStart = new Map(measuredWholeEntityRanges.map((range) => [
        range.startIndex - paragraphNode.contentStartIndex,
        range,
    ]));
    const measuredWholeEntityRangeStarts = measuredWholeEntityRanges.map(
        (range) => range.startIndex - paragraphNode.contentStartIndex
    );
    let measuredWholeEntityRangeIndex = 0;
    let last = 0;

    const breaker = createShapingLineBreaker(
        ctx,
        content,
        viewModel,
        paragraphNode,
        sectionBreakConfig,
        paragraph,
        traditionalLayout,
        measuredWholeEntityRanges
    );

    for (let bk = breaker.nextBreakPoint(); bk; bk = breaker.nextBreakPoint()) {
        // Word treats a spaced ellipsis like closing punctuation, keeping the preceding word with it.
        if (traditionalLayout && bk.type === BreakPointType.Normal
            && content[bk.position] === '…' && content[bk.position - 1] === ' ') {
            continue;
        }
        // Word keeps Western names such as Breyer/Duitsland together. Oversized
        // words still use the layout ruler's normal emergency-break path.
        if (traditionalLayout && bk.type === BreakPointType.Normal
            && /[a-z]\/[a-z]/i.test(content.slice(bk.position - 2, bk.position + 1))) {
            continue;
        }
        // get the string between the last break and this one
        const word = content.slice(last, bk.position);
        const shapedGlyphs: IDocumentSkeletonGlyph[] = [];

        if (last === 0) {
            const marker = createNoteLabelGlyph(ctx, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            if (marker) {
                shapedGlyphs.push(marker);
            }
        }

        let src = word;
        let i = last;
        while (src.length > 0) {
            while (
                measuredWholeEntityRangeIndex < measuredWholeEntityRangeStarts.length &&
                measuredWholeEntityRangeStarts[measuredWholeEntityRangeIndex] < i
            ) {
                measuredWholeEntityRangeIndex++;
            }

            let char = src.match(/^[\s\S]/gu)?.[0];

            if (char == null) {
                break;
            }

            const measuredRange = measuredWholeEntityRangeByStart.get(i);
            if (measuredRange) {
                const glyph = createMeasuredWholeEntityGlyph(
                    content,
                    measuredRange,
                    viewModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraph
                );
                if (glyph) {
                    shapedGlyphs.push(glyph);
                    const count = measuredRange.endIndex - measuredRange.startIndex + 1;
                    i += count;
                    src = src.substring(count);
                    measuredWholeEntityRangeIndex++;
                    continue;
                }
                measuredWholeEntityRangeIndex++;
            }

            const noteGlyph = char === '\uFFFC'
                ? createNoteGlyph(ctx, i, viewModel, paragraphNode, sectionBreakConfig, paragraph)
                : undefined;
            if (noteGlyph) {
                shapedGlyphs.push(noteGlyph);
                i++;
                src = src.substring(1);
            } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                const newGlyph = createShapedCustomBlockGlyph(i, char, viewModel, paragraphNode, sectionBreakConfig, paragraph);

                shapedGlyphs.push(newGlyph);
                i += char.length;
                src = src.substring(char.length);
            } else if (/\s/.test(char) || cjk.hasCJK(char)) {
                const config = getFontCreateConfig(i, viewModel, paragraphNode, sectionBreakConfig, paragraph);
                if (config.textStyle.sc && cjk.hasCJK(char)) {
                    char = getFirstGrapheme(src) ?? char;
                }
                const newGlyph = createWhitespaceGlyph(char, config, i, viewModel, paragraphNode, sectionBreakConfig, snapToGrid, traditionalLayout);
                if (char === DataStreamTreeTokenType.PARAGRAPH
                    && sectionBreakConfig.renderConfig?.zeroWidthParagraphBreak === BooleanNumber.TRUE
                    && sectionBreakConfig.renderConfig?.topAlignExactLineSpacing === BooleanNumber.TRUE) {
                    let previousGlyph = shapedGlyphs[shapedGlyphs.length - 1];
                    for (let index = shapedTextList.length - 1; !previousGlyph && index >= 0; index--) {
                        const glyphs = shapedTextList[index].glyphs;
                        previousGlyph = glyphs[glyphs.length - 1];
                    }
                    if (previousGlyph?.bBox.fontAscent != null && previousGlyph.bBox.fontDescent != null) {
                        // A merged paragraph mark must not move surviving positioned text.
                        const { ba, bd, normalLineHeight } = previousGlyph.bBox;
                        newGlyph.bBox = { ...newGlyph.bBox, ba, bd, normalLineHeight };
                    }
                }

                shapedGlyphs.push(newGlyph);
                i += char.length;
                src = src.substring(char.length);
            } else {
                const handler = getScriptHandler(src, char);
                const nextMeasuredRangeStart = measuredWholeEntityRangeStarts[measuredWholeEntityRangeIndex];
                const sourceBeforeMeasuredRange = handler !== otherHandler || nextMeasuredRangeStart == null
                    ? src
                    : src.slice(0, nextMeasuredRangeStart - i);
                const { step, glyphGroup } = handler(
                    i,
                    sourceBeforeMeasuredRange,
                    viewModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraph
                );
                shapedGlyphs.push(...glyphGroup);
                i += step;

                src = src.substring(step);
            }
        }

        // Keep the opt-out in glyph metrics so both line fitting and edge adjustment respect it.
        if (sectionBreakConfig.renderConfig?.preservePunctuationSpacing === BooleanNumber.TRUE) {
            for (const glyph of shapedGlyphs) {
                if (
                    isCjkLeftAlignedPunctuation(glyph.content)
                    || isCjkRightAlignedPunctuation(glyph.content)
                    || isCjkCenterAlignedPunctuation(glyph.content)
                ) {
                    glyph.adjustability.shrinkability = [0, 0];
                }
            }
        }

        // With line compression enabled, Word resolves spacing for the whole line.
        // doNotCompress still retains fixed adjacent-punctuation spacing, including
        // East Asian quote/bracket pairs, independently of line justification.
        if (sectionBreakConfig.renderConfig?.preservePunctuationSpacing !== BooleanNumber.TRUE
            && (!traditionalLayout || fixedPunctuationPairs)) {
            punctuationSpaceAdjustment(shapedGlyphs, fixedPunctuationPairs);
        }

        appendShapedText(shapedTextList, shapedGlyphs, bk.type, paragraphStyle.fixedTabStops === BooleanNumber.TRUE);

        last = bk.position;
    }

    // Preserve the legacy default, but honor documents that explicitly disable mixed-script spacing.
    if (sectionBreakConfig.spaceWidthEastAsian !== BooleanNumber.FALSE) {
        addCJKLatinSpacing(shapedTextList);
    }

    setTabAlignedTextWidths(shapedTextList);

    return shapedTextList;
}

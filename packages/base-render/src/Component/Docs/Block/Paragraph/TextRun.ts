import { BooleanNumber, GridType, HorizontalAlign, ITextRun, NamedStyleType, SpacingRule } from '@univerjs/core';
import { composeCharForLanguage } from './Language.Ruler';
import { calculateParagraphLayout } from './Layout.Ruler';

import { IFontLocale, IParagraphConfig, ISectionBreakConfig } from '../../../../Basics/Interfaces';
import { getCharSpaceApply, getSpanGroupWidth, lineIterator } from '../../Common/Tools';
import { createSkeletonTabSpan, createSkeletonWordSpan } from '../../Common/Span';
import { getFontStyleString } from '../../../../Basics/Tools';

// import { getCharSpaceApply, getSpanGroupWidth, lineIterator } from '../../Common/Tools';
// import { createSkeletonTabSpan, createSkeletonWordSpan } from '../../Common/Span';
import { IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../../../Basics/IDocumentSkeletonCached';

export function dealWidthTextRun(
    textRun: ITextRun,
    elementIndex: number = 0,
    sectionBreakConfig: ISectionBreakConfig,
    currentPage: IDocumentSkeletonPage,
    paragraphConfig: IParagraphConfig,
    fontLocale?: IFontLocale
): IDocumentSkeletonPage[] {
    const { ct: content = '', ts: textStyle = {}, tab = false } = textRun;
    const fontStyle = getFontStyleString(textStyle, fontLocale);
    const { paragraphStyle = {} } = paragraphConfig;
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        defaultTabStop = 10.5,
        pageSize = {
            width: Infinity,
            height: Infinity,
        },
        marginLeft = 0,
        marginRight = 0,
    } = sectionBreakConfig;
    const {
        namedStyleType = NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED,
        horizontalAlign = HorizontalAlign.UNSPECIFIED,
        lineSpacing = 1,
        spacingRule = SpacingRule.AUTO,
        snapToGrid = BooleanNumber.TRUE,
        direction,
        spaceAbove = 0,
        spaceBelow = 0,
        borderBetween,
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,
        indentFirstLine = 0,
        hanging = 0,
        indentStart = 0,
        indentEnd = 0,
        tabStops = [],
        keepLines = BooleanNumber.FALSE,
        keepNext = BooleanNumber.FALSE,
        wordWrap = BooleanNumber.FALSE,
        widowControl = BooleanNumber.FALSE,
        shading,
    } = paragraphStyle;

    let allPages: IDocumentSkeletonPage[] = [currentPage];
    const pageWidth = pageSize.width || Infinity - marginLeft - marginRight;
    const mixTextStyle = {
        ...documentTextStyle,
        ...textStyle,
    };

    const fontCreateConfig = {
        fontStyle,
        textStyle: mixTextStyle,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    if (tab) {
        const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
        const tabSpan = createSkeletonTabSpan(fontCreateConfig, charSpaceApply); // measureText收敛到create中执行
        allPages = calculateParagraphLayout([tabSpan], allPages, sectionBreakConfig, paragraphConfig, elementIndex, true);
        return allPages;
    }

    const arrayText = content.split('');

    // console.log(arrayText, pageSize);

    for (let charIndex = 0; charIndex < arrayText.length; charIndex++) {
        const char = arrayText[charIndex];
        const isFirstSpan = charIndex === 0;
        const languageHandlerResult = composeCharForLanguage(char, charIndex, arrayText, fontCreateConfig); // Handling special languages such as Tibetan, Arabic
        let newSpanGroup = [];
        if (languageHandlerResult) {
            const { charIndex: newCharIndex, spanGroup } = languageHandlerResult;
            charIndex = newCharIndex;
            newSpanGroup = spanGroup;
        } else {
            const span = createSkeletonWordSpan(char, fontCreateConfig); // measureText收敛到create中执行
            newSpanGroup.push(span);
        }

        allPages = calculateParagraphLayout(newSpanGroup, allPages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
    }

    lineIterator(allPages, (line: IDocumentSkeletonLine) => {
        horizontalAlignHandler(line, horizontalAlign);
    });

    return allPages;
}

function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign) {
    if (horizontalAlign === HorizontalAlign.UNSPECIFIED || horizontalAlign === HorizontalAlign.LEFT) {
        return;
    }

    const { divides } = line;
    const divideLength = divides.length;
    for (let i = 0; i < divideLength; i++) {
        const divide = divides[i];
        const { width, spanGroup } = divide;
        const spanGroupWidth = getSpanGroupWidth(divide);
        // console.log(spanGroup, spanGroupWidth, width);
        if (width === Infinity) {
            continue;
        }
        if (horizontalAlign === HorizontalAlign.CENTER) {
            divide.paddingLeft = (width - spanGroupWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            divide.paddingLeft = width - spanGroupWidth;
        } else if (horizontalAlign === HorizontalAlign.JUSTIFIED) {
            /**todo */
        }
    }
}

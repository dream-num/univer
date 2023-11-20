import { checkParagraphHasIndentByStyle, DataStreamTreeTokenType, IDocumentBody, Nullable } from '@univerjs/core';

import { IDocumentSkeletonSpan, SpanType } from './i-document-skeleton-cached';

export function hasListSpan(span: Nullable<IDocumentSkeletonSpan>) {
    const divide = span?.parent;

    if (divide == null) {
        return false;
    }

    const spanGroup = divide.spanGroup;

    return spanGroup[0]?.spanType === SpanType.LIST;
}

export function isIndentBySpan(span: Nullable<IDocumentSkeletonSpan>, body?: IDocumentBody) {
    const paragraph = getParagraphBySpan(span, body);
    if (paragraph == null) {
        return false;
    }
    const { paragraphStyle } = paragraph;

    if (paragraphStyle == null) {
        return false;
    }

    return checkParagraphHasIndentByStyle(paragraphStyle);
}

export function isLastSpan(span: Nullable<IDocumentSkeletonSpan>) {
    const divide = span?.parent;

    const line = divide?.parent;

    const spanGroup = divide?.spanGroup;

    const divides = line?.divides;

    if (spanGroup && span && divides && divide) {
        const spanIndex = spanGroup.indexOf(span);
        const divideIndex = divides.indexOf(divide);

        if (divideIndex === divides.length - 1 && spanIndex === spanGroup.length - 1) {
            return true;
        }
    }

    return false;
}

export function isFirstSpan(span: Nullable<IDocumentSkeletonSpan>) {
    const divide = span?.parent;

    const line = divide?.parent;

    const spanGroup = divide?.spanGroup;

    const divides = line?.divides;

    if (spanGroup && span && divides && divide) {
        const spanIndex = spanGroup.indexOf(span);
        const divideIndex = divides.indexOf(divide);

        if (divideIndex === 0 && spanIndex === 0) {
            return true;
        }

        if (divideIndex === 0 && spanIndex === 1 && spanGroup[0].spanType === SpanType.LIST) {
            return true;
        }
    }

    return false;
}

export function getParagraphBySpan(span: Nullable<IDocumentSkeletonSpan>, body?: IDocumentBody) {
    const line = span?.parent?.parent;
    if (line == null || body == null) {
        return;
    }
    const paragraphs = body.paragraphs;

    if (paragraphs == null) {
        return;
    }

    for (const paragraph of paragraphs) {
        if (paragraph.startIndex === line.paragraphIndex) {
            return paragraph;
        }
    }
}

export function isPlaceholderOrSpace(span: Nullable<IDocumentSkeletonSpan>) {
    if (span == null) {
        return false;
    }

    if (
        [DataStreamTreeTokenType.PARAGRAPH, DataStreamTreeTokenType.TAB, DataStreamTreeTokenType.SECTION_BREAK].indexOf(
            span.streamType
        ) !== -1 ||
        span.content === DataStreamTreeTokenType.SPACE
    ) {
        return true;
    }

    return false;
}

export function isSameLine(span1: Nullable<IDocumentSkeletonSpan>, span2: Nullable<IDocumentSkeletonSpan>) {
    if (span1 == null) {
        return false;
    }

    if (span2 == null) {
        return false;
    }

    if (span1.parent == null) {
        return false;
    }

    if (span2.parent == null) {
        return false;
    }

    return span1.parent.parent === span2.parent.parent;
}

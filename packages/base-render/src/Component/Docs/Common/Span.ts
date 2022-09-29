import { BooleanNumber, BulletAlignment, GridType } from '@univer/core';
import { validationGrid } from '..';
import { FontCache, IDocumentSkeletonBullet, IDocumentSkeletonSpan, IFontCreateConfig, SpanType } from '../../..';

export function createSkeletonWordSpan(content: string, config: IFontCreateConfig, spanWidth?: number): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.WORD, content, config, spanWidth);
}

export function createSkeletonLetterSpan(content: string, config: IFontCreateConfig, spanWidth?: number): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.LETTER, content, config, spanWidth);
}

export function createSkeletonTabSpan(config: IFontCreateConfig, spanWidth?: number): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.TAB, ' ', config, spanWidth);
}

function _createSkeletonWordOrLetter(spanType: SpanType, content: string, config: IFontCreateConfig, spanWidth?: number): IDocumentSkeletonSpan {
    const { fontStyle, textStyle, charSpace = 1, gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE } = config;
    const bBox = FontCache.getTextSize(content, fontStyle);
    const { width: contentWidth = 0 } = bBox;
    let width = spanWidth ?? contentWidth;
    let paddingLeft = 0;
    if (validationGrid(gridType, snapToGrid)) {
        // 当文字也需要对齐到网格式，进行处理
        const multiple = Math.ceil(contentWidth / charSpace);
        width = multiple * charSpace;
        if (gridType === GridType.LINES_AND_CHARS) {
            paddingLeft = (width - contentWidth) / 2;
        }
    }
    return {
        content,
        ts: textStyle,
        fontStyle,
        width,
        bBox,
        paddingLeft,
        left: 0,
        spanType,
    };
}

export function createSkeletonBulletSpan(span: IDocumentSkeletonSpan, bulletSkeleton: IDocumentSkeletonBullet, charSpaceApply: number): IDocumentSkeletonSpan {
    const { bBox: boundingBox, symbol: content, ts: textStyle, fontStyle, bulletAlign = BulletAlignment.START, bulletType = false } = bulletSkeleton;
    const contentWidth = boundingBox.width;
    // 当文字也需要对齐到网格式，进行处理, LINES默认参照是doc全局字体大小

    const multiple = Math.ceil(contentWidth / charSpaceApply);
    let width = (multiple < 2 ? 2 : multiple) * charSpaceApply; // 默认bullet有2个tab

    let left = 0;
    if (bulletType) {
        // 有序列表的处理，左对齐时left=0，其余情况根据contentWidth调整
        if (bulletAlign === BulletAlignment.CENTER) {
            left = -contentWidth / 2;
            width -= left;
        } else if (bulletAlign === BulletAlignment.END) {
            left = -contentWidth;
            width -= left;
        }
    }

    const bBox = _getMaxBoundingBox(span, bulletSkeleton);

    return {
        content,
        ts: textStyle,
        fontStyle,
        width,
        paddingLeft: 0,
        bBox,
        left,
        spanType: SpanType.LIST,
    };
}

export function setSpanGroupLeft(spanGroup: IDocumentSkeletonSpan[], left: number = 0) {
    const spanGroupLen = spanGroup.length;
    let preSpan;
    for (let i = 0; i < spanGroupLen; i++) {
        const span = spanGroup[i];
        span.left = preSpan ? preSpan.left + preSpan.width : left;

        preSpan = span;
    }
}

export function setSpanLeft(span: IDocumentSkeletonSpan, left: number = 0) {
    span.left = left;
}

function _getMaxBoundingBox(span: IDocumentSkeletonSpan, bulletSkeleton: IDocumentSkeletonBullet) {
    const { ba: spanAscent, bd: spanDescent } = span.bBox;
    const { ba: bulletAscent, bd: bulletDescent } = bulletSkeleton.bBox;

    if (spanAscent + spanDescent > bulletAscent + bulletDescent) {
        return span.bBox;
    }
    return bulletSkeleton.bBox;
}

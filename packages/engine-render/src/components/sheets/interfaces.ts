import type { BorderStyleTypes, HorizontalAlign, ObjectMatrix, VerticalAlign, WrapStrategy } from '@univerjs/core';

import type { BORDER_TYPE } from '../../basics/const';
import type { DocumentSkeleton } from '../docs/doc-skeleton';

export interface BorderCache {
    [key: string]: BorderCacheItem | {};
}

export interface BorderCacheItem {
    type: BORDER_TYPE;
    style: BorderStyleTypes;
    color: string;
}

export interface IFontCacheItem {
    documentSkeleton: DocumentSkeleton;
    // marginTop?: number;
    // marginBottom?: number;
    // marginRight?: number;
    // marginLeft?: number;
    angle?: number;
    verticalAlign: VerticalAlign;
    horizontalAlign: HorizontalAlign;
    wrapStrategy: WrapStrategy;
    // content?: string;
}

interface backgroundCache {
    [key: string]: ObjectMatrix<string>;
}

interface fontCache {
    [key: string]: ObjectMatrix<IFontCacheItem>;
}

export interface IStylesCache {
    background?: backgroundCache;
    font?: fontCache;
    border?: ObjectMatrix<BorderCache>;
}

export enum ShowGridlinesState {
    OFF,
    ON,
}

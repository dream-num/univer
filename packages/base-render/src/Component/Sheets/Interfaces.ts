import { BorderStyleTypes, HorizontalAlign, ObjectMatrix, VerticalAlign, WrapStrategy } from '@univerjs/core';

import { BORDER_TYPE } from '../../Basics/Const';
import { DocumentSkeleton } from '../Docs/DocSkeleton';

export interface BorderCache {
    [key: string]: BorderCacheItem | {};
}

export interface BorderCacheItem {
    type: BORDER_TYPE;
    style: BorderStyleTypes;
    color: string;
}

export interface fontCacheItem {
    documentSkeleton: DocumentSkeleton;
    // marginTop?: number;
    // marginBottom?: number;
    // marginRight?: number;
    // marginLeft?: number;
    angle?: number;
    verticalAlign: VerticalAlign;
    horizontalAlign: HorizontalAlign;
    wrapStrategy: WrapStrategy;
    content?: string;
}

interface backgroundCache {
    [key: string]: ObjectMatrix<string>;
}

interface fontCache {
    [key: string]: ObjectMatrix<fontCacheItem>;
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

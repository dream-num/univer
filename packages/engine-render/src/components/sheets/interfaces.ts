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

import type {
    BorderStyleTypes,
    HorizontalAlign,
    ISelectionCellWithCoord,
    ObjectMatrix,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

import type { BORDER_TYPE } from '../../basics/const';
import type { DocumentSkeleton } from '../docs/layout/doc-skeleton';

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
    vertexAngle?: number; // Text rotation offset based on the top-left corner.
    centerAngle?: number; // Text rotation based on the center point.
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
    backgroundPositions?: ObjectMatrix<ISelectionCellWithCoord>;
    font?: fontCache;
    border?: ObjectMatrix<BorderCache>;
}

export enum ShowGridlinesState {
    OFF,
    ON,
}

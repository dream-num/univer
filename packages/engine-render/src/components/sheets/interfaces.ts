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
import type { Canvas } from '../../canvas';
import type { UniverRenderingContext } from '../../context';
import type { ISheetFontRenderExtension } from './extensions';

export
interface BorderCache {
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

export enum SHEET_VIEWPORT_KEY {
    VIEW_MAIN = 'sheetViewMain',
    VIEW_MAIN_LEFT_TOP = 'sheetViewMainLeftTop',
    VIEW_MAIN_TOP = 'sheetViewMainTop',
    VIEW_MAIN_LEFT = 'sheetViewMainLeft',

    VIEW_ROW_TOP = 'sheetViewRowTop',
    VIEW_ROW_BOTTOM = 'sheetViewRowBottom',
    VIEW_COLUMN_LEFT = 'sheetViewColumnLeft',
    VIEW_COLUMN_RIGHT = 'sheetViewColumnRight',
    VIEW_LEFT_TOP = 'sheetViewLeftTop',
}

export interface IPaintForRefresh {
    cacheCanvas: Canvas;
    cacheCtx: UniverRenderingContext;
    mainCtx: UniverRenderingContext;
    topOrigin: number;
    leftOrigin: number;
    bufferEdgeX: number;
    bufferEdgeY: number;
}
export interface IPaintForScrolling {
    cacheCanvas: Canvas;
    cacheCtx: UniverRenderingContext;
    mainCtx: UniverRenderingContext;
    topOrigin: number;
    leftOrigin: number;
    bufferEdgeX: number;
    bufferEdgeY: number;
    rowHeaderWidth: number;
    columnHeaderHeight: number;
    scaleX: number;
    scaleY: number;
}

export type ISheetRenderExtension = ISheetFontRenderExtension
    & ISheetBackgroundRenderExtension
    & ISheetBorderRenderExtension;

export interface ISheetBackgroundRenderExtension {
    backgroundRenderExtension?: {
        isSkip?: boolean;
    };
};

export interface ISheetBorderRenderExtension {
    borderRenderExtension?: {
        isSkip?: boolean;
    };
};


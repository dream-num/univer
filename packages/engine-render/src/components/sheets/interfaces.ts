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
    BorderStyleTypes,
    HorizontalAlign,
    ICellDataForSheetInterceptor,
    ICellWithCoord,
    ImageCacheMap,
    IStyleData,
    Nullable,
    ObjectMatrix,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import type { BORDER_TYPE } from '../../basics/const';
import type { Canvas } from '../../canvas';
import type { UniverRenderingContext } from '../../context';
import type { DocumentSkeleton } from '../docs/layout/doc-skeleton';

export interface IBorderCache {
    [key: string]: IBorderCacheItem | {};
}

export interface IBorderCacheItem {
    type: BORDER_TYPE;
    style: BorderStyleTypes;
    color: string;
}

export interface IFontCacheItem {
    documentSkeleton?: DocumentSkeleton;
    vertexAngle?: number; // Text rotation offset based on the top-left corner.
    centerAngle?: number; // Text rotation based on the center point.
    verticalAlign: VerticalAlign;
    horizontalAlign: HorizontalAlign;
    wrapStrategy: WrapStrategy;
    imageCacheMap: ImageCacheMap;
    cellData: Nullable<ICellDataForSheetInterceptor>;
    fontString: string;
    style?: Nullable<IStyleData>;
    displayText?: string;
    resolvedHorizontalAlign?: HorizontalAlign;
    textFitsCurrentCell?: boolean;
    shrinkScale?: number;
}

type colorString = string;
export interface IStylesCache {
    background?: Record<colorString, ObjectMatrix<string>>;
    backgroundPositions?: ObjectMatrix<ICellWithCoord>;
    /**
     * Get value from getCell in skeleton and this value is used in font extension
     */
    fontMatrix: ObjectMatrix<IFontCacheItem>;
    border?: ObjectMatrix<IBorderCache>;
}

export enum ShowGridlinesState {
    OFF,
    ON,
}

export enum SHEET_VIEWPORT_KEY {
    VIEW_MAIN = 'viewMain',
    VIEW_MAIN_LEFT_TOP = 'viewMainLeftTop',
    VIEW_MAIN_TOP = 'viewMainTop',
    VIEW_MAIN_LEFT = 'viewMainLeft',

    VIEW_ROW_TOP = 'viewRowTop',
    VIEW_ROW_BOTTOM = 'viewRowBottom',
    VIEW_COLUMN_LEFT = 'viewColumnLeft',
    VIEW_COLUMN_RIGHT = 'viewColumnRight',
    VIEW_LEFT_TOP = 'viewLeftTop',
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
    rowHeaderWidthAndMarginLeft: number;
    columnHeaderHeightAndMarginTop: number;
    scaleX: number;
    scaleY: number;
}
export interface IHeaderStyleCfg {
    fontFamily: string;
    fontColor: string;
    fontSize: number;
    borderColor: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    backgroundColor: string;
    /**
     * column header height
     */
    size?: number;
}

export type IAColumnCfgObj = IHeaderStyleCfg & { text: string };
export type IAColumnCfg = undefined | null | string | Partial<Omit<IAColumnCfgObj, 'size'>>;

export interface IRowStyleCfg {
    fontFamily: string;
    fontColor: string;
    fontSize: number;
    borderColor: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    backgroundColor: string;
    /**
     * row header width
     */
    size?: number;
}

export type IARowCfgObj = IHeaderStyleCfg & { text: string };
export type IARowCfg = undefined | null | string | Partial<IARowCfgObj>;

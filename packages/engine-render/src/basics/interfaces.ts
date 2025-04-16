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
    BooleanNumber,
    GridType,
    IDocStyleBase,
    IDocumentLayout,
    IOffset,
    IParagraphStyle,
    IReferenceSource,
    IScale,
    ISectionBreakBase,
    ISize,
    ITextStyle,
    ITransformState,
    LocaleService,
} from '@univerjs/core';

import type { DataStreamTreeNode } from '../components/docs/view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../components/docs/view-model/document-view-model';
import type {
    DocumentSkeletonPageType,
    IDocumentSkeletonBullet,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonDrawingAnchor,
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonTable,
} from './i-document-skeleton-cached';
import type { ITransformerConfig } from './transformer-config';
import type { Vector2 } from './vector2';

export interface IObjectFullState extends ITransformState {
    strokeWidth?: number;
    zIndex?: number;
    forceRender?: boolean;
    debounceParentDirty?: boolean;
    transformerConfig?: ITransformerConfig;
    printable?: boolean;
}

export interface IRect extends ISize, IOffset {
    points: Vector2[];
}

/**
 * width
 * height
 * scaleX
 * scaleY
 */
export interface ISceneTransformState extends ISize, IScale {}

/**
 * Bad design! should use Bit Flags!
 */
export enum TRANSFORM_CHANGE_OBSERVABLE_TYPE {
    translate,
    resize,
    scale,
    skew,
    flip,
    all,
}

export interface ITransformChangeState {
    type: TRANSFORM_CHANGE_OBSERVABLE_TYPE;
    value: IObjectFullState
        | ISceneTransformState;
    preValue: IObjectFullState
        | ISceneTransformState;
}

export interface IFontLocale {
    fontList: string[];
    defaultFontSize: number;
}

export interface IDocsConfig extends IReferenceSource, IDocumentLayout {
    localeService: LocaleService;
    documentTextStyle?: ITextStyle;
    headerTreeMap: Map<string, DocumentViewModel>;
    footerTreeMap: Map<string, DocumentViewModel>;
}

export interface IHeaderIds {
    defaultHeaderId?: string;
    evenPageHeaderId?: string;
    firstPageHeaderId?: string;
}

export interface IFooterIds {
    defaultFooterId?: string;
    evenPageFooterId?: string;
    firstPageFooterId?: string;
}

export interface ISectionBreakConfig extends IDocStyleBase, ISectionBreakBase, IDocsConfig {
    headerIds?: IHeaderIds;
    footerIds?: IFooterIds;
    useFirstPageHeaderFooter?: BooleanNumber;
    evenAndOddHeaders?: BooleanNumber;
}

export interface IParagraphTableCache {
    tableId: string;
    table: IDocumentSkeletonTable;
    hasPositioned: boolean;
    isSlideTable: boolean;
    tableNode: DataStreamTreeNode;
}

export interface IParagraphConfig {
    paragraphIndex: number;
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    paragraphInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    skeTablesInParagraph?: IParagraphTableCache[];
    // headerAndFooterAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    bulletSkeleton?: IDocumentSkeletonBullet;
    // pageContentWidth: number;
    // pageContentHeight: number;
    paragraphStyle?: IParagraphStyle;
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>;
    skeFooters: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>;
    pDrawingAnchor?: Map<number, IDocumentSkeletonDrawingAnchor>;
    // sectionBreakConfig: ISectionBreakConfig;
}

export interface IFontCreateConfig {
    fontStyle: IDocumentSkeletonFontStyle;
    textStyle: ITextStyle;
    charSpace: number;
    snapToGrid: BooleanNumber;
    gridType?: GridType;
    pageWidth?: number;
}

// export interface IPageConfig {
//     pageNumberStart: number;
//     pageSize: ISize;
//     headerIds: IHeaderIds;
//     footerIds: IFooterIds;
//     footers?: IFooters;
//     headers?: IHeaders;
//     useFirstPageHeaderFooter?: boolean;
//     evenAndOddHeaders?: boolean;
// }

export interface INodeInfo {
    node: IDocumentSkeletonGlyph;
    ratioX: number;
    ratioY: number;
    segmentId: string;
    segmentPage: number; // The index of the page where node is located.
}

export interface INodeSearch {
    glyph: number;
    divide: number;
    line: number;
    column: number;
    section: number;
    page: number;
    segmentPage: number; // The index of the page where the header and footer reside.
    pageType: DocumentSkeletonPageType;
    path: (string | number)[];
}

export interface INodePosition extends INodeSearch {
    isBack: boolean;
}

export interface IAfterRender$Info {
    frameTimeMetric: Record<string, number | number[]>;
    tags: { scrolling: boolean } & Record<string, any>;
}

export type ITimeMetric = [string, number];

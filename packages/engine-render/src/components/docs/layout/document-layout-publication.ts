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

import type { IDocumentSkeletonDrawingAnchor, IParagraphList } from '../../../basics/i-document-skeleton-cached';
import type { IDocumentSkeletonContinuousBlockPatch, IDocumentSkeletonPagePatch } from './document-layout-page-patch';

export type IDocumentLayoutListLevelPublication = Array<[string, IParagraphList[][]]>;
export type IDocumentLayoutDrawingAnchorPublication = Array<[
    string,
    Array<[number, Omit<IDocumentSkeletonDrawingAnchor, 'elements'>]>
]>;

export interface IDocumentLayoutPagePublication {
    pageIndex: number;
    page: IDocumentSkeletonPagePatch;
}

export interface IDocumentLayoutResourcePublication {
    reset: boolean;
    skeHeaders: Array<[string, Array<[number, IDocumentSkeletonPagePatch]>]>;
    skeFooters: Array<[string, Array<[number, IDocumentSkeletonPagePatch]>]>;
    skeListLevel: IDocumentLayoutListLevelPublication | null;
    drawingAnchor: IDocumentLayoutDrawingAnchorPublication | null;
}

interface IDocumentLayoutGeometryPublicationBase {
    left: number;
    top: number;
    st: number;
    ed?: number;
    resources: IDocumentLayoutResourcePublication;
}

export interface IDocumentLayoutPageGeometryPublication extends IDocumentLayoutGeometryPublicationBase {
    kind: 'page';
    pages: IDocumentLayoutPagePublication[];
}

export interface IDocumentLayoutBlockGeometryPublication extends IDocumentLayoutGeometryPublicationBase {
    kind: 'block';
    block: IDocumentSkeletonContinuousBlockPatch;
}

export type IDocumentLayoutGeometryPublication =
    | IDocumentLayoutPageGeometryPublication
    | IDocumentLayoutBlockGeometryPublication;

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

export type DocumentLayoutMode = 'paginated' | 'continuous';
export type DocumentLayoutReason = 'initial' | 'edit';

export interface IDocumentLayoutInvalidation {
    /** First offset changed in the pre-mutation document. */
    oldStart: number;
    /** Exclusive end of the changed range in the pre-mutation document. */
    oldEnd: number;
    /** Exclusive end of the changed range in the post-mutation document. */
    newEnd: number;
}

export interface IDocumentLayoutProtectedPageRange {
    mode: 'paginated';
    startPageIndex: number;
    endPageIndex: number;
}

export type IDocumentLayoutPageRange = Pick<
    IDocumentLayoutProtectedPageRange,
    'startPageIndex' | 'endPageIndex'
>;

export interface IDocumentLayoutProtectedContinuousRange {
    mode: 'continuous';
    startOffset: number;
    endOffset: number;
}

export type IDocumentLayoutProtectedRange =
    | IDocumentLayoutProtectedPageRange
    | IDocumentLayoutProtectedContinuousRange;

export interface IDocumentLayoutApplyResult {
    didReplaceProtectedPages: boolean;
}

export interface IDocumentLayoutProgress {
    generation: number;
    publicationRevision: number;
    didPublish: boolean;
    /** The publication atomically replaced the page containing the edit anchor. */
    didPublishAnchor: boolean;
    publishedPageCount: number;
    reason: DocumentLayoutReason;
    mode: DocumentLayoutMode;
    complete: boolean;
    cancelled: boolean;
    anchorReady: boolean;
    laidOutThrough: number;
    /** Last logical offset whose exit geometry cannot be changed by the next block. */
    stableLaidOutThrough: number;
    pageCount: number;
    processedBlockCount: number;
    totalBlockCount: number;
    estimatedPageCount: number;
    estimatedHeight: number;
    elapsedTime: number;
    maxBlockDuration: number;
    /** Main has sealed the protected interaction page and should hand the remaining suffix to Worker. */
    interactionWindowComplete?: boolean;
}

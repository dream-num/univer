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

import type { UpdateDocsAttributeType } from '../../../shared/command-enum';
import type { ICustomRange, IDocumentBody } from '../../../types/interfaces/i-document-data';

// Internal TextX structural-replacement marker. Inserted paragraphs replace the
// same logical paragraphs later in the operation, so their ids must stay stable.
export const PRESERVE_INSERTED_PARAGRAPH_IDS = '__textXPreserveParagraphIds';

export enum TextXActionType {
    RETAIN = 'r',
    INSERT = 'i',
    DELETE = 'd',
}

/**
 * Retain mutation is used to move the cursor or to update properties of the text in the given range.
 */
export interface IRetainAction {
    t: TextXActionType.RETAIN;
    len: number;
    body?: IDocumentBody;
    oldBody?: IDocumentBody;
    coverType?: UpdateDocsAttributeType;
    /**
     * Identity edits applied after the text operation, with absolute result-document offsets.
     * nextRangeId restores array order by identity (null means the end), including coincident SDT nesting.
     * Collaboration peers must support this extension; legacy TextX implementations ignore it.
     */
    rangeUpdates?: Array<{
        rangeId: string;
        range: ICustomRange | null;
        nextRangeId?: string | null;
        /** Only these property paths are written; missing values remove properties. Arrays are atomic. */
        propertyPaths?: string[][];
    }>;
    /** Before-document values captured by makeInvertible; never persisted in a document body. */
    oldRangeUpdates?: IRetainAction['rangeUpdates'];
}

/**
 * Insert mutation is used to insert text (maybe with rich text properties) at the given position.
 */
export interface IInsertAction {
    t: TextXActionType.INSERT;
    body: IDocumentBody;
    len: number;
    /** Scalar selection intent, not snapshot data. All collaboration peers must support this extension. */
    valueRangeId?: string;
}

/**
 * Delete mutation is used to delete text at the given position.
 */
export interface IDeleteAction {
    t: TextXActionType.DELETE;
    len: number;
    body?: IDocumentBody; // Add a body property to make this action invertible.
    /** Preserved through inversion so undo participates in scalar conflict resolution. */
    valueRangeId?: string;
}

export type TextXAction = IRetainAction | IInsertAction | IDeleteAction;

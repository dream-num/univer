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
import type { IDocumentBody } from '../../../types/interfaces/i-document-data';

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
}

/**
 * Insert mutation is used to insert text (maybe with rich text properties) at the given position.
 */
export interface IInsertAction {
    t: TextXActionType.INSERT;
    body: IDocumentBody;
    len: number;
}

/**
 * Delete mutation is used to delete text at the given position.
 */
export interface IDeleteAction {
    t: TextXActionType.DELETE;
    len: number;
    body?: IDocumentBody; // Add a body property to make this action invertible.
}

export type TextXAction = IRetainAction | IInsertAction | IDeleteAction;

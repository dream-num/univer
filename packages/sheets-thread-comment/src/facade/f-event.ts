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

import type { FWorkbook, RichTextValue } from '@univerjs/core';
import type { FWorksheet } from '@univerjs/sheets/facade';
import type { FThreadComment } from './f-thread-comment';
import { FEventName } from '@univerjs/core';

const CommentEvent = {
    CommentAdded: 'CommentAdded',
    BeforeCommentAdd: 'BeforeCommentAdd',

    CommentUpdated: 'CommentUpdated',
    BeforeCommentUpdate: 'BeforeCommentUpdate',

    CommentDeleted: 'CommentDeleted',
    BeforeCommentDeleted: 'BeforeCommentDeleted',

    CommentResolved: 'CommentResolved',
    BeforeCommentResolve: 'BeforeCommentResolve',
} as const;

export class FCommentEvent extends FEventName {
    /**
     * Comment added event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentAdded, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get CommentAdded(): 'CommentAdded' {
        return CommentEvent.CommentAdded;
    }

    /**
     * Before comment add event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentAdd, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeCommentAdd(): 'BeforeCommentAdd' {
        return CommentEvent.BeforeCommentAdd;
    }

    /**
     * Comment updated event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentUpdated, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get CommentUpdated(): 'CommentUpdated' {
        return CommentEvent.CommentUpdated;
    }

    /**
     * Before comment update event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentUpdate, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeCommentUpdate(): 'BeforeCommentUpdate' {
        return CommentEvent.BeforeCommentUpdate;
    }

    /**
     * Comment deleted event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentDeleted, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get CommentDeleted(): 'CommentDeleted' {
        return CommentEvent.CommentDeleted;
    }

    /**
     * Before comment delete event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentDeleted, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeCommentDeleted(): 'BeforeCommentDeleted' {
        return CommentEvent.BeforeCommentDeleted;
    }

    /**
     * Comment resolved event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentResolved, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get CommentResolved(): 'CommentResolved' {
        return CommentEvent.CommentResolved;
    }

    /**
     * Before comment resolve event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentResolve, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeCommentResolve(): 'BeforeCommentResolve' {
        return CommentEvent.BeforeCommentResolve;
    }
}

export interface ISheetCommentAddEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
}

export interface ISheetCommentUpdateEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
    oldContent: RichTextValue;
    newContent: RichTextValue;
}

export interface ISheetCommentDeleteEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
}

export interface ISheetCommentResolveEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
    resolved: boolean;
}


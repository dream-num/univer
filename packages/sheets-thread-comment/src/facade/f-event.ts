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
import type { FTheadCommentValue, FThreadComment } from './f-thread-comment';
import { FEventName } from '@univerjs/core';

interface ICommentEventMixin {
    /**
     * Comment added event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentAdded, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentAdded: 'CommentAdded';

    /**
     * Before comment add event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentAdd, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentAdd: 'BeforeCommentAdd';

    /**
     * Comment updated event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentUpdated, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentUpdated: 'CommentUpdated';

    /**
     * Before comment update event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentUpdate, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentUpdate: 'BeforeCommentUpdate';

    /**
     * Comment deleted event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentDeleted, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentDeleted: 'CommentDeleted';

    /**
     * Before comment delete event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentDeleted, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentDeleted: 'BeforeCommentDeleted';

    /**
     * Comment resolved event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentResolved, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentResolved: 'CommentResolved';

    /**
     * Before comment resolve event
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentResolve, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentResolve: 'BeforeCommentResolve';
}

const CommentEvent: ICommentEventMixin = {
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
    override get CommentAdded(): 'CommentAdded' {
        return CommentEvent.CommentAdded;
    }

    override get BeforeCommentAdd(): 'BeforeCommentAdd' {
        return CommentEvent.BeforeCommentAdd;
    }

    override get CommentUpdated(): 'CommentUpdated' {
        return CommentEvent.CommentUpdated;
    }

    override get BeforeCommentUpdate(): 'BeforeCommentUpdate' {
        return CommentEvent.BeforeCommentUpdate;
    }

    override get CommentDeleted(): 'CommentDeleted' {
        return CommentEvent.CommentDeleted;
    }

    override get BeforeCommentDeleted(): 'BeforeCommentDeleted' {
        return CommentEvent.BeforeCommentDeleted;
    }

    override get CommentResolved(): 'CommentResolved' {
        return CommentEvent.CommentResolved;
    }

    override get BeforeCommentResolve(): 'BeforeCommentResolve' {
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

export interface IBeforeSheetCommentAddEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FTheadCommentValue;
}

export interface ISheetCommentUpdateEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
}

export interface IBeforeSheetCommentUpdateEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
    newContent: RichTextValue;
}

export interface IBeforeSheetCommentDeleteEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
}

export interface ISheetCommentDeleteEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    commentId: string;
}

export interface ISheetCommentResolveEvent {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    col: number;
    comment: FThreadComment;
    resolved: boolean;
}

export interface ISheetCommentEventConfig {
    BeforeCommentAdd: IBeforeSheetCommentAddEvent;
    CommentAdded: ISheetCommentAddEvent;

    BeforeCommentUpdate: IBeforeSheetCommentUpdateEvent;
    CommentUpdated: ISheetCommentUpdateEvent;

    BeforeCommentDeleted: IBeforeSheetCommentDeleteEvent;
    CommentDeleted: ISheetCommentDeleteEvent;

    BeforeCommentResolve: ISheetCommentResolveEvent;
    CommentResolved: ISheetCommentResolveEvent;
}

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends ICommentEventMixin {
    }

    interface IEventParamConfig extends ISheetCommentEventConfig {
    }
}

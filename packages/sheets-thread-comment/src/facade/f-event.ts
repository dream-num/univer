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

import type { IEventBase, RichTextValue } from '@univerjs/core';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { FTheadCommentItem, FThreadComment } from './f-thread-comment';
import { FEventName } from '@univerjs/core';

interface ICommentEventMixin {
    /**
     * Event fired after comment added
     * @see {@link ISheetCommentAddEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentAdded, (event) => {
     *     const { comment, workbook, worksheet, row, col } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentAdded: 'CommentAdded';

    /**
     * Event fired before comment added
     * @see {@link IBeforeSheetCommentAddEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentAdd, (event) => {
     *     const { comment, workbook, worksheet, row, col } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentAdd: 'BeforeCommentAdd';

    /**
     * Event fired after comment updated
     * @see {@link ISheetCommentUpdateEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentUpdated, (event) => {
     *     const { comment, workbook, worksheet, row, col } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentUpdated: 'CommentUpdated';

    /**
     * Event fired before comment update
     * @see {@link IBeforeSheetCommentUpdateEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentUpdate, (event) => {
     *     const { comment, workbook, worksheet, row, col, newContent } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentUpdate: 'BeforeCommentUpdate';

    /**
     * Event fired after comment deleted
     * @see {@link ISheetCommentDeleteEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentDeleted, (event) => {
     *     const { commentId, workbook, worksheet } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentDeleted: 'CommentDeleted';

    /**
     * Event fired before comment delete
     * @see {@link IBeforeSheetCommentDeleteEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentDeleted, (event) => {
     *     const { commentId, workbook, worksheet } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeCommentDeleted: 'BeforeCommentDeleted';

    /**
     * Event fired after comment resolve
     * @see {@link ISheetCommentResolveEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.CommentResolved, (event) => {
     *     const { comment, row, col, resolved, workbook, worksheet } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly CommentResolved: 'CommentResolved';

    /**
     * Event fired before comment resolve
     * @see {@link ISheetCommentResolveEvent}
     * @example
     * ```ts
     * univerAPI.addEventListener(CommentEvent.BeforeCommentResolve, (event) => {
     *     const { comment, row, col, resolved, workbook, worksheet } = event;
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

/**
 * Event interface triggered after a comment is added to a sheet
 * @interface ISheetCommentAddEvent
 * @augments {IEventBase}
 */
export interface ISheetCommentAddEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet where the comment is added */
    worksheet: FWorksheet;
    /** Row index of the comment */
    row: number;
    /** Column index of the comment */
    col: number;
    /** The added comment object */
    comment: FThreadComment;
}

/**
 * Event interface triggered before a comment is added to a sheet
 * @interface IBeforeSheetCommentAddEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetCommentAddEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet where the comment will be added */
    worksheet: FWorksheet;
    /** Row index for the new comment */
    row: number;
    /** Column index for the new comment */
    col: number;
    /** The comment item to be added */
    comment: FTheadCommentItem;
}

/**
 * Event interface triggered after a comment is updated in a sheet
 * @interface ISheetCommentUpdateEvent
 * @augments {IEventBase}
 */
export interface ISheetCommentUpdateEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the updated comment */
    worksheet: FWorksheet;
    /** Row index of the comment */
    row: number;
    /** Column index of the comment */
    col: number;
    /** The updated comment object */
    comment: FThreadComment;
}

/**
 * Event interface triggered before a comment is updated in a sheet
 * @interface IBeforeSheetCommentUpdateEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetCommentUpdateEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the comment */
    worksheet: FWorksheet;
    /** Row index of the comment */
    row: number;
    /** Column index of the comment */
    col: number;
    /** The current comment object */
    comment: FThreadComment;
    /** The new content to replace the existing comment */
    newContent: RichTextValue;
}

/**
 * Event interface triggered before a comment is deleted from a sheet
 * @interface IBeforeSheetCommentDeleteEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetCommentDeleteEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the comment */
    worksheet: FWorksheet;
    /** Row index of the comment */
    row: number;
    /** Column index of the comment */
    col: number;
    /** The comment to be deleted */
    comment: FThreadComment;
}

/**
 * Event interface triggered after a comment is deleted from a sheet
 * @interface ISheetCommentDeleteEvent
 * @augments {IEventBase}
 */
export interface ISheetCommentDeleteEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet that contained the comment */
    worksheet: FWorksheet;
    /** The ID of the deleted comment */
    commentId: string;
}

/**
 * Event interface triggered when a comment's resolve status changes
 * @interface ISheetCommentResolveEvent
 * @augments {IEventBase}
 */
export interface ISheetCommentResolveEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the comment */
    worksheet: FWorksheet;
    /** Row index of the comment */
    row: number;
    /** Column index of the comment */
    col: number;
    /** The comment object */
    comment: FThreadComment;
    /** The new resolve status */
    resolved: boolean;
}

FEventName.extend(FCommentEvent);
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

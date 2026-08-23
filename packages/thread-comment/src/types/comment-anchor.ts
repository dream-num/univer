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

export enum ThreadCommentAnchorKind {
    SHEET_DRAWING = 'sheet-drawing',
    DOC_DRAWING = 'doc-drawing',
    SLIDE_ELEMENT = 'slide-element',
    SLIDE_POSITION = 'slide-position',
    BOARD_ELEMENT = 'board-element',
    BOARD_POSITION = 'board-position',
    BASE_RECORD = 'base-record',
}

export interface IThreadCommentElementAnchor {
    kind:
        | ThreadCommentAnchorKind.SHEET_DRAWING
        | ThreadCommentAnchorKind.DOC_DRAWING
        | ThreadCommentAnchorKind.SLIDE_ELEMENT
        | ThreadCommentAnchorKind.BOARD_ELEMENT;
    elementId: string;
    pageId?: string;
}

export interface IThreadCommentPositionAnchor {
    kind: ThreadCommentAnchorKind.SLIDE_POSITION | ThreadCommentAnchorKind.BOARD_POSITION;
    x: number;
    y: number;
    pageId?: string;
}

export interface IThreadCommentBaseRecordAnchor {
    kind: ThreadCommentAnchorKind.BASE_RECORD;
    tableId: string;
    recordId: string;
}

export type IThreadCommentAnchor =
    | IThreadCommentElementAnchor
    | IThreadCommentPositionAnchor
    | IThreadCommentBaseRecordAnchor;

const THREAD_COMMENT_ANCHOR_PREFIX = 'univer-comment-anchor:';

interface ISerializedThreadCommentAnchor {
    v: 1;
    anchor: IThreadCommentAnchor;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || isNonEmptyString(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

export function isThreadCommentAnchor(value: unknown): value is IThreadCommentAnchor {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const anchor = value as Record<string, unknown>;
    switch (anchor.kind) {
        case ThreadCommentAnchorKind.SHEET_DRAWING:
        case ThreadCommentAnchorKind.DOC_DRAWING:
        case ThreadCommentAnchorKind.SLIDE_ELEMENT:
        case ThreadCommentAnchorKind.BOARD_ELEMENT:
            return isNonEmptyString(anchor.elementId) && isOptionalString(anchor.pageId);
        case ThreadCommentAnchorKind.SLIDE_POSITION:
        case ThreadCommentAnchorKind.BOARD_POSITION:
            return isFiniteNumber(anchor.x) && isFiniteNumber(anchor.y) && isOptionalString(anchor.pageId);
        case ThreadCommentAnchorKind.BASE_RECORD:
            return isNonEmptyString(anchor.tableId) && isNonEmptyString(anchor.recordId);
        default:
            return false;
    }
}

export function serializeThreadCommentAnchor(anchor: IThreadCommentAnchor): string {
    if (!isThreadCommentAnchor(anchor)) {
        throw new TypeError('Invalid thread comment anchor');
    }

    const value: ISerializedThreadCommentAnchor = { v: 1, anchor };
    return `${THREAD_COMMENT_ANCHOR_PREFIX}${JSON.stringify(value)}`;
}

export function deserializeThreadCommentAnchor(ref: string): IThreadCommentAnchor | null {
    if (!ref.startsWith(THREAD_COMMENT_ANCHOR_PREFIX)) {
        return null;
    }

    try {
        const value = JSON.parse(ref.slice(THREAD_COMMENT_ANCHOR_PREFIX.length)) as Partial<ISerializedThreadCommentAnchor>;
        return value.v === 1 && isThreadCommentAnchor(value.anchor) ? value.anchor : null;
    } catch {
        return null;
    }
}

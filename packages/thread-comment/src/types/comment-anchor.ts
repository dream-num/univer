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
    /** A cell comment managed by the Sheets range Facade. */
    SHEET_CELL = 'sheet-cell',
    /** A Sheet image, chart, Shape, or other drawing element. */
    SHEET_DRAWING = 'sheet-drawing',
    /** A fixed text range comment managed by the Docs text range Facade. */
    DOC_TEXT_RANGE = 'doc-text-range',
    /** A Document image, chart, Shape, or other drawing element. */
    DOC_DRAWING = 'doc-drawing',
    /** A Slide page element identified by a stable element ID. */
    SLIDE_ELEMENT = 'slide-element',
    /** A free position normalized to the Slide page size. */
    SLIDE_POSITION = 'slide-position',
    /** A Board element identified by a stable element ID. */
    BOARD_ELEMENT = 'board-element',
    /** A free position in Board world coordinates. */
    BOARD_POSITION = 'board-position',
    /** A Base record identified by stable table and record IDs. */
    BASE_RECORD = 'base-record',
}

export interface IThreadCommentElementAnchor {
    kind:
        | ThreadCommentAnchorKind.SHEET_DRAWING
        | ThreadCommentAnchorKind.DOC_DRAWING
        | ThreadCommentAnchorKind.SLIDE_ELEMENT
        | ThreadCommentAnchorKind.BOARD_ELEMENT;
    elementId: string;
    /** Slide or Board page ID when the host product has pages. */
    pageId?: string;
}

export interface IThreadCommentPositionAnchor {
    kind: ThreadCommentAnchorKind.SLIDE_POSITION | ThreadCommentAnchorKind.BOARD_POSITION;
    x: number;
    y: number;
    /** Slide or Board page ID when the host product has pages. */
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

    const kind = Reflect.get(value, 'kind');
    switch (kind) {
        case ThreadCommentAnchorKind.SHEET_DRAWING:
        case ThreadCommentAnchorKind.DOC_DRAWING:
        case ThreadCommentAnchorKind.SLIDE_ELEMENT:
        case ThreadCommentAnchorKind.BOARD_ELEMENT:
            return isNonEmptyString(Reflect.get(value, 'elementId')) && isOptionalString(Reflect.get(value, 'pageId'));
        case ThreadCommentAnchorKind.SLIDE_POSITION:
        case ThreadCommentAnchorKind.BOARD_POSITION:
            return isFiniteNumber(Reflect.get(value, 'x')) && isFiniteNumber(Reflect.get(value, 'y'))
                && isOptionalString(Reflect.get(value, 'pageId'));
        case ThreadCommentAnchorKind.BASE_RECORD:
            return isNonEmptyString(Reflect.get(value, 'tableId')) && isNonEmptyString(Reflect.get(value, 'recordId'));
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
        const value: unknown = JSON.parse(ref.slice(THREAD_COMMENT_ANCHOR_PREFIX.length));
        if (!value || typeof value !== 'object' || Reflect.get(value, 'v') !== 1) {
            return null;
        }
        const anchor = Reflect.get(value, 'anchor');
        return isThreadCommentAnchor(anchor) ? anchor : null;
    } catch {
        return null;
    }
}

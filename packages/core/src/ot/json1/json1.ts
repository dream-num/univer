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

import { apply } from './apply';
import { compose } from './compose';
import { JSON1ReadCursor, JSON1WriteCursor } from './cursor';
import { invert, invertWithDoc, makeInvertible } from './invert';
import { checkValidOp, editOp, insertOp, moveOp, registerSubtype, removeOp, replaceOp } from './operation';
import { transformPosition } from './position';
import { ConflictType, transform, transformWithConflictsPred } from './transform';

/*! @license
 * ot-json1 1.0.2
 *
 * Copyright (c) 2013-2018, Joseph Gentle <me@josephg.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 *
 * ot-text-unicode 4.0.0
 *
 * All code contributed to this repository is licensed under the standard MIT license:
 *
 * Copyright 2011 ottypes library contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following condition:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * unicount 1.1.0
 *
 * Copyright 2019 Joseph Gentle
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/** A JSON snapshot to which changesets can be applied. */
export type JSON1Document = null | boolean | number | string | JSON1Document[] | { [key: string]: JSON1Document };
export type JSONXPath = Array<string | number>;

/** The wire keys are shared by stored history and collaboration clients. Pick and drop slots encode moves. */
export interface IJSON1Component {
    i?: unknown;
    r?: unknown;
    p?: number;
    d?: number;
    es?: Array<number | string | { d: number | string }>;
    ena?: number;
    e?: unknown;
    et?: string;
}

type OperationList = Array<string | number | IJSON1Component | OperationList>;

/** A tree of path segments and components. A null operation leaves the snapshot unchanged. */
export type JSONXActions = OperationList | null;

interface IJSON1ReadCursor {
    getPath(): JSONXPath;
    getComponent(): IJSON1Component | null;
    traverse(writer: null, visit: (component: IJSON1Component) => void): void;
}

export interface IJSON1WriteCursor {
    reset(): void;
    descend(key: string | number): void;
    descendPath(path: JSONXPath): this;
    ascend(): void;
    write<K extends keyof IJSON1Component>(key: K, value: IJSON1Component[K]): void;
    writeAtPath<K extends keyof IJSON1Component>(path: JSONXPath, key: K, value: IJSON1Component[K]): this;
    writeMove(from: JSONXPath, to: JSONXPath, slot?: number): this;
    at(path: JSONXPath, visit: (writer: IJSON1WriteCursor) => void): this;
    mergeTree(op: JSONXActions): void;
    get(): JSONXActions;
}

type Transform = (op: JSONXActions, against: JSONXActions, side: 'left' | 'right') => JSONXActions;

export interface IJSON1Conflict {
    type: number;
    op1: JSONXActions;
    op2: JSONXActions;
}

interface IJSON1Operations {
    insertOp(path: JSONXPath, value: JSON1Document): JSONXActions;
    /** Omit the previous value for a compact deletion, or supply it to invert without a snapshot. */
    removeOp(path: JSONXPath, value?: JSON1Document): JSONXActions;
    replaceOp(path: JSONXPath, previous: JSON1Document, next: JSON1Document): JSONXActions;
    moveOp(from: JSONXPath, to: JSONXPath): JSONXActions;
    readCursor(op: JSONXActions): IJSON1ReadCursor;
    writeCursor(): IJSON1WriteCursor;
    checkValidOp(op: JSONXActions): void;
    isNoop(op: JSONXActions): boolean;
    apply(snapshot: JSON1Document | undefined, op: JSONXActions): JSON1Document | undefined;
    compose(first: JSONXActions, second: JSONXActions): JSONXActions;
    /** Invert an operation whose removals already contain their previous values. */
    invert(op: JSONXActions): JSONXActions;
    makeInvertible(op: JSONXActions, before: JSON1Document): JSONXActions;
    invertWithDoc(op: JSONXActions, before: JSON1Document): JSONXActions;
    /** Rebase an operation onto its peer, throwing if the changes conflict. */
    transform: Transform;
    /** Follow the item to its new path after a move, or return null if it was removed. */
    transformPosition(path: JSONXPath, op: JSONXActions): JSONXPath | null;
    /** Resolve all JSON1 conflicts using side priority and the engine’s removal rules. */
    transformNoConflict: Transform;
    /** Create a transform that resolves only conflicts accepted by the caller's policy. */
    createTransform(allowConflict: (conflict: IJSON1Conflict) => boolean): Transform;
    readonly RM_UNEXPECTED_CONTENT: number;
    readonly DROP_COLLISION: number;
}

/** Shared JSON1 operations for building, replaying, and rebasing Univer changesets. */
export const JSON1: IJSON1Operations = {
    insertOp,
    removeOp,
    replaceOp,
    moveOp,
    readCursor: (op) => new JSON1ReadCursor(op),
    writeCursor: () => new JSON1WriteCursor(),
    checkValidOp,
    isNoop: (op) => op == null,
    apply,
    compose,
    invert,
    makeInvertible,
    invertWithDoc,
    transform,
    transformPosition,
    transformNoConflict: (op, against, side) => transformWithConflictsPred(() => true, op, against, side),
    createTransform: (allow) => (op, against, side) => transformWithConflictsPred(allow, op, against, side),
    RM_UNEXPECTED_CONTENT: ConflictType.RM_UNEXPECTED_CONTENT,
    DROP_COLLISION: ConflictType.DROP_COLLISION,
};

export interface IJSON1Subtype<TSnapshot, TEdit> {
    name: string;
    uri?: string;
    apply(doc: TSnapshot, op: TEdit): TSnapshot;
    compose(first: TEdit, second: TEdit): TEdit;
    transform(op: TEdit, against: TEdit, side: 'left' | 'right'): TEdit;
    isNoop?(op: TEdit): boolean;
    invert?(op: TEdit): TEdit;
    makeInvertible?(op: TEdit, doc: TSnapshot): TEdit;
}

export function registerJSON1Subtype<TSnapshot, TEdit>(subtype: IJSON1Subtype<TSnapshot, TEdit>): void {
    registerSubtype(subtype);
}

export function editJSON1Subtype(path: JSONXPath, name: string, edit: unknown): JSONXActions {
    return editOp(path, name, edit);
}

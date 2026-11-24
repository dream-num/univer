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

/** A JSON snapshot. JSON `null` is a stored value. Removing the root produces `undefined`. */
export type JSON1Document = null | boolean | number | string | JSON1Document[] | { [key: string]: JSON1Document };
/** A path from the root. Strings select object properties, numbers select array indices, and `[]` selects the root. */
export type JSONXPath = Array<string | number>;

/**
 * Fields applied at one path. A replacement combines `r` and `i`. A move pairs a `p` at its source
 * with a `d` at its destination. An embedded edit acts on the value left at this path after drops.
 */
export interface IJSON1Component {
    /** Value to insert at this path. */
    i?: unknown;
    /** Value to remove, or `true` for a compact removal. Direct inversion uses this field as the value to restore. */
    r?: unknown;
    /** Pick the value into this operation-local move slot before insertions take place. */
    p?: number;
    /** Drop the value picked into the matching slot at this path. */
    d?: number;
    /** Unicode string edit. Numbers retain code points, strings insert text, and `{ d }` deletes text. */
    es?: Array<number | string | { d: number | string }>;
    /** Signed amount to add to the number at this path. */
    ena?: number;
    /** Payload interpreted by the subtype named in `et`. */
    e?: unknown;
    /** Registered name or URI of the subtype that owns `e` (for example, `text-x`). */
    et?: string;
}

type OperationList = Array<string | number | IJSON1Component | OperationList>;

/**
 * The JSON1 wire tree used by stored history and collaboration clients. Consecutive path segments
 * share a branch. Nested arrays describe siblings in key order. `null` represents an empty operation.
 *
 * @example
 * ```ts
 * const rename: JSONXActions = ['rows', 0, 'name', { r: 'old', i: 'new' }];
 * ```
 */
export type JSONXActions = OperationList | null;

/** A view of the components in one encoded operation, initially positioned at the root. */
interface IJSON1ReadCursor {
    /** Return a copy of the current path that can be retained after traversal advances. */
    getPath(): JSONXPath;
    /** Return the original component at this path, or `null` at a path that only leads to children. */
    getComponent(): IJSON1Component | null;
    /** Visit components depth first. Inside the callback, `getPath()` identifies the component being visited. */
    traverse(writer: null, visit: (component: IJSON1Component) => void): void;
}

/** Build one operation by writing fields relative to the current path. Siblings are written in JSON1 key order. */
export interface IJSON1WriteCursor {
    /** Allow the next write to revisit an earlier sibling. The current path and accumulated fields are preserved. */
    reset(): void;
    /** Move to a child. The path is materialized when a component is written. */
    descend(key: string | number): void;
    /** Descend through a relative path. An invalid segment restores the position held before the call. */
    descendPath(path: JSONXPath): this;
    /** Move up one segment. Ascending above the root throws. */
    ascend(): void;
    /** Set one wire field at the current path. Repeated writes to an existing non-null field must agree. */
    write<K extends keyof IJSON1Component>(key: K, value: IJSON1Component[K]): void;
    /** Write one field at a relative path and return to the starting position, ready to visit any sibling. */
    writeAtPath<K extends keyof IJSON1Component>(path: JSONXPath, key: K, value: IJSON1Component[K]): this;
    /**
     * Pair a pick and drop at paths relative to this cursor.
     *
     * @param from - Path to the value in the source snapshot.
     * @param to - Destination path in the result snapshot.
     * @param slot - Defaults to zero. Use distinct slots numbered from zero for multiple moves in one operation.
     */
    writeMove(from: JSONXPath, to: JSONXPath, slot?: number): this;
    /** Run a callback at a relative path and return to the starting position when the callback returns normally. */
    at(path: JSONXPath, visit: (writer: IJSON1WriteCursor) => void): this;
    /** Merge fields from another operation relative to the current path. Unrelated moves must use distinct slots. */
    mergeTree(op: JSONXActions): void;
    /** Return `null` for an empty writer, or its live operation tree. Later writes can change a previously returned tree. */
    get(): JSONXActions;
}

/** Rebase `op` to run after `against`. Both start at the same revision. Use opposite sides for the two peers. */
type Transform = (op: JSONXActions, against: JSONXActions, side: 'left' | 'right') => JSONXActions;

/** A structural conflict and the portions of each input operation involved in it. Conflict policies inspect these fields. */
export interface IJSON1Conflict {
    /** Conflict kind, such as `JSON1.DROP_COLLISION` or `JSON1.RM_UNEXPECTED_CONTENT`. */
    type: number;
    /** Conflicting portion of the operation being rebased. */
    op1: JSONXActions;
    /** Conflicting portion of the concurrent operation. */
    op2: JSONXActions;
}

/** Operations that build, replay, invert and rebase JSON1 changesets. */
interface IJSON1Operations {
    /** Build an insertion. An object property must be vacant when applied. An array insertion shifts later items. */
    insertOp(path: JSONXPath, value: JSON1Document): JSONXActions;
    /** Build a deletion. Supply the original value for direct inversion or omit it and use `invertWithDoc` for undo. */
    removeOp(path: JSONXPath, value?: JSON1Document): JSONXActions;
    /** Replace the value at `path` with `next`. Supply its original value as `previous` so direct inversion can restore it. */
    replaceOp(path: JSONXPath, previous: JSON1Document, next: JSON1Document): JSONXActions;
    /** Move a value from its path in the source snapshot to its path in the result snapshot. */
    moveOp(from: JSONXPath, to: JSONXPath): JSONXActions;
    /** Open a cursor on the supplied wire tree. Its components are shared with `op`. */
    readCursor(op: JSONXActions): IJSON1ReadCursor;
    /** Create an empty writer positioned at the root. */
    writeCursor(): IJSON1WriteCursor;
    /**
     * Check the wire structure, including sibling order and paired move slots. Applying the operation also checks its target snapshot.
     *
     * @throws When the wire structure is invalid or a registered subtype rejects the edit during validation.
     */
    checkValidOp(op: JSONXActions): void;
    /** Return whether `op` is the empty operation (`null`). */
    isNoop(op: JSONXActions): boolean;
    /**
     * Replay an operation against its source revision.
     *
     * @param snapshot - Source snapshot, or `undefined` when the root is absent.
     * @param op - Changeset to apply. `null` returns the input snapshot.
     * @returns The resulting snapshot, or `undefined` when the operation removes the root.
     */
    apply(snapshot: JSON1Document | undefined, op: JSONXActions): JSON1Document | undefined;
    /**
     * Combine two sequential operations. The second is authored against the result of the first.
     * Applying the result to the original snapshot replays both changes in order.
     */
    compose(first: JSONXActions, second: JSONXActions): JSONXActions;
    /**
     * Build undo from recorded removal values and invertible subtype edits. A compact `{ r: true }`
     * would restore the literal value `true`. Use `invertWithDoc` if the removed value was omitted.
     */
    invert(op: JSONXActions): JSONXActions;
    /**
     * Capture removed values and subtype undo data from `before`, the snapshot immediately before `op`.
     * The returned operation still performs the forward edit and can be passed to `invert`.
     */
    makeInvertible(op: JSONXActions, before: JSON1Document): JSONXActions;
    /**
     * Build undo using the snapshot immediately before `op` was applied.
     *
     * @example
     * ```ts
     * const before = { title: 'Draft' };
     * const remove = JSON1.removeOp(['title']);
     * const undo = JSON1.invertWithDoc(remove, before);
     * const restored = JSON1.apply(JSON1.apply(before, remove), undo); // { title: 'Draft' }
     * ```
     */
    invertWithDoc(op: JSONXActions, before: JSON1Document): JSONXActions;
    /**
     * Rebase an operation from the common revision onto its peer. A concurrent insertion at the same array index
     * places the `left` insertion first. Use the opposite side when rebasing the peer in the other direction.
     *
     * @throws A `writeConflict` error with a `conflict` field when the inputs have a structural conflict.
     * @example
     * ```ts
     * const a = JSON1.insertOp([0], 'A');
     * const b = JSON1.insertOp([0], 'B');
     * const afterB = JSON1.transform(a, b, 'left');
     * const afterA = JSON1.transform(b, a, 'right');
     * JSON1.apply(JSON1.apply([], b), afterB); // ['A', 'B']
     * JSON1.apply(JSON1.apply([], a), afterA); // ['A', 'B']
     * ```
     */
    transform: Transform;
    /** Map a source path to its location after `op`, following moves and index shifts. Returns `null` if the value was removed. */
    transformPosition(path: JSONXPath, op: JSONXActions): JSONXPath | null;
    /** Rebase using the built-in resolution for every JSON1 structural conflict. Invalid inputs can still throw. */
    transformNoConflict: Transform;
    /**
     * Create a rebase function with a conflict policy. Returning `true` applies the built-in resolution for that conflict.
     * Returning `false` propagates the `writeConflict` error. The policy may be called again for the same pair of operations.
     */
    createTransform(allowConflict: (conflict: IJSON1Conflict) => boolean): Transform;
    /** A removal conflicts with content that the other operation inserted, moved in, or edited. */
    readonly RM_UNEXPECTED_CONTENT: number;
    /** Both operations try to place competing values at the same destination. */
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

/**
 * Rules for an embedded edit. Each client replaying or rebasing the edit must register the corresponding subtype.
 *
 * @template TSnapshot - Value stored at the edited document path.
 * @template TEdit - Payload exchanged between clients for this subtype.
 */
export interface IJSON1Subtype<TSnapshot, TEdit> {
    /** Name used to identify this subtype in an operation. */
    name: string;
    /** Optional additional identifier under which the engine registers this subtype. */
    uri?: string;
    /** Apply an embedded edit to the value at its target path. */
    apply(doc: TSnapshot, op: TEdit): TSnapshot;
    /** Combine consecutive embedded edits in their application order. */
    compose(first: TEdit, second: TEdit): TEdit;
    /** Rebase the embedded edit onto a concurrent edit of the same subtype using the supplied side. */
    transform(op: TEdit, against: TEdit, side: 'left' | 'right'): TEdit;
    /** Identify payloads that may be omitted when building an operation. */
    isNoop?(op: TEdit): boolean;
    /** Invert an embedded edit containing the data needed to undo it. */
    invert?(op: TEdit): TEdit;
    /** Fill in undo data using the value at the target path immediately before the embedded edit. */
    makeInvertible?(op: TEdit, doc: TSnapshot): TEdit;
}

/** Register the subtype by name and optional URI so the document adapter can encode and replay its edits. */
export function registerJSON1Subtype<TSnapshot, TEdit>(subtype: IJSON1Subtype<TSnapshot, TEdit>): void {
    registerSubtype(subtype);
}

/** Build an edit for a registered subtype at `path`. Returns `null` if the subtype identifies the edit as empty. */
export function editJSON1Subtype(path: JSONXPath, name: string, edit: unknown): JSONXActions {
    return editOp(path, name, edit);
}

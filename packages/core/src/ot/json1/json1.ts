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

import { editOp, type as engine, insertOp, moveOp, replaceOp } from 'ot-json1';

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

interface IJSON1Conflict {
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
    removeOp: (path, value = true) => engine.writeCursor().writeAtPath(path, 'r', value).get(),
    replaceOp,
    moveOp,
    readCursor: engine.readCursor,
    writeCursor: engine.writeCursor,
    checkValidOp: engine.checkValidOp,
    isNoop: engine.isNoop,
    apply: engine.apply,
    compose: engine.compose,
    invert: engine.invert,
    makeInvertible: engine.makeInvertible,
    invertWithDoc: engine.invertWithDoc,
    transform: (op, against, side) => engine.transform(op, against, side) ?? null,
    transformPosition: engine.transformPosition,
    transformNoConflict: engine.transformNoConflict,
    createTransform: (allowConflict) => engine.typeAllowingConflictsPred(allowConflict).transform,
    RM_UNEXPECTED_CONTENT: engine.RM_UNEXPECTED_CONTENT,
    DROP_COLLISION: engine.DROP_COLLISION,
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
    engine.registerSubtype(subtype);
}

export function editJSON1Subtype(path: JSONXPath, name: string, edit: unknown): JSONXActions {
    return editOp(path, name, edit);
}

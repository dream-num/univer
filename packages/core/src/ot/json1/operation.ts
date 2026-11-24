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

import type { IJSON1Component, IJSON1Subtype, JSON1Document, JSONXActions, JSONXPath } from './json1';
import { JSON1WriteCursor } from './cursor';
import { unicodeText } from './unicode-text';

type Key = JSONXPath[number];
type Subtype = IJSON1Subtype<unknown, unknown> & { checkValidOp?(op: unknown): void };
const types = new Map<string, Subtype>();

/** Copy the JSON snapshot before calling a subtype that can mutate its input while preparing undo. */
export function cloneDocument(value: JSON1Document): JSON1Document {
    const visited = new WeakMap<object, JSON1Document>();
    function copy(node: JSON1Document): JSON1Document {
        if (node === null || typeof node !== 'object') {
            return node;
        }
        const existing = visited.get(node);
        if (existing !== undefined) {
            return existing;
        }
        // Spread creates own data properties, including JSON keys such as "__proto__".
        const result = Array.isArray(node) ? node.slice() : { ...node };
        visited.set(node, result);
        const fields = result as Record<string, JSON1Document>;
        for (const key of Object.keys(fields)) {
            fields[key] = copy(fields[key]);
        }
        return result;
    }
    return copy(value);
}

/** Each registered edit supplies its own replay, composition and concurrent editing rules. */
export function registerSubtype(subtype: Subtype) {
    types.set(subtype.name, subtype);
    if (subtype.uri) {
        types.set(subtype.uri, subtype);
    }
}

/** Numeric deltas can be inverted without replaying the snapshot. */
export const numberSubtype: IJSON1Subtype<number, number> = {
    name: 'number',
    apply: (doc: number, op: number) => doc + op,
    compose: (a: number, b: number) => a + b,
    transform: (op: number) => op,
    invert: (op: number) => -op,
};

registerSubtype(unicodeText);
registerSubtype(numberSubtype);

export interface IEdit {
    type: Subtype;
    payload: unknown;
}

/** Read the edit at a path, including the compact representations for text and number edits. */
export function getEdit(c: IJSON1Component): IEdit | undefined {
    let name = c.et;
    let payload = c.e;
    if (c.es !== undefined) {
        name = 'text-unicode';
        payload = c.es;
    } else if (c.ena !== undefined) {
        name = 'number';
        payload = c.ena;
    }
    if (name === undefined) {
        return;
    }
    const type = types.get(name);
    if (!type) {
        throw new Error(`Unknown edit type ${name}`);
    }
    return { type, payload };
}

export function editComponent({ type, payload }: IEdit): IJSON1Component {
    if (type.isNoop?.(payload)) {
        return {};
    }
    if (type === unicodeText) {
        return { es: payload as IJSON1Component['es'] };
    }
    if (type.name === 'number') {
        return { ena: payload as number };
    }
    return { et: type.name, e: payload };
}

export function editOp(path: JSONXPath, name: string, edit: unknown): JSONXActions {
    const writer = new JSON1WriteCursor();
    const component = editComponent(getEdit({ et: name, e: edit })!);
    writer.at(path, (w) => w.mergeTree([component]));
    return writer.get();
}

export interface IEntry {
    path: JSONXPath;
    component: IJSON1Component;
}

/** Order paths in the same numeric and property order as the changeset writer. */
export function comparePath(a: JSONXPath, b: JSONXPath) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) {
            continue;
        }
        if (typeof a[i] !== typeof b[i]) {
            return typeof a[i] === 'number' ? -1 : 1;
        }
        return a[i] < b[i] ? -1 : 1;
    }
    return a.length - b.length;
}

/** Keep structural fields when a subtype omits its own empty edit during composition or rebase. */
export function effectiveComponent(component: IJSON1Component): IJSON1Component | undefined {
    const edit = (component.et !== undefined || component.es !== undefined) && getEdit(component);
    if (!edit || !edit.type.isNoop?.(edit.payload)) {
        return component;
    }
    const { e, es, et, ...structure } = component;
    return Object.keys(structure).length ? structure : undefined;
}

/** Pack fields from source and result coordinates into the ordered branches of a changeset. */
export function encode(changes: IEntry[]): JSONXActions {
    let count = 0;
    for (const entry of changes) {
        const component = effectiveComponent(entry.component);
        if (component) {
            changes[count++] = component === entry.component ? entry : { path: entry.path, component };
        }
    }
    if (!count) {
        return null;
    }
    if (count === 1) {
        return [...changes[0].path, changes[0].component];
    }
    changes.length = count;
    changes.sort((a, b) => comparePath(a.path, b.path));

    function branch(start: number, end: number, depth: number): NonNullable<JSONXActions> {
        const tree: NonNullable<JSONXActions> = [];
        while (start < end) {
            const first = changes[start];
            if (first.path.length === depth) {
                let part = first.component;
                start++;
                while (start < end && changes[start].path.length === depth) {
                    part = { ...part, ...changes[start++].component };
                }
                tree.push(part);
            } else if (first.path[depth] === changes[end - 1].path[depth]) {
                tree.push(first.path[depth++]);
            } else {
                while (start < end) {
                    const key = changes[start].path[depth];
                    let next = start + 1;
                    while (next < end && changes[next].path[depth] === key) {
                        next++;
                    }
                    tree.push([key, ...branch(start, next, depth + 1)]);
                    start = next;
                }
            }
        }
        return tree;
    }
    return branch(0, changes.length, 0);
}

/** A prefix names either the same JSON node or one of its ancestors. */
export function hasPrefix(path: JSONXPath, prefix: JSONXPath): boolean {
    return path.length >= prefix.length && prefix.every((key, i) => path[i] === key);
}

/** Replacing independent leaves preserves all other addresses in both revisions. */
export function independentReplacements(changes: IEntry[]): boolean {
    return changes.length > 0 && changes.every(({ component, path }, i) =>
        component.i !== undefined && component.r !== undefined && !getEdit(component)
        && (i === 0 || !hasPrefix(path, changes[i - 1].path)));
}

/** A lone embedded edit runs entirely within its registered subtype. */
export function singleEdit(changes: IEntry[]): IEdit | undefined {
    if (changes.length === 1) {
        const c = changes[0].component;
        if (c.i === undefined && c.r === undefined && c.p === undefined && c.d === undefined) {
            return getEdit(c);
        }
    }
}

/** Encode an embedded result at the same address, omitting a subtype no-op. */
export function atEdit(path: JSONXPath, type: Subtype, payload: unknown): JSONXActions {
    const component = editComponent({ type, payload });
    return Object.keys(component).length ? [...path, component] : null;
}

/** Edits below separate siblings cannot affect each other's addresses or content. */
export function independentBranches(first: IEntry[], second: IEntry[]): boolean {
    if (first.length !== 1 || second.length !== 1) {
        return false;
    }
    const a = first[0];
    const b = second[0];
    if (a.component.p !== undefined || b.component.p !== undefined) {
        return false;
    }
    const depth = Math.min(a.path.length, b.path.length);
    for (let i = 0; i < depth; i++) {
        if (a.path[i] !== b.path[i]) {
            return (typeof a.path[i] === 'string' && typeof b.path[i] === 'string') || i + 1 < depth;
        }
    }
    return false;
}

function validKey(key: unknown): key is Key {
    return typeof key === 'string' ? key !== '__proto__' : Number.isSafeInteger(key) && Number(key) >= 0;
}

function precedes(a: Key, b: Key) {
    return typeof a === typeof b ? a < b : typeof a === 'number';
}

function requireValid(condition: unknown): asserts condition {
    if (!condition) {
        throw new Error('Invalid document operation');
    }
}

const componentFields = new Set(['i', 'r', 'd', 'p', 'et', 'e', 'es', 'ena']);

function validateSlot(slot: number, flag: number, moves: Map<number, number>) {
    const flags = moves.get(slot) ?? 0;
    requireValid(Number.isSafeInteger(slot) && slot >= 0 && !(flags & flag));
    moves.set(slot, flags | flag);
}

function validateComponent(c: IJSON1Component, moves?: Map<number, number>): Map<number, number> | undefined {
    requireValid(Object.keys(c).every((k) => componentFields.has(k)));
    requireValid(!(c.p !== undefined && c.r !== undefined) && !(c.d !== undefined && c.i !== undefined));
    if (c.p !== undefined) {
        validateSlot(c.p, 1, moves ??= new Map());
    }
    if (c.d !== undefined) {
        validateSlot(c.d, 2, moves ??= new Map());
    }
    requireValid((c.e === undefined) === (c.et === undefined));
    requireValid(c.es === undefined || (c.ena === undefined && c.et === undefined));
    requireValid(c.ena === undefined || c.et === undefined);
    requireValid(c.ena === undefined || Number.isFinite(c.ena));
    const edit = getEdit(c);
    edit?.type.checkValidOp?.(edit.payload);
    requireValid(edit || c.p !== undefined || c.d !== undefined || c.i !== undefined || c.r !== undefined);
    return moves;
}

/** Decode a persisted changeset, checking branch order and move pairing before any writes. */
export function entries(op: JSONXActions): IEntry[] {
    const result: IEntry[] = [];
    let moves: Map<number, number> | undefined;
    function visit(list: NonNullable<JSONXActions>, path: JSONXPath) {
        requireValid(Array.isArray(list) && list.length);
        const depth = path.length;
        let hasComponent = false;
        let branches = 0;
        let previous: Key | undefined;
        for (const item of list) {
            if (Array.isArray(item)) {
                const key = item[0];
                requireValid(validKey(key) && (previous === undefined || precedes(previous, key)));
                visit(item, path);
                previous = key;
                branches++;
            } else if (validKey(item)) {
                requireValid(!branches);
                path.push(item);
                hasComponent = false;
            } else {
                requireValid(item && typeof item === 'object' && !hasComponent && !branches);
                moves = validateComponent(item, moves);
                result.push({ path: path.slice(), component: item });
                hasComponent = true;
            }
        }
        requireValid((hasComponent || branches > 0) && branches !== 1);
        path.length = depth;
    }
    if (op !== null) {
        visit(op, []);
    }
    if (moves) {
        for (let i = 0; i < moves.size; i++) {
            requireValid(moves.get(i) === 3);
        }
    }
    return result;
}

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

import type { IJSON1Component, IJSON1Subtype, JSONXActions, JSONXPath } from './json1';
import { JSON1WriteCursor } from './cursor';
import { unicodeText } from './unicode-text';

type Key = JSONXPath[number];
type Subtype = IJSON1Subtype<unknown, unknown> & { checkValidOp?(op: unknown): void };
const types = new Map<string, Subtype>();

/** Each registered edit supplies its own replay, composition and concurrent editing rules. */
export function registerSubtype(subtype: Subtype) {
    types.set(subtype.name, subtype);
    if (subtype.uri) {
        types.set(subtype.uri, subtype);
    }
}

registerSubtype(unicodeText);
registerSubtype({
    name: 'number',
    apply: (doc: number, op: number) => doc + op,
    compose: (a: number, b: number) => a + b,
    transform: (op: number) => op,
    invert: (op: number) => -op,
    isNoop: (op: number) => op === 0,
} as IJSON1Subtype<number, number>);

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

function validateComponent(c: IJSON1Component, picks: Set<number>, drops: Set<number>) {
    requireValid(Object.keys(c).every((k) => ['i', 'r', 'd', 'p', 'et', 'e', 'es', 'ena'].includes(k)));
    requireValid(!(c.p !== undefined && c.r !== undefined) && !(c.d !== undefined && c.i !== undefined));
    for (const [slot, set] of [[c.p, picks], [c.d, drops]] as const) {
        if (slot !== undefined) {
            requireValid(Number.isSafeInteger(slot) && slot >= 0 && !set.has(slot));
            set.add(slot);
        }
    }
    requireValid((c.e === undefined) === (c.et === undefined) && [c.es, c.ena, c.et].filter((v) => v !== undefined).length <= 1);
    requireValid(c.ena === undefined || Number.isFinite(c.ena));
    const edit = getEdit(c);
    edit?.type.checkValidOp?.(edit.payload);
    requireValid(edit || c.p !== undefined || c.d !== undefined || c.i !== undefined || c.r !== undefined);
}

/** Decode a persisted changeset, checking branch order and move pairing before any writes. */
export function entries(op: JSONXActions): IEntry[] {
    const result: IEntry[] = [];
    const picks = new Set<number>();
    const drops = new Set<number>();
    function visit(list: NonNullable<JSONXActions>, path: JSONXPath) {
        requireValid(Array.isArray(list) && list.length);
        let hasComponent = false;
        let branches = 0;
        let previous: Key | undefined;
        for (const item of list) {
            if (Array.isArray(item)) {
                const key = item[0];
                requireValid(validKey(key) && (previous === undefined || precedes(previous, key)));
                visit(item, path.slice());
                previous = key;
                branches++;
            } else if (validKey(item)) {
                requireValid(!branches);
                path.push(item);
                hasComponent = false;
            } else {
                requireValid(item && typeof item === 'object' && !hasComponent && !branches);
                validateComponent(item, picks, drops);
                result.push({ path: path.slice(), component: item });
                hasComponent = true;
            }
        }
        requireValid((hasComponent || branches > 0) && branches !== 1);
    }
    if (op !== null) {
        visit(op, []);
    }
    requireValid(picks.size === drops.size);
    for (let i = 0; i < picks.size; i++) {
        requireValid(picks.has(i) && drops.has(i));
    }
    return result;
}

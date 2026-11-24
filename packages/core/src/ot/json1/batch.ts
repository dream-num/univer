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

import type { JSONXActions, JSONXPath } from './json1';
import type { IEntry } from './operation';
import { comparePath, editComponent, encode, getEdit, hasPrefix } from './operation';

interface IAddress {
    scope: JSONXPath;
    entry: IEntry;
}

/** A structural change to an array element can shift any sibling address under the same array. */
export function independentAddresses(changes: IEntry[]): IAddress[] | undefined {
    let hasArrayChange = false;
    const addresses = changes.map((entry) => {
        const { path, component } = entry;
        if (typeof path[path.length - 1] === 'number' && (component.d !== undefined || component.p !== undefined
            || component.r !== undefined || component.i !== undefined)) {
            hasArrayChange = true;
            return { entry, scope: path.slice(0, -1) };
        }
        return { entry, scope: path };
    });
    if (hasArrayChange) {
        addresses.sort((a, b) => comparePath(a.scope, b.scope));
    }
    for (let i = 1; i < addresses.length; i++) {
        if (hasPrefix(addresses[i].scope, addresses[i - 1].scope)) {
            return;
        }
    }
    return addresses;
}

/**
 * Combine batches directly when their structural changes are independent. Coincident embedded edits
 * use the subtype's rules. Overlapping structural addresses need the identity-based merge.
 */
export function combineIndependent(a: IEntry[], b: IEntry[], side?: 'left' | 'right'): JSONXActions | undefined {
    if (!side && a.some(({ component }) => component.p !== undefined) && b.some(({ component }) => component.p !== undefined)) {
        return;
    }
    const first = independentAddresses(a);
    const second = independentAddresses(b);
    if (!first || !second) {
        return;
    }
    const remapped = new Map<IEntry, JSONXPath>();
    const pairs = new Map<IEntry, IEntry>();
    const consumed = new Set<IEntry>();
    let i = 0;
    let j = 0;
    while (i < first.length && j < second.length) {
        const x = first[i];
        const y = second[j];
        const order = comparePath(x.scope, y.scope);
        if (order === 0) {
            const left = x.entry.component;
            const right = y.entry.component;
            const firstIndex = x.entry.path[x.scope.length];
            const secondIndex = y.entry.path[y.scope.length];
            if (typeof firstIndex === 'number' && typeof secondIndex === 'number'
                && Object.keys(left).length === 1 && Object.keys(right).length === 1
                && ((left.i !== undefined && (right.p !== undefined || right.r !== undefined))
                    || (right.i !== undefined && (left.p !== undefined || left.r !== undefined)))) {
                // Picks use source indices and inserts use result gaps. Sequential edits must
                // project both into those coordinates. A concurrent edit projects only its own.
                if (left.i !== undefined) {
                    if (!side && firstIndex === secondIndex) {
                        return;
                    }
                    if (secondIndex < firstIndex) {
                        remapped.set(x.entry, [...x.scope, firstIndex - 1]);
                    } else if (!side) {
                        remapped.set(y.entry, [...y.scope, secondIndex - 1]);
                    }
                } else if (side && secondIndex <= firstIndex) {
                    remapped.set(x.entry, [...x.scope, firstIndex + 1]);
                }
                i++;
                j++;
                continue;
            }
            if (left.p !== undefined || left.r !== undefined || left.d !== undefined || left.i !== undefined
                || right.p !== undefined || right.r !== undefined || right.d !== undefined || right.i !== undefined
                || getEdit(left)!.type !== getEdit(right)!.type) {
                return;
            }
            pairs.set(x.entry, y.entry);
            consumed.add(y.entry);
            i++;
            j++;
        } else if (order < 0) {
            if (hasPrefix(y.scope, x.scope)) {
                return;
            }
            i++;
        } else {
            if (hasPrefix(x.scope, y.scope)) {
                return;
            }
            j++;
        }
    }
    const changes: IEntry[] = [];
    for (const entry of a) {
        let component = side && entry.component.r !== undefined ? { ...entry.component, r: true } : entry.component;
        const paired = pairs.get(entry);
        if (paired) {
            const edit = getEdit(component)!;
            const other = getEdit(paired.component)!;
            const payload = side ? edit.type.transform(edit.payload, other.payload, side) : edit.type.compose(edit.payload, other.payload);
            component = editComponent({ type: edit.type, payload });
        }
        if (!paired || Object.keys(component).length) {
            changes.push({ path: remapped.get(entry) ?? entry.path, component });
        }
    }
    if (!side) {
        for (const entry of b) {
            if (!consumed.has(entry)) {
                changes.push({ path: remapped.get(entry) ?? entry.path, component: entry.component });
            }
        }
    }
    return encode(changes);
}

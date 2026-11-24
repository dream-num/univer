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
import { JSON1WriteCursor } from './cursor';
import { getEdit, hasPrefix } from './operation';

export interface IMove {
    from: JSONXPath;
    to: JSONXPath;
    cutParent: JSONXPath;
    insertParent: JSONXPath;
}

/** Read one unaccompanied move between distinct branches from a validated changeset. */
export function singleMove(changes: IEntry[]): IMove | undefined {
    if (changes.length !== 2) {
        return;
    }
    const pick = changes[0].component.p === 0 ? changes[0] : changes[1];
    const drop = changes[0] === pick ? changes[1] : changes[0];
    if (pick.component.p !== 0 || drop.component.d !== 0 || pick.component.d !== undefined || drop.component.p !== undefined
        || changes.some(({ component }) => component.i !== undefined || component.r !== undefined || getEdit(component))) {
        return;
    }
    const from = pick.path;
    const to = drop.path;
    if (!hasPrefix(from, to) && !hasPrefix(to, from)) {
        return { from, to, cutParent: from.slice(0, -1), insertParent: to.slice(0, -1) };
    }
}

/** Map an address through the cut and insertion. Descendants of the moved value travel with it. */
export function followMove(path: JSONXPath, move: IMove): JSONXPath | null {
    const { from, to, cutParent, insertParent } = move;
    if (hasPrefix(path, from)) {
        return to.concat(path.slice(from.length));
    }
    const mapped = path.slice();
    const cut = from[cutParent.length];
    const sourceKey = mapped[cutParent.length];
    if (typeof cut === 'number' && typeof sourceKey === 'number' && sourceKey > cut && hasPrefix(mapped, cutParent)) {
        mapped[cutParent.length] = sourceKey - 1;
    }
    const insert = to[insertParent.length];
    const key = mapped[insertParent.length];
    if (hasPrefix(mapped, insertParent)) {
        if (typeof insert === 'number' && typeof key === 'number' && key >= insert) {
            mapped[insertParent.length] = key + 1;
        } else if (key === insert) {
            return null;
        }
    }
    return mapped;
}

/** Two reorders separated by an untouched array element have independent source and result indices. */
export function separateReorders(a: IMove, b: IMove): boolean {
    const parent = a.cutParent;
    const depth = parent.length;
    if (![a.insertParent, b.cutParent, b.insertParent].every((path) => path.length === depth && hasPrefix(path, parent))) {
        return false;
    }
    const af = a.from[depth];
    const at = a.to[depth];
    const bf = b.from[depth];
    const bt = b.to[depth];
    return typeof af === 'number' && typeof at === 'number' && typeof bf === 'number' && typeof bt === 'number'
        && (Math.max(af, at) + 1 < Math.min(bf, bt) || Math.max(bf, bt) + 1 < Math.min(af, at));
}

/** Map two reorders in the same array by comparing insertion gaps in their common source. */
export function rebaseReorders(a: IMove, b: IMove, side: 'left' | 'right'): JSONXActions | undefined {
    const parent = a.cutParent;
    const depth = parent.length;
    if (![a.insertParent, b.cutParent, b.insertParent].every((path) => path.length === depth && hasPrefix(path, parent))) {
        return;
    }
    const from = a.from[depth];
    const to = a.to[depth];
    const peerFrom = b.from[depth];
    const peerTo = b.to[depth];
    if (typeof from !== 'number' || typeof to !== 'number' || typeof peerFrom !== 'number' || typeof peerTo !== 'number') {
        return;
    }
    if (from === peerFrom) {
        return side === 'right' ? null : new JSON1WriteCursor().writeMove(b.to, a.to).get();
    }
    const gap = to + Number(to >= from);
    const peerGap = peerTo + Number(peerTo >= peerFrom);
    const afterCut = to - Number(peerFrom < gap);
    const peerAfterCut = peerTo - Number(from < peerGap);
    const peerFirst = peerAfterCut < afterCut
        || (peerAfterCut === afterCut && (peerGap < gap || (peerGap === gap && side === 'right')));
    const source = from - Number(peerFrom < from);
    return new JSON1WriteCursor().writeMove(
        [...parent, source + Number(peerTo <= source)],
        [...parent, afterCut + Number(peerFirst)]
    ).get();
}

/** Swap source and destination markers in the existing branch order of a single move. */
export function reverseMove(op: NonNullable<JSONXActions>): JSONXActions {
    return op.map((item) => {
        if (Array.isArray(item)) {
            return reverseMove(item)!;
        }
        if (typeof item === 'object') {
            return item.p === undefined ? { p: 0 } : { d: 0 };
        }
        return item;
    });
}

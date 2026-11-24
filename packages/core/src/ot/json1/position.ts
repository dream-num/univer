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

// Adapted from ot-json1 1.0.2 (Joseph Gentle). See THIRD_PARTY_NOTICES.txt.

import type { JSONXActions, JSONXPath } from './json1';
import { JSON1ReadCursor } from './cursor';
import { advancer } from './navigation';
import { checkValidOp, getEdit, getEditType } from './operation';
import { getComponent, hasDrop, hasPick } from './snapshot';

/**
 * Follow a source path through removals, moves and insertions. When the path enters an edited subtype,
 * delegate the next position to that subtype if it implements position mapping.
 *
 * @param path - Path in the source snapshot. The caller retains its original array.
 * @param op - Operation taking the source snapshot to the result snapshot.
 * @returns The mapped path, or `null` when the tracked value was removed.
 */
export function transformPosition(path: JSONXPath, op: JSONXActions): JSONXPath | null {
    path = path.slice();
    checkValidOp(op);
    const r = new JSON1ReadCursor(op);
    let removed = false;
    let pickedAtSlot: number;
    let pickIndex: number;
    const advStack = [];
    for (let i = 0; ; i++) {
        const k = path[i];
        const c = r.getComponent();
        if (c) {
            if (c.r !== undefined) {
                removed = true;
            } else if (c.p != null) {
                removed = false;
                pickedAtSlot = c.p;
                pickIndex = i;
            }
        }
        if (i >= path.length) {
            break;
        }
        let pickOffset = 0;
        const pickAdv = advancer(r, undefined, (k, c) => {
            if (hasPick(c)) {
                pickOffset++;
            }
        });
        advStack.unshift(pickAdv);
        const hasNext = pickAdv(k);
        if (typeof k === 'number') {
            (path[i] as number) -= pickOffset;
        }
        if (!hasNext) {
            break;
        }
    }
    advStack.forEach((pickAdv) => pickAdv.end());
    if (removed) {
        return null;
    }
    const handleDrop = () => {
        let i = 0;
        if (pickedAtSlot != null) {
            const rPath = r.getPath();
            i = rPath.length;
            path = rPath.concat(path.slice(pickIndex));
        }
        for (; i < path.length; i++) {
            const k = path[i];
            const c = getComponent(r);
            const et = getEditType(c);
            if (et) {
                const e = getEdit(c!);
                if (et.transformPosition) {
                    path[i] = et.transformPosition(path[i], e);
                }
                break;
            }
            let dropOffset = 0;
            const dropAdv = advancer(
                r,
                (k, c) => (hasDrop(c) ? ~(k - dropOffset) : k - dropOffset),
                (k, c) => {
                    if (hasDrop(c)) {
                        dropOffset++;
                    }
                }
            );
            const hasNext = dropAdv(k);
            if (typeof k === 'number') {
                (path[i] as number) += dropOffset;
            }
            if (!hasNext) {
                break;
            }
        }
    };
    if (pickedAtSlot! != null) {
        r.eachDrop(null, (slot) => {
            if (slot === pickedAtSlot) {
                handleDrop();
            }
        });
    } else {
        handleDrop();
    }
    return path;
}

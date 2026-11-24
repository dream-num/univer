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

import type { IJSON1Component, JSON1Document, JSONXActions } from './json1';
import type { IJSONObject, Key, OperationList } from './snapshot';
import { checkValidOp, getEdit, getEditType } from './operation';
import {
    assert,
    hasPick,
    insertChildMut,
    isValidKey,
    maybeGetChild,
    removeChild,
    replaceChild,
    shallowClone,
} from './snapshot';

// Apply picks in reverse sibling order, then drops in forward order. Only paths changed by either pass are copied.
export function apply(snapshot: JSON1Document | undefined, op: JSONXActions) {
    checkValidOp(op);
    if (op === null) {
        return snapshot;
    }
    const held: JSON1Document[] = [];
    function pick(subDoc: JSON1Document | undefined, descent: OperationList) {
        const stack: (JSON1Document | undefined)[] = [];
        let i = 0;
        for (; i < descent.length; i++) {
            const d = descent[i];
            if (Array.isArray(d)) {
                break;
            }
            if (typeof d === 'object') {
                continue;
            }
            stack.push(subDoc);
            subDoc = maybeGetChild(subDoc, d);
        }
        for (let j = descent.length - 1; j >= i; j--) {
            subDoc = pick(subDoc, descent[j] as OperationList);
        }
        for (--i; i >= 0; i--) {
            const d = descent[i] as Key | IJSON1Component;
            if (typeof d !== 'object') {
                const container = stack.pop();
                const expectedChild = maybeGetChild(container, d);
                subDoc =
                    subDoc === expectedChild
                        ? container
                        : subDoc === undefined
                            ? removeChild(container as JSON1Document[] | IJSONObject, d)
                            : replaceChild(container as JSON1Document[] | IJSONObject, d, subDoc);
            } else if (hasPick(d)) {
                assert(subDoc !== undefined, 'Cannot pick up or remove undefined');
                if (d.p != null) {
                    held[d.p] = subDoc;
                }
                subDoc = undefined;
            }
        }
        return subDoc;
    }
    snapshot = pick(snapshot, op) as JSON1Document;
    function drop(root: JSON1Document, descent: OperationList) {
        let subDoc = root;
        let i = 0;
        const rootContainer: JSON1Document = { root };
        let m = 0;
        let container: JSON1Document = rootContainer;
        let key: Key = 'root';
        // Copy the parent path lazily on the first write to this branch.
        function mut() {
            for (; m < i; m++) {
                const d = descent[m];
                if (typeof d === 'object') {
                    continue;
                }
                assert(isValidKey(container, key));
                container = (container as IJSONObject)[key] = shallowClone((container as IJSONObject)[key]);
                key = d;
            }
        }
        for (; i < descent.length; i++) {
            const d = descent[i];
            if (Array.isArray(d)) {
                const child = drop(subDoc, d);
                if (child !== subDoc && child !== undefined) {
                    mut();
                    subDoc = container[key] = child;
                }
            } else if (typeof d === 'object') {
                if (d.d != null) {
                    mut();
                    subDoc = insertChildMut(container, key, held[d.d]);
                } else if (d.i !== undefined) {
                    mut();
                    subDoc = insertChildMut(container, key, d.i as JSON1Document);
                }
                const t = getEditType(d);
                if (t) {
                    mut();
                    subDoc = container[key] = t.apply(subDoc, getEdit(d)) as JSON1Document;
                } else if (d.e !== undefined) {
                    throw new Error(`Subtype ${d.et} undefined`);
                }
            } else {
                subDoc = maybeGetChild(subDoc, d) as JSON1Document;
            }
        }
        return rootContainer.root;
    }
    snapshot = drop(snapshot, op);
    return snapshot;
}

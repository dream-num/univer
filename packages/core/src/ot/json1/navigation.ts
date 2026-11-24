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

import type { JSON1ReadCursor } from './cursor';
import type { IJSON1Component } from './json1';
import type { Key } from './snapshot';
import { precedes } from './cursor';

// Advance through ordered siblings, optionally mapping array indices across picks or drops. Call end() to restore the parent.
export function advancer(
    r: JSON1ReadCursor | null,
    listMap?: (k: number, c: IJSON1Component | null) => number,
    listAdv?: (k: number, c: IJSON1Component | null) => void
) {
    const didDescend = r?.descendFirst() ?? false;
    let valid = didDescend;
    function advance(target: Key) {
        while (valid) {
            const key = r!.getKey();
            let mappedKey = key;
            if (target != null) {
                let skip = false;
                if (listMap && typeof key === 'number') {
                    mappedKey = listMap(key, r!.getComponent());
                    if (mappedKey < 0) {
                        // A complemented index occupies this position but cannot match the target.
                        mappedKey = ~mappedKey;
                        skip = true;
                    }
                }
                if (precedes(target, mappedKey)) {
                    return null;
                } else if (mappedKey === target && !skip) {
                    return r!;
                }
            }
            if (listAdv && typeof mappedKey === 'number') {
                listAdv(mappedKey, r!.getComponent());
            }
            valid = r!.nextSibling();
        }
        return null;
    }
    advance.end = () => {
        if (didDescend) {
            r!.ascend();
        }
    };
    return advance;
}

export function eachChildOf(
    r1: JSON1ReadCursor | null,
    r2: JSON1ReadCursor | null,
    fn: (k: Key, r1: JSON1ReadCursor | null, r2: JSON1ReadCursor | null) => void
) {
    const descended1 = r1?.descendFirst() ?? false;
    const descended2 = r2?.descendFirst() ?? false;
    let hasChild1 = descended1;
    let hasChild2 = descended2;
    while (hasChild1 || hasChild2) {
        let k1 = hasChild1 ? r1!.getKey() : null;
        let k2 = hasChild2 ? r2!.getKey() : null;
        if (k1 !== null && k2 !== null) {
            if (precedes(k1, k2)) {
                k2 = null;
            } else if (k1 !== k2) {
                k1 = null;
            }
        }
        fn(k1 == null ? k2! : k1, k1 != null ? r1 : null, k2 != null ? r2 : null);
        if (k1 != null && hasChild1) {
            hasChild1 = r1!.nextSibling();
        }
        if (k2 != null && hasChild2) {
            hasChild2 = r2!.nextSibling();
        }
    }
    if (descended1) {
        r1!.ascend();
    }
    if (descended2) {
        r2!.ascend();
    }
}

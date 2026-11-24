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

type TextSequence = string | readonly string[];
type TextEdit = [-1 | 0 | 1, string];

function sharedEdge(a: TextSequence, b: TextSequence, limit: number, fromEnd: boolean) {
    if (!limit || (fromEnd ? a[a.length - 1] !== b[b.length - 1] : a[0] !== b[0])) {
        return 0;
    }
    let matched = 0;
    if (typeof a === 'string' && typeof b === 'string') {
        // Native substring comparison avoids visiting a long unchanged selection one code unit at a time.
        let width = limit;
        while (width >= 32) {
            const x = fromEnd ? a.length - matched - width : matched;
            const y = fromEnd ? b.length - matched - width : matched;
            if (a.slice(x, x + width) === b.slice(y, y + width)) {
                matched += width;
            }
            width = Math.min(limit - matched, Math.floor(width / 2));
        }
    }
    if (fromEnd) {
        while (matched < limit && a[a.length - 1 - matched] === b[b.length - 1 - matched]) {
            matched++;
        }
    } else {
        while (matched < limit && a[matched] === b[matched]) {
            matched++;
        }
    }
    return matched;
}

function high(code: number) {
    return code >= 0xD800 && code <= 0xDBFF;
}

function low(code: number) {
    return code >= 0xDC00 && code <= 0xDFFF;
}

/**
 * Smallest contiguous replacement, in UTF-16 offsets for strings or token offsets for token lists.
 * Identical inputs yield an empty edit at the end.
 */
export function getTextChangeRange(before: TextSequence, after: TextSequence) {
    if (before === after) {
        return { start: before.length, deleteLength: 0, insertLength: 0 };
    }
    const start = sharedEdge(before, after, Math.min(before.length, after.length), false);
    const suffix = sharedEdge(before, after, Math.min(before.length, after.length) - start, true);
    return { start, deleteLength: before.length - start - suffix, insertLength: after.length - start - suffix };
}

function prefixLength(a: string, b: string) {
    const n = sharedEdge(a, b, Math.min(a.length, b.length), false);
    return high(a.charCodeAt(n - 1)) ? n - 1 : n;
}

function suffixLength(a: string, b: string) {
    const n = sharedEdge(a, b, Math.min(a.length, b.length), true);
    return low(a.charCodeAt(a.length - n)) ? n - 1 : n;
}

// Keep a common block covering at least half of the longer selection when one exists
// around a quarter-point seed. Equally long matches at the second seed take precedence.
function commonAnchor(longer: string, shorter: string) {
    if (longer.length < 4 || shorter.length * 2 < longer.length) {
        return;
    }
    let best: { longStart: number; shortStart: number; length: number } | undefined;
    for (const offset of [Math.ceil(longer.length / 4), Math.ceil(longer.length / 2)]) {
        const seed = longer.slice(offset, offset + Math.floor(longer.length / 4));
        const left = longer.slice(0, offset);
        const right = longer.slice(offset + seed.length);
        let lengthAtSeed = (best?.length ?? Math.ceil(longer.length / 2)) - 1;
        for (let i = shorter.indexOf(seed); i >= 0; i = shorter.indexOf(seed, i + 1)) {
            const maxBack = Math.min(offset, i);
            const maxFront = Math.min(longer.length - offset, shorter.length - i);
            if (maxFront + maxBack <= lengthAtSeed) {
                continue;
            }
            const extension = sharedEdge(right, shorter.slice(i + seed.length), maxFront - seed.length, false);
            let front = seed.length + extension;
            if (high(longer.charCodeAt(offset + front - 1))) {
                front--;
            }
            if (front + maxBack <= lengthAtSeed) {
                continue;
            }
            const back = suffixLength(left, shorter.slice(0, i));
            const length = front + back;
            if (length <= lengthAtSeed) {
                continue;
            }
            lengthAtSeed = length;
            best = { longStart: offset - back, shortStart: i - back, length };
        }
    }
    return best;
}

// Meet the two Myers wavefronts in the middle. Only the furthest position for each
// diagonal is needed, so working memory is linear in the combined string length.
function middleCut(a: string, b: string) {
    const radius = Math.ceil((a.length + b.length) / 2);
    const delta = a.length - b.length;
    const odd = delta % 2 !== 0;
    const front = () => {
        const x = new Int32Array(2 * radius + 3).fill(-1);
        x[radius + 1] = 0;
        return { x, skipLow: 0, skipHigh: 0 };
    };
    const paths = [front(), front()];
    for (let distance = 0; distance < radius; distance++) {
        for (let side = 0; side <= 1; side++) {
            const path = paths[side];
            for (let k = -distance + path.skipLow; k <= distance - path.skipHigh; k += 2) {
                const index = radius + k;
                let x = k === -distance || (k !== distance && path.x[index - 1] < path.x[index + 1])
                    ? path.x[index + 1]
                    : path.x[index - 1] + 1;
                let y = x - k;
                if (side === 0) {
                    while (x < a.length && y < b.length && a.charCodeAt(x) === b.charCodeAt(y)) {
                        x++;
                        y++;
                    }
                } else {
                    while (x < a.length && y < b.length && a.charCodeAt(a.length - x - 1) === b.charCodeAt(b.length - y - 1)) {
                        x++;
                        y++;
                    }
                }
                path.x[index] = x;
                if (x > a.length) {
                    path.skipHigh += 2;
                } else if (y > b.length) {
                    path.skipLow += 2;
                } else if ((side === 0) === odd) {
                    const other = paths[1 - side].x[radius + delta - k];
                    if (other >= 0 && x + other >= a.length) {
                        return side === 0 ? [x, y] : [other, other - delta + k];
                    }
                }
            }
        }
    }
}

function mergeRuns(edits: TextEdit[], protectPairs: boolean): TextEdit[] {
    const result: TextEdit[] = [];
    let deleted = '';
    let inserted = '';
    // Each equality commits the preceding replacement. At the outer boundary, move
    // unmatched surrogate halves into that replacement before choosing its edges.
    for (let i = 0; i <= edits.length; i++) {
        const [kind, text] = edits[i] ?? [0, ''];
        if (!text && i !== edits.length) {
            continue;
        }
        if (kind === -1) {
            deleted += text;
            continue;
        }
        if (kind === 1) {
            inserted += text;
            continue;
        }
        let equal = text;
        let last = result[result.length - 1];
        if (protectPairs && last && high(last[1].charCodeAt(last[1].length - 1))) {
            const head = last[1].slice(-1);
            deleted = head + deleted;
            inserted = head + inserted;
            last[1] = last[1].slice(0, -1);
            if (!last[1]) {
                result.pop();
                if (result[result.length - 1]?.[0] === 1) {
                    inserted = result.pop()![1] + inserted;
                }
                if (result[result.length - 1]?.[0] === -1) {
                    deleted = result.pop()![1] + deleted;
                }
            }
        }
        if (protectPairs && low(equal.charCodeAt(0))) {
            deleted += equal[0];
            inserted += equal[0];
            equal = equal.slice(1);
        }
        if (!equal && i !== edits.length) {
            continue;
        }
        const prefix = inserted && deleted ? prefixLength(inserted, deleted) : 0;
        last = result[result.length - 1];
        if (prefix) {
            const keep = deleted.slice(0, prefix);
            if (last?.[0] === 0) {
                last[1] += keep;
            } else {
                result.push([0, keep]);
            }
            inserted = inserted.slice(prefix);
            deleted = deleted.slice(prefix);
        }
        const suffix = inserted && deleted ? suffixLength(inserted, deleted) : 0;
        if (suffix) {
            equal = deleted.slice(-suffix) + equal;
            deleted = deleted.slice(0, -suffix);
            inserted = inserted.slice(0, -suffix);
        }
        if (deleted) {
            result.push([-1, deleted]);
        }
        if (inserted) {
            result.push([1, inserted]);
        }
        if (equal) {
            last = result[result.length - 1];
            if (last?.[0] === 0) {
                last[1] += equal;
            } else {
                result.push([0, equal]);
            }
        }
        inserted = deleted = '';
    }

    return result;
}

function shiftSingleEdits(result: TextEdit[]) {
    let shifted = false;
    for (let i = 1; i + 1 < result.length; i++) {
        const left = result[i - 1];
        const edit = result[i];
        const right = result[i + 1];
        if (left[0] !== 0 || right[0] !== 0) {
            continue;
        }
        if (edit[1].endsWith(left[1])) {
            edit[1] = left[1] + edit[1].slice(0, -left[1].length);
            right[1] = left[1] + right[1];
            result.splice(i - 1, 1);
            shifted = true;
        } else if (edit[1].startsWith(right[1])) {
            left[1] += right[1];
            edit[1] = edit[1].slice(right[1].length) + right[1];
            result.splice(i + 1, 1);
            shifted = true;
        }
    }
    return shifted;
}

function normalize(edits: TextEdit[], protectPairs: boolean) {
    let previous = edits;
    for (;;) {
        const result = mergeRuns(previous, protectPairs);
        if (!shiftSingleEdits(result)) {
            return result;
        }
        // A lone surrogate can move back to the same position on every cleanup pass.
        if (result.length === previous.length && result.every(([kind, text], i) => kind === previous[i][0] && text === previous[i][1])) {
            return result;
        }
        previous = result;
    }
}

function compareMiddle(a: string, b: string): TextEdit[] {
    if (!a || !b) {
        return a ? [[-1, a]] : [[1, b]];
    }
    const deleting = a.length > b.length;
    const longer = deleting ? a : b;
    const shorter = deleting ? b : a;
    const at = longer.indexOf(shorter);
    if (at >= 0) {
        const kind = deleting ? -1 : 1;
        return [[kind, longer.slice(0, at)], [0, shorter], [kind, longer.slice(at + shorter.length)]];
    }
    if (shorter.length > 1) {
        const anchor = commonAnchor(longer, shorter);
        if (anchor) {
            const x = deleting ? anchor.longStart : anchor.shortStart;
            const y = deleting ? anchor.shortStart : anchor.longStart;
            return compare(a.slice(0, x), b.slice(0, y), false)
                .concat([[0, a.slice(x, x + anchor.length)]], compare(a.slice(x + anchor.length), b.slice(y + anchor.length), false));
        }
        const cut = middleCut(a, b);
        // A cut at either endpoint cannot shrink the problem (e.g. unmatched surrogate halves).
        if (cut && (cut[0] || cut[1]) && (cut[0] !== a.length || cut[1] !== b.length)) {
            const [x, y] = cut;
            return compare(a.slice(0, x), b.slice(0, y), false).concat(compare(a.slice(x), b.slice(y), false));
        }
    }
    return [[-1, a], [1, b]];
}

function compare(before: string, after: string, protectPairs: boolean): TextEdit[] {
    if (before === after) {
        return before ? [[0, before]] : [];
    }
    if (!before || !after) {
        return before ? [[-1, before]] : [[1, after]];
    }
    const start = prefixLength(before, after);
    const a = before.slice(start);
    const b = after.slice(start);
    const end = suffixLength(a, b);
    const removed = a.slice(0, a.length - end);
    const added = b.slice(0, b.length - end);
    const head = before.slice(0, start);
    const tail = a.slice(a.length - end);
    const edits = compareMiddle(removed, added);
    // An isolated replacement is already canonical unless a boundary splits a surrogate
    // or a single edit can slide across an equal neighbour.
    const single = edits.length === 1;
    const isolated = single || (edits.length === 2 && edits[0][0] === -1 && edits[1][0] === 1);
    const canonical = isolated &&
        (!protectPairs || (!high(head.charCodeAt(head.length - 1)) && !low(tail.charCodeAt(0)) &&
            !low(head.charCodeAt(0)) && !high(tail.charCodeAt(tail.length - 1)))) &&
        (!single || !head || !tail || (!edits[0][1].endsWith(head) && !edits[0][1].startsWith(tail)));
    if (head) {
        edits.unshift([0, head]);
    }
    if (tail) {
        edits.push([0, tail]);
    }
    return canonical ? edits : normalize(edits, protectPairs);
}

/** Ordered delete, equal and insert runs for a TextX replacement, measured in UTF-16 code units. */
export function diffText(before: string, after: string): TextEdit[] {
    return compare(before, after, true);
}

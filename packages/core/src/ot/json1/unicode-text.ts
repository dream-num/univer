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

import type { IJSON1Component } from './json1';

type Script = NonNullable<IJSON1Component['es']>;
type Span = Script[number];

function length(span: Span): number {
    const value = typeof span === 'object' ? span.d : span;
    return typeof value === 'string' ? Array.from(value).length : value;
}

/** Split retains and deletions at code-point boundaries, preserving any recorded undo text. */
function slice(span: Span, from: number, until?: number): Span {
    const value = typeof span === 'object' ? span.d : span;
    const part = typeof value === 'string' ? Array.from(value).slice(from, until).join('') : (until ?? value) - from;
    return typeof span === 'object' ? { d: part } : part;
}

function append(out: Script, span: Span) {
    const tail = out[out.length - 1];
    if (!length(span)) {
        return;
    }
    if (typeof tail === 'number' && typeof span === 'number') {
        out[out.length - 1] = tail + span;
    } else if (typeof tail === 'string' && typeof span === 'string') {
        out[out.length - 1] = tail + span;
    } else if (typeof tail === 'object' && typeof span === 'object') {
        tail.d = typeof tail.d === 'string' && typeof span.d === 'string' ? tail.d + span.d : length(tail) + length(span);
    } else {
        out.push(typeof span === 'object' ? { ...span } : span);
    }
}

/** Align the two scripts in their shared coordinate system (intermediate text or common source). */
function combine(a: Script, b: Script, side?: 'left' | 'right'): Script {
    const out: Script = [];
    let i = 0;
    let j = 0;
    let first: Span | undefined = a[i];
    let second: Span | undefined = b[j];
    while (first !== undefined || second !== undefined) {
        if (side && typeof first === 'string' && (side === 'left' || typeof second !== 'string')) {
            append(out, first);
            first = a[++i];
        } else if (typeof second === 'string') {
            append(out, side ? length(second) : second);
            second = b[++j];
        } else if (!side && typeof first === 'object') {
            append(out, first);
            first = a[++i];
        } else {
            const n = Math.min(first === undefined ? Infinity : length(first), second === undefined ? Infinity : length(second));
            const x = first === undefined ? n : slice(first, 0, n);
            const y = second === undefined ? n : slice(second, 0, n);
            if (typeof y === 'number') {
                append(out, x);
            } else if (!side && typeof x === 'number') {
                append(out, y);
            }
            first = first === undefined || length(first) === n ? a[++i] : slice(first, n);
            second = second === undefined || length(second) === n ? b[++j] : slice(second, n);
        }
    }
    if (typeof out[out.length - 1] === 'number') {
        out.pop();
    }
    return out;
}

function visit(text: string, op: Script, record: boolean) {
    if (typeof text !== 'string') {
        throw new TypeError('A text edit requires a string');
    }
    const chars = Array.from(text);
    let index = 0;
    const result: string[] = [];
    const script: Script = [];
    for (const span of op) {
        if (typeof span === 'string') {
            result.push(span);
            script.push(span);
            continue;
        }
        const n = length(span);
        if (index + n > chars.length) {
            throw new Error('Text edit extends past the source');
        }
        const content = chars.slice(index, index + n).join('');
        if (typeof span === 'number') {
            result.push(content);
        }
        script.push(record && typeof span === 'object' ? { d: content } : span);
        index += n;
    }
    return { text: result.join('') + chars.slice(index).join(''), script };
}

/** Plain-text history uses Unicode code points for retain and delete lengths. */
export const unicodeText = {
    name: 'text-unicode',
    /** Map a caret offset in code points. An insertion at the caret leaves the caret before it. */
    transformPosition(index: number, op: Script) {
        let source = 0;
        let result = index;
        for (const span of op) {
            if (source >= index) {
                break;
            }
            const n = length(span);
            if (typeof span === 'string') {
                result += n;
            } else {
                if (typeof span === 'object') {
                    result -= Math.min(n, index - source);
                }
                source += n;
            }
        }
        return result;
    },
    checkValidOp(op: Script) {
        if (!Array.isArray(op)) {
            throw new TypeError('Expected a text edit');
        }
        for (const [i, span] of op.entries()) {
            if (span == null || !Number.isSafeInteger(length(span)) || length(span) <= 0) {
                throw new Error('Invalid text span');
            }
            if (typeof span === 'number' && (i + 1 === op.length || typeof op[i + 1] === 'number')) {
                throw new Error('Invalid text retain');
            }
        }
    },
    isNoop: (op: Script) => op.length === 0,
    apply: (doc: string, op: Script) => visit(doc, op, false).text,
    compose: (a: Script, b: Script) => combine(a, b),
    transform: (a: Script, b: Script, side: 'left' | 'right') => combine(a, b, side),
    makeInvertible: (op: Script, doc: string) => visit(doc, op, true).script,
    invert(op: Script): Script {
        return op.map((span) => {
            if (typeof span === 'number') {
                return span;
            }
            if (typeof span === 'string') {
                return { d: span };
            }
            if (typeof span.d !== 'string') {
                throw new TypeError('Undo requires deleted text');
            }
            return span.d;
        });
    },
};

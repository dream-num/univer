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

// Adapted from ot-text-unicode 4.0.0 and unicount 1.1.0. See THIRD_PARTY_NOTICES.txt.

type TextOpComponent = number | string | { d: number | string };

type TextOp = TextOpComponent[];

const checkOp = (op: TextOp) => {
    if (!Array.isArray(op)) {
        throw new TypeError('Op must be an array of components');
    }
    let last = null;
    for (let i = 0; i < op.length; i++) {
        const c = op[i];
        switch (typeof c) {
            case 'object':
                if (typeof c.d !== 'number' && typeof c.d !== 'string') {
                    throw new TypeError('Delete must be number or string');
                }
                if (dlen(c.d) <= 0) {
                    throw new Error('Deletes must not be empty');
                }
                break;
            case 'string':
                if (!(c.length > 0)) {
                    throw new Error('Inserts cannot be empty');
                }
                break;
            case 'number':
                if (!(c > 0)) {
                    throw new Error('Skip components must be >0');
                }
                if (typeof last === 'number') {
                    throw new TypeError('Adjacent skip components should be combined');
                }
                break;
        }
        last = c;
    }
    if (typeof last === 'number') {
        throw new TypeError('Op has a trailing skip');
    }
};

function eachOp(op: TextOp, fn: (c: TextOpComponent, prePos: number, postPos: number) => void) {
    let prePos = 0;
    let postPos = 0;
    for (let i = 0; i < op.length; i++) {
        const c = op[i];
        fn(c, prePos, postPos);
        switch (typeof c) {
            case 'object':
                prePos += dlen(c.d);
                break;
            case 'string':
                postPos += strPosToUni(c);
                break;
            case 'number':
                prePos += c;
                postPos += c;
                break;
        }
    }
}

function mapOp(op: TextOp, fn: (c: TextOpComponent, prePos: number, postPos: number) => TextOpComponent): TextOp {
    const newOp: TextOp = [];
    const append = makeAppend(newOp);
    eachOp(op, (c, prePos, postPos) => {
        append(fn(c, prePos, postPos));
    });
    return trim(newOp);
}

const normalize = (op: TextOp) => mapOp(op, (component) => component);

const dlen = (d: number | string) => (typeof d === 'number' ? d : strPosToUni(d));

const makeAppend = (op: TextOp) => (component: TextOpComponent) => {
    if (!component || (typeof component === 'object' && (component.d === 0 || component.d === ''))) {
        return;
    }
    const lastIndex = op.length - 1;
    const last = op[lastIndex];
    if (typeof component === 'string' && typeof last === 'string') {
        op[lastIndex] = last + component;
    } else if (typeof component === 'number' && typeof last === 'number') {
        op[lastIndex] = last + component;
    } else if (typeof component === 'object' && typeof last === 'object') {
        last.d = typeof last.d === 'string' && typeof component.d === 'string'
            ? last.d + component.d
            : dlen(last.d) + dlen(component.d);
    } else {
        op.push(component);
    }
};

const componentLength = (c: TextOpComponent): number =>
    typeof c === 'number'
        ? c
        : typeof c === 'string'
            ? strPosToUni(c)
            : typeof c.d === 'number'
                ? c.d
                : strPosToUni(c.d);

const uniSlice = (s: string, startUni: number, endUni?: number) => {
    const start = uniToStrPos(s, startUni);
    const end = endUni == null ? Infinity : uniToStrPos(s, endUni);
    return s.slice(start, end);
};

const dslice = (d: number | string, start: number, end?: number) =>
    typeof d === 'number' ? (end == null ? d - start : Math.min(d, end) - start) : uniSlice(d, start, end);

const makeTake = (op: TextOp) => {
    let idx = 0;
    let offset = 0;
    const take = (n: number, indivisableField?: 'i' | 'd'): TextOpComponent | null => {
        if (idx === op.length) {
            return n === -1 ? null : n;
        }
        const c = op[idx];
        let part;
        if (typeof c === 'number') {
            if (n === -1 || c - offset <= n) {
                part = c - offset;
                ++idx;
                offset = 0;
                return part;
            } else {
                offset += n;
                return n;
            }
        } else if (typeof c === 'string') {
            if (n === -1 || indivisableField === 'i' || strPosToUni(c.slice(offset)) <= n) {
                part = c.slice(offset);
                ++idx;
                offset = 0;
                return part;
            } else {
                const offset2 = offset + uniToStrPos(c.slice(offset), n);
                part = c.slice(offset, offset2);
                offset = offset2;
                return part;
            }
        } else {
            if (n === -1 || indivisableField === 'd' || dlen(c.d) - offset <= n) {
                part = { d: dslice(c.d, offset) };
                ++idx;
                offset = 0;
                return part;
            } else {
                const result = dslice(c.d, offset, offset + n);
                offset += n;
                return { d: result };
            }
        }
    };
    const peek = () => op[idx];
    return { take, peek };
};

const trim = (op: TextOp) => {
    if (op.length > 0 && typeof op[op.length - 1] === 'number') {
        op.pop();
    }
    return op;
};

function transform(op1: TextOp, op2: TextOp, side: 'left' | 'right') {
    if (side !== 'left' && side !== 'right') {
        throw new Error(`side (${side}) must be 'left' or 'right'`);
    }
    checkOp(op1);
    checkOp(op2);
    const newOp: TextOp = [];
    const append = makeAppend(newOp);
    const { take, peek } = makeTake(op1);
    for (let i = 0; i < op2.length; i++) {
        const c2 = op2[i];
        let length, c1;
        switch (typeof c2) {
            case 'number':
                length = c2;
                while (length > 0) {
                    c1 = take(length, 'i')!;
                    append(c1);
                    if (typeof c1 !== 'string') {
                        length -= componentLength(c1);
                    }
                }
                break;
            case 'string':
                if (side === 'left') {
                    if (typeof peek() === 'string') {
                        append(take(-1)!);
                    }
                }
                append(strPosToUni(c2));
                break;
            case 'object':
                length = dlen(c2.d);
                while (length > 0) {
                    c1 = take(length, 'i')!;
                    switch (typeof c1) {
                        case 'number':
                            length -= c1;
                            break;
                        case 'string':
                            append(c1);
                            break;
                        case 'object':
                            length -= dlen(c1.d);
                    }
                }
                break;
        }
    }
    let c;
    while ((c = take(-1))) {
        append(c);
    }
    return trim(newOp);
}

function compose(op1: TextOp, op2: TextOp) {
    checkOp(op1);
    checkOp(op2);
    const result: TextOp = [];
    const append = makeAppend(result);
    const { take } = makeTake(op1);
    for (let i = 0; i < op2.length; i++) {
        const component = op2[i];
        let length: number, chunk: TextOpComponent;
        switch (typeof component) {
            case 'number':
                length = component;
                while (length > 0) {
                    chunk = take(length, 'd')!;
                    append(chunk);
                    if (typeof chunk !== 'object') {
                        length -= componentLength(chunk);
                    }
                }
                break;
            case 'string':
                append(component);
                break;
            case 'object': {
                length = dlen(component.d);
                let offset = 0;
                while (offset < length) {
                    chunk = take(length - offset, 'd')!;
                    switch (typeof chunk) {
                        case 'number':
                            append({ d: dslice(component.d, offset, offset + chunk) });
                            offset += chunk;
                            break;
                        case 'string':
                            offset += strPosToUni(chunk);
                            break;
                        case 'object':
                            append(chunk);
                    }
                }
                break;
            }
        }
    }
    let c;
    while ((c = take(-1))) {
        append(c);
    }
    return trim(result);
}

const transformPosition = (cursor: number, op: TextOp) => {
    let pos = 0;
    for (let i = 0; i < op.length && cursor > pos; i++) {
        const c = op[i];
        switch (typeof c) {
            case 'number': {
                pos += c;
                break;
            }
            case 'string': {
                const offset = strPosToUni(c);
                pos += offset;
                cursor += offset;
                break;
            }
            case 'object':
                cursor -= Math.min(dlen(c.d), cursor - pos);
                break;
        }
    }
    return cursor;
};

function makeInvertible(op: TextOp, doc: string) {
    return mapOp(op, (c, prePos) =>
        typeof c === 'object' && typeof c.d === 'number' ? { d: uniSlice(doc, prePos, prePos + c.d) } : c);
}

function invert(op: TextOp) {
    return mapOp(op, (c) => {
        switch (typeof c) {
            case 'object':
                if (typeof c.d === 'number') {
                    throw new TypeError(
                        'Cannot invert text op: Deleted characters missing from operation. makeInvertible must be called first.'
                    );
                } else {
                    return c.d;
                }
            case 'string':
                return { d: c };
            case 'number':
                return c;
        }
    });
}
// Wire offsets count Unicode code points. Keep the 4.0.0 offset rules for stored text edits.
// Offset conversion adapted from unicount 1.1.0, Copyright 2019 Joseph Gentle (ISC).
function strPosToUni(text: string) {
    let count = 0;
    for (let index = 0; index < text.length; index++, count++) {
        const code = text.charCodeAt(index);
        if (code >= 0xD800 && code <= 0xDFFF) {
            if (++index === text.length) {
                throw new Error('Invalid offset - splits unicode bytes');
            }
        }
    }
    return count;
}
function uniToStrPos(text: string, count: number) {
    let offset = 0;
    while (count-- > 0) {
        const code = text.charCodeAt(offset);
        offset += code >= 0xD800 && code <= 0xDFFF ? 2 : 1;
    }
    return offset;
}
export const unicodeText = {
    name: 'text-unicode',
    uri: 'http://sharejs.org/types/text-unicode',
    apply,
    compose,
    transform,
    transformPosition,
    makeInvertible,
    invert,
    normalize,
    isNoop: (op: TextOp) => op.length === 0,
};
function apply(text: string, op: TextOp) {
    checkOp(op);
    if (typeof text !== 'string') {
        throw new TypeError(`Invalid document snapshot: ${text}`);
    }
    const result: string[] = [];
    for (const edit of op) {
        if (typeof edit === 'string') {
            result.push(edit);
        } else {
            const skip = typeof edit === 'number';
            const offset = uniToStrPos(text, skip ? edit : dlen(edit.d));
            if (skip) {
                if (offset > text.length) {
                    throw new Error('The op is too long for this document');
                }
                result.push(text.slice(0, offset));
            }
            text = text.slice(offset);
        }
    }
    return result.join('') + text;
}

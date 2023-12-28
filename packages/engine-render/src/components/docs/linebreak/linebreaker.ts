/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable no-magic-numbers */

import { AI, AL, BA, BK, CJ, CR, HL, HY, LF, NL, NS, RI, SA, SG, SP, WJ, XX, ZWJ } from './classes';
import { CI_BRK, CP_BRK, DI_BRK, IN_BRK, pairTable, PR_BRK } from './pairs';
import data from './trie-data';
import UnicodeTrie from './unicode-trie';

const classTrie = new UnicodeTrie(data);

function mapClass(c: number) {
    switch (c) {
        case AI:
            return AL;

        case SA:
        case SG:
        case XX:
            return AL;

        case CJ:
            return NS;

        default:
            return c;
    }
}

function mapFirst(c: number) {
    switch (c) {
        case LF:
        case NL:
            return BK;

        case SP:
            return WJ;

        default:
            return c;
    }
}

class Break {
    constructor(
        public position: number,
        public required = false
    ) {}
}

export class LineBreaker {
    pos: number;
    lastPos: number;
    curClass: number | null;
    nextClass: number | null;
    LB8a: boolean;
    LB21a: boolean;
    LB30a: number;

    constructor(public string: string) {
        this.pos = 0;
        this.lastPos = 0;
        this.curClass = null;
        this.nextClass = null;
        this.LB8a = false;
        this.LB21a = false;
        this.LB30a = 0;
    }

    nextCodePoint() {
        const code = this.string.charCodeAt(this.pos++);
        const next = this.string.charCodeAt(this.pos);

        // If a surrogate pair
        if (code >= 0xd800 && code <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
            this.pos++;
            return (code - 0xd800) * 0x400 + (next - 0xdc00) + 0x10000;
        }

        return code;
    }

    nextCharClass() {
        return mapClass(classTrie.get(this.nextCodePoint()));
    }

    getSimpleBreak() {
        // handle classes not handled by the pair table
        switch (this.nextClass) {
            case SP:
                return false;

            case BK:
            case LF:
            case NL:
                this.curClass = BK;
                return false;

            case CR:
                this.curClass = CR;
                return false;
        }

        return null;
    }

    getPairTableBreak(lastClass: number) {
        // if not handled already, use the pair table
        let shouldBreak = false;
        switch (pairTable[this.curClass!][this.nextClass!]) {
            case DI_BRK: // Direct break
                shouldBreak = true;
                break;

            case IN_BRK: // possible indirect break
                shouldBreak = lastClass === SP;
                break;

            case CI_BRK:
                shouldBreak = lastClass === SP;
                if (!shouldBreak) {
                    shouldBreak = false;
                    return shouldBreak;
                }
                break;

            case CP_BRK: // prohibited for combining marks
                if (lastClass !== SP) {
                    return shouldBreak;
                }
                break;

            case PR_BRK:
                break;
        }

        if (this.LB8a) {
            shouldBreak = false;
        }

        // Rule LB21a
        if (this.LB21a && (this.curClass === HY || this.curClass === BA)) {
            shouldBreak = false;
            this.LB21a = false;
        } else {
            this.LB21a = this.curClass === HL;
        }

        // Rule LB30a
        if (this.curClass === RI) {
            this.LB30a++;
            if (this.LB30a === 2 && this.nextClass === RI) {
                shouldBreak = true;
                this.LB30a = 0;
            }
        } else {
            this.LB30a = 0;
        }

        this.curClass = this.nextClass;

        return shouldBreak;
    }

    nextBreak() {
        // get the first char if we're at the beginning of the string
        if (this.curClass == null) {
            const firstClass = this.nextCharClass();
            this.curClass = mapFirst(firstClass);
            this.nextClass = firstClass;
            this.LB8a = firstClass === ZWJ;
            this.LB30a = 0;
        }

        while (this.pos < this.string.length) {
            this.lastPos = this.pos;
            const lastClass = this.nextClass;
            this.nextClass = this.nextCharClass();

            // explicit newline
            if (this.curClass === BK || (this.curClass === CR && this.nextClass !== LF)) {
                this.curClass = mapFirst(mapClass(this.nextClass));
                return new Break(this.lastPos, true);
            }

            let shouldBreak = this.getSimpleBreak();

            if (shouldBreak === null) {
                shouldBreak = this.getPairTableBreak(lastClass!);
            }

            // Rule LB8a
            this.LB8a = this.nextClass === ZWJ;

            if (shouldBreak) {
                return new Break(this.lastPos);
            }
        }

        if (this.lastPos < this.string.length) {
            this.lastPos = this.string.length;
            return new Break(this.string.length);
        }

        return null;
    }
}

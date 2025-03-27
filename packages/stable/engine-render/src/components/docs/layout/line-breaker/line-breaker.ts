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

/* eslint-disable ts/naming-convention */

import type { Nullable } from '@univerjs/core';

import type { ILineBreakRule } from './rule';
import { Break, BreakPointType } from './break';
import { AI, AL, BA, BK, CJ, CR, HL, HY, LF, NL, NS, RI, SA, SG, SP, WJ, XX, ZWJ } from './classes';
import { CI_BRK, CP_BRK, DI_BRK, IN_BRK, pairTable, PR_BRK } from './pairs';
import { Rule } from './rule';
import data from './trie-data';
import UnicodeTrie from './unicode-trie';

interface ILineBreakExtension {
    (breaker: LineBreaker): void;
}

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

export interface IBreakPoints {
    nextBreakPoint(): Nullable<Break>;
}

export class LineBreaker implements IBreakPoints {
    private _pos: number = 0;
    private _lastPos: number = 0;
    private _curClass: Nullable<number> = null;
    private _codePoint: Nullable<number> = null;
    private _lastCodePoint: Nullable<number> = null;
    private _nextClass: Nullable<number> = null;
    private _LB8a: boolean = false;
    private _LB21a: boolean = false;
    private _LB30a: number = 0;
    private _rule: Rule = new Rule();

    constructor(public content: string) {}

    use(extension: ILineBreakExtension) {
        extension(this);

        return this;
    }

    addRule(key: string, rule: ILineBreakRule) {
        this._rule.add(key, rule);

        return this;
    }

    nextBreakPoint() {
        // get the first char if we're at the beginning of the string
        if (this._curClass == null) {
            const firstClass = this._nextCharClass();
            this._curClass = mapFirst(firstClass);
            this._nextClass = firstClass;
            this._LB8a = firstClass === ZWJ;
            this._LB30a = 0;
        }

        while (this._pos < this.content.length) {
            this._lastPos = this._pos;
            const lastClass = this._nextClass;
            this._nextClass = this._nextCharClass();

            // explicit newline
            if (this._curClass === BK || (this._curClass === CR && this._nextClass !== LF)) {
                this._curClass = mapFirst(mapClass(this._nextClass));
                return new Break(this._lastPos, BreakPointType.Mandatory);
            }

            if (this._rule.shouldBreak(this._codePoint!, this._lastCodePoint, this._nextClass)) {
                this._curClass = mapFirst(mapClass(this._nextClass));
                return new Break(this._lastPos);
            }

            let shouldBreak = this._getSimpleBreak();

            if (shouldBreak === null) {
                shouldBreak = this._getPairTableBreak(lastClass!);
            }

            // Rule _LB8a
            this._LB8a = this._nextClass === ZWJ;

            if (shouldBreak) {
                return new Break(this._lastPos);
            }
        }

        if (this._lastPos < this.content.length) {
            this._lastPos = this.content.length;
            return new Break(this.content.length);
        }

        return null;
    }

    private _getNextCodePoint() {
        const code = this.content.charCodeAt(this._pos++);
        const next = this.content.charCodeAt(this._pos);

        // If a surrogate pair
        if (code >= 0xD800 && code <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) {
            this._pos++;
            return (code - 0xD800) * 0x400 + (next - 0xDC00) + 0x10000;
        }

        return code;
    }

    private _nextCharClass() {
        const nextCodePoint = this._getNextCodePoint();
        const rawClass = classTrie.get(nextCodePoint);

        this._lastCodePoint = this._codePoint;
        this._codePoint = nextCodePoint;

        return mapClass(rawClass);
    }

    private _getSimpleBreak() {
        // handle classes not handled by the pair table
        switch (this._nextClass) {
            case SP:
                return false;

            case BK:
            case LF:
            case NL:
                this._curClass = BK;
                return false;

            case CR:
                this._curClass = CR;
                return false;
        }

        return null;
    }

    private _getPairTableBreak(lastClass: number) {
        // if not handled already, use the pair table
        let shouldBreak = false;

        switch (pairTable[this._curClass!][this._nextClass!]) {
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

        if (this._LB8a) {
            shouldBreak = false;
        }

        // Rule _LB21a
        if (this._LB21a && (this._curClass === HY || this._curClass === BA)) {
            shouldBreak = false;
            this._LB21a = false;
        } else {
            this._LB21a = this._curClass === HL;
        }

        // Rule _LB30a
        if (this._curClass === RI) {
            this._LB30a++;
            if (this._LB30a === 2 && this._nextClass === RI) {
                shouldBreak = true;
                this._LB30a = 0;
            }
        } else {
            this._LB30a = 0;
        }

        this._curClass = this._nextClass;

        return shouldBreak;
    }
}

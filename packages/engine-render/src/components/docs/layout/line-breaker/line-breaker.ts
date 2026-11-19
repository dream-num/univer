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

import type { Nullable } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';
import type { ILineBreakRule } from './rule';
import { Break, BreakPointType } from './break';
import { AI, AL, BA, BK, CJ, CR, H2, H3, HL, HY, ID, JL, JT, JV, LF, NL, NS, RI, SA, SG, SP, WJ, XX, ZWJ } from './classes';
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
    readonly content: string;
    nextBreakPoint(): Nullable<Break>;
}

export class LineBreaker implements IBreakPoints {
    protected _pos: number = 0;
    private _lastPos: number = 0;
    private _curClass: Nullable<number> = null;
    protected _codePoint: Nullable<number> = null;
    protected _lastCodePoint: Nullable<number> = null;
    private _nextClass: Nullable<number> = null;
    private _lb8a: boolean = false;
    private _lb21a: boolean = false;
    private _lb30a: number = 0;
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
            this._lb8a = firstClass === ZWJ;
            this._lb30a = 0;
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

            // Rule LB8a
            this._lb8a = this._nextClass === ZWJ;

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

    protected _getNextCodePoint() {
        const code = this.content.charCodeAt(this._pos++);
        const next = this.content.charCodeAt(this._pos);

        // If a surrogate pair
        if (code >= 0xD800 && code <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) {
            this._pos++;
            return (code - 0xD800) * 0x400 + (next - 0xDC00) + 0x10000;
        }

        return code;
    }

    protected _nextCharClass() {
        const nextCodePoint = this._getNextCodePoint();
        this._lastCodePoint = this._codePoint;
        this._codePoint = nextCodePoint;
        return mapClass(classTrie.get(nextCodePoint));
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

        if (this._lb8a) {
            shouldBreak = false;
        }

        // Rule LB21a
        if (this._lb21a && (this._curClass === HY || this._curClass === BA)) {
            shouldBreak = false;
            this._lb21a = false;
        } else {
            this._lb21a = this._curClass === HL;
        }

        // Rule LB30a
        if (this._curClass === RI) {
            this._lb30a++;
            if (this._lb30a === 2 && this._nextClass === RI) {
                shouldBreak = true;
                this._lb30a = 0;
            }
        } else {
            this._lb30a = 0;
        }

        this._curClass = this._nextClass;

        return shouldBreak;
    }
}

export class DocumentLineBreaker extends LineBreaker {
    constructor(
        content: string,
        private readonly _wordWrap: BooleanNumber,
        private readonly _languageAt?: (offset: number) => string | undefined,
        private readonly _inferKorean = true
    ) {
        super(content);
    }

    protected override _nextCharClass() {
        const offset = this._pos;
        const nextCodePoint = this._getNextCodePoint();
        const rawClass = classTrie.get(nextCodePoint);
        this._lastCodePoint = this._codePoint;
        this._codePoint = nextCodePoint;

        if (this._wordWrap === BooleanNumber.FALSE) {
            if ((rawClass === H2 || rawClass === H3 || rawClass === JL || rawClass === JV || rawClass === JT)
                && (this._inferKorean || /^ko(?:-|$)/i.test(this._languageAt?.(offset) ?? ''))) {
                return AL;
            }
        } else if (rawClass === AL && /\p{Script=Latin}/u.test(String.fromCodePoint(nextCodePoint))
            && !/^ko(?:-|$)/i.test(this._languageAt?.(offset) ?? '')) {
            return ID;
        }
        return mapClass(rawClass);
    }
}

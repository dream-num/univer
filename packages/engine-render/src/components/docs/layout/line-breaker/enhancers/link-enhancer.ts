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
import type { IBreakPoints, LineBreaker } from '../line-breaker';
import { Break, BreakPointType } from '../break';
import { getSlicePosition } from './utils';

enum LinkCharType {
    Alphabetic = 'Alphabetic',
    Digit = 'Digit',
    Open = 'Open',
    Other = 'Other',
}

function ofLinkCharType(char: string): LinkCharType {
    if (/[a-z]/i.test(char)) {
        return LinkCharType.Alphabetic;
    } else if (/[0-9]/.test(char)) {
        return LinkCharType.Digit;
    } else if (char === '(' || char === '[') {
        return LinkCharType.Open;
    } else {
        return LinkCharType.Other;
    }
}

function linebreakLink(link: string): string[] {
    const pieces: string[] = [];
    let offset = 0;
    let prevCharType = LinkCharType.Other;

    for (let i = 0; i < link.length; i++) {
        const char = link[i];
        const charType = ofLinkCharType(char);

        // Emit opportunities when going from
        // - other -> other
        // - alphabetic -> numeric
        // - numeric -> alphabetic
        // Never before after opening delimiters.
        if (
            i > 0
            && prevCharType !== LinkCharType.Open
            && (charType === LinkCharType.Other ? charType === LinkCharType.Other : charType !== prevCharType)
        ) {
            const piece = link.slice(offset, i);
            if (piece.length < 16) {
                pieces.push(piece);
            } else {
                // If it gets very long (e.g. a hash in the URL), just allow a
                // break at every char.
                for (let j = 0; j < piece.length; j++) {
                    pieces.push(piece[j]);
                }
            }

            offset = i;
            prevCharType = charType;
        }
    }

    return pieces;
}

const LINK_CHAR_REG_EXP = /[a-z\d!#$%&*+,-./:;=?@_~\\]/i;
const LINK_CHAR_NO_TRAILING_REG_EXP = /[!,.;:?']$/g;

function extractLink(content: string, offset: number): string {
    let link = '';

    for (let i = offset; i < content.length; i++) {
        const char = content[i];
        if (LINK_CHAR_REG_EXP.test(char)) {
            link += char;
        } else {
            break;
        }
    }

    link.replace(LINK_CHAR_NO_TRAILING_REG_EXP, '');

    return link;
}

// Special case for links. UAX #14 doesn't handle them well.

export class LineBreakerLinkEnhancer implements IBreakPoints {
    private _curBreak: Nullable<Break> = null;

    private _nextBreak: Nullable<Break> = new Break(0);

    private _isInLink = false;

    private _link = '';

    private _index = -1;

    private _linkSlice: string[] = [];

    public content = '';

    constructor(
        private _lineBreaker: LineBreaker
    ) {
        this.content = _lineBreaker.content;
    }

    nextBreakPoint(): Nullable<Break> {
        if (!this._isInLink) {
            this._curBreak = this._nextBreak;
            this._nextBreak = this._lineBreaker.nextBreakPoint();

            // If has no next break, return null.
            if (this._nextBreak == null || this._curBreak == null) {
                return null;
            }
            // Check if next break is in word.
            const word = this.content.slice(this._curBreak.position, this._nextBreak.position);

            if (word.length && (word.endsWith('://') || word.startsWith('www.'))) {
                this._isInLink = true;
                this._link = extractLink(this.content, this._curBreak.position);
                // get link slice.
                this._linkSlice = linebreakLink(this._link);
                this._index = 0;

                while (this._nextBreak && this._nextBreak.position < this._curBreak.position + this._link.length) {
                    this._nextBreak = this._lineBreaker.nextBreakPoint();
                }

                return this.nextBreakPoint();
            } else {
                return this._nextBreak;
            }
        } else {
            // No need to add `-` to last hyphen slice, so use length - 1.
            if (this._index < this._linkSlice.length - 1) {
                const position = getSlicePosition(this._curBreak!.position, this._linkSlice, this._index);

                this._index++;

                return new Break(position, BreakPointType.Link);
            } else {
                this._isInLink = false;
                this._link = '';
                this._linkSlice = [];
                this._index = -1;

                return this._nextBreak;
            }
        }
    }
}

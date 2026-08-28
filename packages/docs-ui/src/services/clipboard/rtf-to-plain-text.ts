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

const SKIPPED_DESTINATIONS = new Set([
    'colortbl',
    'datastore',
    'filetbl',
    'fonttbl',
    'header',
    'headerf',
    'headerl',
    'headerr',
    'info',
    'listtable',
    'listoverridetable',
    'object',
    'pict',
    'stylesheet',
    'themedata',
]);

const SYMBOLS: Record<string, string> = {
    bullet: '\u2022',
    emdash: '\u2014',
    endash: '\u2013',
    line: '\n',
    lquote: '\u2018',
    par: '\n',
    rdblquote: '\u201D',
    rquote: '\u2019',
    tab: '\t',
    ldblquote: '\u201C',
};

interface IRtfState {
    skip: boolean;
    unicodeFallbackLength: number;
}

export function convertClipboardRtfToPlainText(rtf: string): string {
    if (!/^\s*\{\\rtf\d?/i.test(rtf)) {
        return '';
    }

    const states: IRtfState[] = [{ skip: false, unicodeFallbackLength: 1 }];
    let state = states[0];
    let output = '';
    let index = 0;
    let unicodeFallbackRemaining = 0;

    while (index < rtf.length) {
        const character = rtf[index];
        if (character === '{') {
            state = { ...state };
            states.push(state);
            index += 1;
            continue;
        }
        if (character === '}') {
            if (states.length > 1) {
                states.pop();
                state = states[states.length - 1];
            }
            unicodeFallbackRemaining = 0;
            index += 1;
            continue;
        }
        if (character !== '\\') {
            if (!state.skip && unicodeFallbackRemaining === 0 && character !== '\r' && character !== '\n') {
                output += character;
            } else if (unicodeFallbackRemaining > 0) {
                unicodeFallbackRemaining -= 1;
            }
            index += 1;
            continue;
        }

        const escaped = rtf[index + 1];
        if (escaped === '\\' || escaped === '{' || escaped === '}') {
            if (!state.skip && unicodeFallbackRemaining === 0) {
                output += escaped;
            } else if (unicodeFallbackRemaining > 0) {
                unicodeFallbackRemaining -= 1;
            }
            index += 2;
            continue;
        }
        if (escaped === '~' || escaped === '-' || escaped === '_') {
            if (!state.skip && unicodeFallbackRemaining === 0) {
                output += escaped === '~' ? '\u00A0' : escaped === '_' ? '\u2011' : '';
            } else if (unicodeFallbackRemaining > 0) {
                unicodeFallbackRemaining -= 1;
            }
            index += 2;
            continue;
        }
        if (escaped === '*') {
            state.skip = true;
            index += 2;
            continue;
        }
        if (escaped === "'") {
            const hex = rtf.slice(index + 2, index + 4);
            if (!state.skip && unicodeFallbackRemaining === 0 && /^[0-9a-f]{2}$/i.test(hex)) {
                output += decodeWindows1252(Number.parseInt(hex, 16));
            } else if (unicodeFallbackRemaining > 0) {
                unicodeFallbackRemaining -= 1;
            }
            index += 4;
            continue;
        }

        const control = /^\\([a-z]+)(-?\d+)? ?/i.exec(rtf.slice(index));
        if (!control) {
            index += 2;
            continue;
        }
        const word = control[1].toLowerCase();
        const parameter = control[2] === undefined ? undefined : Number(control[2]);
        index += control[0].length;

        if (SKIPPED_DESTINATIONS.has(word)) {
            state.skip = true;
            continue;
        }
        if (word === 'uc' && parameter !== undefined) {
            state.unicodeFallbackLength = Math.max(0, parameter);
            continue;
        }
        if (word === 'u' && parameter !== undefined && !state.skip) {
            output += String.fromCharCode(parameter < 0 ? parameter + 0x10000 : parameter);
            unicodeFallbackRemaining = state.unicodeFallbackLength;
            continue;
        }
        if (!state.skip && SYMBOLS[word]) {
            output += SYMBOLS[word];
        }
    }

    return output;
}

function decodeWindows1252(code: number): string {
    const replacements: Record<number, string> = {
        0x80: '\u20AC',
        0x82: '\u201A',
        0x83: '\u0192',
        0x84: '\u201E',
        0x85: '\u2026',
        0x86: '\u2020',
        0x87: '\u2021',
        0x88: '\u02C6',
        0x89: '\u2030',
        0x8A: '\u0160',
        0x8B: '\u2039',
        0x8C: '\u0152',
        0x8E: '\u017D',
        0x91: '\u2018',
        0x92: '\u2019',
        0x93: '\u201C',
        0x94: '\u201D',
        0x95: '\u2022',
        0x96: '\u2013',
        0x97: '\u2014',
        0x98: '\u02DC',
        0x99: '\u2122',
        0x9A: '\u0161',
        0x9B: '\u203A',
        0x9C: '\u0153',
        0x9E: '\u017E',
        0x9F: '\u0178',
    };

    return replacements[code] ?? String.fromCharCode(code);
}

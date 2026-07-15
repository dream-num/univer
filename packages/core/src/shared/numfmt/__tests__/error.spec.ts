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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { isDateFormat, isPercentFormat, isTextFormat } from '../api';
import { numfmtTest } from './test-utils';

const excelOpts = { dateSpanLarge: false, dateErrorNumber: false };

numfmtTest('Various format restrictions', (t) => {
    // no more than 4 sections
    t.formatInvalid('a;b;c;d;');
    t.formatInvalid('#;#;#;#;#');

    // no more than 2 conditional sections
    t.formatInvalid('[<-2]a;[<-1]b;[>2]c;d;');

    // can't mix dates and numbers (within a segment)
    t.formatInvalid('y 0');
    t.formatInvalid('yyyy 0');
    t.formatInvalid('m 0');
    t.formatInvalid('mmmm 0');
    t.formatInvalid('d 0');
    t.formatInvalid('dddd 0');
    t.formatInvalid('s 0');
    t.formatInvalid('h 0');
    t.formatInvalid('AM/PM 0');
    t.formatInvalid('[h] 0');
    t.formatInvalid('[m] 0');
    t.formatInvalid('[s] 0');
    t.formatInvalid('y #');
    t.formatInvalid('yyyy #');
    t.formatInvalid('m #');
    t.formatInvalid('mmmm #');
    t.formatInvalid('d #');
    t.formatInvalid('dddd #');
    t.formatInvalid('s #');
    t.formatInvalid('h #');
    t.formatInvalid('AM/PM #');
    t.formatInvalid('[h] #');
    t.formatInvalid('[m] #');
    t.formatInvalid('[s] #');
    t.formatInvalid('y ?');
    t.formatInvalid('yyyy ?');
    t.formatInvalid('m ?');
    t.formatInvalid('mmmm ?');
    t.formatInvalid('d ?');
    t.formatInvalid('dddd ?');
    t.formatInvalid('s ?');
    t.formatInvalid('h ?');
    t.formatInvalid('AM/PM ?');
    t.formatInvalid('[h] ?');
    t.formatInvalid('[m] ?');
    t.formatInvalid('[s] ?');

    t.formatInvalid('d .#');
    t.formatInvalid('mm%');
    t.formatInvalid('mm@');

    // no out of bounds dates
    t.format('dddd, dd. mmmm yyy', -1, '######', excelOpts);
    t.format('dddd, dd. mmmm yyy', 2958470, '######', excelOpts);

    // isDate should not throw on malformed input
    t.equal(isDateFormat('dddd, dd. mmmm yyy'), true, "isDateFormat('dddd, dd. mmmm yyy')");
    t.equal(isDateFormat('0.0M'), false, "isDateFormat('0.0M')");

    // utility functions exist and work on error formatters
    t.equal(isDateFormat('y 0'), false, "isDateFormat('y 0')");
    t.equal(isPercentFormat('y 0'), false, "isPercentFormat('y 0')");
    t.equal(isTextFormat('y 0'), false, "isTextFormat('y 0')");
});

numfmtTest('Single characters', (t) => {
    t.format(' ', 1, ' ');
    t.format('!', 1, '!');
    t.formatInvalid('"');
    t.format('#', 1, '1');
    t.format('$', 1, '$');
    t.format('%', 1, '%');
    t.format('&', 1, '&');
    t.format('\'', 1, '\'');
    t.format('(', 1, '(');
    t.format(')', 1, ')');
    t.formatInvalid('*');
    t.format('+', 1, '+');
    t.format(',', 1, ',');
    t.format('-', 1, '-');
    t.format('.', 1, '.');
    // slash is allowed in date formats
    t.format('d/', 1, '1/');
    // slash otherwise means vulgar fractions
    t.format('0/0', 0, '0/1');
    t.format('0/0', 1, '1/1');
    t.formatInvalid('0/');
    t.formatInvalid('/0');
    t.formatInvalid('/');
    t.format('0', 1, '1');
    t.format('1', 1, '1');
    t.format('2', 1, '2');
    t.format('3', 1, '3');
    t.format('4', 1, '4');
    t.format('5', 1, '5');
    t.format('6', 1, '6');
    t.format('7', 1, '7');
    t.format('8', 1, '8');
    t.format('9', 1, '9');
    t.format(':', 1, ':');
    t.format(';', 1, '');
    t.format('<', 1, '<');
    t.format('=', 1, '=');
    t.format('>', 1, '>');
    t.format('?', 1, '1');
    t.format('@', 1, '1');
    t.format('A', 1, 'A');
    // B is not allowed at the end of the pattern
    t.formatInvalid('B');
    t.format('B ', 1, '43 ');
    t.format('B;', 1, '43');
    t.format('C', 1, 'C');
    t.format('D', 1, '1');
    // E is stricter than e, for whatever reason (see E tests below)
    t.formatInvalid('E');
    t.format('F', 1, 'F');
    t.format('G', 1, '');
    t.format('H', 1, '0');
    t.format('I', 1, 'I');
    t.format('J', 1, 'J');
    t.format('K', 1, 'K');
    t.format('L', 1, 'L');
    t.format('M', 1, '1');
    t.formatInvalid('N');
    t.format('O', 1, 'O');
    t.format('P', 1, 'P');
    t.format('Q', 1, 'Q');
    t.format('R', 1, 'R');
    t.format('S', 1, '0');
    t.format('T', 1, 'T');
    t.format('U', 1, 'U');
    t.format('V', 1, 'V');
    t.format('W', 1, 'W');
    t.format('X', 1, 'X');
    t.format('Y', 1, '00');
    t.format('Z', 1, 'Z');
    t.formatInvalid('[');
    t.formatInvalid('\\');
    t.format(']', 1, ']');
    t.format('^', 1, '^');
    t.formatInvalid('_');
    t.format('`', 1, '`');
    t.format('a', 1, 'a');
    t.format('b', 1, '43');
    t.format('c', 1, 'c');
    t.format('d', 1, '1');
    t.format('e', 1, '1900');
    t.format('f', 1, 'f');
    t.format('g', 1, '');
    t.format('h', 1, '0');
    t.format('i', 1, 'i');
    t.format('j', 1, 'j');
    t.format('k', 1, 'k');
    t.format('l', 1, 'l');
    t.format('m', 1, '1');
    t.formatInvalid('n');
    t.format('o', 1, 'o');
    t.format('p', 1, 'p');
    t.format('q', 1, 'q');
    t.format('r', 1, 'r');
    t.format('s', 1, '0');
    t.format('t', 1, 't');
    t.format('u', 1, 'u');
    t.format('v', 1, 'v');
    t.format('w', 1, 'w');
    t.format('x', 1, 'x');
    t.format('y', 1, '00');
    t.format('z', 1, 'z');
    t.format('{', 1, '{');
    t.format('|', 1, '|');
    t.format('}', 1, '}');
    t.format('~', 1, '~');
    t.format('', 1, '');
    t.format('Ä', 1, 'Ä');
    t.format('Å', 1, 'Å');
    t.format('Ç', 1, 'Ç');
    t.formatInvalid('É');
    t.formatInvalid('Ñ');
    t.format('Ö', 1, 'Ö');
    t.format('Ü', 1, 'Ü');
    t.format('á', 1, 'á');
    t.format('à', 1, 'à');
    t.format('â', 1, 'â');
    t.format('ä', 1, 'ä');
    t.format('ã', 1, 'ã');
    t.format('å', 1, 'å');
    t.format('ç', 1, 'ç');
    t.formatInvalid('é');
    t.formatInvalid('è');
    t.formatInvalid('ê');
    t.formatInvalid('ë');
    t.format('í', 1, 'í');
    t.format('ì', 1, 'ì');
    t.format('î', 1, 'î');
    t.format('ï', 1, 'ï');
    t.formatInvalid('ñ');
    t.format('ó', 1, 'ó');
    t.format('ò', 1, 'ò');
    t.format('ô', 1, 'ô');
    t.format('ö', 1, 'ö');
    t.format('õ', 1, 'õ');
    t.format('ú', 1, 'ú');
    t.format('ù', 1, 'ù');
    t.format('û', 1, 'û');
    t.format('ü', 1, 'ü');
    t.format('†', 1, '†');
    t.format('°', 1, '°');
    t.format('¢', 1, '¢');
    t.format('£', 1, '£');
    t.format('§', 1, '§');
    t.format('•', 1, '•');
    t.format('¶', 1, '¶');
    t.format('ß', 1, 'ß');
    t.format('®', 1, '®');
    t.format('©', 1, '©');
    t.format('™', 1, '™');
    t.format('´', 1, '´');
    t.format('¨', 1, '¨');
    t.format('≠', 1, '≠');
    t.format('Æ', 1, 'Æ');
    t.format('Ø', 1, 'Ø');
    t.format('∞', 1, '∞');
    t.format('±', 1, '±');
    t.format('≤', 1, '≤');
    t.format('≥', 1, '≥');
    t.format('¥', 1, '¥');
    t.format('µ', 1, 'µ');
    t.format('∂', 1, '∂');
    t.format('∑', 1, '∑');
    t.format('∏', 1, '∏');
    t.format('π', 1, 'π');
    t.format('∫', 1, '∫');
    t.format('ª', 1, 'ª');
    t.format('º', 1, 'º');
    t.format('Ω', 1, 'Ω');
    t.format('æ', 1, 'æ');
    t.format('ø', 1, 'ø');
    t.format('¿', 1, '¿');
    t.format('¡', 1, '¡');
    t.format('¬', 1, '¬');
});

numfmtTest('The "E" and "e" operators', (t) => {
    t.format('e', 1, '1900');
    t.formatInvalid('0e');
    t.formatInvalid('e0');
    t.formatInvalid('0e0');
    t.format('e+', 1, '1900+'); // Sheets does not allow this
    t.formatInvalid('0e+');
    t.formatInvalid('e+0');
    t.formatInvalid('0e+0'); // Sheets emits "1e+0"
    t.format('e-', 1, '1900-'); // Sheets emits "1e+0"
    t.formatInvalid('0e-');
    t.formatInvalid('e-0');
    t.formatInvalid('0e-0'); // Sheets emits "1e0"
    t.formatInvalid('E');
    t.formatInvalid('0E');
    t.formatInvalid('E0');
    t.formatInvalid('0E0');
    t.formatInvalid('E+');
    t.formatInvalid('0E+');
    t.formatInvalid('E+0');
    t.format('0E+0', 1, '1E+0');
    t.formatInvalid('E-');
    t.formatInvalid('0E-');
    t.formatInvalid('E-0');
    t.format('0E-0', 1, '1E0');

    t.formatInvalid('0 e 0');
    t.formatInvalid('0 e + 0');
    t.formatInvalid('0 e +0');
    t.formatInvalid('0 e+ 0'); // Sheets emits "1 e +4"

    t.formatInvalid('0 E 0');
    t.formatInvalid('0 E + 0');
    t.formatInvalid('0 E +0');
    t.format('0 E+ 0', 1, '1 E +0');

    t.format('e-m', 1, '1900-1');
});

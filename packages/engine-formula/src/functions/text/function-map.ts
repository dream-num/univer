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

import { Concat } from './concat';
import { Concatenate } from './concatenate';
import { FUNCTION_NAMES_TEXT } from './function-names';
import { Leftb } from './leftb';
import { Len } from './len';
import { Lenb } from './lenb';
import { Lower } from './lower';
import { Mid } from './mid';
import { Regexextract } from './regexextract';
import { Regexmatch } from './regexmatch';
import { Regexreplace } from './regexreplace';
import { Rept } from './rept';
import { Text } from './text';
import { Textafter } from './textafter';
import { Textbefore } from './textbefore';
import { Textsplit } from './textsplit';

export const functionText = [
    [Concat, FUNCTION_NAMES_TEXT.CONCAT],
    [Concatenate, FUNCTION_NAMES_TEXT.CONCATENATE],
    [Len, FUNCTION_NAMES_TEXT.LEN],
    [Lenb, FUNCTION_NAMES_TEXT.LENB],
    [Lower, FUNCTION_NAMES_TEXT.LOWER],
    [Mid, FUNCTION_NAMES_TEXT.MID],
    [Regexextract, FUNCTION_NAMES_TEXT.REGEXEXTRACT],
    [Regexmatch, FUNCTION_NAMES_TEXT.REGEXMATCH],
    [Regexreplace, FUNCTION_NAMES_TEXT.REGEXREPLACE],
    [Rept, FUNCTION_NAMES_TEXT.REPT],
    [Text, FUNCTION_NAMES_TEXT.TEXT],
    [Textafter, FUNCTION_NAMES_TEXT.TEXTAFTER],
    [Textbefore, FUNCTION_NAMES_TEXT.TEXTBEFORE],
    [Textsplit, FUNCTION_NAMES_TEXT.TEXTSPLIT],
    [Leftb, FUNCTION_NAMES_TEXT.LEFTB],
];

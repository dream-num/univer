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

import { Arraytotext } from './arraytotext';
import { Asc } from './asc';
import { Bahttext } from './bahttext';
import { Char } from './char';
import { Clean } from './clean';
import { Code } from './code';
import { Concat } from './concat';
import { Concatenate } from './concatenate';
import { Dbcs } from './dbcs';
import { Dollar } from './dollar';
import { Exact } from './exact';
import { Fixed } from './fixed';
import { FUNCTION_NAMES_TEXT } from './function-names';
import { Leftb } from './leftb';
import { Len } from './len';
import { Lenb } from './lenb';
import { Lower } from './lower';
import { Mid } from './mid';
import { Regexextract } from './regexextract';
import { Regexmatch } from './regexmatch';
import { Regexreplace } from './regexreplace';
import { Numbervalue } from './numbervalue';
import { Proper } from './proper';
import { Rept } from './rept';
import { Right } from './right';
import { Text } from './text';
import { Textafter } from './textafter';
import { Textbefore } from './textbefore';
import { Textsplit } from './textsplit';

export const functionText = [
    [Asc, FUNCTION_NAMES_TEXT.ASC],
    [Arraytotext, FUNCTION_NAMES_TEXT.ARRAYTOTEXT],
    [Bahttext, FUNCTION_NAMES_TEXT.BAHTTEXT],
    [Char, FUNCTION_NAMES_TEXT.CHAR],
    [Clean, FUNCTION_NAMES_TEXT.CLEAN],
    [Code, FUNCTION_NAMES_TEXT.CODE],
    [Concat, FUNCTION_NAMES_TEXT.CONCAT],
    [Concatenate, FUNCTION_NAMES_TEXT.CONCATENATE],
    [Dbcs, FUNCTION_NAMES_TEXT.DBCS],
    [Dollar, FUNCTION_NAMES_TEXT.DOLLAR],
    [Exact, FUNCTION_NAMES_TEXT.EXACT],
    [Fixed, FUNCTION_NAMES_TEXT.FIXED],
    [Len, FUNCTION_NAMES_TEXT.LEN],
    [Lenb, FUNCTION_NAMES_TEXT.LENB],
    [Lower, FUNCTION_NAMES_TEXT.LOWER],
    [Mid, FUNCTION_NAMES_TEXT.MID],
    [Regexextract, FUNCTION_NAMES_TEXT.REGEXEXTRACT],
    [Regexmatch, FUNCTION_NAMES_TEXT.REGEXMATCH],
    [Regexreplace, FUNCTION_NAMES_TEXT.REGEXREPLACE],
    [Numbervalue, FUNCTION_NAMES_TEXT.NUMBERVALUE],
    [Proper, FUNCTION_NAMES_TEXT.PROPER],
    [Rept, FUNCTION_NAMES_TEXT.REPT],
    [Right, FUNCTION_NAMES_TEXT.RIGHT],
    [Text, FUNCTION_NAMES_TEXT.TEXT],
    [Textafter, FUNCTION_NAMES_TEXT.TEXTAFTER],
    [Textbefore, FUNCTION_NAMES_TEXT.TEXTBEFORE],
    [Textsplit, FUNCTION_NAMES_TEXT.TEXTSPLIT],
    [Leftb, FUNCTION_NAMES_TEXT.LEFTB],
];

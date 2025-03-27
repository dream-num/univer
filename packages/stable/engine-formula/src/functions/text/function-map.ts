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
import { Find } from './find';
import { Findb } from './findb';
import { Fixed } from './fixed';
import { FUNCTION_NAMES_TEXT } from './function-names';
import { Left } from './left';
import { Leftb } from './leftb';
import { Len } from './len';
import { Lenb } from './lenb';
import { Lower } from './lower';
import { Mid } from './mid';
import { Midb } from './midb';
import { Numberstring } from './numberstring';
import { Numbervalue } from './numbervalue';
import { Proper } from './proper';
import { Regexextract } from './regexextract';
import { Regexmatch } from './regexmatch';
import { Regexreplace } from './regexreplace';
import { Replace } from './replace';
import { Replaceb } from './replaceb';
import { Rept } from './rept';
import { Right } from './right';
import { Rightb } from './rightb';
import { Search } from './search';
import { Searchb } from './searchb';
import { Substitute } from './substitute';
import { T } from './t';
import { Text } from './text';
import { Textafter } from './textafter';
import { Textbefore } from './textbefore';
import { Textjoin } from './textjoin';
import { Textsplit } from './textsplit';
import { Trim } from './trim';
import { Unichar } from './unichar';
import { Unicode } from './unicode';
import { Upper } from './upper';
import { Value } from './value';
import { Valuetotext } from './valuetotext';

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
    [Find, FUNCTION_NAMES_TEXT.FIND],
    [Findb, FUNCTION_NAMES_TEXT.FINDB],
    [Fixed, FUNCTION_NAMES_TEXT.FIXED],
    [Left, FUNCTION_NAMES_TEXT.LEFT],
    [Leftb, FUNCTION_NAMES_TEXT.LEFTB],
    [Len, FUNCTION_NAMES_TEXT.LEN],
    [Lenb, FUNCTION_NAMES_TEXT.LENB],
    [Lower, FUNCTION_NAMES_TEXT.LOWER],
    [Mid, FUNCTION_NAMES_TEXT.MID],
    [Midb, FUNCTION_NAMES_TEXT.MIDB],
    [Numberstring, FUNCTION_NAMES_TEXT.NUMBERSTRING],
    [Numbervalue, FUNCTION_NAMES_TEXT.NUMBERVALUE],
    [Regexextract, FUNCTION_NAMES_TEXT.REGEXEXTRACT],
    [Regexmatch, FUNCTION_NAMES_TEXT.REGEXMATCH],
    [Regexreplace, FUNCTION_NAMES_TEXT.REGEXREPLACE],
    [Proper, FUNCTION_NAMES_TEXT.PROPER],
    [Replace, FUNCTION_NAMES_TEXT.REPLACE],
    [Replaceb, FUNCTION_NAMES_TEXT.REPLACEB],
    [Rept, FUNCTION_NAMES_TEXT.REPT],
    [Right, FUNCTION_NAMES_TEXT.RIGHT],
    [Rightb, FUNCTION_NAMES_TEXT.RIGHTB],
    [Search, FUNCTION_NAMES_TEXT.SEARCH],
    [Searchb, FUNCTION_NAMES_TEXT.SEARCHB],
    [Substitute, FUNCTION_NAMES_TEXT.SUBSTITUTE],
    [T, FUNCTION_NAMES_TEXT.T],
    [Text, FUNCTION_NAMES_TEXT.TEXT],
    [Textafter, FUNCTION_NAMES_TEXT.TEXTAFTER],
    [Textbefore, FUNCTION_NAMES_TEXT.TEXTBEFORE],
    [Textjoin, FUNCTION_NAMES_TEXT.TEXTJOIN],
    [Textsplit, FUNCTION_NAMES_TEXT.TEXTSPLIT],
    [Trim, FUNCTION_NAMES_TEXT.TRIM],
    [Unichar, FUNCTION_NAMES_TEXT.UNICHAR],
    [Unicode, FUNCTION_NAMES_TEXT.UNICODE],
    [Upper, FUNCTION_NAMES_TEXT.UPPER],
    [Value, FUNCTION_NAMES_TEXT.VALUE],
    [Valuetotext, FUNCTION_NAMES_TEXT.VALUETOTEXT],
];

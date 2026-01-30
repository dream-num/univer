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

import type { IFunctionNames } from '../basics/function';

import { FUNCTION_NAMES_DATE } from './date/function-names';
import { FUNCTION_NAMES_INFORMATION } from './information/function-names';
import { FUNCTION_NAMES_LOGICAL } from './logical/function-names';
import { FUNCTION_NAMES_LOOKUP } from './lookup/function-names';
import { FUNCTION_NAMES_MATH } from './math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from './statistical/function-names';
import { FUNCTION_NAMES_TEXT } from './text/function-names';

/**
 * Function names that can also appear as column identifiers
 * in full-column references like:
 *
 *   IF:IF, LOG:LOG, SIN:SIN
 *
 * NOTE:
 * Real validation must still rely on column label parsing (A..XFD).
 * This set is for parser edge cases / compatibility heuristics only.
 */
export const COLUMN_LIKE_FUNCTION_NAMES = new Set<IFunctionNames>([
    FUNCTION_NAMES_INFORMATION.N,
    // Logical
    FUNCTION_NAMES_LOGICAL.IF,
    FUNCTION_NAMES_LOGICAL.OR,
    FUNCTION_NAMES_LOGICAL.AND,
    FUNCTION_NAMES_LOGICAL.NOT,

    // Math / trig / numeric
    FUNCTION_NAMES_MATH.LOG,
    FUNCTION_NAMES_MATH.LN,
    FUNCTION_NAMES_MATH.PI,
    FUNCTION_NAMES_MATH.COS,
    FUNCTION_NAMES_MATH.SIN,
    FUNCTION_NAMES_MATH.TAN,
    FUNCTION_NAMES_MATH.EXP,
    FUNCTION_NAMES_STATISTICAL.MIN,
    FUNCTION_NAMES_STATISTICAL.MAX,
    FUNCTION_NAMES_MATH.MOD,
    FUNCTION_NAMES_MATH.ABS,
    FUNCTION_NAMES_MATH.ROUND,
    FUNCTION_NAMES_MATH.POWER,

    // Information
    FUNCTION_NAMES_LOOKUP.ROW,
    FUNCTION_NAMES_INFORMATION.TYPE,
    FUNCTION_NAMES_INFORMATION.NA,
    FUNCTION_NAMES_INFORMATION.ERROR_TYPE,
    FUNCTION_NAMES_INFORMATION.CELL,
    FUNCTION_NAMES_INFORMATION.INFO,

    // Text
    FUNCTION_NAMES_TEXT.TEXT,
    FUNCTION_NAMES_TEXT.LEFT,
    FUNCTION_NAMES_TEXT.RIGHT,
    FUNCTION_NAMES_TEXT.MID,
    FUNCTION_NAMES_TEXT.VALUE,
    FUNCTION_NAMES_TEXT.T,
    FUNCTION_NAMES_TEXT.LEN,
    FUNCTION_NAMES_TEXT.TRIM,
    FUNCTION_NAMES_TEXT.UPPER,
    FUNCTION_NAMES_TEXT.LOWER,
    FUNCTION_NAMES_TEXT.PROPER,
    FUNCTION_NAMES_TEXT.CLEAN,
    FUNCTION_NAMES_TEXT.SUBSTITUTE,
    FUNCTION_NAMES_TEXT.REPT,
    FUNCTION_NAMES_TEXT.FIND,
    FUNCTION_NAMES_TEXT.SEARCH,
    FUNCTION_NAMES_TEXT.CODE,
    FUNCTION_NAMES_TEXT.CHAR,
    FUNCTION_NAMES_TEXT.EXACT,

    // Date / time
    FUNCTION_NAMES_DATE.DATE,
    FUNCTION_NAMES_DATE.TIME,
]);

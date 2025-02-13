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

import { prefixToken, suffixToken } from './token';

// export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*\\]';
// export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*?\\]';
// export const UNIT_NAME_REGEX = '\\[((?![\\/?:"<>|*\\\\]).)*?\\]';

export const UNIT_NAME_REGEX = '\\[([^\\[\\]\\/?:"<>|*\\\\]+)\\]'; // '[Book-1.xlsx]Sheet1'!$A$4 gets [Book-1.xlsx] as unitId

export const UNIT_NAME_REGEX_PRECOMPILING = new RegExp(UNIT_NAME_REGEX);

export const SHEET_NAME_REGEX = '((?![\\[\\]\\/?*\\\\]).)*!';

export const ABSOLUTE_SYMBOL = '$';

export const RANGE_SYMBOL = '\\s*?:\\s*?';

// Column numbers range from A to Z, and row numbers start at 1
const COLUMN_REGEX = '[A-Za-z]+';
const ROW_REGEX = '[1-9][0-9]*';

export const UNIT_NAME_SHEET_NAME_REGEX = `'?(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?'?`;

export const SIMPLE_SINGLE_RANGE_REGEX = `\\${ABSOLUTE_SYMBOL}?${COLUMN_REGEX}\\${ABSOLUTE_SYMBOL}?${ROW_REGEX}`;

export const REFERENCE_MULTIPLE_RANGE_REGEX = `^(${prefixToken.AT})?${UNIT_NAME_SHEET_NAME_REGEX}${SIMPLE_SINGLE_RANGE_REGEX}${RANGE_SYMBOL}${SIMPLE_SINGLE_RANGE_REGEX}$`;

export const REFERENCE_MULTIPLE_RANGE_REGEX_PRECOMPILING = new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX);

export const REFERENCE_SINGLE_RANGE_REGEX = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?${SIMPLE_SINGLE_RANGE_REGEX}(${suffixToken.POUND})?$`;

export const REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING = new RegExp(REFERENCE_SINGLE_RANGE_REGEX);

export const REFERENCE_REGEX_ROW = `^${UNIT_NAME_SHEET_NAME_REGEX}\\${ABSOLUTE_SYMBOL}?${ROW_REGEX}${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?${ROW_REGEX}$`;

export const REFERENCE_REGEX_ROW_PRECOMPILING = new RegExp(REFERENCE_REGEX_ROW);

export const REFERENCE_REGEX_COLUMN = `^${UNIT_NAME_SHEET_NAME_REGEX}\\${ABSOLUTE_SYMBOL}?${COLUMN_REGEX}${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?${COLUMN_REGEX}$`;

export const REFERENCE_REGEX_COLUMN_PRECOMPILING = new RegExp(REFERENCE_REGEX_COLUMN);

export const REFERENCE_REGEX_SINGLE_ROW = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?\\${ABSOLUTE_SYMBOL}?${ROW_REGEX}$`;

export const REFERENCE_REGEX_SINGLE_ROW_PRECOMPILING = new RegExp(REFERENCE_REGEX_SINGLE_ROW);

export const REFERENCE_REGEX_SINGLE_COLUMN = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?\\${ABSOLUTE_SYMBOL}?${COLUMN_REGEX}$`;

export const REFERENCE_REGEX_SINGLE_COLUMN_PRECOMPILING = new RegExp(REFERENCE_REGEX_SINGLE_COLUMN);

const TABLE_NAME_REGEX = '((?![~!@#$%^&*()_+<>?:,./;’，。、‘：“《》？~！@#￥%……（）【】\\[\\]\\/\\\\]).)+';

const TABLE_TITLE_REGEX = '\\[#.+\\]\\s*?,\\s*?';

const TABLE_CONTENT_REGEX = '\\[((?<!#).)*\\]';

const TABLE_MULTIPLE_COLUMN_REGEX = `${TABLE_CONTENT_REGEX}${RANGE_SYMBOL}${TABLE_CONTENT_REGEX}`;

export const REFERENCE_TABLE_ALL_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}$`;

export const REFERENCE_TABLE_SINGLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(${TABLE_CONTENT_REGEX}|\\[${TABLE_TITLE_REGEX}${TABLE_CONTENT_REGEX}\\])+$`; // =Table1[Column1] | =Table1[[#Title],[Column1]]

export const REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(\\[${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$|^${TABLE_NAME_REGEX}(\\[${TABLE_TITLE_REGEX}${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$`; // =Table1[[#Title],[Column1]:[Column2]] | =Table1[[Column1]:[Column2]]

export const SUPER_TABLE_COLUMN_REGEX = '[.*?]';

export const SUPER_TABLE_COLUMN_REGEX_PRECOMPILING = new RegExp(SUPER_TABLE_COLUMN_REGEX, 'g');

export const ARRAY_VALUE_REGEX = '{.*?}';

export const ARRAY_VALUE_REGEX_PRECOMPILING = new RegExp(ARRAY_VALUE_REGEX, 'g');

export function regexTestSingeRange(token: string): boolean {
    REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.lastIndex = 0;
    return REFERENCE_SINGLE_RANGE_REGEX_PRECOMPILING.test(token);
}

export function regexTestMultipleRange(token: string): boolean {
    REFERENCE_MULTIPLE_RANGE_REGEX_PRECOMPILING.lastIndex = 0;
    return REFERENCE_MULTIPLE_RANGE_REGEX_PRECOMPILING.test(token);
}

export function regexTestRow(token: string): boolean {
    REFERENCE_REGEX_ROW_PRECOMPILING.lastIndex = 0;
    return REFERENCE_REGEX_ROW_PRECOMPILING.test(token);
}

export function regexTestColumn(token: string): boolean {
    REFERENCE_REGEX_COLUMN_PRECOMPILING.lastIndex = 0;
    return REFERENCE_REGEX_COLUMN_PRECOMPILING.test(token);
}

export function regexTestSingleRow(token: string): boolean {
    REFERENCE_REGEX_SINGLE_ROW_PRECOMPILING.lastIndex = 0;
    return REFERENCE_REGEX_SINGLE_ROW_PRECOMPILING.test(token);
}

export function regexTestSingleColumn(token: string): boolean {
    REFERENCE_REGEX_SINGLE_COLUMN_PRECOMPILING.lastIndex = 0;
    return REFERENCE_REGEX_SINGLE_COLUMN_PRECOMPILING.test(token);
}

export function regexTestSuperTableColumn(token: string): boolean {
    SUPER_TABLE_COLUMN_REGEX_PRECOMPILING.lastIndex = 0;
    return SUPER_TABLE_COLUMN_REGEX_PRECOMPILING.test(token);
}

export function regexTestArrayValue(token: string): boolean {
    ARRAY_VALUE_REGEX_PRECOMPILING.lastIndex = 0;
    return ARRAY_VALUE_REGEX_PRECOMPILING.test(token);
}

export function isReferenceString(refString: string) {
    return (
        regexTestSingeRange(refString) ||
        regexTestMultipleRange(refString) ||
        regexTestRow(refString) ||
        regexTestColumn(refString)
    );
}

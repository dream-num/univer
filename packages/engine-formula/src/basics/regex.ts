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

import { prefixToken, suffixToken } from './token';

// export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*\\]';
// export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*?\\]';
// export const UNIT_NAME_REGEX = '\\[((?![\\/?:"<>|*\\\\]).)*?\\]';

export const UNIT_NAME_REGEX = '\\[([^\\[\\]\\/?:"<>|*\\\\]+)\\]'; // '[Book-1.xlsx]Sheet1'!$A$4 gets [Book-1.xlsx] as unitId

export const SHEET_NAME_REGEX = '((?![\\[\\]\\/?*\\\\]).)*!';

export const ABSOLUTE_SYMBOL = '$';

export const RANGE_SYMBOL = '\\s*?:\\s*?';

export const UNIT_NAME_SHEET_NAME_REGEX = `'?(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?'?`;

export const SIMPLE_SINGLE_RANGE_REGEX = `\\${ABSOLUTE_SYMBOL}?[A-Za-z]+\\${ABSOLUTE_SYMBOL}?[0-9]+`;

export const REFERENCE_MULTIPLE_RANGE_REGEX = `^(${prefixToken.AT})?${UNIT_NAME_SHEET_NAME_REGEX}${SIMPLE_SINGLE_RANGE_REGEX}${RANGE_SYMBOL}${SIMPLE_SINGLE_RANGE_REGEX}$`;

export const REFERENCE_SINGLE_RANGE_REGEX = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?${SIMPLE_SINGLE_RANGE_REGEX}(${suffixToken.POUND})?$`;

export const REFERENCE_REGEX_ROW = `^${UNIT_NAME_SHEET_NAME_REGEX}\\${ABSOLUTE_SYMBOL}?[0-9]+${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?[0-9]+$`;

export const REFERENCE_REGEX_COLUMN = `^${UNIT_NAME_SHEET_NAME_REGEX}\\${ABSOLUTE_SYMBOL}?[A-Za-z]+${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?[A-Za-z]+$`;

export const REFERENCE_REGEX_SINGLE_ROW = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?\\${ABSOLUTE_SYMBOL}?[0-9]+$`;

export const REFERENCE_REGEX_SINGLE_COLUMN = `^${UNIT_NAME_SHEET_NAME_REGEX}\\s*?\\${ABSOLUTE_SYMBOL}?[A-Za-z]+$`;

const TABLE_NAME_REGEX = '((?![~!@#$%^&*()_+<>?:,./;’，。、‘：“《》？~！@#￥%……（）【】\\[\\]\\/\\\\]).)+';

const TABLE_TITLE_REGEX = '\\[#.+\\]\\s*?,\\s*?';

const TABLE_CONTENT_REGEX = '\\[((?<!#).)*\\]';

const TABLE_MULTIPLE_COLUMN_REGEX = `${TABLE_CONTENT_REGEX}${RANGE_SYMBOL}${TABLE_CONTENT_REGEX}`;

export const REFERENCE_TABLE_ALL_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}$`;

export const REFERENCE_TABLE_SINGLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(${TABLE_CONTENT_REGEX}|\\[${TABLE_TITLE_REGEX}${TABLE_CONTENT_REGEX}\\])+$`; // =Table1[Column1] | =Table1[[#Title],[Column1]]

export const REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(\\[${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$|^${TABLE_NAME_REGEX}(\\[${TABLE_TITLE_REGEX}${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$`; // =Table1[[#Title],[Column1]:[Column2]] | =Table1[[Column1]:[Column2]]

export const $SUPER_TABLE_COLUMN_REGEX = '[.*?]';

export const $ARRAY_VALUE_REGEX = '{.*?}';

export function isReferenceString(refString: string) {
    return (
        new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(refString) ||
        new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX).test(refString) ||
        new RegExp(REFERENCE_REGEX_ROW).test(refString) ||
        new RegExp(REFERENCE_REGEX_COLUMN).test(refString)
    );
}

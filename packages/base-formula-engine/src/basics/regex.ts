import { prefixToken, suffixToken } from './token';

export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*\\]';

export const SHEET_NAME_REGEX = '((?![\\[\\]\\/?*\\\\]).)*!';

export const ABSOLUTE_SYMBOL = '$';

export const RANGE_SYMBOL = '\\s*?:\\s*?';

export const SIMPLE_SINGLE_RANGE_REGEX = `\\${ABSOLUTE_SYMBOL}?[A-Za-z]+\\${ABSOLUTE_SYMBOL}?[0-9]+`;

export const REFERENCE_MULTIPLE_RANGE_REGEX = `^(${prefixToken.AT})?(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?${SIMPLE_SINGLE_RANGE_REGEX}${RANGE_SYMBOL}${SIMPLE_SINGLE_RANGE_REGEX}$`;

export const REFERENCE_SINGLE_RANGE_REGEX = `^(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?\\s*?${SIMPLE_SINGLE_RANGE_REGEX}(${suffixToken.POUND})?$`;

export const REFERENCE_REGEX_ROW = `^(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?\\${ABSOLUTE_SYMBOL}?[0-9]+${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?[0-9]+$`;

export const REFERENCE_REGEX_COLUMN = `^(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?\\${ABSOLUTE_SYMBOL}?[A-Za-z]+${RANGE_SYMBOL}\\${ABSOLUTE_SYMBOL}?[A-Za-z]+$`;

export const REFERENCE_REGEX_SINGLE_ROW = `^(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?\\s*?\\${ABSOLUTE_SYMBOL}?[0-9]+$`;

export const REFERENCE_REGEX_SINGLE_COLUMN = `^(${UNIT_NAME_REGEX})?(${SHEET_NAME_REGEX})?\\s*?\\${ABSOLUTE_SYMBOL}?[A-Za-z]+$`;

const TABLE_NAME_REGEX = `((?![~!@#$%^&*()_+<>?:,./;’，。、‘：“《》？~！@#￥%……（）【】\\[\\]\\/\\\\]).)+`;

const TABLE_TITLE_REGEX = `\\[#.+\\]\\s*?,\\s*?`;

const TABLE_CONTENT_REGEX = `\\[((?<!#).)*\\]`;

const TABLE_MULTIPLE_COLUMN_REGEX = `${TABLE_CONTENT_REGEX}${RANGE_SYMBOL}${TABLE_CONTENT_REGEX}`;

export const REFERENCE_TABLE_ALL_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}$`;

export const REFERENCE_TABLE_SINGLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(${TABLE_CONTENT_REGEX}|\\[${TABLE_TITLE_REGEX}${TABLE_CONTENT_REGEX}\\])+$`; // =Table1[Column1] | =Table1[[#Title],[Column1]]

export const REFERENCE_TABLE_MULTIPLE_COLUMN_REGEX = `^(${UNIT_NAME_REGEX})?${TABLE_NAME_REGEX}(\\[${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$|^${TABLE_NAME_REGEX}(\\[${TABLE_TITLE_REGEX}${TABLE_MULTIPLE_COLUMN_REGEX}\\])?$`; // =Table1[[#Title],[Column1]:[Column2]] | =Table1[[Column1]:[Column2]]

export const $SUPER_TABLE_COLUMN_REGEX = /[.*?]/g;

export const $ARRAY_VALUE_REGEX = /{.*?}/g;

export function isReferenceString(refString: string) {
    return (
        new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(refString) ||
        new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX).test(refString) ||
        new RegExp(REFERENCE_REGEX_ROW).test(refString) ||
        new RegExp(REFERENCE_REGEX_COLUMN).test(refString)
    );
}

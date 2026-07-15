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

export const u_YEAR = 2;
export const u_MONTH = 2 ** 2;
export const u_DAY = 2 ** 3;
export const u_HOUR = 2 ** 4;
export const u_MIN = 2 ** 5;
export const u_SEC = 2 ** 6;
export const u_DSEC = 2 ** 7; // decisecond
export const u_CSEC = 2 ** 8; // centisecond
export const u_MSEC = 2 ** 9; // millisecond

// Excel date boundaries
export const MIN_S_DATE = 0;
export const MAX_S_DATE = 2958466;
// Google date boundaries
export const MIN_L_DATE = -694324;
export const MAX_L_DATE = 35830291;

// if more calendars are added, they should conform to MS CALID identifiers
// https://docs.microsoft.com/en-us/windows/win32/intl/calendar-identifiers
export const EPOCH_1904 = -1;
export const EPOCH_1900 = 1;
export const EPOCH_1317 = 6;

export const TOKEN_GENERAL = 'general';
export const TOKEN_HASH = 'hash';
export const TOKEN_ZERO = 'zero';
export const TOKEN_QMARK = 'qmark';
export const TOKEN_SLASH = 'slash';
export const TOKEN_GROUP = 'group';
export const TOKEN_SCALE = 'scale';
export const TOKEN_COMMA = 'comma';
export const TOKEN_BREAK = 'break';
export const TOKEN_TEXT = 'text';
export const TOKEN_PLUS = 'plus';
export const TOKEN_MINUS = 'minus';
export const TOKEN_POINT = 'point';
export const TOKEN_SPACE = 'space';
export const TOKEN_PERCENT = 'percent';
export const TOKEN_DIGIT = 'digit';
export const TOKEN_CALENDAR = 'calendar';
export const TOKEN_ERROR = 'error';
export const TOKEN_DATETIME = 'datetime';
export const TOKEN_DURATION = 'duration';
export const TOKEN_CONDITION = 'condition';
export const TOKEN_DBNUM = 'dbnum';
export const TOKEN_NATNUM = 'natnum';
export const TOKEN_LOCALE = 'locale';
export const TOKEN_COLOR = 'color';
export const TOKEN_MODIFIER = 'modifier';
export const TOKEN_AMPM = 'ampm';
export const TOKEN_ESCAPED = 'escaped';
export const TOKEN_STRING = 'string';
export const TOKEN_SKIP = 'skip';
export const TOKEN_EXP = 'exp';
export const TOKEN_FILL = 'fill';
export const TOKEN_PAREN = 'paren';
export const TOKEN_CHAR = 'char';

export const indexColors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#800000',
    '#008000',
    '#000080',
    '#808000',
    '#800080',
    '#008080',
    '#C0C0C0',
    '#808080',
    '#9999FF',
    '#993366',
    '#FFFFCC',
    '#CCFFFF',
    '#660066',
    '#FF8080',
    '#0066CC',
    '#CCCCFF',
    '#000080',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
    '#800080',
    '#800000',
    '#008080',
    '#0000FF',
    '#00CCFF',
    '#CCFFFF',
    '#CCFFCC',
    '#FFFF99',
    '#99CCFF',
    '#FF99CC',
    '#CC99FF',
    '#FFCC99',
    '#3366FF',
    '#33CCCC',
    '#99CC00',
    '#FFCC00',
    '#FF9900',
    '#FF6600',
    '#666699',
    '#969696',
    '#003366',
    '#339966',
    '#003300',
    '#333300',
    '#993300',
    '#993366',
    '#333399',
    '#333333',
];

export const currencySymbols = [
    '¤',
    '$',
    '£',
    '¥',
    '֏',
    '؋',
    '৳',
    '฿',
    '៛',
    '₡',
    '₦',
    '₩',
    '₪',
    '₫',
    '€',
    '₭',
    '₮',
    '₱',
    '₲',
    '₴',
    '₸',
    '₹',
    '₺',
    '₼',
    '₽',
    '₾',
    '₿',
];

export const reCurrencySymbols = new RegExp(`[${currencySymbols.join('')}]`);

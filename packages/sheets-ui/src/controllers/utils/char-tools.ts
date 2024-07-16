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

import { LocaleType } from '@univerjs/core';

const fullWidthToHalfWidthMap: { [key: string]: string } = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    Ａ: 'A', Ｂ: 'B', Ｃ: 'C', Ｄ: 'D', Ｅ: 'E',
    Ｆ: 'F', Ｇ: 'G', Ｈ: 'H', Ｉ: 'I', Ｊ: 'J',
    Ｋ: 'K', Ｌ: 'L', Ｍ: 'M', Ｎ: 'N', Ｏ: 'O',
    Ｐ: 'P', Ｑ: 'Q', Ｒ: 'R', Ｓ: 'S', Ｔ: 'T',
    Ｕ: 'U', Ｖ: 'V', Ｗ: 'W', Ｘ: 'X', Ｙ: 'Y',
    Ｚ: 'Z', ａ: 'a', ｂ: 'b', ｃ: 'c', ｄ: 'd',
    ｅ: 'e', ｆ: 'f', ｇ: 'g', ｈ: 'h', ｉ: 'i',
    ｊ: 'j', ｋ: 'k', ｌ: 'l', ｍ: 'm', ｎ: 'n',
    ｏ: 'o', ｐ: 'p', ｑ: 'q', ｒ: 'r', ｓ: 's',
    ｔ: 't', ｕ: 'u', ｖ: 'v', ｗ: 'w', ｘ: 'x',
    ｙ: 'y', ｚ: 'z', '％': '%', '－': '-', '．': '.',
    '：': ':', '／': '/', '＋': '+', '＠': '@', '＆': '&',
    '＊': '*', '＃': '#', '＝': '=', '＞': '>', '＜': '<',
    '＄': '$', '＂': '"', '＇': "'", '（': '(', '）': ')', '　': ' ',
    '，': ',', '！': '!', '？': '?', '；': ';', '［': '[', '］': ']',
    '｛': '{', '｝': '}',
};

// Full-width character conversion function
export function toHalfWidth(char: string): string {
    return fullWidthToHalfWidthMap[char] || char;
}

// Boolean conversion
export const booleanMap: { [key: string]: string } = {
    true: 'TRUE',
    false: 'FALSE',
};

// TODO@Dushusir: add more locales
export function isCJKLocale(locale: LocaleType) {
    return [LocaleType.ZH_CN, LocaleType.ZH_TW].includes(locale);
}

export function replaceString(replacedString: string, normalStr: string, startIndex: number, endIndex: number): string {
    return normalStr.substring(0, startIndex) + replacedString + normalStr.substring(endIndex);
}

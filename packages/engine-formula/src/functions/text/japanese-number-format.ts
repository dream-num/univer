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

import { formatExcelFixedDecimal } from './excel-fixed-decimal';

const JAPANESE_DIGITS = ['〇一二三四五六七八九', '〇壱弐参四伍六七八九', '０１２３４５６７８９'];

export function formatJapaneseGeneral(number: number, general: string, mode: number): string {
    const digits = JAPANESE_DIGITS[mode - 1];
    const [mantissa, exponent] = general.split(/[eE]/);
    const places = Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent ?? '0'));
    const [whole, fraction] = formatExcelFixedDecimal(Math.abs(number), places, false).split('.');
    const units = mode === 2 ? ['', '拾', '百', '阡'] : ['', '十', '百', '千'];
    const scale = ['', mode === 2 ? '萬' : '万', '億', '兆'];
    const mapDigits = (text: string) => text.replace(/\d/g, (digit) => digits[Number(digit)]);
    let result = number < 0 ? '-' : '';
    let index = 0;
    if (whole.length > 16) {
        index = whole.length - 12;
        result += `${mapDigits(whole.slice(0, index))}兆`;
    }
    if (whole === '0') result += digits[0];
    let group = '';
    for (; index < whole.length; index++) {
        const digit = Number(whole[index]);
        const power = whole.length - index - 1;
        const unit = power % 4;
        if (digit !== 0) group += `${digit !== 1 || unit === 0 || mode === 2 ? digits[digit] : ''}${units[unit]}`;
        if (unit === 0 && group) {
            result += group + scale[Math.floor(power / 4)];
            group = '';
        }
    }
    return fraction ? `${result}.${mapDigits(fraction)}` : result;
}

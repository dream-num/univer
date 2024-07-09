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

export function toYMD_1900(ord: number, leap1900 = true) {
    if (leap1900 && ord >= 0) {
        if (ord === 0) {
            return [1900, 1, 0];
        }
        if (ord === 60) {
            return [1900, 2, 29];
        }
        if (ord < 60) {
            return [1900, (ord < 32 ? 1 : 2), ((ord - 1) % 31) + 1];
        }
    }
    let l = ord + 68569 + 2415019;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const nDay = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const nMonth = j + 2 - (12 * l);
    const nYear = 100 * (n - 49) + i + l;
    return [nYear | 0, nMonth | 0, nDay | 0];
}

export function excelSerialToUnixTimestamp(excelSerial: number) {
    const date = new Date((excelSerial - 25569) * 86400);
    return date.getTime();
}

export const timestamp2SerialTime = (timestamp: number) => {
    return (timestamp / 86400) + 25569;
};

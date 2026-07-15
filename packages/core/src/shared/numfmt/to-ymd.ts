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

import type { DateParts } from './types';
import { EPOCH_1317, EPOCH_1904 } from './constants';

const floor = Math.floor;

// https://www.codeproject.com/Articles/2750/Excel-Serial-Date-to-Day-Month-Year-and-Vice-Versa
export function toYMD1900(serial: number, leap1900: boolean = true): DateParts {
    if (leap1900 && serial >= 0) {
        if (serial === 0) {
            return [1900, 1, 0];
        }
        if (serial === 60) {
            return [1900, 2, 29];
        }
        if (serial < 60) {
            return [1900, serial < 32 ? 1 : 2, ((serial - 1) % 31) + 1];
        }
    }
    let l = serial + 68569 + 2415019;
    const n = floor((4 * l) / 146097);
    l -= floor((146097 * n + 3) / 4);
    const i = floor((4000 * (l + 1)) / 1461001);
    l = l - floor((1461 * i) / 4) + 31;
    const j = floor((80 * l) / 2447);
    const nDay = l - floor((2447 * j) / 80);
    l = floor(j / 11);
    const nMonth = j + 2 - (12 * l);
    const nYear = 100 * (n - 49) + i + l;
    return [nYear | 0, nMonth | 0, nDay | 0];
}

export function toYMD1904(serial: number): DateParts {
    return toYMD1900(serial + 1462);
}

// https://web.archive.org/web/20080209173858/https://www.microsoft.com/globaldev/DrIntl/columns/002/default.mspx
// > [algorithm] is used in many Microsoft products, including all
// > operating systems that support Arabic locales, Microsoft Office,
// > COM, Visual Basic, VBA, and SQL Server 2000.
export function toYMD1317(serial: number): DateParts {
    if (serial === 60) {
        throw new Error('#VALUE!');
    }
    if (serial <= 1) {
        return [1317, 8, 29];
    }
    if (serial < 60) {
        return [1317, serial < 32 ? 9 : 10, 1 + ((serial - 2) % 30)];
    }
    const y = 10631 / 30;
    const shift1 = 8.01 / 60;
    let z = serial + 466935;
    const cyc = floor(z / 10631);
    z -= 10631 * cyc;
    const j = floor((z - shift1) / y);
    z -= floor(j * y + shift1);
    const m = floor((z + 28.5001) / 29.5);
    if (m === 13) {
        return [30 * cyc + j, 12, 30];
    }
    return [30 * cyc + j, m, z - floor(29.5001 * m - 29)];
}

export function toYMD(serial: number, system: number = 0, leap1900: boolean = true): DateParts {
    const int = floor(serial);
    if (system === EPOCH_1317) {
        return toYMD1317(int);
    }
    if (system === EPOCH_1904) {
        return toYMD1904(int);
    }
    return toYMD1900(int, leap1900);
}

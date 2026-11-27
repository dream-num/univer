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

import { DateSystem, excelDateSerial, excelSerialToDate } from '@univerjs/core';
import { getDaysInYear } from '../../basics/date';

export function isExcelTBillPeriod(settlement: number, maturity: number, dateSystem: DateSystem): boolean {
    const start = Math.floor(settlement);
    const end = Math.floor(maturity);
    const days = end - start;
    if (start < 0 || days < 1 || days > 366) return false;
    if (days <= 365) return true;

    const firstYear = excelSerialToDate(start, dateSystem).getUTCFullYear();
    const lastYear = excelSerialToDate(end, dateSystem).getUTCFullYear();
    // The leap day extends the term only when included in [settlement, maturity).
    for (let year = firstYear; year <= lastYear; year++) {
        if (getDaysInYear(year) !== 366) continue;
        const leapDay = year === 1900 && dateSystem === DateSystem.Date1900
            ? 60
            : excelDateSerial(new Date(Date.UTC(year, 1, 29)), dateSystem);
        if (start <= leapDay && leapDay < end) return true;
    }
    return false;
}

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

import { dateM1, dateM10, dateM11, dateM12, dateM2, dateM3, dateM4, dateM5, dateM6, dateM7, dateM8, dateM9, dateQ1, dateQ2, dateQ3, dateQ4 } from './dateGenerator';
import { groupByDay, groupByHour, groupByMinute, groupByMonth, groupByYear } from './dateGroupGenerator';
import { textEqual } from './textFuncGenerator';
import type { CompareFunc, CompareType } from './types';
import { DateCompareTypeEnum, DateGroupCompareTypeEnum, TextCompareTypeEnum } from './types';

export const compareFunctionGenerator = (compareType: CompareType): CompareFunc => {
    switch (compareType) {
        case TextCompareTypeEnum.textNotEqual:
            return textEqual;
        case DateCompareTypeEnum.Q1:
            return dateQ1;
        case DateCompareTypeEnum.Q2:
            return dateQ2;
        case DateCompareTypeEnum.Q3:
            return dateQ3;
        case DateCompareTypeEnum.Q4:
            return dateQ4;
        case DateCompareTypeEnum.M1:
            return dateM1;
        case DateCompareTypeEnum.M2:
            return dateM2;
        case DateCompareTypeEnum.M3:
            return dateM3;
        case DateCompareTypeEnum.M4:
            return dateM4;
        case DateCompareTypeEnum.M5:
            return dateM5;
        case DateCompareTypeEnum.M6:
            return dateM6;
        case DateCompareTypeEnum.M7:
            return dateM7;
        case DateCompareTypeEnum.M8:
            return dateM8;
        case DateCompareTypeEnum.M9:
            return dateM9;
        case DateCompareTypeEnum.M10:
            return dateM10;
        case DateCompareTypeEnum.M11:
            return dateM11;
        case DateCompareTypeEnum.M12:
            return dateM12;
        case DateGroupCompareTypeEnum.year:
            return groupByYear;
        case DateGroupCompareTypeEnum.month:
            return groupByMonth;
        case DateGroupCompareTypeEnum.day:
            return groupByDay;
        case DateGroupCompareTypeEnum.hour:
            return groupByHour;
        case DateGroupCompareTypeEnum.minute:
            return groupByMinute;
    }
    return () => true;
};


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

import { DateFunction } from './date';
import { Datevalue } from './datevalue';
import { Day } from './day';
import { Edate } from './edate';
import { FUNCTION_NAMES_DATE } from './function-names';
import { Month } from './month';
import { Now } from './now';
import { Time } from './time';
import { Timevalue } from './timevalue';
import { Today } from './today';
import { Year } from './year';

export const functionDate = [
    [DateFunction, FUNCTION_NAMES_DATE.DATE],
    [Datevalue, FUNCTION_NAMES_DATE.DATEVALUE],
    [Day, FUNCTION_NAMES_DATE.DAY],
    [Edate, FUNCTION_NAMES_DATE.EDATE],
    [Month, FUNCTION_NAMES_DATE.MONTH],
    [Now, FUNCTION_NAMES_DATE.NOW],
    [Time, FUNCTION_NAMES_DATE.TIME],
    [Timevalue, FUNCTION_NAMES_DATE.TIMEVALUE],
    [Today, FUNCTION_NAMES_DATE.TODAY],
    [Year, FUNCTION_NAMES_DATE.YEAR],
];

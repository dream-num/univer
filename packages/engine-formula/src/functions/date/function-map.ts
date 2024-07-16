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

import { FUNCTION_NAMES_DATE } from './function-names';
import { DateFunction } from './date';
import { Datedif } from './datedif';
import { Datevalue } from './datevalue';
import { Day } from './day';
import { Days } from './days';
import { Days360 } from './days360';
import { Edate } from './edate';
import { Hour } from './hour';
import { Minute } from './minute';
import { Month } from './month';
import { Networkdays } from './networkdays';
import { NetworkdaysIntl } from './networkdays-intl';
import { Now } from './now';
import { Second } from './second';
import { Time } from './time';
import { Timevalue } from './timevalue';
import { Today } from './today';
import { Weekday } from './weekday';
import { Workday } from './workday';
import { WorkdayIntl } from './workday-intl';
import { Year } from './year';

export const functionDate = [
    [DateFunction, FUNCTION_NAMES_DATE.DATE],
    [Datedif, FUNCTION_NAMES_DATE.DATEDIF],
    [Datevalue, FUNCTION_NAMES_DATE.DATEVALUE],
    [Day, FUNCTION_NAMES_DATE.DAY],
    [Days, FUNCTION_NAMES_DATE.DAYS],
    [Days360, FUNCTION_NAMES_DATE.DAYS360],
    [Edate, FUNCTION_NAMES_DATE.EDATE],
    [Hour, FUNCTION_NAMES_DATE.HOUR],
    [Minute, FUNCTION_NAMES_DATE.MINUTE],
    [Month, FUNCTION_NAMES_DATE.MONTH],
    [Networkdays, FUNCTION_NAMES_DATE.NETWORKDAYS],
    [NetworkdaysIntl, FUNCTION_NAMES_DATE.NETWORKDAYS_INTL],
    [Now, FUNCTION_NAMES_DATE.NOW],
    [Second, FUNCTION_NAMES_DATE.SECOND],
    [Time, FUNCTION_NAMES_DATE.TIME],
    [Timevalue, FUNCTION_NAMES_DATE.TIMEVALUE],
    [Today, FUNCTION_NAMES_DATE.TODAY],
    [Weekday, FUNCTION_NAMES_DATE.WEEKDAY],
    [Workday, FUNCTION_NAMES_DATE.WORKDAY],
    [WorkdayIntl, FUNCTION_NAMES_DATE.WORKDAY_INTL],
    [Year, FUNCTION_NAMES_DATE.YEAR],
];

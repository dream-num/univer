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

import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FUNCTION_NAMES_DATE, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_DATE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_DATE.DATE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DATE.description',
        abstract: 'sheets-formula.functionList.DATE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DATE.functionParameter.year.name',
                detail: 'sheets-formula.functionList.DATE.functionParameter.year.detail',
                example: '2024',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DATE.functionParameter.month.name',
                detail: 'sheets-formula.functionList.DATE.functionParameter.month.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DATE.functionParameter.day.name',
                detail: 'sheets-formula.functionList.DATE.functionParameter.day.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DATEDIF,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DATEDIF.description',
        abstract: 'sheets-formula.functionList.DATEDIF.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DATEDIF.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.DATEDIF.functionParameter.startDate.detail',
                example: '"2001-6-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DATEDIF.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.DATEDIF.functionParameter.endDate.detail',
                example: '"2002-8-15"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DATEDIF.functionParameter.unit.name',
                detail: 'sheets-formula.functionList.DATEDIF.functionParameter.unit.detail',
                example: '"D"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DATEVALUE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DATEVALUE.description',
        abstract: 'sheets-formula.functionList.DATEVALUE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DATEVALUE.functionParameter.dateText.name',
                detail: 'sheets-formula.functionList.DATEVALUE.functionParameter.dateText.detail',
                example: '"2024-8-8"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAY,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DAY.description',
        abstract: 'sheets-formula.functionList.DAY.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DAY.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.DAY.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAYS,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DAYS.description',
        abstract: 'sheets-formula.functionList.DAYS.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DAYS.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.DAYS.functionParameter.endDate.detail',
                example: '"2021-12-31"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DAYS.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.DAYS.functionParameter.startDate.detail',
                example: '"2021-1-1"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAYS360,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.DAYS360.description',
        abstract: 'sheets-formula.functionList.DAYS360.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.DAYS360.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.DAYS360.functionParameter.startDate.detail',
                example: '"2021-1-29"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DAYS360.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.DAYS360.functionParameter.endDate.detail',
                example: '"2021-3-31"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.DAYS360.functionParameter.method.name',
                detail: 'sheets-formula.functionList.DAYS360.functionParameter.method.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EDATE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.EDATE.description',
        abstract: 'sheets-formula.functionList.EDATE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.EDATE.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.EDATE.functionParameter.startDate.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.EDATE.functionParameter.months.name',
                detail: 'sheets-formula.functionList.EDATE.functionParameter.months.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EOMONTH,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.EOMONTH.description',
        abstract: 'sheets-formula.functionList.EOMONTH.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.EOMONTH.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.EOMONTH.functionParameter.startDate.detail',
                example: '"2011-1-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.EOMONTH.functionParameter.months.name',
                detail: 'sheets-formula.functionList.EOMONTH.functionParameter.months.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EPOCHTODATE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.EPOCHTODATE.description',
        abstract: 'sheets-formula.functionList.EPOCHTODATE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.EPOCHTODATE.functionParameter.timestamp.name',
                detail: 'sheets-formula.functionList.EPOCHTODATE.functionParameter.timestamp.detail',
                example: '1655906710',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.EPOCHTODATE.functionParameter.unit.name',
                detail: 'sheets-formula.functionList.EPOCHTODATE.functionParameter.unit.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.HOUR,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.HOUR.description',
        abstract: 'sheets-formula.functionList.HOUR.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.HOUR.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.HOUR.functionParameter.serialNumber.detail',
                example: '"2011-7-18 7:45"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.ISOWEEKNUM,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.ISOWEEKNUM.description',
        abstract: 'sheets-formula.functionList.ISOWEEKNUM.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.ISOWEEKNUM.functionParameter.date.name',
                detail: 'sheets-formula.functionList.ISOWEEKNUM.functionParameter.date.detail',
                example: '"2012-3-9"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.MINUTE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.MINUTE.description',
        abstract: 'sheets-formula.functionList.MINUTE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.MINUTE.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.MINUTE.functionParameter.serialNumber.detail',
                example: '"12:45"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.MONTH,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.MONTH.description',
        abstract: 'sheets-formula.functionList.MONTH.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.MONTH.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.MONTH.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NETWORKDAYS,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.NETWORKDAYS.description',
        abstract: 'sheets-formula.functionList.NETWORKDAYS.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.startDate.detail',
                example: '"2012-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.endDate.detail',
                example: '"2013-3-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.holidays.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS.functionParameter.holidays.detail',
                example: '"2012-11-22"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NETWORKDAYS_INTL,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.NETWORKDAYS_INTL.description',
        abstract: 'sheets-formula.functionList.NETWORKDAYS_INTL.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.startDate.detail',
                example: '"2012-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.endDate.detail',
                example: '"2013-3-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.weekend.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.weekend.detail',
                example: '6',
                require: 0,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.holidays.name',
                detail: 'sheets-formula.functionList.NETWORKDAYS_INTL.functionParameter.holidays.detail',
                example: '"2012-11-22"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NOW,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.NOW.description',
        abstract: 'sheets-formula.functionList.NOW.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.SECOND,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.SECOND.description',
        abstract: 'sheets-formula.functionList.SECOND.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.SECOND.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.SECOND.functionParameter.serialNumber.detail',
                example: '"4:48:18"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TIME,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.TIME.description',
        abstract: 'sheets-formula.functionList.TIME.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.TIME.functionParameter.hour.name',
                detail: 'sheets-formula.functionList.TIME.functionParameter.hour.detail',
                example: '15',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.TIME.functionParameter.minute.name',
                detail: 'sheets-formula.functionList.TIME.functionParameter.minute.detail',
                example: '20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.TIME.functionParameter.second.name',
                detail: 'sheets-formula.functionList.TIME.functionParameter.second.detail',
                example: '59',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TIMEVALUE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.TIMEVALUE.description',
        abstract: 'sheets-formula.functionList.TIMEVALUE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.TIMEVALUE.functionParameter.timeText.name',
                detail: 'sheets-formula.functionList.TIMEVALUE.functionParameter.timeText.detail',
                example: '"15:20:59"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TO_DATE,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.TO_DATE.description',
        abstract: 'sheets-formula.functionList.TO_DATE.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.TO_DATE.functionParameter.value.name',
                detail: 'sheets-formula.functionList.TO_DATE.functionParameter.value.detail',
                example: '40826.4375',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TODAY,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.TODAY.description',
        abstract: 'sheets-formula.functionList.TODAY.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WEEKDAY,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.WEEKDAY.description',
        abstract: 'sheets-formula.functionList.WEEKDAY.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.WEEKDAY.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.WEEKDAY.functionParameter.serialNumber.detail',
                example: '"2008-2-14"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WEEKDAY.functionParameter.returnType.name',
                detail: 'sheets-formula.functionList.WEEKDAY.functionParameter.returnType.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WEEKNUM,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.WEEKNUM.description',
        abstract: 'sheets-formula.functionList.WEEKNUM.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.WEEKNUM.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.WEEKNUM.functionParameter.serialNumber.detail',
                example: '"2012-3-9"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WEEKNUM.functionParameter.returnType.name',
                detail: 'sheets-formula.functionList.WEEKNUM.functionParameter.returnType.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WORKDAY,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.WORKDAY.description',
        abstract: 'sheets-formula.functionList.WORKDAY.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.WORKDAY.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.WORKDAY.functionParameter.startDate.detail',
                example: '"2008-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WORKDAY.functionParameter.days.name',
                detail: 'sheets-formula.functionList.WORKDAY.functionParameter.days.detail',
                example: '151',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WORKDAY.functionParameter.holidays.name',
                detail: 'sheets-formula.functionList.WORKDAY.functionParameter.holidays.detail',
                example: '"2008-11-26"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WORKDAY_INTL,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.WORKDAY_INTL.description',
        abstract: 'sheets-formula.functionList.WORKDAY_INTL.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.startDate.detail',
                example: '"2008-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.days.name',
                detail: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.days.detail',
                example: '151',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.weekend.name',
                detail: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.weekend.detail',
                example: '6',
                require: 0,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.holidays.name',
                detail: 'sheets-formula.functionList.WORKDAY_INTL.functionParameter.holidays.detail',
                example: '"2008-11-26"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.YEAR,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.YEAR.description',
        abstract: 'sheets-formula.functionList.YEAR.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.YEAR.functionParameter.serialNumber.name',
                detail: 'sheets-formula.functionList.YEAR.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.YEARFRAC,
        functionType: FunctionType.Date,
        description: 'sheets-formula.functionList.YEARFRAC.description',
        abstract: 'sheets-formula.functionList.YEARFRAC.abstract',
        functionParameter: [
            {
                name: 'sheets-formula.functionList.YEARFRAC.functionParameter.startDate.name',
                detail: 'sheets-formula.functionList.YEARFRAC.functionParameter.startDate.detail',
                example: '"2012-1-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.YEARFRAC.functionParameter.endDate.name',
                detail: 'sheets-formula.functionList.YEARFRAC.functionParameter.endDate.detail',
                example: '"2012-7-30"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'sheets-formula.functionList.YEARFRAC.functionParameter.basis.name',
                detail: 'sheets-formula.functionList.YEARFRAC.functionParameter.basis.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
];

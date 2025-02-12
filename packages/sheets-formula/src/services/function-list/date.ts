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

import { FUNCTION_NAMES_DATE, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_DATE: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_DATE.DATE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DATE.description',
        abstract: 'formula.functionList.DATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DATE.functionParameter.year.name',
                detail: 'formula.functionList.DATE.functionParameter.year.detail',
                example: '2024',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DATE.functionParameter.month.name',
                detail: 'formula.functionList.DATE.functionParameter.month.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DATE.functionParameter.day.name',
                detail: 'formula.functionList.DATE.functionParameter.day.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DATEDIF,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DATEDIF.description',
        abstract: 'formula.functionList.DATEDIF.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DATEDIF.functionParameter.startDate.name',
                detail: 'formula.functionList.DATEDIF.functionParameter.startDate.detail',
                example: '"2001-6-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DATEDIF.functionParameter.endDate.name',
                detail: 'formula.functionList.DATEDIF.functionParameter.endDate.detail',
                example: '"2002-8-15"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DATEDIF.functionParameter.method.name',
                detail: 'formula.functionList.DATEDIF.functionParameter.method.detail',
                example: '"D"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DATEVALUE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DATEVALUE.description',
        abstract: 'formula.functionList.DATEVALUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DATEVALUE.functionParameter.dateText.name',
                detail: 'formula.functionList.DATEVALUE.functionParameter.dateText.detail',
                example: '"2024-8-8"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAY,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DAY.description',
        abstract: 'formula.functionList.DAY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DAY.functionParameter.serialNumber.name',
                detail: 'formula.functionList.DAY.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAYS,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DAYS.description',
        abstract: 'formula.functionList.DAYS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DAYS.functionParameter.endDate.name',
                detail: 'formula.functionList.DAYS.functionParameter.endDate.detail',
                example: '"2021-12-31"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DAYS.functionParameter.startDate.name',
                detail: 'formula.functionList.DAYS.functionParameter.startDate.detail',
                example: '"2021-1-1"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.DAYS360,
        functionType: FunctionType.Date,
        description: 'formula.functionList.DAYS360.description',
        abstract: 'formula.functionList.DAYS360.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DAYS360.functionParameter.startDate.name',
                detail: 'formula.functionList.DAYS360.functionParameter.startDate.detail',
                example: '"2021-1-29"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DAYS360.functionParameter.endDate.name',
                detail: 'formula.functionList.DAYS360.functionParameter.endDate.detail',
                example: '"2021-3-31"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DAYS360.functionParameter.method.name',
                detail: 'formula.functionList.DAYS360.functionParameter.method.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EDATE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.EDATE.description',
        abstract: 'formula.functionList.EDATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EDATE.functionParameter.startDate.name',
                detail: 'formula.functionList.EDATE.functionParameter.startDate.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EDATE.functionParameter.months.name',
                detail: 'formula.functionList.EDATE.functionParameter.months.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EOMONTH,
        functionType: FunctionType.Date,
        description: 'formula.functionList.EOMONTH.description',
        abstract: 'formula.functionList.EOMONTH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EOMONTH.functionParameter.startDate.name',
                detail: 'formula.functionList.EOMONTH.functionParameter.startDate.detail',
                example: '"2011-1-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EOMONTH.functionParameter.months.name',
                detail: 'formula.functionList.EOMONTH.functionParameter.months.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.EPOCHTODATE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.EPOCHTODATE.description',
        abstract: 'formula.functionList.EPOCHTODATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EPOCHTODATE.functionParameter.timestamp.name',
                detail: 'formula.functionList.EPOCHTODATE.functionParameter.timestamp.detail',
                example: '1655906710',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EPOCHTODATE.functionParameter.unit.name',
                detail: 'formula.functionList.EPOCHTODATE.functionParameter.unit.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.HOUR,
        functionType: FunctionType.Date,
        description: 'formula.functionList.HOUR.description',
        abstract: 'formula.functionList.HOUR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HOUR.functionParameter.serialNumber.name',
                detail: 'formula.functionList.HOUR.functionParameter.serialNumber.detail',
                example: '"2011-7-18 7:45"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.ISOWEEKNUM,
        functionType: FunctionType.Date,
        description: 'formula.functionList.ISOWEEKNUM.description',
        abstract: 'formula.functionList.ISOWEEKNUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ISOWEEKNUM.functionParameter.date.name',
                detail: 'formula.functionList.ISOWEEKNUM.functionParameter.date.detail',
                example: '"2012-3-9"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.MINUTE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.MINUTE.description',
        abstract: 'formula.functionList.MINUTE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MINUTE.functionParameter.serialNumber.name',
                detail: 'formula.functionList.MINUTE.functionParameter.serialNumber.detail',
                example: '"12:45"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.MONTH,
        functionType: FunctionType.Date,
        description: 'formula.functionList.MONTH.description',
        abstract: 'formula.functionList.MONTH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MONTH.functionParameter.serialNumber.name',
                detail: 'formula.functionList.MONTH.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NETWORKDAYS,
        functionType: FunctionType.Date,
        description: 'formula.functionList.NETWORKDAYS.description',
        abstract: 'formula.functionList.NETWORKDAYS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NETWORKDAYS.functionParameter.startDate.name',
                detail: 'formula.functionList.NETWORKDAYS.functionParameter.startDate.detail',
                example: '"2012-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NETWORKDAYS.functionParameter.endDate.name',
                detail: 'formula.functionList.NETWORKDAYS.functionParameter.endDate.detail',
                example: '"2013-3-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NETWORKDAYS.functionParameter.holidays.name',
                detail: 'formula.functionList.NETWORKDAYS.functionParameter.holidays.detail',
                example: '"2012-11-22"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NETWORKDAYS_INTL,
        functionType: FunctionType.Date,
        description: 'formula.functionList.NETWORKDAYS_INTL.description',
        abstract: 'formula.functionList.NETWORKDAYS_INTL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.startDate.name',
                detail: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.startDate.detail',
                example: '"2012-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.endDate.name',
                detail: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.endDate.detail',
                example: '"2013-3-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.weekend.name',
                detail: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.weekend.detail',
                example: '6',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.holidays.name',
                detail: 'formula.functionList.NETWORKDAYS_INTL.functionParameter.holidays.detail',
                example: '"2012-11-22"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.NOW,
        functionType: FunctionType.Date,
        description: 'formula.functionList.NOW.description',
        abstract: 'formula.functionList.NOW.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.SECOND,
        functionType: FunctionType.Date,
        description: 'formula.functionList.SECOND.description',
        abstract: 'formula.functionList.SECOND.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SECOND.functionParameter.serialNumber.name',
                detail: 'formula.functionList.SECOND.functionParameter.serialNumber.detail',
                example: '"4:48:18"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TIME,
        functionType: FunctionType.Date,
        description: 'formula.functionList.TIME.description',
        abstract: 'formula.functionList.TIME.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TIME.functionParameter.hour.name',
                detail: 'formula.functionList.TIME.functionParameter.hour.detail',
                example: '15',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TIME.functionParameter.minute.name',
                detail: 'formula.functionList.TIME.functionParameter.minute.detail',
                example: '20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TIME.functionParameter.second.name',
                detail: 'formula.functionList.TIME.functionParameter.second.detail',
                example: '59',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TIMEVALUE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.TIMEVALUE.description',
        abstract: 'formula.functionList.TIMEVALUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TIMEVALUE.functionParameter.timeText.name',
                detail: 'formula.functionList.TIMEVALUE.functionParameter.timeText.detail',
                example: '"15:20:59"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TO_DATE,
        functionType: FunctionType.Date,
        description: 'formula.functionList.TO_DATE.description',
        abstract: 'formula.functionList.TO_DATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TO_DATE.functionParameter.value.name',
                detail: 'formula.functionList.TO_DATE.functionParameter.value.detail',
                example: '40826.4375',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.TODAY,
        functionType: FunctionType.Date,
        description: 'formula.functionList.TODAY.description',
        abstract: 'formula.functionList.TODAY.abstract',
        functionParameter: [
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WEEKDAY,
        functionType: FunctionType.Date,
        description: 'formula.functionList.WEEKDAY.description',
        abstract: 'formula.functionList.WEEKDAY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WEEKDAY.functionParameter.serialNumber.name',
                detail: 'formula.functionList.WEEKDAY.functionParameter.serialNumber.detail',
                example: '"2008-2-14"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WEEKDAY.functionParameter.returnType.name',
                detail: 'formula.functionList.WEEKDAY.functionParameter.returnType.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WEEKNUM,
        functionType: FunctionType.Date,
        description: 'formula.functionList.WEEKNUM.description',
        abstract: 'formula.functionList.WEEKNUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WEEKNUM.functionParameter.serialNumber.name',
                detail: 'formula.functionList.WEEKNUM.functionParameter.serialNumber.detail',
                example: '"2012-3-9"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WEEKNUM.functionParameter.returnType.name',
                detail: 'formula.functionList.WEEKNUM.functionParameter.returnType.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WORKDAY,
        functionType: FunctionType.Date,
        description: 'formula.functionList.WORKDAY.description',
        abstract: 'formula.functionList.WORKDAY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WORKDAY.functionParameter.startDate.name',
                detail: 'formula.functionList.WORKDAY.functionParameter.startDate.detail',
                example: '"2008-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WORKDAY.functionParameter.days.name',
                detail: 'formula.functionList.WORKDAY.functionParameter.days.detail',
                example: '151',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WORKDAY.functionParameter.holidays.name',
                detail: 'formula.functionList.WORKDAY.functionParameter.holidays.detail',
                example: '"2008-11-26"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.WORKDAY_INTL,
        functionType: FunctionType.Date,
        description: 'formula.functionList.WORKDAY_INTL.description',
        abstract: 'formula.functionList.WORKDAY_INTL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WORKDAY_INTL.functionParameter.startDate.name',
                detail: 'formula.functionList.WORKDAY_INTL.functionParameter.startDate.detail',
                example: '"2008-10-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WORKDAY_INTL.functionParameter.days.name',
                detail: 'formula.functionList.WORKDAY_INTL.functionParameter.days.detail',
                example: '151',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WORKDAY_INTL.functionParameter.weekend.name',
                detail: 'formula.functionList.WORKDAY_INTL.functionParameter.weekend.detail',
                example: '6',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WORKDAY_INTL.functionParameter.holidays.name',
                detail: 'formula.functionList.WORKDAY_INTL.functionParameter.holidays.detail',
                example: '"2008-11-26"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.YEAR,
        functionType: FunctionType.Date,
        description: 'formula.functionList.YEAR.description',
        abstract: 'formula.functionList.YEAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.YEAR.functionParameter.serialNumber.name',
                detail: 'formula.functionList.YEAR.functionParameter.serialNumber.detail',
                example: '"1969-7-20"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_DATE.YEARFRAC,
        functionType: FunctionType.Date,
        description: 'formula.functionList.YEARFRAC.description',
        abstract: 'formula.functionList.YEARFRAC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.YEARFRAC.functionParameter.startDate.name',
                detail: 'formula.functionList.YEARFRAC.functionParameter.startDate.detail',
                example: '"2012-1-1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.YEARFRAC.functionParameter.endDate.name',
                detail: 'formula.functionList.YEARFRAC.functionParameter.endDate.detail',
                example: '"2012-7-30"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.YEARFRAC.functionParameter.basis.name',
                detail: 'formula.functionList.YEARFRAC.functionParameter.basis.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
];

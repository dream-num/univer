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

export default {
    DATE: {
        description: 'Returns the serial number of a particular date',
        abstract: 'Returns the serial number of a particular date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'The value of the year argument can include one to four digits. Excel interprets the year argument according to the date system your computer is using. By default, Univer uses the 1900 date system, which means the first date is January 1, 1900.' },
            month: { name: 'month', detail: 'A positive or negative integer representing the month of the year from 1 to 12 (January to December).' },
            day: { name: 'day', detail: 'A positive or negative integer representing the day of the month from 1 to 31.' },
        },
    },
    DATEDIF: {
        description: 'Calculates the number of days, months, or years between two dates. This function is useful in formulas where you need to calculate an age.',
        abstract: 'Calculates the number of days, months, or years between two dates. This function is useful in formulas where you need to calculate an age.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/datedif-function-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the first, or starting date of a given period.' },
            endDate: { name: 'end_date', detail: 'A date that represents the last, or ending, date of the period.' },
            method: { name: 'method', detail: 'The type of information that you want returned.' },
        },
    },
    DATEVALUE: {
        description: 'Converts a date in the form of text to a serial number.',
        abstract: 'Converts a date in the form of text to a serial number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Text that represents a date in an Excel date format, or a reference to a cell that contains text that represents a date in an Excel date format. For example, "1/30/2008" or "30-Jan-2008" are text strings within quotation marks that represent dates.\nUsing the default date system in Microsoft Excel for Windows, the date_text argument must represent a date between January 1, 1900 and December 31, 9999. The DATEVALUE function returns the #VALUE! error value if the value of the date_text argument falls outside of this range.\nIf the year portion of the date_text argument is omitted, the DATEVALUE function uses the current year from your computer\'s built-in clock. Time information in the date_text argument is ignored.' },
        },
    },
    DAY: {
        description: 'Returns the day of a date, represented by a serial number. The day is given as an integer ranging from 1 to 31.',
        abstract: 'Converts a serial number to a day of the month',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/day-function-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the day you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    DAYS: {
        description: 'Returns the number of days between two dates',
        abstract: 'Returns the number of days between two dates',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/days-function-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Start_date and End_date are the two dates between which you want to know the number of days.' },
            startDate: { name: 'start_date', detail: 'Start_date and End_date are the two dates between which you want to know the number of days.' },
        },
    },
    DAYS360: {
        description: 'Calculates the number of days between two dates based on a 360-day year',
        abstract: 'Calculates the number of days between two dates based on a 360-day year',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/days360-function-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Start_date and End_date are the two dates between which you want to know the number of days.' },
            endDate: { name: 'end_date', detail: 'Start_date and End_date are the two dates between which you want to know the number of days.' },
            method: { name: 'method', detail: 'A logical value that specifies whether to use the U.S. or European method in the calculation.' },
        },
    },
    EDATE: {
        description: 'Returns the serial number that represents the date that is the indicated number of months before or after a specified date (the start_date). Use EDATE to calculate maturity dates or due dates that fall on the same day of the month as the date of issue.',
        abstract: 'Returns the serial number of the date that is the indicated number of months before or after the start date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008. Problems can occur if dates are entered as text.' },
            months: { name: 'months', detail: 'The number of months before or after start_date. A positive value for months yields a future date; a negative value yields a past date.' },
        },
    },
    EOMONTH: {
        description: 'Returns the serial number of the last day of the month before or after a specified number of months',
        abstract: 'Returns the serial number of the last day of the month before or after a specified number of months',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the starting date.' },
            months: { name: 'months', detail: 'The number of months before or after start_date.' },
        },
    },
    EPOCHTODATE: {
        description: 'Converts a Unix epoch timestamp in seconds, milliseconds, or microseconds to a datetime in Universal Time Coordinated (UTC).',
        abstract: 'Converts a Unix epoch timestamp in seconds, milliseconds, or microseconds to a datetime in Universal Time Coordinated (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hans&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'A Unix epoch timestamp, in seconds, milliseconds, or microseconds.' },
            unit: { name: 'unit', detail: 'The unit of time in which the timestamp is expressed. 1 by default: \n1 indicates the time unit is seconds. \n2 indicates the time unit is milliseconds.\n3 indicates the time unit is microseconds.' },
        },
    },
    HOUR: {
        description: 'Converts a serial number to an hour',
        abstract: 'Converts a serial number to an hour',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hour-function-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the day you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Returns the number of the ISO week number of the year for a given date',
        abstract: 'Returns the number of the ISO week number of the year for a given date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/isoweeknum-function-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Date is the date-time code used by Excel for date and time calculation.' },
        },
    },
    MINUTE: {
        description: 'Converts a serial number to a minute',
        abstract: 'Converts a serial number to a minute',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/minute-function-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the day you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    MONTH: {
        description: 'Returns the month of a date represented by a serial number. The month is given as an integer, ranging from 1 (January) to 12 (December).',
        abstract: 'Converts a serial number to a month',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/month-function-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Required. The date of the month you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    NETWORKDAYS: {
        description: 'Returns the number of whole workdays between two dates',
        abstract: 'Returns the number of whole workdays between two dates',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'A date that represents the end date.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays. ' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Returns the number of whole workdays between two dates using parameters to indicate which and how many days are weekend days',
        abstract: 'Returns the number of whole workdays between two dates using parameters to indicate which and how many days are weekend days',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/networkdays-intl-function-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'A date that represents the end date.' },
            weekend: { name: 'weekend', detail: 'is a weekend number or string that specifies when weekends occur.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays. ' },
        },
    },
    NOW: {
        description: 'Returns the serial number of the current date and time.',
        abstract: 'Returns the serial number of the current date and time',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/now-function-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Converts a serial number to a second',
        abstract: 'Converts a serial number to a second',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/second-function-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the day you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    TIME: {
        description: 'Returns the serial number of a particular time.',
        abstract: 'Returns the serial number of a particular time',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/time-function-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'A number from 0 (zero) to 32767 representing the hour. Any value greater than 23 will be divided by 24 and the remainder will be treated as the hour value. For example, TIME(27,0,0) = TIME(3,0,0) = .125 or 3:00 AM.' },
            minute: { name: 'minute', detail: 'A number from 0 to 32767 representing the minute. Any value greater than 59 will be converted to hours and minutes. For example, TIME(0,750,0) = TIME(12,30,0) = .520833 or 12:30 PM.' },
            second: { name: 'second', detail: 'A number from 0 to 32767 representing the second. Any value greater than 59 will be converted to hours, minutes, and seconds. For example, TIME(0,0,2000) = TIME(0,33,22) = .023148 or 12:33:20 AM.' },
        },
    },
    TIMEVALUE: {
        description: 'Converts a time in the form of text to a serial number.',
        abstract: 'Converts a time in the form of text to a serial number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/timevalue-function-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'A text string that represents a time in any one of the Microsoft Excel time formats; for example, "6:45 PM" and "18:45" text strings within quotation marks that represent time.' },
        },
    },
    TO_DATE: {
        description: 'Converts a provided number to a date.',
        abstract: 'Converts a provided number to a date.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The argument or reference to a cell to be converted to a date.' },
        },
    },
    TODAY: {
        description: 'Returns the serial number of today\'s date',
        abstract: 'Returns the serial number of today\'s date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/today-function-5eb3078d-a82c-4736-8930-2f51a028fdd9',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Converts a serial number to a day of the week',
        abstract: 'Converts a serial number to a day of the week',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/weekday-function-60e44483-2ed1-439f-8bd0-e404c190949a',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'A sequential number that represents the date of the day you are trying to find.' },
            returnType: { name: 'return_type', detail: 'A number that determines the type of return value.' },
        },
    },
    WEEKNUM: {
        description: 'Converts a serial number to a number representing where the week falls numerically with a year',
        abstract: 'Converts a serial number to a number representing where the week falls numerically with a year',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'A date within the week.' },
            returnType: { name: 'return_type', detail: 'A number that determines on which day the week begins. The default is 1.' },
        },
    },
    WORKDAY: {
        description: 'Returns the serial number of the date before or after a specified number of workdays',
        abstract: 'Returns the serial number of the date before or after a specified number of workdays',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            days: { name: 'days', detail: 'The number of nonweekend and nonholiday days before or after start_date. A positive value for days yields a future date; a negative value yields a past date.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays. ' },
        },
    },
    WORKDAY_INTL: {
        description: 'Returns the serial number of the date before or after a specified number of workdays using parameters to indicate which and how many days are weekend days',
        abstract: 'Returns the serial number of the date before or after a specified number of workdays using parameters to indicate which and how many days are weekend days',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/workday-intl-function-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            days: { name: 'days', detail: 'The number of nonweekend and nonholiday days before or after start_date. A positive value for days yields a future date; a negative value yields a past date.' },
            weekend: { name: 'weekend', detail: 'is a weekend number or string that specifies when weekends occur.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays. ' },
        },
    },
    YEAR: {
        description: 'Returns the year corresponding to a date. The year is returned as an integer in the range 1900-9999.',
        abstract: 'Converts a serial number to a year',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/year-function-c64f017a-1354-490d-981f-578e8ec8d3b9',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the year you want to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008. Problems can occur if dates are entered as text.' },
        },
    },
    YEARFRAC: {
        description: 'Returns the year fraction representing the number of whole days between start_date and end_date',
        abstract: 'Returns the year fraction representing the number of whole days between start_date and end_date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/yearfrac-function-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'A date that represents the end date.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
};

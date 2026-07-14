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

const locale = {
    DATE: {
        description: 'Returns the serial number of a particular date',
        abstract: 'Returns the serial number of a particular date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/date-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the first, or starting date of a given period. Dates may be entered as text strings within quotation marks (for example, "2001/1/30"), as serial numbers (for example, 36921, which represents January 30, 2001, if you\'re using the 1900 date system), or as the results of other formulas or functions (for example, DATEVALUE("2001/1/30")).' },
            endDate: { name: 'end_date', detail: 'A date that represents the last, or ending, date of the period.' },
            unit: { name: 'Unit', detail: 'The type of information that you want returned, where: Unit****Returns " Y "The number of complete years in the period." M "The number of complete months in the period." D "The number of days in the period." MD "The difference between the days in start_date and end_date. The months and years of the dates are ignored. Important: We don\'t recommend using the "MD" argument, as there are known limitations with it. See the known issues section below." YM "The difference between the months in start_date and end_date. The days and years of the dates are ignored" YD "The difference between the days of start_date and end_date. The years of the dates are ignored.' },
        },
    },
    DATEVALUE: {
        description: 'Converts a date in the form of text to a serial number.',
        abstract: 'Converts a date in the form of text to a serial number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/datevalue-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'The date of the day you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008.' },
        },
    },
    DAYS: {
        description: 'Returns the number of days between two dates.',
        abstract: 'Returns the number of days between two dates.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Required. Start_date and End_date are the two dates between which you want to know the number of days.' },
            startDate: { name: 'start_date', detail: 'Required. Start_date and End_date are the two dates between which you want to know the number of days.' },
        },
    },
    DAYS360: {
        description: 'Calculates the number of days between two dates based on a 360-day year',
        abstract: 'Calculates the number of days between two dates based on a 360-day year',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/days360-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/edate-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/eomonth-function',
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
                url: 'https://support.google.com/docs/answer/13193461?hl=en',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'A Unix epoch timestamp, in seconds, milliseconds, or microseconds.' },
            unit: { name: 'unit', detail: '[OPTIONAL – 1 by default]: The unit of time in which the timestamp is expressed.' },
        },
    },
    HOUR: {
        description: 'Converts a serial number to an hour',
        abstract: 'Converts a serial number to an hour',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hour-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Date is the date-time code used by Excel for date and time calculation.' },
        },
    },
    MINUTE: {
        description: 'Returns the minutes of a time value. The minute is given as an integer, ranging from 0 to 59.',
        abstract: 'Returns the minutes of a time value. The minute is given as an integer, ranging from 0 to 59.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Required. The time that contains the minute you want to find. Times may be entered as text strings within quotation marks (for example, "6:45 PM"), as decimal numbers (for example, 0.78125, which represents 6:45 PM), or as results of other formulas or functions (for example, TIMEVALUE("6:45 PM")).' },
        },
    },
    MONTH: {
        description: 'Returns the month of a date represented by a serial number. The month is given as an integer, ranging from 1 (January) to 12 (December).',
        abstract: 'Returns the month of a date represented by a serial number. The month is given as an integer, ranging from 1 (January) to 12 (December).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Required. The date of the month you are trying to find. Dates should be entered by using the DATE function, or as results of other formulas or functions. For example, use DATE(2008,5,23) for the 23rd day of May, 2008. Problems can occur if dates are entered as text .' },
        },
    },
    NETWORKDAYS: {
        description: 'Returns the number of whole working days between start_date and end_date. Working days exclude weekends and any dates identified in holidays. Use NETWORKDAYS to calculate employee benefits that accrue based on the number of days worked during a specific term.',
        abstract: 'Returns the number of whole working days between start_date and end_date. Working days exclude weekends and any dates identified in holidays. Use NETWORKDAYS to calculate employee benefits that accrue based on the number of days worked during a specific term.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Required. A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'Required. A date that represents the end date.' },
            holidays: { name: 'holidays', detail: 'Optional. An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays. The list can be either a range of cells that contains the dates or an array constant of the serial numbers that represent the dates.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Returns the number of whole workdays between two dates using parameters to indicate which and how many days are weekend days',
        abstract: 'Returns the number of whole workdays between two dates using parameters to indicate which and how many days are weekend days',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'A date that represents the end date.' },
            weekend: { name: 'weekend', detail: 'is a weekend number or string that specifies when weekends occur.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays.' },
        },
    },
    NOW: {
        description: 'Returns the serial number of the current date and time. If the cell format was General before the function was entered, Excel changes the cell format so that it matches the date and time format of your regional settings. You can change the date and time format for the cell by using the commands in the Number group of the Home tab on the Ribbon.',
        abstract: 'Returns the serial number of the current date and time. If the cell format was General before the function was entered, Excel changes the cell format so that it matches the date and time format of your regional settings. You can change the date and time format for the cell by using the commands in the Number group of the Home tab on the Ribbon.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Returns the seconds of a time value. The second is given as an integer in the range 0 (zero) to 59.',
        abstract: 'Returns the seconds of a time value. The second is given as an integer in the range 0 (zero) to 59.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Required. The time that contains the seconds you want to find. Times may be entered as text strings within quotation marks (for example, "6:45 PM"), as decimal numbers (for example, 0.78125, which represents 6:45 PM), or as results of other formulas or functions (for example, TIMEVALUE("6:45 PM")).' },
        },
    },
    TIME: {
        description: 'Returns the decimal number for a particular time. If the cell format was General before the function was entered, the result is formatted as a date.',
        abstract: 'Returns the decimal number for a particular time. If the cell format was General before the function was entered, the result is formatted as a date.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Required. A number from 0 (zero) to 32767 representing the hour. Any value greater than 23 will be divided by 24 and the remainder will be treated as the hour value. For example, TIME(27,0,0) = TIME(3,0,0) = .125 or 3:00 AM.' },
            minute: { name: 'minute', detail: 'Required. A number from 0 to 32767 representing the minute. Any value greater than 59 will be converted to hours and minutes. For example, TIME(0,750,0) = TIME(12,30,0) = .520833 or 12:30 PM.' },
            second: { name: 'second', detail: 'Required. A number from 0 to 32767 representing the second. Any value greater than 59 will be converted to hours, minutes, and seconds. For example, TIME(0,0,2000) = TIME(0,33,22) = .023148 or 12:33:20 AM' },
        },
    },
    TIMEVALUE: {
        description: 'Converts a time in the form of text to a serial number.',
        abstract: 'Converts a time in the form of text to a serial number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/timevalue-function',
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
                url: 'https://support.google.com/docs/answer/3094239?hl=en',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The argument or reference to a cell to be converted to a date. If value is a number or a reference to a cell containing a numeric value, TO_DATE returns value converted to a date, interpreting value as number of days since December 30, 1899. Negative values are interpreted as days before this date, and fractional values indicate time of day past midnight. If value is not a number or a reference to a cell containing a numeric value, TO_DATE returns value without modification.' },
        },
    },
    TODAY: {
        description: 'Returns the serial number of today\'s date',
        abstract: 'Returns the serial number of today\'s date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/today-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/weekday-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/weeknum-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            days: { name: 'days', detail: 'The number of nonweekend and nonholiday days before or after start_date. A positive value for days yields a future date; a negative value yields a past date.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Returns the serial number of the date before or after a specified number of workdays using parameters to indicate which and how many days are weekend days',
        abstract: 'Returns the serial number of the date before or after a specified number of workdays using parameters to indicate which and how many days are weekend days',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            days: { name: 'days', detail: 'The number of nonweekend and nonholiday days before or after start_date. A positive value for days yields a future date; a negative value yields a past date.' },
            weekend: { name: 'weekend', detail: 'is a weekend number or string that specifies when weekends occur.' },
            holidays: { name: 'holidays', detail: 'An optional range of one or more dates to exclude from the working calendar, such as state and federal holidays and floating holidays.' },
        },
    },
    YEAR: {
        description: 'Returns the year corresponding to a date. The year is returned as an integer in the range 1900-9999.',
        abstract: 'Converts a serial number to a year',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/year-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'A date that represents the start date.' },
            endDate: { name: 'end_date', detail: 'A date that represents the end date.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
};

export default locale;

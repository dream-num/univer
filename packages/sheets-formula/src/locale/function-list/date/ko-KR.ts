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

import type enUS from './en-US';

const locale: typeof enUS = {
    DATE: {
        description: '특정 날짜의 일련 번호를 반환합니다',
        abstract: '특정 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'year 인수의 값은 1~4자리를 포함할 수 있습니다. Excel은 컴퓨터에서 사용하는 날짜 시스템에 따라 year 인수를 해석합니다. 기본적으로 Univer는 1900 날짜 시스템을 사용하며, 이는 첫 번째 날짜가 1900년 1월 1일임을 의미합니다.' },
            month: { name: 'month', detail: '1월부터 12월까지 1에서 12 사이의 월을 나타내는 양수 또는 음수 정수입니다.' },
            day: { name: 'day', detail: '1에서 31 사이의 월의 일을 나타내는 양수 또는 음수 정수입니다.' },
        },
    },
    DATEDIF: {
        description: '두 날짜 사이의 일수, 월수 또는 연수를 계산합니다. 이 함수는 나이를 계산해야 하는 수식에서 유용합니다.',
        abstract: '두 날짜 사이의 일수, 월수 또는 연수를 계산합니다. 이 함수는 나이를 계산해야 하는 수식에서 유용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '특정 기간의 첫 번째 날짜 또는 시작 날짜를 나타내는 날짜입니다. 날짜는 따옴표로 묶인 텍스트 문자열(예: "2001-01-30"), 일련 번호(예: 1900 날짜 체계를 사용할 경우 2001년 1월 30일을 나타내는 값인 36921), 다른 수식 또는 함수의 결과(예: DATEVALUE("2001-01-30"))로 입력할 수 있습니다.' },
            endDate: { name: 'end_date', detail: '기간의 마지막 날짜나 종료 날짜를 나타내는 날짜입니다.' },
            unit: { name: 'Unit', detail: '반환하려는 정보의 유형입니다. 여기서: Unit****Returns " Y "기간의 완료 연도 수입니다." M "기간의 완료 월 수입니다." D "기간의 일 수입니다." MD "start_date 일과 end_date 간의 차이입니다. 두 날짜의 월이나 연도는 무시됩니다. 중요: 알려진 제한 사항이 있으므로 "MD" 인수를 사용하지 않는 것이 좋습니다. 아래의 알려진 문제 섹션을 참조하세요." YM "start_date 월과 end_date 간의 차이입니다. 날짜의 일과 연도는 무시됩니다" YD "start_date 일과 end_date 사이의 차이입니다. 두 날짜의 연도는 무시됩니다.' },
        },
    },
    DATEVALUE: {
        description: '텍스트 형식의 날짜를 일련 번호로 변환합니다.',
        abstract: '텍스트 형식의 날짜를 일련 번호로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Excel 날짜 형식의 날짜를 나타내는 텍스트 또는 Excel 날짜 형식의 날짜를 나타내는 텍스트가 포함된 셀에 대한 참조입니다. 예를 들어, "1/30/2008" 또는 "30-Jan-2008"은 날짜를 나타내는 따옴표 안의 텍스트 문자열입니다.\nWindows용 Microsoft Excel의 기본 날짜 시스템을 사용하는 경우 date_text 인수는 1900년 1월 1일과 9999년 12월 31일 사이의 날짜를 나타내야 합니다. date_text 인수의 값이 이 범위를 벗어나면 DATEVALUE 함수는 #VALUE! 오류 값을 반환합니다.\ndate_text 인수의 연도 부분이 생략되면 DATEVALUE 함수는 컴퓨터의 내장 시계에서 현재 연도를 사용합니다. date_text 인수의 시간 정보는 무시됩니다.' },
        },
    },
    DAY: {
        description: '일련 번호로 나타낸 날짜의 일을 반환합니다. 일은 1에서 31 사이의 정수로 제공됩니다.',
        abstract: '일련 번호를 월의 일로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 일의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    DAYS: {
        description: '두 날짜 사이의 일 수를 반환합니다',
        abstract: '두 날짜 사이의 일 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Start_date와 End_date는 일 수를 알고자 하는 두 날짜입니다.' },
            startDate: { name: 'start_date', detail: 'Start_date와 End_date는 일 수를 알고자 하는 두 날짜입니다.' },
        },
    },
    DAYS360: {
        description: '360일 기준으로 두 날짜 사이의 일 수를 계산합니다',
        abstract: '360일 기준으로 두 날짜 사이의 일 수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Start_date와 End_date는 일 수를 알고자 하는 두 날짜입니다.' },
            endDate: { name: 'end_date', detail: 'Start_date와 End_date는 일 수를 알고자 하는 두 날짜입니다.' },
            method: { name: 'method', detail: '계산에서 미국 또는 유럽 방법을 사용할지 여부를 지정하는 논리값입니다.' },
        },
    },
    EDATE: {
        description: '시작 날짜 이전 또는 이후의 표시된 개월 수 날짜를 나타내는 일련 번호를 반환합니다. EDATE를 사용하여 발행일과 동일한 월의 일에 해당하는 만기일 또는 만기일을 계산합니다.',
        abstract: '시작 날짜 이전 또는 이후의 표시된 개월 수인 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다. 날짜를 텍스트로 입력하면 문제가 발생할 수 있습니다.' },
            months: { name: 'months', detail: 'start_date 이전 또는 이후의 개월 수입니다. months의 양수 값은 미래 날짜를 산출하고 음수 값은 과거 날짜를 산출합니다.' },
        },
    },
    EOMONTH: {
        description: '지정된 개월 수 이전 또는 이후 달의 마지막 날의 일련 번호를 반환합니다',
        abstract: '지정된 개월 수 이전 또는 이후 달의 마지막 날의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            months: { name: 'months', detail: 'start_date 이전 또는 이후의 개월 수입니다.' },
        },
    },
    EPOCHTODATE: {
        description: '초, 밀리초 또는 마이크로초 단위의 Unix epoch 타임스탬프를 협정 세계시(UTC) 기준의 날짜 및 시간으로 변환합니다.',
        abstract: '초, 밀리초 또는 마이크로초 단위의 Unix epoch 타임스탬프를 협정 세계시(UTC) 기준의 날짜 및 시간으로 변환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/13193461?hl=ko',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'EPOCHTODATE(1655908429662,2)' },
            unit: { name: 'unit', detail: 'EPOCHTODATE(1655906710)' },
        },
    },
    HOUR: {
        description: '일련 번호를 시간으로 변환합니다',
        abstract: '일련 번호를 시간으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 시간의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    ISOWEEKNUM: {
        description: '지정된 날짜의 연도에 해당하는 ISO 주 번호를 반환합니다.',
        abstract: '지정된 날짜의 연도에 해당하는 ISO 주 번호를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: '필수. 날짜는 날짜 및 시간 계산을 위해 Excel에서 사용하는 날짜-시간 코드입니다.' },
        },
    },
    MINUTE: {
        description: '시간 값의 분을 반환합니다. 분은 0에서 59 사이의 정수로 표시됩니다.',
        abstract: '시간 값의 분을 반환합니다. 분은 0에서 59 사이의 정수로 표시됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '필수. 분을 계산할 시간 값입니다. 따옴표로 묶은 텍스트 문자열(예: "6:45 PM"), 10진수(6:45 PM을 나타내는 0.78125) 또는 다른 수식이나 함수의 결과(예: TIMEVALUE("6:45 PM"))를 입력할 수 있습니다.' },
        },
    },
    MONTH: {
        description: '일련 번호가 나타내는 날짜의 월을 반환합니다. 월은 1(1월)에서 12(12월) 사이의 정수로 표시됩니다.',
        abstract: '일련 번호가 나타내는 날짜의 월을 반환합니다. 월은 1(1월)에서 12(12월) 사이의 정수로 표시됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '필수. 월을 구할 날짜입니다. 날짜는 DATE 함수를 사용하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어 2008년 5월 23일에 대해서는 DATE(2008,5,23)을 사용합니다. 날짜를 텍스트로 입력 하면 문제가 발생할 수 있습니다.' },
        },
    },
    NETWORKDAYS: {
        description: '두 날짜 사이의 전체 작업일 수를 반환합니다',
        abstract: '두 날짜 사이의 전체 작업일 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            endDate: { name: 'end_date', detail: '종료 날짜를 나타내는 날짜입니다.' },
            holidays: { name: 'holidays', detail: '주 및 연방 공휴일과 유동 휴일 같이 작업 일정에서 제외할 하나 이상의 날짜의 선택적 범위입니다.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '매개 변수를 사용하여 주말인 요일과 일수를 나타내는 두 날짜 사이의 전체 작업일 수를 반환합니다',
        abstract: '매개 변수를 사용하여 주말인 요일과 일수를 나타내는 두 날짜 사이의 전체 작업일 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            endDate: { name: 'end_date', detail: '종료 날짜를 나타내는 날짜입니다.' },
            weekend: { name: 'weekend', detail: '주말이 언제 발생하는지 지정하는 주말 번호 또는 문자열입니다.' },
            holidays: { name: 'holidays', detail: '주 및 연방 공휴일과 유동 휴일 같이 작업 일정에서 제외할 하나 이상의 날짜의 선택적 범위입니다.' },
        },
    },
    NOW: {
        description: '현재 날짜와 시간의 일련 번호를 반환합니다. 함수를 입력하기 전 셀 형식이 일반 인 경우 셀 형식이 국가별 설정의 날짜 및 시간 형식과 일치하도록 변경됩니다. 리본 메뉴의 홈 탭에 있는 표시 형식 그룹의 명령을 사용하여 셀의 날짜 및 시간 형식을 변경할 수 있습니다.',
        abstract: '현재 날짜와 시간의 일련 번호를 반환합니다. 함수를 입력하기 전 셀 형식이 일반 인 경우 셀 형식이 국가별 설정의 날짜 및 시간 형식과 일치하도록 변경됩니다. 리본 메뉴의 홈 탭에 있는 표시 형식 그룹의 명령을 사용하여 셀의 날짜 및 시간 형식을 변경할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '시간 값의 초를 반환합니다. 초는 0에서 59 사이의 정수로 제공됩니다.',
        abstract: '시간 값의 초를 반환합니다. 초는 0에서 59 사이의 정수로 제공됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '필수. 초를 계산할 시간 값입니다. 따옴표로 묶은 텍스트 문자열(예: "6:45 PM"), 10진수(6:45 PM을 나타내는 0.78125) 또는 다른 수식이나 함수의 결과(예: TIMEVALUE("6:45 PM"))를 입력할 수 있습니다.' },
        },
    },
    TIME: {
        description: '특정 시간의 일련 번호를 반환합니다.',
        abstract: '특정 시간의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: '시간을 나타내는 0(영)에서 32767 사이의 숫자입니다. 23보다 큰 값은 24로 나뉘며 나머지는 시간 값으로 처리됩니다. 예를 들어, TIME(27,0,0) = TIME(3,0,0) = .125 또는 오전 3:00입니다.' },
            minute: { name: 'minute', detail: '분을 나타내는 0에서 32767 사이의 숫자입니다. 59보다 큰 값은 시간과 분으로 변환됩니다. 예를 들어, TIME(0,750,0) = TIME(12,30,0) = .520833 또는 오후 12:30입니다.' },
            second: { name: 'second', detail: '초를 나타내는 0에서 32767 사이의 숫자입니다. 59보다 큰 값은 시간, 분 및 초로 변환됩니다. 예를 들어, TIME(0,0,2000) = TIME(0,33,20) = .023148 또는 오전 12:33:20입니다.' },
        },
    },
    TIMEVALUE: {
        description: '텍스트 형식의 시간을 일련 번호로 변환합니다.',
        abstract: '텍스트 형식의 시간을 일련 번호로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Microsoft Excel 시간 형식 중 하나로 시간을 나타내는 텍스트 문자열입니다. 예를 들어 "6:45 PM" 및 "18:45" 텍스트 문자열은 시간을 나타내는 따옴표 안에 있습니다.' },
        },
    },
    TO_DATE: {
        description: '입력된 숫자를 날짜로 변환합니다.',
        abstract: '입력된 숫자를 날짜로 변환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3094239?hl=ko',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: '오늘 날짜의 일련 번호를 반환합니다',
        abstract: '오늘 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: '일련 번호를 요일로 변환합니다',
        abstract: '일련 번호를 요일로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 요일의 날짜를 나타내는 순차 번호입니다.' },
            returnType: { name: 'return_type', detail: '반환 값의 유형을 결정하는 숫자입니다.' },
        },
    },
    WEEKNUM: {
        description: '일련 번호를 해당 연도에서 주가 차지하는 위치를 나타내는 숫자로 변환합니다',
        abstract: '일련 번호를 해당 연도에서 주가 차지하는 위치를 나타내는 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '주 내의 날짜입니다.' },
            returnType: { name: 'return_type', detail: '주가 시작되는 요일을 결정하는 숫자입니다. 기본값은 1입니다.' },
        },
    },
    WORKDAY: {
        description: '지정된 작업일 수 이전 또는 이후 날짜의 일련 번호를 반환합니다',
        abstract: '지정된 작업일 수 이전 또는 이후 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            days: { name: 'days', detail: 'start_date 이전 또는 이후의 주말 및 휴일이 아닌 일 수입니다. days의 양수 값은 미래 날짜를 산출하고 음수 값은 과거 날짜를 산출합니다.' },
            holidays: { name: 'holidays', detail: '주 및 연방 공휴일과 유동 휴일 같이 작업 일정에서 제외할 하나 이상의 날짜의 선택적 범위입니다.' },
        },
    },
    WORKDAY_INTL: {
        description: '매개 변수를 사용하여 주말인 요일과 일수를 나타내는 지정된 작업일 수 이전 또는 이후 날짜의 일련 번호를 반환합니다',
        abstract: '매개 변수를 사용하여 주말인 요일과 일수를 나타내는 지정된 작업일 수 이전 또는 이후 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            days: { name: 'days', detail: 'start_date 이전 또는 이후의 주말 및 휴일이 아닌 일 수입니다. days의 양수 값은 미래 날짜를 산출하고 음수 값은 과거 날짜를 산출합니다.' },
            weekend: { name: 'weekend', detail: '주말이 언제 발생하는지 지정하는 주말 번호 또는 문자열입니다.' },
            holidays: { name: 'holidays', detail: '주 및 연방 공휴일과 유동 휴일 같이 작업 일정에서 제외할 하나 이상의 날짜의 선택적 범위입니다.' },
        },
    },
    YEAR: {
        description: '날짜에 해당하는 연도를 반환합니다. 연도는 1900-9999 범위의 정수로 반환됩니다.',
        abstract: '일련 번호를 연도로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 연도의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다. 날짜를 텍스트로 입력하면 문제가 발생할 수 있습니다.' },
        },
    },
    YEARFRAC: {
        description: 'start_date와 end_date 사이의 전체 날짜 수를 나타내는 연도 비율을 반환합니다',
        abstract: 'start_date와 end_date 사이의 전체 날짜 수를 나타내는 연도 비율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            endDate: { name: 'end_date', detail: '종료 날짜를 나타내는 날짜입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
};

export default locale;

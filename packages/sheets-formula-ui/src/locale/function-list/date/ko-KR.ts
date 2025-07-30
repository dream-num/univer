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
                url: 'https://support.microsoft.com/ko-kr/office/date-함수-e36c0c8c-4104-49da-ab83-82328b832349',
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
                url: 'https://support.microsoft.com/ko-kr/office/datedif-함수-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '지정된 기간의 첫 번째 또는 시작 날짜를 나타내는 날짜입니다.' },
            endDate: { name: 'end_date', detail: '기간의 마지막 또는 종료 날짜를 나타내는 날짜입니다.' },
            method: { name: 'method', detail: '반환하려는 정보의 유형입니다.' },
        },
    },
    DATEVALUE: {
        description: '텍스트 형식의 날짜를 일련 번호로 변환합니다.',
        abstract: '텍스트 형식의 날짜를 일련 번호로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/datevalue-함수-df8b07d4-7761-4a93-bc33-b7471bbff252',
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
                url: 'https://support.microsoft.com/ko-kr/office/day-함수-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
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
                url: 'https://support.microsoft.com/ko-kr/office/days-함수-57740535-d549-4395-8728-0f07bff0b9df',
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
                url: 'https://support.microsoft.com/ko-kr/office/days360-함수-b9a509fd-49ef-407e-94df-0cbda5718c2a',
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
                url: 'https://support.microsoft.com/ko-kr/office/edate-함수-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
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
                url: 'https://support.microsoft.com/ko-kr/office/eomonth-함수-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: '시작 날짜를 나타내는 날짜입니다.' },
            months: { name: 'months', detail: 'start_date 이전 또는 이후의 개월 수입니다.' },
        },
    },
    EPOCHTODATE: {
        description: 'Unix epoch 타임스탬프(초, 밀리초 또는 마이크로초)를 UTC(협정 세계시)의 날짜/시간으로 변환합니다.',
        abstract: 'Unix epoch 타임스탬프(초, 밀리초 또는 마이크로초)를 UTC(협정 세계시)의 날짜/시간으로 변환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/13193461?hl=ko&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: '초, 밀리초 또는 마이크로초 단위의 Unix epoch 타임스탬프입니다.' },
            unit: { name: 'unit', detail: '타임스탬프가 표현되는 시간 단위입니다. 기본값은 1입니다: \n1은 시간 단위가 초임을 나타냅니다. \n2는 시간 단위가 밀리초임을 나타냅니다.\n3은 시간 단위가 마이크로초임을 나타냅니다.' },
        },
    },
    HOUR: {
        description: '일련 번호를 시간으로 변환합니다',
        abstract: '일련 번호를 시간으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/hour-함수-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 시간의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    ISOWEEKNUM: {
        description: '지정된 날짜의 연도의 ISO 주 번호를 반환합니다',
        abstract: '지정된 날짜의 연도의 ISO 주 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/isoweeknum-함수-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: '날짜는 Excel에서 날짜 및 시간 계산에 사용하는 날짜-시간 코드입니다.' },
        },
    },
    MINUTE: {
        description: '일련 번호를 분으로 변환합니다',
        abstract: '일련 번호를 분으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/minute-함수-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 분의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    MONTH: {
        description: '일련 번호로 나타낸 날짜의 월을 반환합니다. 월은 1(1월)에서 12(12월) 사이의 정수로 지정됩니다.',
        abstract: '일련 번호를 월로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/month-함수-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 월의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    NETWORKDAYS: {
        description: '두 날짜 사이의 전체 작업일 수를 반환합니다',
        abstract: '두 날짜 사이의 전체 작업일 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/networkdays-함수-48e717bf-a7a3-495f-969e-5005e3eb18e7',
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
                url: 'https://support.microsoft.com/ko-kr/office/networkdays-intl-함수-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
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
        description: '현재 날짜 및 시간의 일련 번호를 반환합니다.',
        abstract: '현재 날짜 및 시간의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/now-함수-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '일련 번호를 초로 변환합니다',
        abstract: '일련 번호를 초로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/second-함수-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: '찾으려는 초의 날짜입니다. 날짜는 DATE 함수를 사용하여 입력하거나 다른 수식 또는 함수의 결과로 입력해야 합니다. 예를 들어, 2008년 5월 23일에는 DATE(2008,5,23)을 사용합니다.' },
        },
    },
    TIME: {
        description: '특정 시간의 일련 번호를 반환합니다.',
        abstract: '특정 시간의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/time-함수-9a5aff99-8f7d-4611-845e-747d0b8d5457',
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
                url: 'https://support.microsoft.com/ko-kr/office/timevalue-함수-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Microsoft Excel 시간 형식 중 하나로 시간을 나타내는 텍스트 문자열입니다. 예를 들어 "6:45 PM" 및 "18:45" 텍스트 문자열은 시간을 나타내는 따옴표 안에 있습니다.' },
        },
    },
    TO_DATE: {
        description: '제공된 숫자를 날짜로 변환합니다.',
        abstract: '제공된 숫자를 날짜로 변환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3094239?hl=ko&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '날짜로 변환할 인수 또는 셀에 대한 참조입니다.' },
        },
    },
    TODAY: {
        description: '오늘 날짜의 일련 번호를 반환합니다',
        abstract: '오늘 날짜의 일련 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/today-함수-5eb3078d-a82c-4736-8930-2f51a028fdd9',
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
                url: 'https://support.microsoft.com/ko-kr/office/weekday-함수-60e44483-2ed1-439f-8bd0-e404c190949a',
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
                url: 'https://support.microsoft.com/ko-kr/office/weeknum-함수-e5c43a03-b4ab-426c-b411-b18c13c75340',
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
                url: 'https://support.microsoft.com/ko-kr/office/workday-함수-f764a5b7-05fc-4494-9486-60d494efbf33',
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
                url: 'https://support.microsoft.com/ko-kr/office/workday-intl-함수-a378391c-9ba7-4678-8a39-39611a9bf81d',
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
                url: 'https://support.microsoft.com/ko-kr/office/year-함수-c64f017a-1354-490d-981f-578e8ec8d3b9',
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
                url: 'https://support.microsoft.com/ko-kr/office/yearfrac-함수-3844141e-c76d-4143-82b6-208454ddc6a8',
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

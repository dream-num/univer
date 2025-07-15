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
    ACCRINT: {
        description: '정기적으로 이자를 지급하는 증권의 경과 이자를 반환합니다',
        abstract: '정기적으로 이자를 지급하는 증권의 경과 이자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/accrint-함수-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            firstInterest: { name: 'first_interest', detail: '증권의 첫 번째 이자 지급일입니다.' },
            settlement: { name: 'settlement', detail: '증권의 만기일입니다.' },
            rate: { name: 'rate', detail: '증권의 연간 이표 이율입니다.' },
            par: { name: 'par', detail: '증권의 액면가입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
            calcMethod: { name: 'calc_method', detail: '논리값: 발행일부터 이자가 발생하는 경우 = TRUE 또는 무시, 마지막 이표 지급일부터 이자가 발생하는 경우 = FALSE.' },
        },
    },
    ACCRINTM: {
        description: '만기에 이자를 지급하는 증권의 경과 이자를 반환합니다',
        abstract: '만기에 이자를 지급하는 증권의 경과 이자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/accrintm-함수-f62f01f9-5754-4cc4-805b-0e70199328a7',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            settlement: { name: 'settlement', detail: '증권의 만기일입니다.' },
            rate: { name: 'rate', detail: '증권의 연간 이표 이율입니다.' },
            par: { name: 'par', detail: '증권의 액면가입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    AMORDEGRC: {
        description: '감가상각 계수를 사용하여 각 회계 기간의 감가상각액을 반환합니다',
        abstract: '감가상각 계수를 사용하여 각 회계 기간의 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/amordegrc-함수-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    AMORLINC: {
        description: '각 회계 기간의 감가상각액을 반환합니다',
        abstract: '각 회계 기간의 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/amorlinc-함수-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 원가입니다.' },
            datePurchased: { name: 'date_purchased', detail: '자산의 구입일입니다.' },
            firstPeriod: { name: 'first_period', detail: '첫 번째 기간의 종료일입니다.' },
            salvage: { name: 'salvage', detail: '자산의 수명이 끝날 때의 잔존가입니다.' },
            period: { name: 'period', detail: '기간입니다.' },
            rate: { name: 'rate', detail: '감가상각률입니다.' },
            basis: { name: 'basis', detail: '사용할 연도 기준입니다.' },
        },
    },
    COUPDAYBS: {
        description: '이표 기간의 시작부터 결제일까지의 일수를 반환합니다',
        abstract: '이표 기간의 시작부터 결제일까지의 일수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/coupdaybs-함수-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    COUPDAYS: {
        description: '결제일이 포함된 이표 기간의 일수를 반환합니다',
        abstract: '결제일이 포함된 이표 기간의 일수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/coupdays-함수-cc64380b-315b-4e7b-950c-b30b0a76f671',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    COUPDAYSNC: {
        description: '결제일부터 다음 이표일까지의 일수를 반환합니다',
        abstract: '결제일부터 다음 이표일까지의 일수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/coupdaysnc-함수-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    COUPNCD: {
        description: '결제일 이후의 다음 이표일을 반환합니다',
        abstract: '결제일 이후의 다음 이표일을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/coupncd-함수-fd962fef-506b-4d9d-8590-16df5393691f',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    COUPNUM: {
        description: '결제일과 만기일 사이에 지급할 이표 수를 반환합니다',
        abstract: '결제일과 만기일 사이에 지급할 이표 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/coupnum-함수-a90af57b-de53-4969-9c99-dd6139db2522',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    COUPPCD: {
        description: '결제일 이전의 이전 이표일을 반환합니다',
        abstract: '결제일 이전의 이전 이표일을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/couppcd-함수-2eb50473-6ee9-4052-a206-77a9a385d5b3',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    CUMIPMT: {
        description: '두 기간 사이에 지급된 누적 이자를 반환합니다',
        abstract: '두 기간 사이에 지급된 누적 이자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cumipmt-함수-61067bb0-9016-427d-b95b-1a752af0e606',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '이자율입니다.' },
            nper: { name: 'nper', detail: '총 지불 기간 수입니다.' },
            pv: { name: 'pv', detail: '현재 가치입니다.' },
            startPeriod: { name: 'start_period', detail: '계산의 첫 번째 기간입니다. 지불 기간은 1부터 번호가 매겨집니다.' },
            endPeriod: { name: 'end_period', detail: '계산의 마지막 기간입니다.' },
            type: { name: 'type', detail: '지불 시기입니다.' },
        },
    },
    CUMPRINC: {
        description: '두 기간 사이에 대출에 대해 지급된 누적 원금을 반환합니다',
        abstract: '두 기간 사이에 대출에 대해 지급된 누적 원금을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cumprinc-함수-94a4516d-bd65-41a1-bc16-053a6af4c04d',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '이자율입니다.' },
            nper: { name: 'nper', detail: '총 지불 기간 수입니다.' },
            pv: { name: 'pv', detail: '현재 가치입니다.' },
            startPeriod: { name: 'start_period', detail: '계산의 첫 번째 기간입니다. 지불 기간은 1부터 번호가 매겨집니다.' },
            endPeriod: { name: 'end_period', detail: '계산의 마지막 기간입니다.' },
            type: { name: 'type', detail: '지불 시기입니다.' },
        },
    },
    DB: {
        description: '고정 감소 잔액법을 사용하여 지정된 기간의 자산 감가상각액을 반환합니다',
        abstract: '고정 감소 잔액법을 사용하여 지정된 기간의 자산 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/db-함수-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 초기 원가입니다.' },
            salvage: { name: 'salvage', detail: '감가상각이 끝날 때의 가치(자산의 잔존가라고도 함)입니다.' },
            life: { name: 'life', detail: '자산을 감가상각하는 기간 수(자산의 내용 연수라고도 함)입니다.' },
            period: { name: 'period', detail: '감가상각액을 계산하려는 기간입니다.' },
            month: { name: 'month', detail: '첫해의 개월 수입니다. month를 생략하면 12로 간주됩니다.' },
        },
    },
    DDB: {
        description: '이중 감소 잔액법 또는 지정한 다른 방법을 사용하여 지정된 기간의 자산 감가상각액을 반환합니다',
        abstract: '이중 감소 잔액법 또는 지정한 다른 방법을 사용하여 지정된 기간의 자산 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ddb-함수-519a7a37-8772-4c96-85c0-ed2c209717a5',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 초기 원가입니다.' },
            salvage: { name: 'salvage', detail: '감가상각이 끝날 때의 가치(자산의 잔존가라고도 함)입니다.' },
            life: { name: 'life', detail: '자산을 감가상각하는 기간 수(자산의 내용 연수라고도 함)입니다.' },
            period: { name: 'period', detail: '감가상각액을 계산하려는 기간입니다.' },
            factor: { name: 'factor', detail: '잔액이 감소하는 비율입니다. factor를 생략하면 2(이중 감소 잔액법)로 간주됩니다.' },
        },
    },
    DISC: {
        description: '증권의 할인율을 반환합니다',
        abstract: '증권의 할인율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/disc-함수-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            pr: { name: 'pr', detail: '액면가 $100당 증권의 가격입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    DOLLARDE: {
        description: '분수로 표현된 달러 가격을 십진수로 표현된 달러 가격으로 변환합니다',
        abstract: '분수로 표현된 달러 가격을 십진수로 표현된 달러 가격으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dollarde-함수-db85aab0-1677-428a-9dfd-a38476693427',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: '소수점으로 구분된 정수 부분과 분수 부분으로 표현된 숫자입니다.' },
            fraction: { name: 'fraction', detail: '분수의 분모에 사용할 정수입니다.' },
        },
    },
    DOLLARFR: {
        description: '십진수로 표현된 달러 가격을 분수로 표현된 달러 가격으로 변환합니다',
        abstract: '십진수로 표현된 달러 가격을 분수로 표현된 달러 가격으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dollarfr-함수-0835d163-3023-4a33-9824-3042c5d4f495',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: '십진수입니다.' },
            fraction: { name: 'fraction', detail: '분수의 분모에 사용할 정수입니다.' },
        },
    },
    DURATION: {
        description: '정기적으로 이자를 지급하는 증권의 연간 듀레이션을 반환합니다',
        abstract: '정기적으로 이자를 지급하는 증권의 연간 듀레이션을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/duration-함수-b254ea57-eadc-4602-a86a-c8e369334038',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            coupon: { name: 'coupon', detail: '증권의 연간 이표 이율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    EFFECT: {
        description: '실효 연이율을 반환합니다',
        abstract: '실효 연이율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/effect-함수-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: '명목 이자율입니다.' },
            npery: { name: 'npery', detail: '연간 복리 계산 기간 수입니다.' },
        },
    },
    FV: {
        description: '투자의 미래 가치를 반환합니다',
        abstract: '투자의 미래 가치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/fv-함수-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            nper: { name: 'nper', detail: '연금의 총 지불 기간 수입니다.' },
            pmt: { name: 'pmt', detail: '각 기간에 지불되는 금액으로, 연금 기간 동안 변경할 수 없습니다.' },
            pv: { name: 'pv', detail: '현재 가치 또는 일련의 미래 지불금의 현재 가치 합계입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    FVSCHEDULE: {
        description: '일련의 복리 이자율을 적용한 후 초기 원금의 미래 가치를 반환합니다',
        abstract: '일련의 복리 이자율을 적용한 후 초기 원금의 미래 가치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/fvschedule-함수-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: '현재 가치입니다.' },
            schedule: { name: 'schedule', detail: '적용할 이자율 배열입니다.' },
        },
    },
    INTRATE: {
        description: '완전 투자된 증권의 이자율을 반환합니다',
        abstract: '완전 투자된 증권의 이자율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/intrate-함수-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            investment: { name: 'investment', detail: '증권에 투자한 금액입니다.' },
            redemption: { name: 'redemption', detail: '만기에 받을 금액입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    IPMT: {
        description: '지정된 기간의 투자에 대한 이자 지불액을 반환합니다',
        abstract: '지정된 기간의 투자에 대한 이자 지불액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ipmt-함수-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            per: { name: 'per', detail: '이자를 찾으려는 기간으로 1에서 nper 사이의 범위에 있어야 합니다.' },
            nper: { name: 'nper', detail: '연금의 총 지불 기간 수입니다.' },
            pv: { name: 'pv', detail: '현재 가치 또는 일련의 미래 지불금의 현재 가치 합계입니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    IRR: {
        description: '일련의 현금 흐름에 대한 내부 수익률을 반환합니다',
        abstract: '일련의 현금 흐름에 대한 내부 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/irr-함수-64925eaa-9988-495b-b290-3ad0c163c1bc',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '내부 수익률을 계산하려는 숫자가 포함된 배열 또는 셀 참조입니다.\n1.값에는 내부 수익률을 계산하기 위해 최소한 하나의 양수 값과 하나의 음수 값이 포함되어야 합니다.\n2.IRR은 값의 순서를 사용하여 현금 흐름의 순서를 해석합니다. 원하는 순서대로 지불 및 수입 값을 입력해야 합니다.\n3.배열 또는 참조 인수에 텍스트, 논리값 또는 빈 셀이 포함된 경우 해당 값은 무시됩니다.' },
            guess: { name: 'guess', detail: 'IRR의 결과에 가까운 것으로 추측되는 숫자입니다.' },
        },
    },
    ISPMT: {
        description: '투자의 특정 기간 동안 지불된 이자를 계산합니다',
        abstract: '투자의 특정 기간 동안 지불된 이자를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ispmt-함수-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '투자의 이자율입니다.' },
            per: { name: 'per', detail: '이자를 찾으려는 기간으로 1과 Nper 사이여야 합니다.' },
            nper: { name: 'nper', detail: '투자의 총 지불 기간 수입니다.' },
            pv: { name: 'pv', detail: '투자의 현재 가치입니다. 대출의 경우 Pv는 대출 금액입니다.' },
        },
    },
    MDURATION: {
        description: '액면가를 $100으로 가정한 증권의 Macauley 수정 듀레이션을 반환합니다',
        abstract: '액면가를 $100으로 가정한 증권의 Macauley 수정 듀레이션을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mduration-함수-b3786a69-4f20-469a-94ad-33e5b90a763c',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            coupon: { name: 'coupon', detail: '증권의 연간 이표 이율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    MIRR: {
        description: '양수 및 음수 현금 흐름이 다른 이율로 자금 조달되는 경우의 내부 수익률을 반환합니다',
        abstract: '양수 및 음수 현금 흐름이 다른 이율로 자금 조달되는 경우의 내부 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mirr-함수-b020f038-7492-4fb4-93c1-35c345b53524',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '숫자가 포함된 배열 또는 셀 참조입니다. 이러한 숫자는 정기적으로 발생하는 일련의 지불(음수 값) 및 수입(양수 값)을 나타냅니다.\n1.수정된 내부 수익률을 계산하려면 값에 최소한 하나의 양수 값과 하나의 음수 값이 포함되어야 합니다. 그렇지 않으면 MIRR은 #DIV/0! 오류 값을 반환합니다.\n2.배열 또는 참조 인수에 텍스트, 논리값 또는 빈 셀이 포함된 경우 해당 값은 무시되지만 값이 0인 셀은 포함됩니다.' },
            financeRate: { name: 'finance_rate', detail: '현금 흐름에 사용된 돈에 대해 지불하는 이자율입니다.' },
            reinvestRate: { name: 'reinvest_rate', detail: '현금 흐름을 재투자할 때 받는 이자율입니다.' },
        },
    },
    NOMINAL: {
        description: '연간 명목 이자율을 반환합니다',
        abstract: '연간 명목 이자율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/nominal-함수-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: '실효 이자율입니다.' },
            npery: { name: 'npery', detail: '연간 복리 계산 기간 수입니다.' },
        },
    },
    NPER: {
        description: '투자의 기간 수를 반환합니다',
        abstract: '투자의 기간 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/nper-함수-240535b5-6653-4d2d-bfcf-b6a38151d815',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            pmt: { name: 'pmt', detail: '각 기간에 지불되는 금액으로, 연금 기간 동안 변경할 수 없습니다.' },
            pv: { name: 'pv', detail: '현재 가치 또는 일련의 미래 지불금의 현재 가치 합계입니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    NPV: {
        description: '일련의 정기적인 현금 흐름과 할인율을 기반으로 투자의 순 현재 가치를 반환합니다',
        abstract: '일련의 정기적인 현금 흐름과 할인율을 기반으로 투자의 순 현재 가치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/npv-함수-8672cb67-2576-4d07-b67b-ac28acf2a568',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '한 기간 동안의 할인율입니다.' },
            value1: { name: 'value1', detail: '지불 및 수입을 나타내는 1~254개의 인수입니다.' },
            value2: { name: 'value2', detail: '지불 및 수입을 나타내는 1~254개의 인수입니다.' },
        },
    },
    ODDFPRICE: {
        description: '첫 번째 기간이 비정상적인 증권의 액면가 $100당 가격을 반환합니다',
        abstract: '첫 번째 기간이 비정상적인 증권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/oddfprice-함수-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            firstCoupon: { name: 'first_coupon', detail: '증권의 첫 번째 이표일입니다.' },
            rate: { name: 'rate', detail: '증권의 이자율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    ODDFYIELD: {
        description: '첫 번째 기간이 비정상적인 증권의 수익률을 반환합니다',
        abstract: '첫 번째 기간이 비정상적인 증권의 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/oddfyield-함수-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            firstCoupon: { name: 'first_coupon', detail: '증권의 첫 번째 이표일입니다.' },
            rate: { name: 'rate', detail: '증권의 이자율입니다.' },
            pr: { name: 'pr', detail: '증권의 가격입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    ODDLPRICE: {
        description: '마지막 기간이 비정상적인 증권의 액면가 $100당 가격을 반환합니다',
        abstract: '마지막 기간이 비정상적인 증권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/oddlprice-함수-fb657749-d200-4902-afaf-ed5445027fc4',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            lastInterest: { name: 'last_interest', detail: '증권의 마지막 이표일입니다.' },
            rate: { name: 'rate', detail: '증권의 이자율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    ODDLYIELD: {
        description: '마지막 기간이 비정상적인 증권의 수익률을 반환합니다',
        abstract: '마지막 기간이 비정상적인 증권의 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/oddlyield-함수-c873d088-cf40-435f-8d41-c8232fee9238',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            lastInterest: { name: 'last_interest', detail: '증권의 마지막 이표일입니다.' },
            rate: { name: 'rate', detail: '증권의 이자율입니다.' },
            pr: { name: 'pr', detail: '증권의 가격입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    PDURATION: {
        description: '투자가 지정된 값에 도달하는 데 필요한 기간을 반환합니다',
        abstract: '투자가 지정된 값에 도달하는 데 필요한 기간을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pduration-함수-44f33460-5be5-4c90-b857-22308892adaf',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            pv: { name: 'pv', detail: '투자의 현재 가치입니다.' },
            fv: { name: 'fv', detail: '투자의 원하는 미래 가치입니다.' },
        },
    },
    PMT: {
        description: '연금에 대한 정기 지불액을 반환합니다',
        abstract: '연금에 대한 정기 지불액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pmt-함수-0214da64-9a63-4996-bc20-214433fa6441',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '대출의 이자율입니다.' },
            nper: { name: 'nper', detail: '대출의 총 지불 횟수입니다.' },
            pv: { name: 'pv', detail: '현재 가치 또는 일련의 미래 지불금의 현재 가치 합계인 원금입니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불을 한 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    PPMT: {
        description: '지정된 기간의 투자에 대한 원금 지불액을 반환합니다',
        abstract: '지정된 기간의 투자에 대한 원금 지불액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ppmt-함수-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            per: { name: 'per', detail: '원금을 찾으려는 기간을 지정하며 1에서 nper 사이의 범위에 있어야 합니다.' },
            nper: { name: 'nper', detail: '연금의 총 지불 기간 수입니다.' },
            pv: { name: 'pv', detail: '현재 가치 - 일련의 미래 지불금의 현재 가치 합계입니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    PRICE: {
        description: '정기적으로 이자를 지급하는 증권의 액면가 $100당 가격을 반환합니다',
        abstract: '정기적으로 이자를 지급하는 증권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/price-함수-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            rate: { name: 'rate', detail: '증권의 연간 이표 이율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    PRICEDISC: {
        description: '할인된 증권의 액면가 $100당 가격을 반환합니다',
        abstract: '할인된 증권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pricedisc-함수-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            discount: { name: 'discount', detail: '증권의 할인율입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    PRICEMAT: {
        description: '만기에 이자를 지급하는 증권의 액면가 $100당 가격을 반환합니다',
        abstract: '만기에 이자를 지급하는 증권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pricemat-함수-52c3b4da-bc7e-476a-989f-a95f675cae77',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            rate: { name: 'rate', detail: '발행일의 증권 이자율입니다.' },
            yld: { name: 'yld', detail: '증권의 연간 수익률입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    PV: {
        description: '투자의 현재 가치를 반환합니다',
        abstract: '투자의 현재 가치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pv-함수-23879d31-0e02-4321-be01-da16e8168cbd',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '기간당 이자율입니다.' },
            nper: { name: 'nper', detail: '연금의 총 지불 기간 수입니다.' },
            pmt: { name: 'pmt', detail: '각 기간에 지불되는 금액으로, 연금 기간 동안 변경할 수 없습니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
        },
    },
    RATE: {
        description: '연금의 기간당 이자율을 반환합니다',
        abstract: '연금의 기간당 이자율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rate-함수-9f665657-4a7e-4bb7-a030-83fc59e748ce',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: '연금의 총 지불 기간 수입니다.' },
            pmt: { name: 'pmt', detail: '각 기간에 지불되는 금액으로, 연금 기간 동안 변경할 수 없습니다.' },
            pv: { name: 'pv', detail: '현재 가치 - 일련의 미래 지불금의 현재 가치 합계입니다.' },
            fv: { name: 'fv', detail: '미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다.' },
            type: { name: 'type', detail: '지불 시기를 나타내는 숫자 0 또는 1입니다.' },
            guess: { name: 'guess', detail: '이자율에 대한 추측값입니다.' },
        },
    },
    RECEIVED: {
        description: '완전 투자된 증권에 대해 만기에 받는 금액을 반환합니다',
        abstract: '완전 투자된 증권에 대해 만기에 받는 금액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/received-함수-7a3f8b93-6611-4f81-8576-828312c9b5e5',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            investment: { name: 'investment', detail: '증권에 투자한 금액입니다.' },
            discount: { name: 'discount', detail: '증권의 할인율입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    RRI: {
        description: '투자 성장에 대한 등가 이자율을 반환합니다',
        abstract: '투자 성장에 대한 등가 이자율을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rri-함수-6f5822d8-7ef1-4233-944c-79e8172930f4',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: '투자의 기간 수입니다.' },
            pv: { name: 'pv', detail: '투자의 현재 가치입니다.' },
            fv: { name: 'fv', detail: '투자의 미래 가치입니다.' },
        },
    },
    SLN: {
        description: '한 기간의 자산의 정액 감가상각액을 반환합니다',
        abstract: '한 기간의 자산의 정액 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/sln-함수-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 초기 원가입니다.' },
            salvage: { name: 'salvage', detail: '수명이 끝날 때의 가치입니다.' },
            life: { name: 'life', detail: '자산의 내용 연수입니다.' },
        },
    },
    SYD: {
        description: '지정된 기간의 자산에 대한 연수 합계 감가상각액을 반환합니다',
        abstract: '지정된 기간의 자산에 대한 연수 합계 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/syd-함수-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 초기 원가입니다.' },
            salvage: { name: 'salvage', detail: '수명이 끝날 때의 가치입니다.' },
            life: { name: 'life', detail: '자산이 감가상각되는 기간 수입니다.' },
            per: { name: 'per', detail: '기간으로 life와 동일한 단위를 사용해야 합니다.' },
        },
    },
    TBILLEQ: {
        description: '재무부 단기 채권에 대한 채권 등가 수익률을 반환합니다',
        abstract: '재무부 단기 채권에 대한 채권 등가 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tbilleq-함수-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '재무부 단기 채권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '재무부 단기 채권의 만기일입니다.' },
            discount: { name: 'discount', detail: '재무부 단기 채권의 할인율입니다.' },
        },
    },
    TBILLPRICE: {
        description: '재무부 단기 채권의 액면가 $100당 가격을 반환합니다',
        abstract: '재무부 단기 채권의 액면가 $100당 가격을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tbillprice-함수-eacca992-c29d-425a-9eb8-0513fe6035a2',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '재무부 단기 채권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '재무부 단기 채권의 만기일입니다.' },
            discount: { name: 'discount', detail: '재무부 단기 채권의 할인율입니다.' },
        },
    },
    TBILLYIELD: {
        description: '재무부 단기 채권의 수익률을 반환합니다',
        abstract: '재무부 단기 채권의 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tbillyield-함수-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '재무부 단기 채권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '재무부 단기 채권의 만기일입니다.' },
            pr: { name: 'pr', detail: '재무부 단기 채권의 액면가 $100당 가격입니다.' },
        },
    },
    VDB: {
        description: '이중 감소 잔액법 또는 기타 지정한 방법을 사용하여 지정된 기간 또는 부분 기간의 자산 감가상각액을 반환합니다',
        abstract: '이중 감소 잔액법 또는 기타 지정한 방법을 사용하여 지정된 기간 또는 부분 기간의 자산 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/vdb-함수-dde4e207-f3fa-488d-91d2-66d55e861d73',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: '자산의 초기 원가입니다.' },
            salvage: { name: 'salvage', detail: '수명이 끝날 때의 가치입니다.' },
            life: { name: 'life', detail: '자산이 감가상각되는 기간 수입니다.' },
            startPeriod: { name: 'start_period', detail: '감가상각을 계산하려는 시작 기간입니다.' },
            endPeriod: { name: 'end_period', detail: '감가상각을 계산하려는 종료 기간입니다.' },
            factor: { name: 'factor', detail: '잔액이 감소하는 비율입니다.' },
            noSwitch: { name: 'no_switch', detail: '감가상각이 정액법보다 크지 않을 때 정액법으로 전환할지 여부를 지정하는 논리값입니다.' },
        },
    },
    XIRR: {
        description: '반드시 정기적이지 않은 일련의 현금 흐름에 대한 내부 수익률을 반환합니다',
        abstract: '반드시 정기적이지 않은 일련의 현금 흐름에 대한 내부 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/xirr-함수-de1242ec-6477-445b-b11b-a303ad9adc9d',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '일련의 날짜에 해당하는 일련의 현금 흐름입니다.' },
            dates: { name: 'dates', detail: '현금 흐름 지불에 해당하는 지불 날짜 일정입니다.' },
            guess: { name: 'guess', detail: 'XIRR의 결과에 가까운 것으로 추측되는 숫자입니다.' },
        },
    },
    XNPV: {
        description: '반드시 정기적이지 않은 일련의 현금 흐름에 대한 순 현재 가치를 반환합니다',
        abstract: '반드시 정기적이지 않은 일련의 현금 흐름에 대한 순 현재 가치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/xnpv-함수-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '현금 흐름에 적용할 할인율입니다.' },
            values: { name: 'values', detail: '일련의 날짜에 해당하는 일련의 현금 흐름입니다.' },
            dates: { name: 'dates', detail: '현금 흐름 지불에 해당하는 지불 날짜 일정입니다.' },
        },
    },
    YIELD: {
        description: '정기적으로 이자를 지급하는 증권의 수익률을 반환합니다',
        abstract: '정기적으로 이자를 지급하는 증권의 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/yield-함수-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            rate: { name: 'rate', detail: '증권의 연간 이표 이율입니다.' },
            pr: { name: 'pr', detail: '액면가 $100당 증권의 가격입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            frequency: { name: 'frequency', detail: '연간 이표 지급 횟수입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    YIELDDISC: {
        description: '재무부 단기 채권과 같은 할인 증권의 연간 수익률을 반환합니다',
        abstract: '재무부 단기 채권과 같은 할인 증권의 연간 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/yielddisc-함수-a9dbdbae-7dae-46de-b995-615faffaaed7',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            pr: { name: 'pr', detail: '액면가 $100당 증권의 가격입니다.' },
            redemption: { name: 'redemption', detail: '액면가 $100당 증권의 환매 가치입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
    YIELDMAT: {
        description: '만기에 이자를 지급하는 증권의 연간 수익률을 반환합니다',
        abstract: '만기에 이자를 지급하는 증권의 연간 수익률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/yieldmat-함수-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '증권의 결제일입니다.' },
            maturity: { name: 'maturity', detail: '증권의 만기일입니다.' },
            issue: { name: 'issue', detail: '증권의 발행일입니다.' },
            rate: { name: 'rate', detail: '발행일의 증권 이자율입니다.' },
            pr: { name: 'pr', detail: '액면가 $100당 증권의 가격입니다.' },
            basis: { name: 'basis', detail: '사용할 일수 계산 기준 유형입니다.' },
        },
    },
};

export default locale;

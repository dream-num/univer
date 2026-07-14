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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/accrint-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/accrintm-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/amordegrc-function',
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
    AMORLINC: {
        description: '각 회계 기간의 감가상각액을 반환합니다',
        abstract: '각 회계 기간의 감가상각액을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/amorlinc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coupdaybs-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coupdays-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coupdaysnc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coupncd-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coupnum-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/couppcd-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cumipmt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cumprinc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/db-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ddb-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/disc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dollarde-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dollarfr-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/duration-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: '명목 이자율입니다.' },
            npery: { name: 'npery', detail: '연간 복리 계산 기간 수입니다.' },
        },
    },
    FV: {
        description: 'FV 는 재무 함수 중 하나로, 고정 이자율을 기반으로 투자의 미래 가치를 계산합니다. FV를 정기적인 납입액 또는 단일 일괄 지불에 사용할 수 있습니다.',
        abstract: 'FV 는 재무 함수 중 하나로, 고정 이자율을 기반으로 투자의 미래 가치를 계산합니다. FV를 정기적인 납입액 또는 단일 일괄 지불에 사용할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '필수. 기간별 이자율입니다.' },
            nper: { name: 'nper', detail: '필수. 총 납입 기간 수입니다.' },
            pmt: { name: 'pmt', detail: '필수. 각 기간의 납입액으로서 전 기간 동안 일정합니다. 일반적으로 pmt에는 기타 비용과 세금을 제외한 원금과 이자가 포함됩니다. pmt를 생략할 경우 pv 인수를 반드시 지정해야 합니다.' },
            pv: { name: 'pv', detail: '선택적. 일련의 미래 지급액에 상응하는 현재 가치의 개략적인 합계입니다. pv를 생략하면 0으로 간주되며 이 경우 pmt 인수를 반드시 포함해야 합니다.' },
            type: { name: 'type', detail: '선택적. 납입 시점을 나타내는 숫자로서 0 또는 1입니다. 생략하면 0으로 간주됩니다.' },
        },
    },
    FVSCHEDULE: {
        description: '초기 원금에 일련의 복리 이자율을 적용했을 때의 예상 금액을 반환합니다. FVSCHEDULE을 사용하면 투자액에 다양한 이자율을 적용했을 때의 예상 금액을 계산할 수 있습니다.',
        abstract: '초기 원금에 일련의 복리 이자율을 적용했을 때의 예상 금액을 반환합니다. FVSCHEDULE을 사용하면 투자액에 다양한 이자율을 적용했을 때의 예상 금액을 계산할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: '필수. 현재 가치입니다.' },
            schedule: { name: 'schedule', detail: '필수. 적용할 이자율로 구성된 배열입니다.' },
        },
    },
    INTRATE: {
        description: '완전 투자 유가 증권의 이자율을 반환합니다.',
        abstract: '완전 투자 유가 증권의 이자율을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: '필수. 유가 증권의 결산일입니다. 즉, 유가 증권이 매수자에게 매도된 발행일 다음 날입니다.' },
            maturity: { name: 'maturity', detail: '필수. 유가 증권의 만기일입니다. 즉, 유가 증권이 만기가 되는 날짜입니다.' },
            investment: { name: 'investment', detail: '필수. 유가 증권의 투자액입니다.' },
            redemption: { name: 'redemption', detail: '필수. 만기 시 상환액입니다.' },
            basis: { name: 'basis', detail: '선택적. 날짜 계산 기준입니다.' },
        },
    },
    IPMT: {
        description: '일정 금액을 정기적으로 납입하고 일정한 이자율이 적용되는 투자에 대해 주어진 기간 동안의 이자를 계산합니다.',
        abstract: '일정 금액을 정기적으로 납입하고 일정한 이자율이 적용되는 투자에 대해 주어진 기간 동안의 이자를 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '필수. 기간별 이자율입니다.' },
            per: { name: 'per', detail: '필수. 이자를 계산할 기간으로 1에서 nper 사이여야 합니다.' },
            nper: { name: 'nper', detail: '필수. 총 납입 기간 수입니다.' },
            pv: { name: 'pv', detail: '필수. 일련의 미래 지급액에 상응하는 현재 가치의 개략적인 합계입니다.' },
            fv: { name: 'fv', detail: '선택적. 미래 가치 또는 마지막 지불 후 달성하려는 현금 잔액입니다. fv를 생략하면 0으로 간주됩니다(예: 대출의 미래 값은 0).' },
            type: { name: 'type', detail: '선택적. 납입 시점을 나타내는 숫자로서 0 또는 1입니다. 생략하면 0으로 간주됩니다.' },
        },
    },
    IRR: {
        description: '숫자로 표시되는 일련의 주기적인 현금 흐름에 대한 내부 수익률을 반환합니다. 이 현금 흐름은 연금과 같이 일정할 필요는 없습니다. 그러나 현금 흐름은 월간이나 연간처럼 정기적으로 발생해야 합니다. 내부 수익률은 주기적으로 발생하는 납입액(음수)과 수익액(양수)으로 구성되는 투자 이자율입니다.',
        abstract: '숫자로 표시되는 일련의 주기적인 현금 흐름에 대한 내부 수익률을 반환합니다. 이 현금 흐름은 연금과 같이 일정할 필요는 없습니다. 그러나 현금 흐름은 월간이나 연간처럼 정기적으로 발생해야 합니다. 내부 수익률은 주기적으로 발생하는 납입액(음수)과 수익액(양수)으로 구성되는 투자 이자율입니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '내부 수익률을 계산하려는 숫자가 포함된 배열 또는 셀 참조입니다.\n1.값에는 내부 수익률을 계산하기 위해 최소한 하나의 양수 값과 하나의 음수 값이 포함되어야 합니다.\n2.IRR은 값의 순서를 사용하여 현금 흐름의 순서를 해석합니다. 원하는 순서대로 지불 및 수입 값을 입력해야 합니다.\n3.배열 또는 참조 인수에 텍스트, 논리값 또는 빈 셀이 포함된 경우 해당 값은 무시됩니다.' },
            guess: { name: 'guess', detail: 'IRR의 결과에 가까운 것으로 추측되는 숫자입니다.' },
        },
    },
    ISPMT: {
        description: '원금 지급을 통해 지정된 대출 기간(또는 투자)에 대해 지급되거나 받은 이자를 계산합니다.',
        abstract: '원금 지급을 통해 지정된 대출 기간(또는 투자)에 대해 지급되거나 받은 이자를 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: '필수 요소입니다. 투자에 대한 이자율입니다.' },
            per: { name: 'per', detail: '필수 요소입니다. 관심사를 찾으려는 기간이며 1과 Nper 사이여야 합니다.' },
            nper: { name: 'nper', detail: '필수 요소입니다. 투자에 대한 총 지급 횟수입니다.' },
            pv: { name: 'pv', detail: '필수 요소입니다. 투자 금액의 현재 가치입니다. 대출의 경우 Pv는 대출 금액입니다.' },
        },
    },
    MDURATION: {
        description: '액면가를 $100으로 가정한 증권의 Macauley 수정 듀레이션을 반환합니다',
        abstract: '액면가를 $100으로 가정한 증권의 Macauley 수정 듀레이션을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mduration-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mirr-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/nominal-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/nper-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/npv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oddfprice-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oddfyield-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oddlprice-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oddlyield-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pduration-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pmt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ppmt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/price-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pricedisc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pricemat-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rate-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/received-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rri-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sln-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/syd-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tbilleq-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tbillprice-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tbillyield-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/vdb-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/xirr-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/xnpv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/yield-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/yielddisc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/yieldmat-function',
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

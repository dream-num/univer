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
    sheet: {
        numfmt: {
            title: '숫자 서식',
            numfmtType: '서식 종류',
            cancel: '취소',
            confirm: '확인',
            general: '일반',
            accounting: '회계',
            text: '텍스트',
            number: '숫자',
            percent: '백분율',
            scientific: '과학적 표기',
            currency: '통화',
            date: '날짜',
            time: '시간',
            thousandthPercentile: '천 단위 구분기호',
            preview: '미리보기',
            dateTime: '날짜 및 시간',
            decimalLength: '소수점 자리수',
            currencyType: '통화 기호',
            moreFmt: '기타 서식',
            financialValue: '재무 값',
            roundingCurrency: '통화 반올림',
            timeDuration: '시간 길이',
            currencyDes: '통화 서식은 일반적인 통화 값을 표시하는 데 사용됩니다. 회계 서식은 소수점에 맞춰 값을 정렬합니다.',
            accountingDes: '회계 숫자 서식은 통화 기호와 소수점에 맞춰 값을 정렬합니다.',
            dateType: '날짜 유형',
            dateDes: '날짜 서식은 날짜 및 시간 값을 날짜 형식으로 표시합니다.',
            negType: '음수 표시 형식',
            generalDes: '일반 서식은 특정 숫자 서식이 적용되지 않습니다.',
            thousandthPercentileDes: '백분율 서식은 일반 숫자를 표시할 때 사용됩니다. 통화 및 회계 서식은 금액 계산에 특화되어 있습니다.',
            addDecimal: '소수점 자리수 늘리기',
            subtractDecimal: '소수점 자리수 줄이기',
            customFormat: '사용자 지정 서식',
            customFormatDes: '기존 서식을 기반으로 사용자 지정 숫자 서식을 만듭니다.',
        },
    },
};

export default locale;

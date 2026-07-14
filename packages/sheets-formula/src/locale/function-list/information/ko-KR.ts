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
    CELL: {
        description: '셀의 서식, 위치 또는 내용에 대한 정보를 반환합니다',
        abstract: '셀의 서식, 위치 또는 내용에 대한 정보를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: '반환할 셀 정보 유형을 지정하는 텍스트 값입니다.' },
            reference: { name: 'reference', detail: '정보를 원하는 셀입니다.' },
        },
    },
    ERROR_TYPE: {
        description: '오류 유형에 해당하는 숫자를 반환합니다',
        abstract: '오류 유형에 해당하는 숫자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: '식별 번호를 찾으려는 오류 값입니다.' },
        },
    },
    INFO: {
        description: '현재 운영 환경에 대한 정보를 반환합니다',
        abstract: '현재 운영 환경에 대한 정보를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: '유형 텍스트', detail: '반환할 정보 유형을 지정하는 텍스트입니다.' },
        },
    },
    ISBETWEEN: {
        description: '제공된 숫자가 다른 두 숫자 사이에 있는지 확인합니다. 다른 두 숫자는 각각 범위에 포함하거나 포함하지 않을 수 있습니다.',
        abstract: '제공된 숫자가 다른 두 숫자 사이에 있는지 확인합니다. 다른 두 숫자는 각각 범위에 포함하거나 포함하지 않을 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/10538337?hl=ko',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: '`낮은_값`과 `높은_값` 사이에서 테스트되는 값입니다.' },
            lowerValue: { name: 'lower_value', detail: '값 범위의 하한으로, `비교할_값`이 포함될 수 있습니다.' },
            upperValue: { name: 'upper_value', detail: '값 범위의 상한으로, `비교할_값`이 포함될 수 있습니다.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: '값 범위에 `낮은_값`이 포함되는지를 지정합니다. 기본값은 TRUE입니다.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: '값 범위에 `높은_값`이 포함되는지를 지정합니다. 기본값은 TRUE입니다.' },
        },
    },
    ISBLANK: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISDATE: {
        description: 'ISDATE 함수는 값이 날짜인지 여부를 반환합니다.',
        abstract: 'ISDATE 함수는 값이 날짜인지 여부를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/9061381?hl=ko',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '날짜인지 확인할 값입니다.' },
        },
    },
    ISEMAIL: {
        description: '값이 유효한 이메일 주소인지 확인하려면 ISEMAIL 함수를 사용합니다. 이 함수는 값이 일반적으로 허용되는 이메일 주소 형식을 따르는지 확인하지만 존재 여부는 확인하지 않습니다.',
        abstract: '값이 유효한 이메일 주소인지 확인하려면 ISEMAIL 함수를 사용합니다. 이 함수는 값이 일반적으로 허용되는 이메일 주소 형식을 따르는지 확인하지만 존재 여부는 확인하지 않습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3256503?hl=ko',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '유효한 이메일 주소인지 확인할 값입니다.' },
        },
    },
    ISERR: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISERROR: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISEVEN: {
        description: '숫자가 짝수이면 TRUE를 반환합니다',
        abstract: '숫자가 짝수이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트할 값입니다. 숫자가 정수가 아니면 잘립니다.' },
        },
    },
    ISFORMULA: {
        description: '수식이 포함된 셀에 대한 참조가 있으면 TRUE를 반환합니다',
        abstract: '수식이 포함된 셀에 대한 참조가 있으면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: '테스트하려는 셀에 대한 참조입니다.' },
        },
    },
    ISLOGICAL: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISNA: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISNONTEXT: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISNUMBER: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISODD: {
        description: '숫자가 홀수이면 TRUE를 반환합니다',
        abstract: '숫자가 홀수이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트할 값입니다. 숫자가 정수가 아니면 잘립니다.' },
        },
    },
    ISOMITTED: {
        description: 'LAMBDA의 값이 누락되었는지 확인하고 TRUE 또는 FALSE를 반환합니다',
        abstract: 'LAMBDA의 값이 누락되었는지 확인하고 TRUE 또는 FALSE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: '인수', detail: 'LAMBDA 매개 변수처럼 인수가 생략되었는지 검사할 값입니다.' },
        },
    },
    ISREF: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISTEXT: {
        description: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        abstract: '이 문서에서 소개하는 여러 함수는 통틀어 IS 함수라고 불리며 각 함수에서는 값의 유형을 검사하고 그 결과에 따라 TRUE 또는 FALSE를 반환합니다. 예를 들어 ISBLANK 함수는 값 인수가 빈 셀에 대한 참조이면 논리값 TRUE를 반환하고, 그렇지 않으면 FALSE를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '필수. 테스트할 값입니다. value 인수는 빈 셀, 오류, 논리값, 텍스트, 숫자, 참조 값 또는 이러한 항목을 가리키는 이름일 수 있습니다.' },
        },
    },
    ISURL: {
        description: '유효한 URL 값인지 확인합니다.',
        abstract: '유효한 URL 값인지 확인합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3256501?hl=ko',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '유효한 URL인지 확인할 값입니다.' },
        },
    },
    N: {
        description: '숫자로 변환된 값을 반환합니다',
        abstract: '숫자로 변환된 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '변환하려는 값입니다.' },
        },
    },
    NA: {
        description: '오류 값 #N/A를 반환합니다',
        abstract: '오류 값 #N/A를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: '참조된 시트의 시트 번호를 반환합니다',
        abstract: '참조된 시트의 시트 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '시트 번호를 원하는 시트의 이름 또는 참조입니다. value가 생략되면 SHEET는 함수가 포함된 시트의 번호를 반환합니다.' },
        },
    },
    SHEETS: {
        description: '통합 문서의 시트 수를 반환합니다',
        abstract: '통합 문서의 시트 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: '값의 데이터 형식을 나타내는 숫자를 반환합니다',
        abstract: '값의 데이터 형식을 나타내는 숫자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '숫자, 텍스트, 논리값 등과 같은 모든 값이 될 수 있습니다.' },
        },
    },
};

export default locale;

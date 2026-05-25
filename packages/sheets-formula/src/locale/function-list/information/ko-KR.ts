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
                url: 'https://support.microsoft.com/ko-kr/office/cell-함수-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
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
                url: 'https://support.microsoft.com/ko-kr/office/error-type-함수-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
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
                url: 'https://support.microsoft.com/ko-kr/office/info-함수-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    ISBETWEEN: {
        description: '제공된 숫자가 포함적으로 또는 제외적으로 다른 두 숫자 사이에 있는지 확인합니다.',
        abstract: '제공된 숫자가 포함적으로 또는 제외적으로 다른 두 숫자 사이에 있는지 확인합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/10538337?hl=ko&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: '`lower_value`와 `upper_value` 사이에 있는지 테스트할 값입니다.' },
            lowerValue: { name: 'lower_value', detail: '`value_to_compare`가 속할 수 있는 값 범위의 하한입니다.' },
            upperValue: { name: 'upper_value', detail: '`value_to_compare`가 속할 수 있는 값 범위의 상한입니다.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: '값 범위에 `lower_value`가 포함되는지 여부입니다. 기본적으로 TRUE입니다.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: '값 범위에 `upper_value`가 포함되는지 여부입니다. 기본적으로 TRUE입니다.' },
        },
    },
    ISBLANK: {
        description: '값이 비어 있으면 TRUE를 반환합니다',
        abstract: '값이 비어 있으면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISDATE: {
        description: '값이 날짜인지 여부를 반환합니다.',
        abstract: '값이 날짜인지 여부를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/9061381?hl=ko&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '날짜로 확인할 값입니다.' },
        },
    },
    ISEMAIL: {
        description: '값이 유효한 이메일 주소인지 확인합니다',
        abstract: '값이 유효한 이메일 주소인지 확인합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3256503?hl=ko&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '이메일 주소로 확인할 값입니다.' },
        },
    },
    ISERR: {
        description: '값이 #N/A를 제외한 오류 값이면 TRUE를 반환합니다',
        abstract: '값이 #N/A를 제외한 오류 값이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISERROR: {
        description: '값이 오류 값이면 TRUE를 반환합니다',
        abstract: '값이 오류 값이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISEVEN: {
        description: '숫자가 짝수이면 TRUE를 반환합니다',
        abstract: '숫자가 짝수이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/iseven-함수-aa15929a-d77b-4fbb-92f4-2f479af55356',
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
                url: 'https://support.microsoft.com/ko-kr/office/isformula-함수-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: '테스트하려는 셀에 대한 참조입니다.' },
        },
    },
    ISLOGICAL: {
        description: '값이 논리값이면 TRUE를 반환합니다',
        abstract: '값이 논리값이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISNA: {
        description: '값이 #N/A 오류 값이면 TRUE를 반환합니다',
        abstract: '값이 #N/A 오류 값이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISNONTEXT: {
        description: '값이 텍스트가 아니면 TRUE를 반환합니다',
        abstract: '값이 텍스트가 아니면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISNUMBER: {
        description: '값이 숫자이면 TRUE를 반환합니다',
        abstract: '값이 숫자이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISODD: {
        description: '숫자가 홀수이면 TRUE를 반환합니다',
        abstract: '숫자가 홀수이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/isodd-함수-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
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
                url: 'https://support.microsoft.com/ko-kr/office/isomitted-함수-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    ISREF: {
        description: '값이 참조이면 TRUE를 반환합니다',
        abstract: '값이 참조이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISTEXT: {
        description: '값이 텍스트이면 TRUE를 반환합니다',
        abstract: '값이 텍스트이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/is-함수-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다. value 인수는 빈 값(빈 셀), 오류, 논리값, 텍스트, 숫자 또는 참조 값이거나 이들 중 하나를 참조하는 이름일 수 있습니다.' },
        },
    },
    ISURL: {
        description: '값이 유효한 URL인지 확인합니다.',
        abstract: '값이 유효한 URL인지 확인합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3256501?hl=ko&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'URL로 확인할 값입니다.' },
        },
    },
    N: {
        description: '숫자로 변환된 값을 반환합니다',
        abstract: '숫자로 변환된 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/n-함수-a624cad1-3635-4208-b54a-29733d1278c9',
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
                url: 'https://support.microsoft.com/ko-kr/office/na-함수-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
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
                url: 'https://support.microsoft.com/ko-kr/office/sheet-함수-44718b6f-8b87-47a1-a9d6-b701c06cff24',
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
                url: 'https://support.microsoft.com/ko-kr/office/sheets-함수-770515eb-e1e8-45ce-8066-b557e5e4b80b',
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
                url: 'https://support.microsoft.com/ko-kr/office/type-함수-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '숫자, 텍스트, 논리값 등과 같은 모든 값이 될 수 있습니다.' },
        },
    },
};

export default locale;

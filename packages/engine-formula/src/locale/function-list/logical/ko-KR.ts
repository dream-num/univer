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
    AND: {
        description: '모든 인수가 TRUE이면 TRUE를 반환합니다',
        abstract: '모든 인수가 TRUE이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'TRUE 또는 FALSE로 평가하려는 첫 번째 조건입니다.' },
            logical2: { name: 'logical2', detail: 'TRUE 또는 FALSE로 평가하려는 추가 조건으로 최대 255개 조건입니다.' },
        },
    },
    BYCOL: {
        description: '각 열에 LAMBDA를 적용하고 결과 배열을 반환합니다',
        abstract: '각 열에 LAMBDA를 적용하고 결과 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '열로 구분할 배열입니다.' },
            lambda: { name: 'lambda', detail: '열을 단일 매개 변수로 취하고 하나의 결과를 계산하는 LAMBDA입니다.' },
        },
    },
    BYROW: {
        description: '각 행에 LAMBDA를 적용하고 결과 배열을 반환합니다',
        abstract: '각 행에 LAMBDA를 적용하고 결과 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '행으로 구분할 배열입니다.' },
            lambda: { name: 'lambda', detail: '행을 단일 매개 변수로 취하고 하나의 결과를 계산하는 LAMBDA입니다.' },
        },
    },
    FALSE: {
        description: '논리값 FALSE를 반환합니다',
        abstract: '논리값 FALSE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: '조건을 테스트하고 True 또는 False에 대한 값을 반환합니다',
        abstract: '조건을 테스트하고 True 또는 False에 대한 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: '평가하려는 조건입니다.' },
            valueIfTrue: { name: 'value_if_true', detail: 'logical_test가 TRUE일 때 반환하려는 값입니다.' },
            valueIfFalse: { name: 'value_if_false', detail: 'logical_test가 FALSE일 때 반환하려는 값입니다.' },
        },
    },
    IFERROR: {
        description: '수식이 오류로 평가되면 사용자가 지정한 값을 반환하고, 그렇지 않으면 수식 결과를 반환합니다',
        abstract: '수식이 오류로 평가되면 사용자가 지정한 값을 반환하고, 그렇지 않으면 수식 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '오류를 확인할 인수입니다.' },
            valueIfError: { name: 'value_if_error', detail: '수식이 오류로 평가되면 반환할 값입니다.' },
        },
    },
    IFNA: {
        description: '식이 #N/A로 확인되면 지정한 값을 반환하고, 그렇지 않으면 식의 결과를 반환합니다',
        abstract: '식이 #N/A로 확인되면 지정한 값을 반환하고, 그렇지 않으면 식의 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '#N/A 오류 값을 확인할 인수입니다.' },
            valueIfNa: { name: 'value_if_na', detail: '수식이 #N/A 오류 값으로 평가되면 반환할 값입니다.' },
        },
    },
    IFS: {
        description: '하나 이상의 조건이 충족되는지 확인하고 첫 번째 TRUE 조건에 해당하는 값을 반환합니다',
        abstract: '하나 이상의 조건이 충족되는지 확인하고 첫 번째 TRUE 조건에 해당하는 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'TRUE 또는 FALSE로 평가되는 조건입니다.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'logical_test1이 TRUE일 때 반환되는 결과입니다. 비어 있을 수 있습니다.' },
            logicalTest2: { name: 'logical_test2', detail: 'TRUE 또는 FALSE로 평가되는 조건입니다.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'logical_test2가 TRUE일 때 반환되는 결과입니다. 비어 있을 수 있습니다.' },
        },
    },
    LAMBDA: {
        description: '사용자 정의 재사용 가능한 함수를 만들고 친숙한 이름으로 호출합니다',
        abstract: '사용자 정의 재사용 가능한 함수를 만들고 친숙한 이름으로 호출합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: '함수에 전달하려는 값입니다(예: 셀 참조, 하드 코딩된 값 또는 기타 수식).' },
            calculation: { name: 'calculation', detail: '마지막 인수로 실행하고 함수의 결과를 반환하려는 수식입니다.' },
        },
    },
    LET: {
        description: '함수는 LET 계산 결과에 이름을 할당합니다. 이를 통해 수식 안에 중간 계산, 값을 저장하거나 이름을 정의할 수 있습니다. 이러한 이름은 함수 범위 내에서만 적용됩니다 LET . 프로그래밍 LET 의 변수와 마찬가지로 은 Excel의 네이티브 수식 구문을 통해 수행됩니다.',
        abstract: '함수는 LET 계산 결과에 이름을 할당합니다. 이를 통해 수식 안에 중간 계산, 값을 저장하거나 이름을 정의할 수 있습니다. 이러한 이름은 함수 범위 내에서만 적용됩니다 LET . 프로그래밍 LET 의 변수와 마찬가지로 은 Excel의 네이티브 수식 구문을 통해 수행됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: '첫 번째 이름입니다. 유효한 Excel 이름으로 시작해야 합니다.' },
            nameValue1: { name: 'name_value1', detail: '이름 1에 할당된 값입니다.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: '다음 중 하나입니다. LET 함수의 모든 이름을 사용하는 계산이며 LET 함수의 마지막 인수여야 합니다. 또는 두 번째 name_value에 할당할 두 번째 이름이며, 이름을 지정하면 name_value2와 calculation_or_name3가 필요합니다.' },
            nameValue2: { name: 'name_value2', detail: 'calculation_or_name2에 할당된 값입니다.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: '다음 중 하나입니다. LET 함수의 모든 이름을 사용하는 계산이며 LET 함수의 마지막 인수는 계산이어야 합니다. 또는 세 번째 name_value에 할당할 세 번째 이름이며, 이름을 지정하면 name_value3와 calculation_or_name4가 필요합니다.' },
        },
    },
    MAKEARRAY: {
        description: 'LAMBDA를 적용하여 지정된 행 및 열 크기의 계산된 배열을 반환합니다',
        abstract: 'LAMBDA를 적용하여 지정된 행 및 열 크기의 계산된 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: '배열의 행 수입니다. 0보다 커야 합니다.' },
            number2: { name: 'cols', detail: '배열의 열 수입니다. 0보다 커야 합니다.' },
            value3: {
                name: 'lambda',
                detail: ' A LAMBDA that is called to create the array. The LAMBDA takes two parameters: row (The row index of the array), col (The column index of the array).',
            },
        },
    },
    MAP: {
        description: '배열의 각 값을 새 값에 매핑하여 형성된 배열을 반환합니다',
        abstract: '배열의 각 값을 새 값에 매핑하여 형성된 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '매핑할 배열입니다.' },
            array2: { name: 'array2', detail: '매핑할 두 번째 배열입니다.' },
            lambda: { name: 'lambda', detail: '각 배열에서 하나의 값을 받아들이고 하나의 결과를 반환하는 LAMBDA입니다.' },
        },
    },
    NOT: {
        description: '인수의 논리를 반대로 바꿉니다',
        abstract: '인수의 논리를 반대로 바꿉니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: '반대로 바꿀 조건 또는 값입니다.' },
        },
    },
    OR: {
        description: '인수가 하나라도 TRUE이면 TRUE를 반환합니다',
        abstract: '인수가 하나라도 TRUE이면 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'TRUE 또는 FALSE로 평가하려는 첫 번째 조건입니다.' },
            logical2: { name: 'logical2', detail: 'TRUE 또는 FALSE로 평가하려는 추가 조건으로 최대 255개 조건입니다.' },
        },
    },
    REDUCE: {
        description: '각 값에 LAMBDA를 적용하여 배열을 누적 값으로 축소하고 누적기에서 총 값을 반환합니다',
        abstract: '각 값에 LAMBDA를 적용하여 배열을 누적 값으로 축소하고 누적기에서 총 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: '누산기의 시작 값을 설정합니다.' },
            array: { name: 'array', detail: '축소할 배열입니다.' },
            lambda: { name: 'lambda', detail: '배열의 각 요소에서 호출되는 LAMBDA입니다.' },
        },
    },
    SCAN: {
        description: '각 값에 LAMBDA를 적용하여 배열을 검색하고 각 중간 값을 갖는 배열을 반환합니다',
        abstract: '각 값에 LAMBDA를 적용하여 배열을 검색하고 각 중간 값을 갖는 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: '누산기의 시작 값을 설정합니다.' },
            array: { name: 'array', detail: '검색할 배열입니다.' },
            lambda: { name: 'lambda', detail: '배열의 각 요소에서 호출되는 LAMBDA입니다.' },
        },
    },
    SWITCH: {
        description: '값 목록에 대해 식을 평가하고 첫 번째로 일치하는 값에 해당하는 결과를 반환합니다',
        abstract: '값 목록에 대해 식을 평가하고 첫 번째로 일치하는 값에 해당하는 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: '값(예: 숫자, 날짜 또는 일부 텍스트)에 대해 평가되는 식입니다.' },
            value1: { name: 'value1', detail: '식과 비교될 값입니다.' },
            result1: { name: 'result1', detail: '해당 값이 식과 일치하면 반환되는 값입니다.' },
            defaultOrValue2: { name: 'default_or_value2', detail: '기본 - 생략 가능. 일치 항목이 없으면 반환할 값입니다.' },
            result2: { name: 'result2', detail: '기본 - 생략 가능. 해당 값이 식과 일치하면 반환되는 값입니다.' },
        },
    },
    TRUE: {
        description: '논리값 TRUE를 반환합니다',
        abstract: '논리값 TRUE를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: '모든 인수의 논리적 배타적 OR을 반환합니다',
        abstract: '모든 인수의 논리적 배타적 OR을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: '1에서 254개의 조건으로 TRUE 또는 FALSE를 테스트할 수 있습니다.' },
            logical2: { name: 'logical2', detail: '1에서 254개의 조건으로 TRUE 또는 FALSE를 테스트할 수 있습니다.' },
        },
    },
};

export default locale;

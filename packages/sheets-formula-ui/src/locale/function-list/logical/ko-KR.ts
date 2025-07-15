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
                url: 'https://support.microsoft.com/ko-kr/office/and-함수-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
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
                url: 'https://support.microsoft.com/ko-kr/office/bycol-함수-58463999-7de5-49ce-8f38-b7f7a2192bfb',
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
                url: 'https://support.microsoft.com/ko-kr/office/byrow-함수-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
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
                url: 'https://support.microsoft.com/ko-kr/office/false-함수-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
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
                url: 'https://support.microsoft.com/ko-kr/office/if-함수-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
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
                url: 'https://support.microsoft.com/ko-kr/office/iferror-함수-c526fd07-caeb-47b8-8bb6-63f3e417f611',
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
                url: 'https://support.microsoft.com/ko-kr/office/ifna-함수-6626c961-a569-42fc-a49d-79b4951fd461',
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
                url: 'https://support.microsoft.com/ko-kr/office/ifs-함수-36329a26-37b2-467c-972b-4a39bd951d45',
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
                url: 'https://support.microsoft.com/ko-kr/office/lambda-함수-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: '함수에 전달하려는 값입니다(예: 셀 참조, 하드 코딩된 값 또는 기타 수식).' },
            calculation: { name: 'calculation', detail: '마지막 인수로 실행하고 함수의 결과를 반환하려는 수식입니다.' },
        },
    },
    LET: {
        description: '계산 결과에 이름을 할당합니다',
        abstract: '계산 결과에 이름을 할당합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/let-함수-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: '첫 번째 이름입니다. 유효한 Excel 이름으로 시작해야 합니다.' },
            nameValue1: { name: 'name_value1', detail: '이름 1에 할당된 값입니다.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'One of the following:\n1.A calculation that uses all names within the LET function. This must be the last argument in the LET function.\n2.A second name to assign to a second name_value. If a name is specified, name_value2 and calculation_or_name3 become required.' },
            nameValue2: { name: 'name_value2', detail: 'The value that is assigned to calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'One of the following:\n1.A calculation that uses all names within the LET function. The last argument in the LET function must be a calculation.\n2.A third name to assign to a third name_value. If a name is specified, name_value3 and calculation_or_name4 become required.' },
        },
    },
    MAKEARRAY: {
        description: 'LAMBDA를 적용하여 지정된 행 및 열 크기의 계산된 배열을 반환합니다',
        abstract: 'LAMBDA를 적용하여 지정된 행 및 열 크기의 계산된 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/makearray-함수-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'The number of rows in the array. Must be greater than zero.' },
            number2: { name: 'cols', detail: 'The number of columns in the array. Must be greater than zero.' },
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
                url: 'https://support.microsoft.com/ko-kr/office/map-함수-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '매핑할 배열입니다.' },
            array2: { name: 'array2', detail: 'An array2 to be mapped.' },
            lambda: { name: 'lambda', detail: '각 배열에서 하나의 값을 받아들이고 하나의 결과를 반환하는 LAMBDA입니다.' },
        },
    },
    NOT: {
        description: '인수의 논리를 반대로 바꿉니다',
        abstract: '인수의 논리를 반대로 바꿉니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/not-함수-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
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
                url: 'https://support.microsoft.com/ko-kr/office/or-함수-7d17ad14-8700-4281-b308-00b131e22af0',
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
                url: 'https://support.microsoft.com/ko-kr/office/reduce-함수-42e39910-b345-45f3-84b8-0642b568b7cb',
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
                url: 'https://support.microsoft.com/ko-kr/office/scan-함수-d58dfd11-9969-4439-8730-1f22e81cc0f5',
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
                url: 'https://support.microsoft.com/ko-kr/office/switch-함수-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
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
                url: 'https://support.microsoft.com/ko-kr/office/true-함수-7652c6e3-8987-48d0-97cd-ef223246b3fb',
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
                url: 'https://support.microsoft.com/ko-kr/office/xor-함수-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: '1에서 254개의 조건으로 TRUE 또는 FALSE를 테스트할 수 있습니다.' },
            logical2: { name: 'logical2', detail: '1에서 254개의 조건으로 TRUE 또는 FALSE를 테스트할 수 있습니다.' },
        },
    },
};

export default locale;

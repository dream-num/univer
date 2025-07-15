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
    CUBEKPIMEMBER: {
        description: 'KPI 속성을 반환하고 셀에 KPI 이름을 표시합니다. KPI는 조직의 성과를 모니터링하는 데 사용되는 측정 가능한 지표입니다, 예: 월간 총 이익 또는 분기별 직원 회전율.',
        abstract: 'KPI 속성을 반환하고 셀에 KPI 이름을 표시합니다. KPI는 조직의 성과를 모니터링하는 데 사용되는 측정 가능한 지표입니다, 예: 월간 총 이익 또는 분기별 직원 회전율.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    CUBEMEMBER: {
        description: '큐브에서 멤버 또는 튜플을 반환합니다. 멤버 또는 튜플이 큐브에 존재하는지 확인하려면 사용합니다.',
        abstract: '큐브에서 멤버 또는 튜플을 반환합니다. 멤버 또는 튜플이 큐브에 존재하는지 확인하려면 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: '큐브에서 멤버 속성의 값을 반환합니다. 멤버 이름이 큐브에 존재하는지 확인하려면 사용합니다.',
        abstract: '큐브에서 멤버 속성의 값을 반환합니다. 멤버 이름이 큐브에 존재하는지 확인하려면 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBERANKEDMEMBER: {
        description: '집합에서 n번째 또는 순위가 지정된 멤버를 반환합니다. 최고 판매 역할을 수행하는 사람이나 상위 10명의 학생과 같은 집합에서 하나 이상의 요소를 반환하려면 사용합니다.',
        abstract: '집합에서 n번째 또는 순위가 지정된 멤버를 반환합니다. 최고 판매 역할을 수행하는 사람이나 상위 10명의 학생과 같은 집합에서 하나 이상의 요소를 반환하려면 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    CUBESET: {
        description: '집합 표현식을 서버의 큐브로 보내어 집합을 만들고 그 집합을 Microsoft Excel로 반환합니다.',
        abstract: '집합 표현식을 서버의 큐브로 보내어 집합을 만들고 그 집합을 Microsoft Excel로 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    CUBESETCOUNT: {
        description: '집합에 있는 항목의 수를 반환합니다.',
        abstract: '집합에 있는 항목의 수를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    CUBEVALUE: {
        description: '큐브에서 집계된 값을 반환합니다.',
        abstract: '큐브에서 집계된 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
};

export default locale;

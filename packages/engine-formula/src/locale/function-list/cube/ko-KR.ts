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
        description: 'KPI(핵심 성과 지표) 속성을 반환하고 셀에 KPI 이름을 표시합니다. KPI는 월별 매출총이익, 분기별 직원 전직률과 같이 수량화할 수 있는 측정값이며 조직의 성과를 모니터링하는 데 사용됩니다.',
        abstract: 'KPI(핵심 성과 지표) 속성을 반환하고 셀에 KPI 이름을 표시합니다. KPI는 월별 매출총이익, 분기별 직원 전직률과 같이 수량화할 수 있는 측정값이며 조직의 성과를 모니터링하는 데 사용됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            kpiName: { name: 'Kpi_name', detail: '필수. 큐브의 KPI 이름을 나타내는 텍스트 문자열입니다.' },
            kpiProperty: { name: 'Kpi_property', detail: '필수. 반환되는 KPI 구성 요소로서 다음 중 하나일 수 있습니다.' },
            caption: { name: '캡션', detail: '선택적. kpi_name과 kpi_property 대신 셀에 표시되는 대체 텍스트 문자열입니다.' },
        },
    },
    CUBEMEMBER: {
        description: '큐브에서 구성원이나 튜플을 반환합니다. 큐브에 구성원이나 튜플이 있는지 확인하는 데 사용합니다.',
        abstract: '큐브에서 구성원이나 튜플을 반환합니다. 큐브에 구성원이나 튜플이 있는지 확인하는 데 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            memberExpression: { name: 'Member_expression', detail: '필수. 큐브에서 고유한 구성원으로 평가되는 MDX(다차원 식)의 텍스트 문자열입니다. 또는 member_expression은 셀 범위 또는 배열 상수로 지정된 튜플이 될 수 있습니다.' },
            caption: { name: '캡션', detail: '선택적. 정의된 경우 큐브에서 캡션 대신 셀에 표시되는 텍스트 문자열입니다. 튜플이 반환될 경우 사용되는 캡션은 해당 튜플의 마지막 구성원에 대한 캡션입니다.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Excel의 Cube 함수 중 하나인 CUBEMEMBERPROPERTY 함수는 큐브에서 멤버 속성의 값을 반환합니다. 큐브 내에 구성원 이름이 있는지 확인하고 해당 구성원에 지정된 속성을 반환하는 데 사용합니다.',
        abstract: 'Excel의 Cube 함수 중 하나인 CUBEMEMBERPROPERTY 함수는 큐브에서 멤버 속성의 값을 반환합니다. 큐브 내에 구성원 이름이 있는지 확인하고 해당 구성원에 지정된 속성을 반환하는 데 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            memberExpression: { name: 'Member_expression', detail: '필수. 큐브 내에 있는 구성원의 MDX(다차원 식)를 나타내는 텍스트 문자열입니다.' },
            property: { name: '속성', detail: '필수. 반환되는 속성의 이름을 나타내는 텍스트 문자열이거나 속성 이름을 포함하는 셀에 대한 참조입니다.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: '집합에서 n번째 또는 순위 내의 구성원을 반환합니다. 최고 판매 사원이나 10등 내의 학생 등 집합에서 하나 이상의 요소를 반환하는 데 사용합니다.',
        abstract: '집합에서 n번째 또는 순위 내의 구성원을 반환합니다. 최고 판매 사원이나 10등 내의 학생 등 집합에서 하나 이상의 요소를 반환하는 데 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            setExpression: { name: 'Set_expression', detail: '필수. "{[Item1].children}"과 같은 집합 식을 나타내는 텍스트 문자열입니다. set_expression은 CUBESET 함수이거나 CUBESET 함수를 포함하는 셀에 대한 참조일 수도 있습니다.' },
            rank: { name: '순위', detail: '필수. 반환할 맨 위 값을 지정하는 정수 값입니다. rank가 1이면 최상위 값을 반환하고 rank가 2이면 최상위에서 두 번째 값을 반환합니다. 상위 5개의 값을 반환하려면 CUBERANKEDMEMBER를 다섯 번 사용하고 1부터 5까지 매번 다른 순위를 지정하십시오.' },
            caption: { name: '캡션', detail: '선택적. 정의된 경우 큐브에서 캡션 대신 셀에 표시되는 텍스트 문자열입니다.' },
        },
    },
    CUBESET: {
        description: '서버의 큐브에 집합을 만드는 식을 전송하여 계산된 구성원이나 튜플 집합을 정의하고 이 집합을 Microsoft Excel에 반환합니다.',
        abstract: '서버의 큐브에 집합을 만드는 식을 전송하여 계산된 구성원이나 튜플 집합을 정의하고 이 집합을 Microsoft Excel에 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            setExpression: { name: 'Set_expression', detail: '필수. 구성원 또는 튜플의 집합을 만드는 집합 식을 나타내는 텍스트 문자열입니다. set_expression은 집합에 포함된 구성원, 튜플 또는 하위 집합이 하나 이상 들어 있는 Excel 범위에 대한 셀 참조일 수도 있습니다.' },
            caption: { name: '캡션', detail: '선택적. 정의된 경우 큐브에서 캡션 대신 셀에 표시되는 텍스트 문자열입니다.' },
            sortOrder: { name: 'Sort_order', detail: '선택적. 수행할 정렬 유형으로서 다음 중 하나일 수 있습니다.' },
            sortBy: { name: 'Sort_by', detail: '선택적. 정렬 기준으로 사용할 값을 나타내는 텍스트 문자열입니다. 예를 들어 판매량이 가장 높은 도시를 가져오려면 set_expression에 도시 집합을 지정하고 sort_by에 판매량 측정값을 지정합니다. 인구가 가장 많은 도시를 가져오려면 set_expression에 도시 집합을 지정하고 sort_by에 인구 측정값을 지정합니다. sort_order에 sort_by가 필요한 경우 sort_by를 지정하지 않으면 CUBESET에서는 #VALUE! 오류 메시지가 반환됩니다.' },
        },
    },
    CUBESETCOUNT: {
        description: '집합에서 항목 개수를 반환합니다.',
        abstract: '집합에서 항목 개수를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: '설정', detail: '필수. CUBESET 함수에 의해 정의된 집합으로 계산되는 Microsoft Excel 식을 나타내는 텍스트 문자열입니다. set은 CUBESET 함수이거나 CUBESET 함수를 포함하는 셀에 대한 참조일 수도 있습니다.' },
        },
    },
    CUBEVALUE: {
        description: '큐브에서 집계 값을 반환합니다.',
        abstract: '큐브에서 집계 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: '연결', detail: '필수. 큐브에 대한 연결 이름을 나타내는 텍스트 문자열입니다.' },
            memberExpression: { name: 'Member_expression', detail: '선택적. 큐브 내의 멤버 또는 튜플로 계산되는 MDX(다차원 식)의 텍스트 문자열입니다. 또는 member_expression CUBESET 함수로 정의된 집합일 수 있습니다. member_expression 슬라이서로 사용하여 집계된 값이 반환되는 큐브 부분을 정의합니다. member_expression 측정값이 지정되지 않은 경우 해당 큐브에 대한 기본 측정값이 사용됩니다.' },
        },
    },
};

export default locale;

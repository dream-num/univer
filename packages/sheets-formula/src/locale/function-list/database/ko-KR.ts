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
    DAVERAGE: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 값의 평균을 계산합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 값의 평균을 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '는 목록 또는 데이터베이스를 구성하는 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '함수에 사용되는 열을 나타냅니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '은 지정한 조건을 포함하는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DCOUNT: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자가 있는 셀의 개수를 계산합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자가 있는 셀의 개수를 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DCOUNTA: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 셀 중 비어 있지 않은 셀의 개수를 계산합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 셀 중 비어 있지 않은 셀의 개수를 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '선택적. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DGET: {
        description: '목록이나 데이터베이스의 열에서 지정한 조건에 맞는 하나의 값을 추출합니다.',
        abstract: '목록이나 데이터베이스의 열에서 지정한 조건에 맞는 하나의 값을 추출합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DMAX: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 가장 큰 값을 반환합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 가장 큰 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DMIN: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 가장 작은 값을 반환합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 가장 작은 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DPRODUCT: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 값을 곱합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 값을 곱합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DSTDEV: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 표본을 기반으로 한 모집단의 표준 편차를 추정합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 표본을 기반으로 한 모집단의 표준 편차를 추정합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DSTDEVP: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 전체 모집단을 기반으로 한 모집단의 표준 편차를 계산합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 전체 모집단을 기반으로 한 모집단의 표준 편차를 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DSUM: {
        description: '목록 또는 데이터베이스에서 DSUM은 지정된 조건과 일치하는 레코드의 필드(열)에 있는 숫자의 합계를 제공합니다.',
        abstract: '목록 또는 데이터베이스에서 DSUM은 지정된 조건과 일치하는 레코드의 필드(열)에 있는 숫자의 합계를 제공합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 목록 또는 데이터베이스를 구성하는 셀 범위입니다. 데이터베이스는 관련 정보의 행이 레코드 이고 데이터 열이 필드 인 관련 데이터의 목록입니다. 목록의 첫 번째 행에는 해당 열마다 레이블이 포함됩니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. 예를 들어 "Age" 또는 "Yield"와 같이 큰따옴표 사이에 묶인 열 레이블을 지정합니다. 또는 목록 내의 열 위치를 나타내는 숫자(따옴표 제외)를 지정할 수 있습니다( 예: 첫 번째 열의 경우 1 , 두 번째 열의 경우 2 등).' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 포함된 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DVAR: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 표본을 기반으로 한 모집단의 분산을 추정합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 표본을 기반으로 한 모집단의 분산을 추정합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
    DVARP: {
        description: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 전체 모집단을 기반으로 한 모집단의 분산을 계산합니다.',
        abstract: '목록이나 데이터베이스의 레코드 필드(열)에서 지정한 조건에 맞는 숫자를 사용하여 전체 모집단을 기반으로 한 모집단의 분산을 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '필수. 데이터베이스나 목록으로 지정할 셀 범위입니다. 데이터베이스는 레코드(관련 정보 행)와 필드(데이터 열)로 이루어진 관련 데이터 목록입니다. 목록의 첫째 행에는 각 열의 레이블이 있습니다.' },
            field: { name: 'field', detail: '필수. 함수에 사용되는 열을 지정합니다. field 인수는 "나이" 또는 "수확량"처럼 열 레이블을 큰따옴표로 묶어 텍스트로 지정하거나 첫째 열을 1, 둘째 열을 2 등 목록 내의 열 위치를 나타내는 숫자로 지정할 수 있습니다.' },
            criteria: { name: 'criteria', detail: '필수. 지정한 조건이 있는 셀 범위입니다. 적어도 하나의 열 레이블이 있고 열 레이블 아래에 열 조건을 지정할 셀이 하나 이상 포함된 범위를 criteria 인수로 사용할 수 있습니다.' },
        },
    },
};

export default locale;

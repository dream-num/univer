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
        description: '선택한 데이터베이스 항목의 평균을 반환합니다',
        abstract: '선택한 데이터베이스 항목의 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/daverage-함수-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DCOUNT: {
        description: '데이터베이스에서 숫자가 있는 셀의 개수를 계산합니다',
        abstract: '데이터베이스에서 숫자가 있는 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dcount-함수-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DCOUNTA: {
        description: '데이터베이스에서 비어 있지 않은 셀의 개수를 계산합니다',
        abstract: '데이터베이스에서 비어 있지 않은 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dcounta-함수-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DGET: {
        description: '지정한 조건과 일치하는 단일 레코드를 데이터베이스에서 추출합니다',
        abstract: '지정한 조건과 일치하는 단일 레코드를 데이터베이스에서 추출합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dget-함수-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DMAX: {
        description: '선택한 데이터베이스 항목에서 최대값을 반환합니다',
        abstract: '선택한 데이터베이스 항목에서 최대값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dmax-함수-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DMIN: {
        description: '선택한 데이터베이스 항목에서 최소값을 반환합니다',
        abstract: '선택한 데이터베이스 항목에서 최소값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dmin-함수-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DPRODUCT: {
        description: '데이터베이스에서 조건과 일치하는 레코드의 특정 필드에 있는 값을 곱합니다',
        abstract: '데이터베이스에서 조건과 일치하는 레코드의 특정 필드에 있는 값을 곱합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dproduct-함수-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DSTDEV: {
        description: '선택한 데이터베이스 항목의 표본을 기준으로 표준 편차를 추정합니다',
        abstract: '선택한 데이터베이스 항목의 표본을 기준으로 표준 편차를 추정합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dstdev-함수-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DSTDEVP: {
        description: '선택한 데이터베이스 항목의 전체 모집단을 기준으로 표준 편차를 계산합니다',
        abstract: '선택한 데이터베이스 항목의 전체 모집단을 기준으로 표준 편차를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dstdevp-함수-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DSUM: {
        description: '조건과 일치하는 데이터베이스의 레코드 필드 열에 있는 숫자를 더합니다',
        abstract: '조건과 일치하는 데이터베이스의 레코드 필드 열에 있는 숫자를 더합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dsum-함수-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DVAR: {
        description: '선택한 데이터베이스 항목의 표본을 기준으로 분산을 추정합니다',
        abstract: '선택한 데이터베이스 항목의 표본을 기준으로 분산을 추정합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dvar-함수-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
    DVARP: {
        description: '선택한 데이터베이스 항목의 전체 모집단을 기준으로 분산을 계산합니다',
        abstract: '선택한 데이터베이스 항목의 전체 모집단을 기준으로 분산을 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/dvarp-함수-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: '목록이나 데이터베이스를 구성하는 셀 범위입니다.' },
            field: { name: 'field', detail: '함수에서 사용되는 열을 나타냅니다.' },
            criteria: { name: 'criteria', detail: '지정한 조건이 포함된 셀 범위입니다.' },
        },
    },
};

export default locale;

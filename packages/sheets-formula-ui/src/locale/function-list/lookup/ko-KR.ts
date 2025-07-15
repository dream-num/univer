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
    ADDRESS: {
        description: '지정된 행 및 열 번호가 주어진 워크시트에서 셀의 주소를 가져옵니다. 예를 들어 ADDRESS(2,3)은 $C$2를 반환합니다. 또 다른 예로 ADDRESS(77,300)은 $KN$77을 반환합니다. ROW 및 COLUMN 함수와 같은 다른 함수를 사용하여 ADDRESS 함수에 대한 행 및 열 번호 인수를 제공할 수 있습니다.',
        abstract: '워크시트의 단일 셀에 대한 참조를 텍스트로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/address-함수-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: {
                name: '행 번호',
                detail: '셀 참조에 사용할 행 번호를 지정하는 숫자 값입니다.',
            },
            column_num: {
                name: '열 번호',
                detail: '셀 참조에 사용할 열 번호를 지정하는 숫자 값입니다.',
            },
            abs_num: {
                name: '참조 유형',
                detail: '반환할 참조 유형을 지정하는 숫자 값입니다.',
            },
            a1: {
                name: '참조 스타일',
                detail: 'A1 또는 R1C1 참조 스타일을 지정하는 논리값입니다. A1 스타일에서는 열에 알파벳 레이블이 지정되고 행에는 숫자 레이블이 지정됩니다. R1C1 참조 스타일에서는 열과 행 모두에 숫자 레이블이 지정됩니다. A1 인수가 TRUE이거나 생략되면 ADDRESS 함수는 A1 스타일 참조를 반환합니다. FALSE이면 ADDRESS 함수는 R1C1 스타일 참조를 반환합니다.',
            },
            sheet_text: {
                name: '워크시트 이름',
                detail: '외부 참조로 사용할 워크시트의 이름을 지정하는 텍스트 값입니다. 예를 들어 수식 =ADDRESS(1,1,,,"Sheet2")는 Sheet2!$A$1을 반환합니다. sheet_text 인수가 생략되면 시트 이름이 사용되지 않으며 함수가 반환하는 주소는 현재 시트의 셀을 참조합니다.',
            },
        },
    },
    AREAS: {
        description: '참조의 영역 수를 반환합니다',
        abstract: '참조의 영역 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/areas-함수-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '셀 또는 셀 범위에 대한 참조이며 여러 영역을 참조할 수 있습니다.' },
        },
    },
    CHOOSE: {
        description: '값 목록에서 값을 선택합니다.',
        abstract: '값 목록에서 값을 선택합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/choose-함수-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: '선택된 값 인수를 지정합니다. Index_num은 1에서 254 사이의 숫자이거나 1에서 254 사이의 숫자를 포함하는 셀에 대한 수식 또는 참조여야 합니다.\nindex_num이 1이면 CHOOSE는 value1을 반환합니다. 2이면 CHOOSE는 value2를 반환합니다. 이런 식으로 계속됩니다.\nindex_num이 1보다 작거나 목록의 마지막 값 번호보다 크면 CHOOSE는 #VALUE! 오류 값을 반환합니다.\nindex_num이 분수이면 사용되기 전에 가장 낮은 정수로 잘립니다.' },
            value1: { name: 'value1', detail: 'CHOOSE는 index_num을 기반으로 값이나 수행할 작업을 선택합니다. 인수는 숫자, 셀 참조, 정의된 이름, 수식, 함수 또는 텍스트일 수 있습니다.' },
            value2: { name: 'value2', detail: '1에서 254개의 값 인수입니다.' },
        },
    },
    CHOOSECOLS: {
        description: '배열에서 지정된 열을 반환합니다',
        abstract: '배열에서 지정된 열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/choosecols-함수-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '새 배열에 반환할 열을 포함하는 배열입니다.' },
            colNum1: { name: 'col_num1', detail: '반환할 첫 번째 열입니다.' },
            colNum2: { name: 'col_num2', detail: '반환할 추가 열입니다.' },
        },
    },
    CHOOSEROWS: {
        description: '배열에서 지정된 행을 반환합니다',
        abstract: '배열에서 지정된 행을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chooserows-함수-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '새 배열에 반환할 행을 포함하는 배열입니다.' },
            rowNum1: { name: 'row_num1', detail: '반환할 첫 번째 행 번호입니다.' },
            rowNum2: { name: 'row_num2', detail: '반환할 추가 행 번호입니다.' },
        },
    },
    COLUMN: {
        description: '지정된 셀 참조의 열 번호를 반환합니다.',
        abstract: '참조의 열 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/column-함수-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '열 번호를 반환하려는 셀 또는 셀 범위입니다.' },
        },
    },
    COLUMNS: {
        description: '배열 또는 참조의 열 수를 반환합니다.',
        abstract: '참조의 열 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/columns-함수-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '열 수를 구하려는 배열, 배열 수식 또는 셀 범위에 대한 참조입니다.' },
        },
    },
    DROP: {
        description: '배열의 시작 또는 끝에서 지정된 수의 행이나 열을 제외합니다',
        abstract: '배열의 시작 또는 끝에서 지정된 수의 행이나 열을 제외합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/drop-함수-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '행이나 열을 삭제할 배열입니다.' },
            rows: { name: '행', detail: '삭제할 행 수입니다. 음수 값은 배열의 끝에서 삭제합니다.' },
            columns: { name: '열', detail: '제외할 열 수입니다. 음수 값은 배열의 끝에서 삭제합니다.' },
        },
    },
    EXPAND: {
        description: '배열을 지정된 행 및 열 차원으로 확장하거나 채웁니다',
        abstract: '배열을 지정된 행 및 열 차원으로 확장하거나 채웁니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/expand-함수-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '확장할 배열입니다.' },
            rows: { name: '행', detail: '확장된 배열의 행 수입니다. 누락된 경우 행은 확장되지 않습니다.' },
            columns: { name: '열', detail: '확장된 배열의 열 수입니다. 누락된 경우 열은 확장되지 않습니다.' },
            padWith: { name: 'pad_with', detail: '채울 값입니다. 기본값은 #N/A입니다.' },
        },
    },
    FILTER: {
        description: '정의한 기준에 따라 데이터 범위를 필터링합니다',
        abstract: '정의한 기준에 따라 데이터 범위를 필터링합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/filter-함수-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '필터링할 범위 또는 배열입니다.' },
            include: { name: '포함', detail: 'TRUE가 행이나 열을 유지함을 나타내는 부울 값의 배열입니다.' },
            ifEmpty: { name: 'if_empty', detail: '유지된 항목이 없으면 반환합니다.' },
        },
    },
    FORMULATEXT: {
        description: '지정된 참조의 수식을 텍스트로 반환합니다',
        abstract: '지정된 참조의 수식을 텍스트로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/formulatext-함수-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '셀 또는 셀 범위에 대한 참조입니다.' },
        },
    },
    GETPIVOTDATA: {
        description: '피벗 테이블 보고서에 저장된 데이터를 반환합니다',
        abstract: '피벗 테이블 보고서에 저장된 데이터를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/getpivotdata-함수-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    HLOOKUP: {
        description: '배열의 첫 행에서 찾고 표시된 셀의 값을 반환합니다',
        abstract: '배열의 첫 행에서 찾고 표시된 셀의 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/hlookup-함수-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: '표의 첫 번째 행에서 찾을 값입니다. Lookup_value는 값, 참조 또는 텍스트 문자열일 수 있습니다.',
            },
            tableArray: {
                name: 'table_array',
                detail: '데이터를 조회할 정보 표입니다. 범위에 대한 참조 또는 범위 이름을 사용합니다.',
            },
            rowIndexNum: {
                name: 'row_index_num',
                detail: '일치하는 값이 반환될 table_array의 행 번호입니다. row_index_num이 1이면 table_array의 첫 번째 행 값을 반환하고, row_index_num이 2이면 table_array의 두 번째 행 값을 반환하는 식입니다.',
            },
            rangeLookup: {
                name: 'range_lookup',
                detail: 'HLOOKUP이 정확히 일치하는 항목을 찾을지 대략적으로 일치하는 항목을 찾을지를 지정하는 논리값입니다.',
            },
        },
    },
    HSTACK: {
        description: '배열을 가로로 순서대로 추가하여 더 큰 배열을 반환합니다',
        abstract: '배열을 가로로 순서대로 추가하여 더 큰 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/hstack-함수-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: '배열', detail: '추가할 배열입니다.' },
            array2: { name: '배열', detail: '추가할 배열입니다.' },
        },
    },
    HYPERLINK: {
        description: '셀 내부에 하이퍼링크를 만듭니다.',
        abstract: '셀 내부에 하이퍼링크를 만듭니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3093313?sjid=14131674310032162335-NC&hl=ko',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: '따옴표로 묶인 링크 위치의 전체 URL 또는 이러한 URL을 포함하는 셀에 대한 참조입니다.' },
            linkLabel: { name: 'link_label', detail: '셀에 링크로 표시할 텍스트로, 따옴표로 묶이거나 이러한 레이블을 포함하는 셀에 대한 참조입니다.' },
        },
    },
    IMAGE: {
        description: '지정된 소스에서 이미지를 반환합니다',
        abstract: '지정된 소스에서 이미지를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/image-함수-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    INDEX: {
        description: '특정 행과 열의 교차점에 있는 셀의 참조를 반환합니다. 참조가 인접하지 않은 선택 항목으로 구성된 경우 조회할 선택 항목을 선택할 수 있습니다.',
        abstract: '인덱스를 사용하여 참조 또는 배열에서 값을 선택합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/index-함수-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '하나 이상의 셀 범위에 대한 참조입니다.' },
            rowNum: { name: 'row_num', detail: '참조를 반환할 참조의 행 번호입니다.' },
            columnNum: { name: 'column_num', detail: '참조를 반환할 참조의 열 번호입니다.' },
            areaNum: { name: 'area_num', detail: 'row_num과 column_num의 교차점을 반환할 참조의 범위를 선택합니다.' },
        },
    },
    INDIRECT: {
        description: '텍스트 문자열로 지정된 참조를 반환합니다. 참조는 즉시 평가되어 내용을 표시합니다.',
        abstract: '텍스트 값으로 표시된 참조를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/indirect-함수-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'A1 스타일 참조, R1C1 스타일 참조, 참조로 정의된 이름 또는 텍스트 문자열로 셀에 대한 참조를 포함하는 셀에 대한 참조입니다.' },
            a1: { name: 'a1', detail: 'ref_text 셀에 어떤 유형의 참조가 포함되어 있는지 지정하는 논리값입니다.' },
        },
    },
    LOOKUP: {
        description: '단일 행이나 열에서 찾고 두 번째 행이나 열의 같은 위치에서 값을 찾아야 할 때 사용합니다',
        abstract: '벡터 또는 배열에서 값을 조회합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/lookup-함수-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: 'LOOKUP이 첫 번째 벡터에서 검색하는 값입니다. Lookup_value는 숫자, 텍스트, 논리값 또는 값을 참조하는 이름이나 참조일 수 있습니다.',
            },
            lookupVectorOrArray: {
                name: 'lookup_vectorOrArray',
                detail: '하나의 행이나 하나의 열만 포함하는 범위입니다',
            },
            resultVector: {
                name: 'result_vector',
                detail: '하나의 행이나 하나의 열만 포함하는 범위입니다. result_vector 인수는 lookup_vector와 같은 크기여야 합니다.',
            },
        },
    },
    MATCH: {
        description: 'MATCH 함수는 셀 범위에서 지정된 항목을 검색한 다음 범위에서 해당 항목의 상대 위치를 반환합니다.',
        abstract: '참조 또는 배열에서 값을 조회합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/match-함수-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'lookup_array에서 일치시킬 값입니다.' },
            lookupArray: { name: 'lookup_array', detail: '검색하는 셀 범위입니다.' },
            matchType: { name: 'match_type', detail: '숫자 -1, 0 또는 1입니다.' },
        },
    },
    OFFSET: {
        description: '지정된 참조에서 오프셋된 참조를 반환합니다',
        abstract: '지정된 참조에서 오프셋된 참조를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/offset-함수-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '오프셋의 기준이 되는 참조입니다.' },
            rows: { name: '행', detail: '왼쪽 위 셀이 참조하도록 하려는 위 또는 아래 행 수입니다.' },
            cols: { name: '열', detail: '결과의 왼쪽 위 셀이 참조하도록 하려는 왼쪽 또는 오른쪽 열 수입니다.' },
            height: { name: '높이', detail: '반환된 참조가 되도록 하려는 행 수의 높이입니다. Height는 양수여야 합니다.' },
            width: { name: '너비', detail: '반환된 참조가 되도록 하려는 열 수의 너비입니다. Width는 양수여야 합니다.' },
        },
    },
    ROW: {
        description: '참조의 행 번호를 반환합니다',
        abstract: '참조의 행 번호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/row-함수-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '행 번호를 구하려는 셀 또는 셀 범위입니다.' },
        },
    },
    ROWS: {
        description: '배열 또는 참조의 행 수를 반환합니다.',
        abstract: '참조의 행 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rows-함수-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '행 수를 구하려는 배열, 배열 수식 또는 셀 범위에 대한 참조입니다.' },
        },
    },
    RTD: {
        description: 'COM 자동화를 지원하는 프로그램에서 실시간 데이터를 검색합니다',
        abstract: 'COM 자동화를 지원하는 프로그램에서 실시간 데이터를 검색합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rtd-함수-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    SORT: {
        description: '범위 또는 배열의 내용을 정렬합니다',
        abstract: '범위 또는 배열의 내용을 정렬합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/sort-함수-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '정렬할 범위 또는 배열입니다.' },
            sortIndex: { name: 'sort_index', detail: '정렬 순서(행별 또는 열별)를 나타내는 숫자입니다.' },
            sortOrder: { name: 'sort_order', detail: '원하는 정렬 순서를 나타내는 숫자입니다. 1은 오름차순(기본값), -1은 내림차순입니다.' },
            byCol: { name: 'by_col', detail: '원하는 정렬 방향을 나타내는 논리값입니다. FALSE는 행별로 정렬(기본값), TRUE는 열별로 정렬합니다.' },
        },
    },
    SORTBY: {
        description: '해당 범위 또는 배열의 값을 기준으로 범위 또는 배열의 내용을 정렬합니다',
        abstract: '해당 범위 또는 배열의 값을 기준으로 범위 또는 배열의 내용을 정렬합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/sortby-함수-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '정렬할 범위 또는 배열입니다.' },
            byArray1: { name: 'by_array1', detail: '정렬 기준이 되는 범위 또는 배열입니다.' },
            sortOrder1: { name: 'sort_order1', detail: '원하는 정렬 순서를 나타내는 숫자입니다. 1은 오름차순(기본값), -1은 내림차순입니다.' },
            byArray2: { name: 'by_array2', detail: '정렬 기준이 되는 범위 또는 배열입니다.' },
            sortOrder2: { name: 'sort_order2', detail: '원하는 정렬 순서를 나타내는 숫자입니다. 1은 오름차순(기본값), -1은 내림차순입니다.' },
        },
    },
    TAKE: {
        description: '배열의 시작 또는 끝에서 지정된 수의 연속 행이나 열을 반환합니다',
        abstract: '배열의 시작 또는 끝에서 지정된 수의 연속 행이나 열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/take-함수-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '행이나 열을 가져올 배열입니다.' },
            rows: { name: '행', detail: '가져올 행 수입니다. 음수 값은 배열의 끝에서 가져옵니다.' },
            columns: { name: '열', detail: '가져올 열 수입니다. 음수 값은 배열의 끝에서 가져옵니다.' },
        },
    },
    TOCOL: {
        description: '배열을 단일 열로 반환합니다',
        abstract: '배열을 단일 열로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tocol-함수-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '열로 반환할 배열 또는 참조입니다.' },
            ignore: { name: '무시', detail: '특정 유형의 값을 무시할지 여부입니다. 기본적으로 값은 무시되지 않습니다. 다음 중 하나를 지정합니다.\n0 모든 값 유지(기본값)\n1 공백 무시\n2 오류 무시\n3 공백 및 오류 무시' },
            scanByColumn: { name: 'scan_by_column', detail: '열별로 배열을 스캔합니다. 기본적으로 배열은 행별로 스캔됩니다. 스캔은 값이 행별로 정렬되는지 열별로 정렬되는지를 결정합니다.' },
        },
    },
    TOROW: {
        description: '배열을 단일 행으로 반환합니다',
        abstract: '배열을 단일 행으로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/torow-함수-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '행으로 반환할 배열 또는 참조입니다.' },
            ignore: { name: '무시', detail: '특정 유형의 값을 무시할지 여부입니다. 기본적으로 값은 무시되지 않습니다. 다음 중 하나를 지정합니다.\n0 모든 값 유지(기본값)\n1 공백 무시\n2 오류 무시\n3 공백 및 오류 무시' },
            scanByColumn: { name: 'scan_by_column', detail: '열별로 배열을 스캔합니다. 기본적으로 배열은 행별로 스캔됩니다. 스캔은 값이 행별로 정렬되는지 열별로 정렬되는지를 결정합니다.' },
        },
    },
    TRANSPOSE: {
        description: '배열의 전치를 반환합니다',
        abstract: '배열의 전치를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/transpose-함수-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '워크시트의 셀 범위 또는 배열입니다.' },
        },
    },
    UNIQUE: {
        description: '목록이나 범위에서 고유한 값 목록을 반환합니다',
        abstract: '목록이나 범위에서 고유한 값 목록을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/unique-함수-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            array: { name: '배열', detail: '고유한 행이나 열이 반환되는 범위 또는 배열입니다.' },
            byCol: { name: 'by_col', detail: '논리값입니다. 행을 서로 비교하고 고유한 값을 반환 = FALSE 또는 생략됨, 열을 서로 비교하고 고유한 값을 반환 = TRUE입니다.' },
            exactlyOnce: { name: 'exactly_once', detail: '논리값입니다. 배열에서 한 번만 나타나는 행이나 열을 반환 = TRUE, 배열에서 모든 고유 행이나 열을 반환 = FALSE 또는 생략됨입니다.' },
        },
    },
    VLOOKUP: {
        description: '테이블이나 범위에서 행별로 항목을 찾아야 할 때 VLOOKUP을 사용합니다. 예를 들어 부품 번호로 자동차 부품의 가격을 조회하거나 직원 ID를 기반으로 직원 이름을 찾습니다.',
        abstract: '배열의 첫 번째 열에서 찾고 행을 가로질러 이동하여 셀의 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/vlookup-함수-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: '조회하려는 값입니다. 조회하려는 값은 table_array 인수에서 지정한 셀 범위의 첫 번째 열에 있어야 합니다.',
            },
            tableArray: {
                name: 'table_array',
                detail: 'VLOOKUP이 lookup_value와 반환 값을 검색할 셀 범위입니다. 명명된 범위나 테이블을 사용할 수 있으며 셀 참조 대신 인수에 이름을 사용할 수 있습니다.',
            },
            colIndexNum: {
                name: 'col_index_num',
                detail: '반환 값을 포함하는 열 번호(table_array의 가장 왼쪽 열부터 1로 시작)입니다.',
            },
            rangeLookup: {
                name: 'range_lookup',
                detail: 'VLOOKUP이 대략적인 일치 항목을 찾을지 정확한 일치 항목을 찾을지를 지정하는 논리값입니다. 대략적인 일치 - 1/TRUE, 정확한 일치 - 0/FALSE',
            },
        },
    },
    VSTACK: {
        description: '배열을 세로로 순서대로 추가하여 더 큰 배열을 반환합니다',
        abstract: '배열을 세로로 순서대로 추가하여 더 큰 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/vstack-함수-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            array1: { name: '배열', detail: '추가할 배열입니다.' },
            array2: { name: '배열', detail: '추가할 배열입니다.' },
        },
    },
    WRAPCOLS: {
        description: '지정된 요소 수 이후에 제공된 값의 행이나 열을 열별로 래핑합니다',
        abstract: '지정된 요소 수 이후에 제공된 값의 행이나 열을 열별로 래핑합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/wrapcols-함수-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: '벡터', detail: '래핑할 벡터 또는 참조입니다.' },
            wrapCount: { name: 'wrap_count', detail: '각 열의 최대 값 수입니다.' },
            padWith: { name: 'pad_with', detail: '채울 값입니다. 기본값은 #N/A입니다.' },
        },
    },
    WRAPROWS: {
        description: '지정된 요소 수 이후에 제공된 값의 행이나 열을 행별로 래핑합니다',
        abstract: '지정된 요소 수 이후에 제공된 값의 행이나 열을 행별로 래핑합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/wraprows-함수-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: '벡터', detail: '래핑할 벡터 또는 참조입니다.' },
            wrapCount: { name: 'wrap_count', detail: '각 행의 최대 값 수입니다.' },
            padWith: { name: 'pad_with', detail: '채울 값입니다. 기본값은 #N/A입니다.' },
        },
    },
    XLOOKUP: {
        description: '범위나 배열을 검색하고 찾은 첫 번째 일치 항목에 해당하는 항목을 반환합니다. 일치 항목이 없으면 XLOOKUP은 가장 가까운(대략적인) 일치 항목을 반환할 수 있습니다.',
        abstract: '범위나 배열을 검색하고 찾은 첫 번째 일치 항목에 해당하는 항목을 반환합니다. 일치 항목이 없으면 XLOOKUP은 가장 가까운(대략적인) 일치 항목을 반환할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/xlookup-함수-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'lookup_value',
                detail: '검색할 값입니다. 생략하면 XLOOKUP은 lookup_array에서 찾은 빈 셀을 반환합니다.',
            },
            lookupArray: { name: 'lookup_array', detail: '검색할 배열 또는 범위입니다' },
            returnArray: { name: 'return_array', detail: '반환할 배열 또는 범위입니다' },
            ifNotFound: {
                name: 'if_not_found',
                detail: '유효한 일치 항목을 찾을 수 없는 경우 제공한 [if_not_found] 텍스트를 반환합니다. 유효한 일치 항목을 찾을 수 없고 [if_not_found]가 누락된 경우 #N/A가 반환됩니다.',
            },
            matchMode: {
                name: 'match_mode',
                detail: '일치 유형을 지정합니다. 0 - 정확히 일치. 찾을 수 없으면 #N/A를 반환합니다. 이것이 기본값입니다. -1 - 정확히 일치. 찾을 수 없으면 다음으로 작은 항목을 반환합니다. 1 - 정확히 일치. 찾을 수 없으면 다음으로 큰 항목을 반환합니다. 2 - *, ? 및 ~가 특별한 의미를 갖는 와일드카드 일치입니다.',
            },
            searchMode: {
                name: 'search_mode',
                detail: '사용할 검색 모드를 지정합니다. 1 - 첫 번째 항목부터 검색을 수행합니다. 이것이 기본값입니다. -1 - 마지막 항목부터 역방향 검색을 수행합니다. 2 - lookup_array가 오름차순으로 정렬되어 있다고 가정하는 이진 검색을 수행합니다. 정렬되지 않은 경우 잘못된 결과가 반환됩니다. -2 - lookup_array가 내림차순으로 정렬되어 있다고 가정하는 이진 검색을 수행합니다. 정렬되지 않은 경우 잘못된 결과가 반환됩니다.',
            },
        },
    },
    XMATCH: {
        description: '배열이나 셀 범위에서 지정된 항목을 검색한 다음 항목의 상대 위치를 반환합니다.',
        abstract: '배열이나 셀 범위에서 항목의 상대 위치를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/xmatch-함수-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: '조회 값입니다' },
            lookupArray: { name: 'lookup_array', detail: '검색할 배열 또는 범위입니다' },
            matchMode: { name: 'match_mode', detail: '일치 유형을 지정합니다.\n0 - 정확히 일치(기본값)\n-1 - 정확히 일치 또는 다음으로 작은 항목\n1 - 정확히 일치 또는 다음으로 큰 항목\n2 - *, ? 및 ~가 특별한 의미를 갖는 와일드카드 일치' },
            searchMode: { name: 'search_mode', detail: '검색 유형을 지정합니다.\n1 - 처음부터 끝까지 검색(기본값)\n-1 - 끝에서 처음으로 검색(역방향 검색)\n2 - lookup_array가 오름차순으로 정렬되어 있다고 가정하는 이진 검색을 수행합니다. 정렬되지 않은 경우 잘못된 결과가 반환됩니다.\n-2 - lookup_array가 내림차순으로 정렬되어 있다고 가정하는 이진 검색을 수행합니다. 정렬되지 않은 경우 잘못된 결과가 반환됩니다.' },
        },
    },
};

export default locale;

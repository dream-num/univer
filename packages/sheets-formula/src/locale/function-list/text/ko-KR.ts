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
    ASC: {
        description: '문자열의 전자(더블바이트) 영어 문자 또는 가타카나를 반자(싱글바이트) 문자로 변경합니다',
        abstract: '문자열의 전자(더블바이트) 영어 문자 또는 가타카나를 반자(싱글바이트) 문자로 변경합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '텍스트이거나 전자 문자가 포함된 텍스트가 있는 셀에 대한 참조입니다.' },
        },
    },
    ARRAYTOTEXT: {
        description: '지정된 범위의 텍스트 값 배열을 반환합니다',
        abstract: '지정된 범위의 텍스트 값 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '텍스트로 반환할 배열입니다.' },
            format: { name: 'format', detail: '반환되는 데이터의 형식입니다. 0(기본값) 또는 1일 수 있습니다.' },
        },
    },
    BAHTTEXT: {
        description: 'ß(바트) 통화 형식을 사용하여 숫자를 텍스트로 변환합니다',
        abstract: 'ß(바트) 통화 형식을 사용하여 숫자를 텍스트로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '텍스트로 변환하려는 숫자, 숫자가 포함된 셀에 대한 참조 또는 숫자로 평가되는 수식입니다.' },
        },
    },
    CHAR: {
        description: '코드 번호로 지정된 문자를 반환합니다',
        abstract: '코드 번호로 지정된 문자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '원하는 문자를 지정하는 1에서 255 사이의 숫자입니다.' },
        },
    },
    CLEAN: {
        description: '텍스트에서 인쇄할 수 없는 모든 문자를 제거합니다',
        abstract: '텍스트에서 인쇄할 수 없는 모든 문자를 제거합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '인쇄할 수 없는 문자를 제거할 워크시트 정보입니다.' },
        },
    },
    CODE: {
        description: '텍스트 문자열의 첫 번째 문자에 대한 숫자 코드를 반환합니다',
        abstract: '텍스트 문자열의 첫 번째 문자에 대한 숫자 코드를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '첫 번째 문자의 코드 번호를 원하는 텍스트입니다.' },
        },
    },
    CONCAT: {
        description: '여러 범위 및/또는 문자열의 텍스트를 결합하지만 구분 기호 또는 IgnoreEmpty 인수는 제공하지 않습니다',
        abstract: '여러 범위 및/또는 문자열의 텍스트를 결합합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: '결합할 텍스트 항목입니다. 문자열 또는 문자열의 배열(예: 셀 범위)일 수 있습니다.' },
            text2: { name: 'text2', detail: '결합할 추가 텍스트 항목입니다. 텍스트 항목은 최대 253개까지 가능합니다.' },
        },
    },
    CONCATENATE: {
        description: '여러 텍스트 항목을 하나의 텍스트 항목으로 결합합니다',
        abstract: '여러 텍스트 항목을 하나의 텍스트 항목으로 결합합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: '결합할 첫 번째 항목입니다. 항목은 텍스트 값, 숫자 또는 셀 참조일 수 있습니다.' },
            text2: { name: 'text2', detail: '결합할 추가 텍스트 항목입니다. 최대 255개 항목, 총 8,192자까지 가능합니다.' },
        },
    },
    DBCS: {
        description: '문자열 내의 반자(싱글바이트) 영어 문자 또는 가타카나를 전자(더블바이트) 문자로 변경합니다',
        abstract: '문자열 내의 반자(싱글바이트) 영어 문자 또는 가타카나를 전자(더블바이트) 문자로 변경합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '텍스트이거나 반자 문자가 포함된 텍스트가 있는 셀에 대한 참조입니다.' },
        },
    },
    DOLLAR: {
        description: '통화 형식을 사용하여 숫자를 텍스트로 변환합니다',
        abstract: '통화 형식을 사용하여 숫자를 텍스트로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '숫자, 숫자가 포함된 셀에 대한 참조 또는 숫자로 평가되는 수식입니다.' },
            decimals: { name: 'decimals', detail: '소수점 오른쪽의 자릿수입니다. 음수이면 숫자는 소수점 왼쪽으로 반올림됩니다.' },
        },
    },
    EXACT: {
        description: '두 텍스트 값이 동일한지 확인합니다',
        abstract: '두 텍스트 값이 동일한지 확인합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: '첫 번째 텍스트 문자열입니다.' },
            text2: { name: 'text2', detail: '두 번째 텍스트 문자열입니다.' },
        },
    },
    FIND: {
        description: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분)',
        abstract: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: '찾으려는 텍스트입니다.' },
            withinText: { name: 'within_text', detail: 'find_text를 포함하는 텍스트입니다.' },
            startNum: { name: 'start_num', detail: '검색을 시작할 문자입니다.' },
        },
    },
    FINDB: {
        description: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분, 더블바이트 문자 허용)',
        abstract: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분, 더블바이트 문자 허용)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: '찾으려는 텍스트입니다.' },
            withinText: { name: 'within_text', detail: 'find_text를 포함하는 텍스트입니다.' },
            startNum: { name: 'start_num', detail: '검색을 시작할 바이트입니다.' },
        },
    },
    FIXED: {
        description: '숫자를 지정된 소수 자릿수로 텍스트로 서식을 지정합니다',
        abstract: '숫자를 지정된 소수 자릿수로 텍스트로 서식을 지정합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하고 텍스트로 변환하려는 숫자입니다.' },
            decimals: { name: 'decimals', detail: '소수점 오른쪽의 자릿수입니다.' },
            noCommas: { name: 'no_commas', detail: '반환된 텍스트에 쉼표를 포함하지 않으려면 TRUE인 논리값입니다.' },
        },
    },
    LEFT: {
        description: '텍스트 값에서 맨 왼쪽 문자를 반환합니다',
        abstract: '텍스트 값에서 맨 왼쪽 문자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            numChars: { name: 'num_chars', detail: 'LEFT에서 추출할 문자 수를 지정합니다.' },
        },
    },
    LEFTB: {
        description: '텍스트 값에서 맨 왼쪽 문자를 반환합니다(바이트 기준)',
        abstract: '텍스트 값에서 맨 왼쪽 문자를 반환합니다(바이트 기준)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            numBytes: { name: 'num_bytes', detail: 'LEFTB에서 추출할 바이트 수를 지정합니다.' },
        },
    },
    LEN: {
        description: '텍스트 문자열의 문자 수를 반환합니다',
        abstract: '텍스트 문자열의 문자 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '길이를 찾으려는 텍스트입니다. 공백은 문자로 계산됩니다.' },
        },
    },
    LENB: {
        description: '텍스트 문자열의 문자 수를 바이트 단위로 반환합니다',
        abstract: '텍스트 문자열의 문자 수를 바이트 단위로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '길이를 찾으려는 텍스트입니다.' },
        },
    },
    LOWER: {
        description: '텍스트를 소문자로 변환합니다',
        abstract: '텍스트를 소문자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '소문자로 변환하려는 텍스트입니다. LOWER는 문자가 아닌 문자를 변경하지 않습니다.' },
        },
    },
    MID: {
        description: '텍스트 문자열에서 지정한 위치부터 특정 개수의 문자를 반환합니다',
        abstract: '텍스트 문자열에서 지정한 위치부터 특정 개수의 문자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            startNum: { name: 'start_num', detail: '추출하려는 첫 번째 문자의 위치입니다.' },
            numChars: { name: 'num_chars', detail: 'MID가 텍스트에서 반환할 문자 수를 지정합니다.' },
        },
    },
    MIDB: {
        description: '텍스트 문자열에서 지정한 위치부터 특정 개수의 문자를 반환합니다(바이트 기준)',
        abstract: '텍스트 문자열에서 지정한 위치부터 특정 개수의 문자를 반환합니다(바이트 기준)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            startNum: { name: 'start_num', detail: '추출하려는 첫 번째 문자의 위치입니다(바이트 기준).' },
            numBytes: { name: 'num_bytes', detail: 'MIDB가 반환할 바이트 수를 지정합니다.' },
        },
    },
    NUMBERSTRING: {
        description: '숫자를 중국어 문자열로 변환합니다.',
        abstract: '숫자를 중국어 문자열로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '중국어 문자열로 변환할 값입니다.' },
            type: { name: 'type', detail: '반환할 결과의 유형입니다. 1은 중국어 소문자, 2는 중국어 대문자, 3은 중국어 읽기 및 쓰기 문자입니다.' },
        },
    },
    NUMBERVALUE: {
        description: '텍스트를 로캘 독립적인 방식으로 숫자로 변환합니다',
        abstract: '텍스트를 로캘 독립적인 방식으로 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '숫자로 변환할 텍스트입니다.' },
            decimalSeparator: { name: 'decimal_separator', detail: '소수 구분 기호로 사용되는 문자입니다.' },
            groupSeparator: { name: 'group_separator', detail: '그룹 구분 기호로 사용되는 문자입니다.' },
        },
    },
    PHONETIC: {
        description: '텍스트 문자열에서 윗주 문자를 추출합니다',
        abstract: '텍스트 문자열에서 윗주 문자를 추출합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: '참조', detail: '추출할 윗주 텍스트가 포함된 텍스트, 범위 또는 참조입니다.' },
        },
    },
    PROPER: {
        description: '텍스트 값의 각 단어의 첫 글자를 대문자로 표시합니다',
        abstract: '텍스트 값의 각 단어의 첫 글자를 대문자로 표시합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '따옴표로 묶인 텍스트, 적절한 대/소문자로 반환하려는 텍스트가 포함된 셀에 대한 참조 또는 텍스트를 반환하는 수식입니다.' },
        },
    },
    REGEXEXTRACT: {
        description: '정규 표현식에 따라 첫 번째로 일치하는 하위 문자열을 추출합니다.',
        abstract: '정규 표현식에 따라 첫 번째로 일치하는 하위 문자열을 추출합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098244?hl=ko',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '도움말: 위의 예에서는 데이터의 열 2개가 반환되며 첫 번째 열에는 \'값\', 두 번째 열에는 \'추출\'이 반환됩니다.' },
            regularExpression: { name: 'regular_expression', detail: '추출할 텍스트의 일부입니다.' },
        },
    },
    REGEXMATCH: {
        description: '텍스트 일부가 정규 표현식과 일치하는지 여부입니다.',
        abstract: '텍스트 일부가 정규 표현식과 일치하는지 여부입니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098292?hl=ko',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '정규식에 대해 테스트할 텍스트입니다.' },
            regularExpression: { name: 'regular_expression', detail: '텍스트가 테스트될 정규식입니다.' },
        },
    },
    REGEXREPLACE: {
        description: '정규 표현식을 사용하여 텍스트 문자열의 일부를 다른 텍스트 문자열로 대체합니다.',
        abstract: '정규 표현식을 사용하여 텍스트 문자열의 일부를 다른 텍스트 문자열로 대체합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098245?hl=ko',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '일부를 바꿀 텍스트입니다.' },
            regularExpression: { name: 'regular_expression', detail: '정규식입니다.' },
            replacement: { name: 'replacement', detail: '삽입할 텍스트입니다.' },
        },
    },
    REPLACE: {
        description: '텍스트 내의 문자를 바꿉니다',
        abstract: '텍스트 내의 문자를 바꿉니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: '일부 문자를 바꿀 텍스트입니다.' },
            startNum: { name: 'start_num', detail: 'old_text에서 new_text로 바꿀 문자의 위치입니다.' },
            numChars: { name: 'num_chars', detail: 'REPLACE가 old_text에서 new_text로 바꿀 문자 수입니다.' },
            newText: { name: 'new_text', detail: 'old_text의 문자를 바꿀 텍스트입니다.' },
        },
    },
    REPLACEB: {
        description: '텍스트 내의 문자를 바꿉니다(바이트 기준)',
        abstract: '텍스트 내의 문자를 바꿉니다(바이트 기준)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: '일부 문자를 바꿀 텍스트입니다.' },
            startNum: { name: 'start_num', detail: 'old_text에서 new_text로 바꿀 바이트의 위치입니다.' },
            numBytes: { name: 'num_bytes', detail: 'REPLACEB가 old_text에서 new_text로 바꿀 바이트 수입니다.' },
            newText: { name: 'new_text', detail: 'old_text의 문자를 바꿀 텍스트입니다.' },
        },
    },
    REPT: {
        description: '텍스트를 지정된 횟수만큼 반복합니다',
        abstract: '텍스트를 지정된 횟수만큼 반복합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '반복하려는 텍스트입니다.' },
            numberTimes: { name: 'number_times', detail: '텍스트를 반복할 횟수를 지정하는 양수입니다.' },
        },
    },
    RIGHT: {
        description: '텍스트 값에서 맨 오른쪽 문자를 반환합니다',
        abstract: '텍스트 값에서 맨 오른쪽 문자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            numChars: { name: 'num_chars', detail: 'RIGHT에서 추출할 문자 수를 지정합니다.' },
        },
    },
    RIGHTB: {
        description: '텍스트 값에서 맨 오른쪽 문자를 반환합니다(바이트 기준)',
        abstract: '텍스트 값에서 맨 오른쪽 문자를 반환합니다(바이트 기준)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            numBytes: { name: 'num_bytes', detail: 'RIGHTB에서 추출할 바이트 수를 지정합니다.' },
        },
    },
    SEARCH: {
        description: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분 안 함)',
        abstract: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분 안 함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: '찾으려는 텍스트입니다.' },
            withinText: { name: 'within_text', detail: 'find_text를 검색할 텍스트입니다.' },
            startNum: { name: 'start_num', detail: '검색을 시작할 within_text의 문자 번호입니다.' },
        },
    },
    SEARCHB: {
        description: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분 안 함, 바이트 기준)',
        abstract: '하나의 텍스트 값을 다른 텍스트 값 내에서 찾습니다(대/소문자 구분 안 함, 바이트 기준)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: '찾으려는 텍스트입니다.' },
            withinText: { name: 'within_text', detail: 'find_text를 검색할 텍스트입니다.' },
            startNum: { name: 'start_num', detail: '검색을 시작할 within_text의 바이트 번호입니다.' },
        },
    },
    SUBSTITUTE: {
        description: '텍스트 문자열에서 기존 텍스트를 새 텍스트로 대체합니다',
        abstract: '텍스트 문자열에서 기존 텍스트를 새 텍스트로 대체합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '문자를 대체할 텍스트 또는 텍스트가 포함된 셀에 대한 참조입니다.' },
            oldText: { name: 'old_text', detail: '바꿀 텍스트입니다.' },
            newText: { name: 'new_text', detail: 'old_text를 바꿀 텍스트입니다.' },
            instanceNum: { name: 'instance_num', detail: '대체할 old_text의 발생 위치를 지정합니다. 지정하면 old_text의 해당 인스턴스만 바뀝니다.' },
        },
    },
    T: {
        description: '인수를 텍스트로 변환합니다',
        abstract: '인수를 텍스트로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '테스트하려는 값입니다.' },
        },
    },
    TEXT: {
        description: '값을 서식을 지정하고 텍스트로 변환합니다',
        abstract: '값을 서식을 지정하고 텍스트로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '텍스트로 변환하려는 숫자 값입니다.' },
            formatText: { name: 'format_text', detail: '따옴표로 묶인 텍스트 문자열로 적용된 서식을 정의하는 텍스트 문자열입니다.' },
        },
    },
    TEXTAFTER: {
        description: '지정된 문자 또는 문자열 뒤에 발생하는 텍스트를 반환합니다',
        abstract: '지정된 문자 또는 문자열 뒤에 발생하는 텍스트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '검색하는 텍스트입니다. 와일드카드는 허용되지 않습니다.' },
            delimiter: { name: 'delimiter', detail: '텍스트를 추출할 지점을 표시합니다.' },
            instanceNum: { name: 'instance_num', detail: '구분 기호의 인스턴스입니다.' },
            matchMode: { name: 'match_mode', detail: '텍스트 검색이 대/소문자를 구분하는지 여부를 결정합니다. 기본값은 대/소문자 구분입니다.' },
            matchEnd: { name: 'match_end', detail: '구분 기호의 끝을 텍스트의 끝으로 처리합니다.' },
            ifNotFound: { name: 'if_not_found', detail: '일치하는 항목이 없을 때 반환되는 값입니다.' },
        },
    },
    TEXTBEFORE: {
        description: '지정된 문자 또는 문자열 앞에 발생하는 텍스트를 반환합니다',
        abstract: '지정된 문자 또는 문자열 앞에 발생하는 텍스트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '검색하는 텍스트입니다. 와일드카드는 허용되지 않습니다.' },
            delimiter: { name: 'delimiter', detail: '텍스트를 추출할 지점을 표시합니다.' },
            instanceNum: { name: 'instance_num', detail: '구분 기호의 인스턴스입니다.' },
            matchMode: { name: 'match_mode', detail: '텍스트 검색이 대/소문자를 구분하는지 여부를 결정합니다. 기본값은 대/소문자 구분입니다.' },
            matchEnd: { name: 'match_end', detail: '구분 기호의 끝을 텍스트의 끝으로 처리합니다.' },
            ifNotFound: { name: 'if_not_found', detail: '일치하는 항목이 없을 때 반환되는 값입니다.' },
        },
    },
    TEXTJOIN: {
        description: '여러 범위 및/또는 문자열의 텍스트를 결합하고 결합되는 각 텍스트 값 사이에 지정한 구분 기호를 포함합니다',
        abstract: '여러 범위 및/또는 문자열의 텍스트를 결합합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: '텍스트 문자열 또는 빈 문자열로, 인수에 의해 지정된 각 문자열 사이에 삽입됩니다.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'TRUE이면 빈 셀을 무시합니다.' },
            text1: { name: 'text1', detail: '결합할 텍스트 항목입니다. 문자열 또는 문자열의 배열(예: 셀 범위)일 수 있습니다.' },
            text2: { name: 'text2', detail: '결합할 추가 텍스트 항목입니다. text 인수는 최대 252개까지 가능합니다.' },
        },
    },
    TEXTSPLIT: {
        description: '열 및 행 구분 기호를 사용하여 텍스트를 행 또는 열로 분할합니다',
        abstract: '열 및 행 구분 기호를 사용하여 텍스트를 행 또는 열로 분할합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '분할하려는 텍스트입니다.' },
            colDelimiter: { name: 'col_delimiter', detail: '열로 분할할 지점을 표시합니다.' },
            rowDelimiter: { name: 'row_delimiter', detail: '행으로 분할할 지점을 표시합니다.' },
            ignoreEmpty: { name: 'ignore_empty', detail: '연속된 구분 기호를 무시할지 여부입니다. 기본값은 FALSE입니다.' },
            matchMode: { name: 'match_mode', detail: '텍스트 검색에서 대/소문자를 구분할지 여부를 지정합니다. 기본적으로 대/소문자를 구분합니다.' },
            padWith: { name: 'pad_with', detail: '누락된 값을 채울 값입니다. 기본적으로 #N/A입니다.' },
        },
    },
    TRIM: {
        description: '텍스트에서 공백을 제거합니다',
        abstract: '텍스트에서 공백을 제거합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '공백을 제거할 텍스트입니다.' },
        },
    },
    UNICHAR: {
        description: '지정된 숫자 값으로 참조되는 유니코드 문자를 반환합니다',
        abstract: '지정된 숫자 값으로 참조되는 유니코드 문자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '유니코드 번호입니다.' },
        },
    },
    UNICODE: {
        description: '텍스트의 첫 문자에 해당하는 숫자(코드 포인트)를 반환합니다',
        abstract: '텍스트의 첫 문자에 해당하는 숫자(코드 포인트)를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '유니코드 값을 원하는 문자입니다.' },
        },
    },
    UPPER: {
        description: '텍스트를 대문자로 변환합니다',
        abstract: '텍스트를 대문자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '대문자로 변환하려는 텍스트입니다. 텍스트는 참조 또는 텍스트 문자열일 수 있습니다.' },
        },
    },
    VALUE: {
        description: '텍스트 인수를 숫자로 변환합니다',
        abstract: '텍스트 인수를 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '따옴표로 묶인 텍스트 또는 숫자로 변환하려는 텍스트가 포함된 셀에 대한 참조입니다.' },
        },
    },
    VALUETOTEXT: {
        description: '지정된 값에서 텍스트를 반환합니다',
        abstract: '지정된 값에서 텍스트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '텍스트로 반환할 값입니다.' },
            format: { name: 'format', detail: '반환되는 데이터의 형식입니다. 0(기본값) 또는 1일 수 있습니다.' },
        },
    },
    CALL: {
        description: '동적 링크 라이브러리 또는 코드 리소스에서 프로시저를 호출합니다. 이 함수에는 두 가지 구문 형식이 있습니다. REGISTER 함수의 인수를 사용하는 이전에 등록된 코드 리소스에서만 구문 1을 사용합니다. 구문 2a 또는 2b를 사용하여 코드 리소스를 동시에 등록하고 호출합니다.',
        abstract: '동적 링크 라이브러리 또는 코드 리소스에서 프로시저를 호출합니다. 이 함수에는 두 가지 구문 형식이 있습니다. REGISTER 함수의 인수를 사용하는 이전에 등록된 코드 리소스에서만 구문 1을 사용합니다. 구문 2a 또는 2b를 사용하여 코드 리소스를 동시에 등록하고 호출합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: '필수. 따옴표 붙은 텍스트로서, Windows용 Microsoft Excel의 프로시저를 포함하는 동적 연결 라이브러리의 이름을 지정합니다.' },
            procedure: { name: '절차', detail: '필수. Windows용 Microsoft Excel의 DLL에서 함수의 이름을 지정하는 텍스트입니다. 모듈 정의 파일(.DEF)의 EXPORTS 문에 지정되어 있는 함수의 순서 값을 사용할 수도 있습니다. 순서 값은 텍스트 형식이 될 수 없습니다.' },
            typeText: { name: 'Type_text', detail: '필수. 반환 값의 데이터 형식과 DLL 또는 코드 리소스의 모든 인수 데이터 형식을 지정하는 텍스트입니다. type_text의 첫째 문자는 반환 값을 지정합니다. type_text에 사용하는 코드에 대한 자세한 내용을 보려면 CALL 및 REGISTER 함수 사용 을 참조하세요. 독립 실행형 DLL이나 코드 리소스(XLL)의 경우 이 인수를 생략할 수 있습니다.' },
            argument1: { name: 'Argument1,...', detail: '선택적. 프로시저에 전달될 인수입니다.' },
        },
    },
    EUROCONVERT: {
        description: '숫자를 유로화로, 유로화에서 유로 회원국 통화로 또는 유로화를 매개 통화로 사용하여 숫자를 현재 유로 회원국 통화에서 다른 유로 회원국 통화로 변환(3각 변환)합니다. 변환할 수 있는 통화는 유로화를 채택한 유럽 연합(EU) 회원국들의 통화입니다. 이 함수는 EU에서 설정한 고정 변환율을 사용합니다.',
        abstract: '숫자를 유로화로, 유로화에서 유로 회원국 통화로 또는 유로화를 매개 통화로 사용하여 숫자를 현재 유로 회원국 통화에서 다른 유로 회원국 통화로 변환(3각 변환)합니다. 변환할 수 있는 통화는 유로화를 채택한 유럽 연합(EU) 회원국들의 통화입니다. 이 함수는 EU에서 설정한 고정 변환율을 사용합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 통화 값 또는 값이 들어 있는 셀에 대한 참조입니다.' },
            source: { name: '소스', detail: '필수. 원본 통화에 대한 ISO 코드에 해당하는 세 자리 문자열 또는 그 문자열이 들어 있는 셀에 대한 참조입니다. EUROCONVERT 함수에서 사용할 수 있는 통화 코드는 다음과 같습니다.' },
            target: { name: '대상', detail: '필수. 숫자를 변환할 대상 통화의 ISO 코드에 해당하는 세 자리 문자열 또는 셀 참조입니다. ISO 코드에 대해서는 앞에 나오는 원본 통화 관련 표를 참조하세요.' },
            fullPrecision: { name: 'Full_precision', detail: '필수. 결과를 표시하는 방법을 지정하는 논리값(TRUE, FALSE) 또는 TRUE나 FALSE 값을 나타내는 식입니다.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: '필수. 두 유로 회원국 통화 간 변환을 할 때 매개 유로 값에 사용될 유효 자릿수를 지정하는 3보다 크거나 같은 정수입니다. 이 인수를 생략하면 Excel에서 매개 유로 값은 반올림되지 않습니다. 유로 회원국 통화를 유로화로 변환할 때 이 인수를 포함하면 유로 회원국 통화로 변환될 수 있는 매개 유로 값이 계산됩니다.' },
        },
    },
    REGISTER_ID: {
        description: '지정한 DLL(동적 연결 라이브러리) 또는 이전에 등록한 코드 리소스의 레지스터 ID를 반환합니다. DLL이나 코드 리소스가 등록되지 않았으면 DLL이나 코드 리소스를 등록한 후 레지스터 ID를 반환합니다.',
        abstract: '지정한 DLL(동적 연결 라이브러리) 또는 이전에 등록한 코드 리소스의 레지스터 ID를 반환합니다. DLL이나 코드 리소스가 등록되지 않았으면 DLL이나 코드 리소스를 등록한 후 레지스터 ID를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: '필수. Windows용 Microsoft Excel에서 함수가 포함된 DLL의 이름을 지정하는 텍스트입니다.' },
            procedure: { name: '절차', detail: '필수. Windows용 Microsoft Excel의 DLL에서 함수의 이름을 지정하는 텍스트입니다. 모듈 정의 파일(.DEF)의 EXPORTS 문에 지정되어 있는 함수의 순서 값을 사용할 수도 있습니다. 서수 값이나 리소스 ID 번호는 텍스트 형식이 될 수 없습니다.' },
            typeText: { name: 'Type_text', detail: '선택적. 반환 값의 데이터 형식과 DLL의 모든 인수 데이터 형식을 지정하는 텍스트입니다. type_text의 첫째 문자는 반환 값을 지정합니다. 함수나 코드 리소스가 이미 등록된 경우에는 이 인수를 생략할 수 있습니다.' },
        },
    },
};

export default locale;

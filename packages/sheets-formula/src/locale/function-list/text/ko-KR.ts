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
                url: 'https://support.microsoft.com/ko-kr/office/asc-함수-0b6abf1c-c663-4004-a964-ebc00b723266',
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
                url: 'https://support.microsoft.com/ko-kr/office/arraytotext-함수-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
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
                url: 'https://support.microsoft.com/ko-kr/office/bahttext-함수-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
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
                url: 'https://support.microsoft.com/ko-kr/office/char-함수-bbd249c8-b36e-4a91-8017-1c133f9b837a',
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
                url: 'https://support.microsoft.com/ko-kr/office/clean-함수-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
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
                url: 'https://support.microsoft.com/ko-kr/office/code-함수-c32b692b-2ed0-4a04-bdd9-75640144b928',
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
                url: 'https://support.microsoft.com/ko-kr/office/concat-함수-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
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
                url: 'https://support.microsoft.com/ko-kr/office/concatenate-함수-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
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
                url: 'https://support.microsoft.com/ko-kr/office/dbcs-함수-a4025e73-63d2-4958-9423-21a24794c9e5',
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
                url: 'https://support.microsoft.com/ko-kr/office/dollar-함수-a6cd05d9-9740-4ad3-a469-8109d18ff611',
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
                url: 'https://support.microsoft.com/ko-kr/office/exact-함수-d3087698-fc15-4a15-9631-12575cf29926',
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
                url: 'https://support.microsoft.com/ko-kr/office/find-findb-함수-c7912941-af2a-4bdf-a553-d0d89b0a0628',
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
                url: 'https://support.microsoft.com/ko-kr/office/find-findb-함수-c7912941-af2a-4bdf-a553-d0d89b0a0628',
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
                url: 'https://support.microsoft.com/ko-kr/office/fixed-함수-ffd5723c-324c-45e9-8b96-e41be2a8274a',
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
                url: 'https://support.microsoft.com/ko-kr/office/left-leftb-함수-9203d2d2-7960-479b-84c6-1ea52b99640c',
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
                url: 'https://support.microsoft.com/ko-kr/office/left-leftb-함수-9203d2d2-7960-479b-84c6-1ea52b99640c',
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
                url: 'https://support.microsoft.com/ko-kr/office/len-lenb-함수-29236f94-cedc-429d-affd-b5e33d2c67cb',
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
                url: 'https://support.microsoft.com/ko-kr/office/len-lenb-함수-29236f94-cedc-429d-affd-b5e33d2c67cb',
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
                url: 'https://support.microsoft.com/ko-kr/office/lower-함수-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
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
                url: 'https://support.microsoft.com/ko-kr/office/mid-midb-함수-d5f9e25c-d7d6-472e-b568-4ecb12433028',
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
                url: 'https://support.microsoft.com/ko-kr/office/mid-midb-함수-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '추출하려는 문자가 포함된 텍스트 문자열입니다.' },
            startNum: { name: 'start_num', detail: '추출하려는 첫 번째 문자의 위치입니다(바이트 기준).' },
            numBytes: { name: 'num_bytes', detail: 'MIDB가 반환할 바이트 수를 지정합니다.' },
        },
    },
    NUMBERSTRING: {
        description: 'Convert numbers to Chinese strings',
        abstract: 'Convert numbers to Chinese strings',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value converted to a Chinese string.' },
            type: { name: 'type', detail: 'The type of the returned result. \n1. Chinese lowercase \n2. Chinese uppercase \n3. Reading and Writing Chinese Characters' },
        },
    },
    NUMBERVALUE: {
        description: '텍스트를 로캘 독립적인 방식으로 숫자로 변환합니다',
        abstract: '텍스트를 로캘 독립적인 방식으로 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/numbervalue-함수-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
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
                url: 'https://support.microsoft.com/ko-kr/office/phonetic-함수-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: '텍스트 값의 각 단어의 첫 글자를 대문자로 표시합니다',
        abstract: '텍스트 값의 각 단어의 첫 글자를 대문자로 표시합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/proper-함수-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '따옴표로 묶인 텍스트, 적절한 대/소문자로 반환하려는 텍스트가 포함된 셀에 대한 참조 또는 텍스트를 반환하는 수식입니다.' },
        },
    },
    REGEXEXTRACT: {
        description: '정규식과 일치하는 텍스트의 첫 번째 부분을 추출합니다',
        abstract: '정규식과 일치하는 텍스트의 첫 번째 부분을 추출합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098244?hl=ko&sjid=10110901065663498429-AP',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '입력 텍스트입니다.' },
            regularExpression: { name: 'regular_expression', detail: '추출할 텍스트의 일부입니다.' },
        },
    },
    REGEXMATCH: {
        description: '텍스트의 일부가 정규식과 일치하는지 확인합니다',
        abstract: '텍스트의 일부가 정규식과 일치하는지 확인합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098292?hl=ko&sjid=10110901065663498429-AP',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '정규식에 대해 테스트할 텍스트입니다.' },
            regularExpression: { name: 'regular_expression', detail: '텍스트가 테스트될 정규식입니다.' },
        },
    },
    REGEXREPLACE: {
        description: '정규식을 사용하여 텍스트 문자열의 일부를 다른 텍스트 문자열로 바꿉니다',
        abstract: '정규식을 사용하여 텍스트 문자열의 일부를 다른 텍스트 문자열로 바꿉니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3098245?hl=ko&sjid=10110901065663498429-AP',
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
                url: 'https://support.microsoft.com/ko-kr/office/replace-replaceb-함수-8d799074-2425-4a8a-84bc-82472868878a',
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
                url: 'https://support.microsoft.com/ko-kr/office/replace-replaceb-함수-8d799074-2425-4a8a-84bc-82472868878a',
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
                url: 'https://support.microsoft.com/ko-kr/office/rept-함수-04c4d778-e712-43b4-9c15-d656582bb061',
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
                url: 'https://support.microsoft.com/ko-kr/office/right-rightb-함수-240267ee-9afa-4639-a02b-f19e1786cf2f',
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
                url: 'https://support.microsoft.com/ko-kr/office/right-rightb-함수-240267ee-9afa-4639-a02b-f19e1786cf2f',
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
                url: 'https://support.microsoft.com/ko-kr/office/search-searchb-함수-9ab04538-0e55-4719-a72e-b6f54513b495',
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
                url: 'https://support.microsoft.com/ko-kr/office/search-searchb-함수-9ab04538-0e55-4719-a72e-b6f54513b495',
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
                url: 'https://support.microsoft.com/ko-kr/office/substitute-함수-6434944e-a904-4336-a9b0-1e58df3bc332',
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
                url: 'https://support.microsoft.com/ko-kr/office/t-함수-fb83aeec-45e7-4924-af95-53e073541228',
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
                url: 'https://support.microsoft.com/ko-kr/office/text-함수-20d5ac4d-7b94-49fd-bb38-93d29371225c',
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
                url: 'https://support.microsoft.com/ko-kr/office/textafter-함수-c8db2546-5b51-416a-9690-c7e6722e90b4',
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
                url: 'https://support.microsoft.com/ko-kr/office/textbefore-함수-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
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
                url: 'https://support.microsoft.com/ko-kr/office/textjoin-함수-357b449a-ec91-49d0-80c3-0e8fc845691c',
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
                url: 'https://support.microsoft.com/ko-kr/office/textsplit-함수-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
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
                url: 'https://support.microsoft.com/ko-kr/office/trim-함수-410388fa-c5df-49c6-b16c-9e5630b479f9',
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
                url: 'https://support.microsoft.com/ko-kr/office/unichar-함수-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
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
                url: 'https://support.microsoft.com/ko-kr/office/unicode-함수-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
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
                url: 'https://support.microsoft.com/ko-kr/office/upper-함수-c11f29b3-d1a3-4537-8df6-04d0049963d6',
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
                url: 'https://support.microsoft.com/ko-kr/office/value-함수-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
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
                url: 'https://support.microsoft.com/ko-kr/office/valuetotext-함수-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: '텍스트로 반환할 값입니다.' },
            format: { name: 'format', detail: '반환되는 데이터의 형식입니다. 0(기본값) 또는 1일 수 있습니다.' },
        },
    },
    CALL: {
        description: 'Calls a procedure in a dynamic link library or code resource',
        abstract: 'Calls a procedure in a dynamic link library or code resource',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/call-function-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EUROCONVERT: {
        description: 'Converts a number to euros, converts a number from euros to a euro member currency, or converts a number from one euro member currency to another by using the euro as an intermediary (triangulation)',
        abstract: 'Converts a number to euros, converts a number from euros to a euro member currency, or converts a number from one euro member currency to another by using the euro as an intermediary (triangulation)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/euroconvert-function-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REGISTER_ID: {
        description: 'Returns the register ID of the specified dynamic link library (DLL) or code resource that has been previously registered',
        abstract: 'Returns the register ID of the specified dynamic link library (DLL) or code resource that has been previously registered',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/register-id-function-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};

export default locale;

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
    ABS: {
        description: '숫자의 절대값을 반환합니다. 숫자의 절대값은 부호가 없는 숫자입니다.',
        abstract: '숫자의 절대값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '절대값을 구하려는 실수입니다.' },
        },
    },
    ACOS: {
        description: '숫자의 아크코사인 또는 역코사인을 반환합니다. 아크코사인은 코사인이 number인 각도입니다. 반환된 각도는 0(영)에서 pi 사이의 범위에서 라디안으로 지정됩니다.',
        abstract: '숫자의 아크코사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '원하는 각도의 코사인이며 -1에서 1 사이여야 합니다.' },
        },
    },
    ACOSH: {
        description: '숫자의 역쌍곡코사인을 반환합니다. 숫자는 1보다 크거나 같아야 합니다. 역쌍곡코사인은 쌍곡코사인이 number인 값이므로 ACOSH(COSH(number))는 number와 같습니다.',
        abstract: '숫자의 역쌍곡코사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '1보다 크거나 같은 실수입니다.' },
        },
    },
    ACOT: {
        description: '숫자의 아크코탄젠트 또는 역코탄젠트의 주요 값을 반환합니다.',
        abstract: '숫자의 아크코탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'number',
                detail: 'Number는 원하는 각도의 코탄젠트입니다. 이는 실수여야 합니다.',
            },
        },
    },
    ACOTH: {
        description: '숫자의 쌍곡아크코탄젠트를 반환합니다',
        abstract: '숫자의 쌍곡아크코탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number의 절대값은 1보다 커야 합니다.' },
        },
    },
    AGGREGATE: {
        description: '목록 또는 데이터베이스에서 집계를 반환합니다',
        abstract: '목록 또는 데이터베이스에서 집계를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: '사용할 함수를 지정하는 1에서 19 사이의 숫자입니다.' },
            options: { name: 'options', detail: '함수의 계산 범위에서 무시할 값을 결정하는 숫자 값입니다.' },
            ref1: { name: 'ref1', detail: '집계 값을 구할 인수가 여러 개인 함수의 첫 번째 인수입니다.' },
            ref2: { name: 'ref2', detail: '집계 값을 구할 인수로, 2개에서 252개까지 사용할 수 있습니다.' },
        },
    },
    ARABIC: {
        description: '로마 숫자를 아라비아 숫자로 변환합니다',
        abstract: '로마 숫자를 아라비아 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '따옴표로 묶인 문자열, 빈 문자열("") 또는 텍스트가 포함된 셀에 대한 참조입니다.' },
        },
    },
    ASIN: {
        description: '숫자의 아크사인을 반환합니다.',
        abstract: '숫자의 아크사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '원하는 각도의 사인이며 -1에서 1 사이여야 합니다.' },
        },
    },
    ASINH: {
        description: '숫자의 역쌍곡사인을 반환합니다.',
        abstract: '숫자의 역쌍곡사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '실수입니다.' },
        },
    },
    ATAN: {
        description: '숫자의 아크탄젠트를 반환합니다.',
        abstract: '숫자의 아크탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '원하는 각도의 탄젠트입니다.' },
        },
    },
    ATAN2: {
        description: 'x 및 y 좌표에서 아크탄젠트를 반환합니다.',
        abstract: 'x 및 y 좌표에서 아크탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: '점의 x 좌표입니다.' },
            yNum: { name: 'y_num', detail: '점의 y 좌표입니다.' },
        },
    },
    ATANH: {
        description: '역 하이퍼볼릭 탄젠트 값을 반환합니다. number는 -1과 1 사이의 값이어야 합니다(-1과 1은 제외). 역 하이퍼볼릭 탄젠트 값은 하이퍼볼릭 탄젠트 값이 number 인 값이므로 ATANH(TANH(number))는 number 와 같습니다.',
        abstract: '역 하이퍼볼릭 탄젠트 값을 반환합니다. number는 -1과 1 사이의 값이어야 합니다(-1과 1은 제외). 역 하이퍼볼릭 탄젠트 값은 하이퍼볼릭 탄젠트 값이 number 인 값이므로 ATANH(TANH(number))는 number 와 같습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 1과 -1 사이의 실수입니다.' },
        },
    },
    BASE: {
        description: '숫자를 지정된 기수(밑)의 텍스트 표현으로 변환합니다',
        abstract: '숫자를 지정된 기수(밑)의 텍스트 표현으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '변환하려는 숫자입니다. 0보다 크거나 같고 2^53보다 작은 정수여야 합니다.' },
            radix: { name: 'radix', detail: '숫자를 변환하려는 기수입니다. 2보다 크거나 같고 36보다 작거나 같은 정수여야 합니다.' },
            minLength: { name: 'min_length', detail: '반환된 문자열의 최소 길이입니다. 0보다 크거나 같은 정수여야 합니다.' },
        },
    },
    CEILING: {
        description: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림합니다',
        abstract: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
        },
    },
    CEILING_MATH: {
        description: '숫자를 위로 반올림하여 가장 가까운 정수 또는 가장 가까운 significance의 배수로 만듭니다',
        abstract: '숫자를 위로 반올림하여 가장 가까운 정수 또는 가장 가까운 significance의 배수로 만듭니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
            mode: { name: 'mode', detail: '음수의 경우 Number가 0을 향해 반올림되는지 또는 0에서 멀어지도록 반올림되는지를 제어합니다.' },
        },
    },
    CEILING_PRECISE: {
        description: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림합니다. 숫자의 부호에 관계없이 숫자는 반올림됩니다.',
        abstract: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림합니다. 숫자의 부호에 관계없이 숫자는 반올림됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
        },
    },
    COMBIN: {
        description: '지정된 개체 수에 대한 조합의 수를 반환합니다',
        abstract: '지정된 개체 수에 대한 조합의 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '항목의 수입니다.' },
            numberChosen: { name: 'number_chosen', detail: '각 조합의 항목 수입니다.' },
        },
    },
    COMBINA: {
        description: '지정된 항목 수에 대한 반복 조합의 수를 반환합니다',
        abstract: '지정된 항목 수에 대한 반복 조합의 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '항목의 수입니다.' },
            numberChosen: { name: 'number_chosen', detail: '각 조합의 항목 수입니다.' },
        },
    },
    COS: {
        description: '숫자의 코사인을 반환합니다.',
        abstract: '숫자의 코사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '코사인을 원하는 각도(라디안)입니다.' },
        },
    },
    COSH: {
        description: '숫자의 쌍곡코사인을 반환합니다',
        abstract: '숫자의 쌍곡코사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '쌍곡코사인을 찾으려는 실수입니다.' },
        },
    },
    COT: {
        description: '각도의 코탄젠트를 반환합니다',
        abstract: '각도의 코탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '코탄젠트를 원하는 각도(라디안)입니다.' },
        },
    },
    COTH: {
        description: '숫자의 쌍곡코탄젠트를 반환합니다',
        abstract: '숫자의 쌍곡코탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '쌍곡코탄젠트를 찾으려는 실수입니다.' },
        },
    },
    CSC: {
        description: '각도의 코시컨트를 반환합니다',
        abstract: '각도의 코시컨트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '코시컨트를 원하는 각도(라디안)입니다.' },
        },
    },
    CSCH: {
        description: '각도의 쌍곡코시컨트를 반환합니다',
        abstract: '각도의 쌍곡코시컨트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '쌍곡코시컨트를 원하는 각도(라디안)입니다.' },
        },
    },
    DECIMAL: {
        description: '지정된 밑의 숫자의 텍스트 표현을 십진수로 변환합니다',
        abstract: '지정된 밑의 숫자의 텍스트 표현을 십진수로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text의 문자열 길이는 255자 이하여야 합니다.' },
            radix: { name: 'radix', detail: '숫자를 변환하려는 기수입니다. 2보다 크거나 같고 36보다 작거나 같은 정수여야 합니다.' },
        },
    },
    DEGREES: {
        description: '라디안을 도로 변환합니다',
        abstract: '라디안을 도로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: '변환하려는 각도(라디안)입니다.' },
        },
    },
    EVEN: {
        description: '숫자를 위로 반올림하여 가장 가까운 짝수 정수로 만듭니다',
        abstract: '숫자를 위로 반올림하여 가장 가까운 짝수 정수로 만듭니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림할 값입니다.' },
        },
    },
    EXP: {
        description: '주어진 숫자의 거듭제곱으로 거듭제곱한 e를 반환합니다',
        abstract: '주어진 숫자의 거듭제곱으로 거듭제곱한 e를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '밑 e에 적용되는 지수입니다.' },
        },
    },
    FACT: {
        description: '숫자의 계승을 반환합니다',
        abstract: '숫자의 계승을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '계승을 원하는 음이 아닌 숫자입니다. 숫자가 정수가 아닌 경우 잘립니다.' },
        },
    },
    FACTDOUBLE: {
        description: '숫자의 이중 계승을 반환합니다',
        abstract: '숫자의 이중 계승을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '이중 계승을 원하는 음이 아닌 숫자입니다. 숫자가 정수가 아닌 경우 잘립니다.' },
        },
    },
    FLOOR: {
        description: '숫자를 0 방향으로 내림하여 반올림합니다',
        abstract: '숫자를 0 방향으로 내림하여 반올림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
        },
    },
    FLOOR_MATH: {
        description: '숫자를 아래로 반올림하여 가장 가까운 정수 또는 가장 가까운 significance의 배수로 만듭니다',
        abstract: '숫자를 아래로 반올림하여 가장 가까운 정수 또는 가장 가까운 significance의 배수로 만듭니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
            mode: { name: 'mode', detail: '음수의 경우 Number가 0을 향해 반올림되는지 또는 0에서 멀어지도록 반올림되는지를 제어합니다.' },
        },
    },
    FLOOR_PRECISE: {
        description: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 내림합니다. 숫자의 부호에 관계없이 숫자는 내림됩니다.',
        abstract: '숫자를 가장 가까운 정수 또는 가장 가까운 significance의 배수로 내림합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
        },
    },
    GCD: {
        description: '최대공약수를 반환합니다',
        abstract: '최대공약수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최대공약수를 찾으려는 첫 번째 숫자로, 쉼표로 구분된 매개 변수 대신 단일 배열 또는 배열에 대한 참조를 사용할 수도 있습니다.' },
            number2: { name: 'number2', detail: '최대공약수를 찾으려는 두 번째 숫자입니다. 이런 방식으로 최대 255개의 숫자를 지정할 수 있습니다.' },
        },
    },
    INT: {
        description: '숫자를 가장 가까운 정수로 내림합니다',
        abstract: '숫자를 가장 가까운 정수로 내림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '정수로 내림할 실수입니다.' },
        },
    },
    ISO_CEILING: {
        description: '가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림된 숫자를 반환합니다',
        abstract: '가장 가까운 정수 또는 가장 가까운 significance의 배수로 반올림된 숫자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 값입니다.' },
            significance: { name: 'significance', detail: '반올림하려는 배수입니다.' },
        },
    },
    LCM: {
        description: '최소공배수를 반환합니다',
        abstract: '최소공배수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최소공배수를 찾으려는 첫 번째 숫자로, 쉼표로 구분된 매개 변수 대신 단일 배열 또는 배열에 대한 참조를 사용할 수도 있습니다.' },
            number2: { name: 'number2', detail: '최소공배수를 찾으려는 두 번째 숫자입니다. 이런 방식으로 최대 255개의 숫자를 지정할 수 있습니다.' },
        },
    },
    LN: {
        description: '숫자의 자연 로그를 반환합니다',
        abstract: '숫자의 자연 로그를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '자연 로그를 원하는 양의 실수입니다.' },
        },
    },
    LOG: {
        description: '지정된 밑에 대한 숫자의 로그를 반환합니다',
        abstract: '지정된 밑에 대한 숫자의 로그를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '로그를 원하는 양의 실수입니다.' },
            base: { name: 'base', detail: '로그의 밑입니다. base를 생략하면 10으로 간주합니다.' },
        },
    },
    LOG10: {
        description: '숫자의 밑이 10인 로그를 반환합니다',
        abstract: '숫자의 밑이 10인 로그를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '밑이 10인 로그를 원하는 양의 실수입니다.' },
        },
    },
    MDETERM: {
        description: '배열의 행렬 행렬식을 반환합니다',
        abstract: '배열의 행렬 행렬식을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '행과 열 수가 같은 숫자 배열입니다.' },
        },
    },
    MINVERSE: {
        description: '배열의 역행렬을 반환합니다',
        abstract: '배열의 역행렬을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '행과 열 수가 같은 숫자 배열입니다.' },
        },
    },
    MMULT: {
        description: '두 배열의 행렬 곱을 반환합니다',
        abstract: '두 배열의 행렬 곱을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '곱하려는 첫 번째 배열입니다.' },
            array2: { name: 'array2', detail: '곱하려는 두 번째 배열입니다.' },
        },
    },
    MOD: {
        description: '나눗셈의 나머지를 반환합니다',
        abstract: '나눗셈의 나머지를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '나머지를 찾으려는 숫자입니다.' },
            divisor: { name: 'divisor', detail: 'number를 나누는 숫자입니다.' },
        },
    },
    MROUND: {
        description: '원하는 배수로 반올림된 숫자를 반환합니다',
        abstract: '원하는 배수로 반올림된 숫자를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림할 값입니다.' },
            multiple: { name: 'multiple', detail: '반올림하려는 배수입니다.' },
        },
    },
    MULTINOMIAL: {
        description: '값 집합의 다항계수를 반환합니다',
        abstract: '값 집합의 다항계수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '계산에 사용할 첫 번째 값 또는 범위입니다.' },
            number2: { name: 'number2', detail: '계산에 사용할 추가 값 또는 범위입니다.' },
        },
    },
    MUNIT: {
        description: '지정된 차원의 단위 행렬을 반환합니다',
        abstract: '지정된 차원의 단위 행렬을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: '반환하려는 단위 행렬의 차원을 지정하는 정수입니다.' },
        },
    },
    ODD: {
        description: '숫자를 가장 가까운 홀수 정수로 반올림합니다',
        abstract: '숫자를 가장 가까운 홀수 정수로 반올림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림할 값입니다.' },
        },
    },
    PI: {
        description: 'pi 값을 반환합니다',
        abstract: 'pi 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: '거듭제곱한 숫자의 결과를 반환합니다',
        abstract: '거듭제곱한 숫자의 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '밑 숫자입니다. 실수일 수 있습니다.' },
            power: { name: 'power', detail: '밑 숫자를 거듭제곱할 지수입니다.' },
        },
    },
    PRODUCT: {
        description: '인수를 곱합니다',
        abstract: '인수를 곱합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '곱하려는 첫 번째 숫자 또는 범위입니다.' },
            number2: { name: 'number2', detail: '곱하려는 추가 숫자 또는 범위로 최대 255개까지 입니다.' },
        },
    },
    QUOTIENT: {
        description: '나눗셈의 정수 부분을 반환합니다',
        abstract: '나눗셈의 정수 부분을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: '피제수입니다.' },
            denominator: { name: 'denominator', detail: '제수입니다.' },
        },
    },
    RADIANS: {
        description: '도를 라디안으로 변환합니다',
        abstract: '도를 라디안으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: '라디안으로 변환하려는 각도입니다.' },
        },
    },
    RAND: {
        description: '0과 1 사이의 난수를 반환합니다',
        abstract: '0과 1 사이의 난수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: '난수 배열을 반환합니다. 채울 행과 열의 수, 최소값과 최대값, 정수 또는 십진수 값 반환 여부를 지정할 수 있습니다.',
        abstract: '난수 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: '반환할 행 수입니다.' },
            columns: { name: 'columns', detail: '반환할 열 수입니다.' },
            min: { name: 'min', detail: '반환할 최소 숫자입니다.' },
            max: { name: 'max', detail: '반환할 최대 숫자입니다.' },
            wholeNumber: { name: 'whole_number', detail: '정수 또는 십진수 값을 반환합니다. TRUE는 정수, FALSE는 십진수입니다.' },
        },
    },
    RANDBETWEEN: {
        description: '지정한 숫자 사이의 난수를 반환합니다',
        abstract: '지정한 숫자 사이의 난수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'RANDBETWEEN이 반환할 가장 작은 정수입니다.' },
            top: { name: 'top', detail: 'RANDBETWEEN이 반환할 가장 큰 정수입니다.' },
        },
    },
    ROMAN: {
        description: '아라비아 숫자를 텍스트로 로마 숫자로 변환합니다',
        abstract: '아라비아 숫자를 텍스트로 로마 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '변환하려는 아라비아 숫자입니다.' },
            form: { name: 'form', detail: '로마 숫자의 유형을 지정하는 숫자입니다. 로마 숫자 스타일은 고전에서 간단한 순서로 I에서 IV까지 더 간결해집니다. 예제를 참조하세요.' },
        },
    },
    ROUND: {
        description: '숫자를 지정된 자릿수로 반올림합니다',
        abstract: '숫자를 지정된 자릿수로 반올림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 숫자입니다.' },
            numDigits: { name: 'num_digits', detail: '반올림하려는 자릿수입니다.' },
        },
    },
    ROUNDBANK: {
        description: '은행가 반올림 방식으로 숫자를 반올림합니다.',
        abstract: '은행가 반올림 방식으로 숫자를 반올림합니다.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '은행가 반올림 방식으로 반올림할 수입니다.' },
            numDigits: { name: 'num_digits', detail: '은행가 반올림 방식으로 반올림할 자릿수입니다.' },
        },
    },
    ROUNDDOWN: {
        description: '숫자를 0 방향으로 내림합니다',
        abstract: '숫자를 0 방향으로 내림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '내림하려는 실수입니다.' },
            numDigits: { name: 'num_digits', detail: '숫자를 내림할 자릿수입니다.' },
        },
    },
    ROUNDUP: {
        description: '숫자를 0에서 멀어지는 방향으로 올림합니다',
        abstract: '숫자를 0에서 멀어지는 방향으로 올림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '올림하려는 실수입니다.' },
            numDigits: { name: 'num_digits', detail: '숫자를 올림할 자릿수입니다.' },
        },
    },
    SEC: {
        description: '각도의 시컨트를 반환합니다',
        abstract: '각도의 시컨트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '시컨트를 원하는 각도(라디안)입니다.' },
        },
    },
    SECH: {
        description: '각도의 쌍곡시컨트를 반환합니다',
        abstract: '각도의 쌍곡시컨트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '쌍곡시컨트를 원하는 각도(라디안)입니다.' },
        },
    },
    SERIESSUM: {
        description: '수식을 기반으로 거듭제곱 급수의 합을 반환합니다',
        abstract: '수식을 기반으로 거듭제곱 급수의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '거듭제곱 급수의 입력 값입니다.' },
            n: { name: 'n', detail: 'x를 거듭제곱할 초기 거듭제곱입니다.' },
            m: { name: 'm', detail: '급수의 각 항에서 n을 증가시킬 단계입니다.' },
            coefficients: { name: 'coefficients', detail: 'x의 연속 거듭제곱에 곱할 계수 집합입니다.' },
        },
    },
    SEQUENCE: {
        description: '1, 2, 3, 4와 같은 순차 숫자 목록을 배열로 생성합니다',
        abstract: '순차 숫자 목록을 배열로 생성합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: '반환할 행 수입니다.' },
            columns: { name: 'columns', detail: '반환할 열 수입니다.' },
            start: { name: 'start', detail: '순서의 첫 번째 숫자입니다.' },
            step: { name: 'step', detail: '배열의 각 순차 값 사이의 증분입니다.' },
        },
    },
    SIGN: {
        description: '숫자의 부호를 반환합니다',
        abstract: '숫자의 부호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '부호를 결정하려는 실수입니다.' },
        },
    },
    SIN: {
        description: '지정한 각도의 사인을 반환합니다',
        abstract: '지정한 각도의 사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '사인을 원하는 각도(라디안)입니다.' },
        },
    },
    SINH: {
        description: '숫자의 쌍곡사인을 반환합니다',
        abstract: '숫자의 쌍곡사인을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '실수입니다.' },
        },
    },
    SQRT: {
        description: '양의 제곱근을 반환합니다',
        abstract: '양의 제곱근을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '제곱근을 원하는 숫자입니다.' },
        },
    },
    SQRTPI: {
        description: '(number * pi)의 제곱근을 반환합니다',
        abstract: '(number * pi)의 제곱근을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'pi를 곱할 숫자입니다.' },
        },
    },
    SUBTOTAL: {
        description: '목록이나 데이터베이스에서 부분합을 반환합니다',
        abstract: '목록이나 데이터베이스에서 부분합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: '부분합을 계산하는 데 사용할 함수를 지정하는 1에서 11 또는 101에서 111 사이의 숫자입니다.' },
            ref1: { name: 'ref1', detail: '부분합을 구하려는 첫 번째 명명된 범위 또는 참조입니다.' },
            ref2: { name: 'ref2', detail: '부분합을 구하려는 2에서 254개의 명명된 범위 또는 참조입니다.' },
        },
    },
    SUM: {
        description: '인수를 더합니다',
        abstract: '인수를 더합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '더하려는 첫 번째 숫자입니다. 숫자는 4와 같은 값, A6과 같은 셀 참조 또는 A2:A8과 같은 셀 범위일 수 있습니다.' },
            number2: { name: 'number2', detail: '더하려는 두 번째 숫자입니다. 이런 방식으로 최대 255개의 숫자를 지정할 수 있습니다.' },
        },
    },
    SUMIF: {
        description: '지정한 조건에 의해 지정된 셀을 더합니다',
        abstract: '지정한 조건에 의해 지정된 셀을 더합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: '조건에 의해 평가하려는 셀 범위입니다.' },
            criteria: { name: 'criteria', detail: '어떤 셀을 더할지 정의하는 숫자, 식, 셀 참조, 텍스트 또는 함수 형식의 조건입니다.' },
            sumRange: { name: 'sum_range', detail: '더할 실제 셀입니다(범위에서 지정한 셀 이외의 셀을 더하려는 경우)입니다.' },
        },
    },
    SUMIFS: {
        description: '범위에서 여러 조건을 충족하는 셀을 더합니다',
        abstract: '범위에서 여러 조건을 충족하는 셀을 더합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: '더할 셀 범위입니다.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'criteria1을 사용하여 테스트되는 범위입니다.' },
            criteria1: { name: 'criteria1', detail: 'criteria_range1에서 더할 셀을 정의하는 조건입니다.' },
            criteriaRange2: { name: 'criteria_range2', detail: '추가 범위입니다. 최대 127개의 범위 쌍을 입력할 수 있습니다.' },
            criteria2: { name: 'criteria2', detail: '추가 관련 조건입니다. 최대 127개의 조건 쌍을 입력할 수 있습니다.' },
        },
    },
    SUMPRODUCT: {
        description: '해당 배열 구성 요소의 곱의 합을 반환합니다',
        abstract: '해당 배열 구성 요소의 곱의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '구성 요소를 곱한 다음 더하려는 첫 번째 배열 인수입니다.' },
            array2: { name: 'array2', detail: '구성 요소를 곱한 다음 더하려는 2에서 255개의 배열 인수입니다.' },
        },
    },
    SUMSQ: {
        description: '인수의 제곱의 합을 반환합니다',
        abstract: '인수의 제곱의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '제곱하고 더하려는 첫 번째 숫자입니다.' },
            number2: { name: 'number2', detail: '제곱하고 더하려는 2에서 255개의 숫자입니다.' },
        },
    },
    SUMX2MY2: {
        description: '두 배열에서 해당 값의 제곱 차이의 합을 반환합니다',
        abstract: '두 배열에서 해당 값의 제곱 차이의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: '첫 번째 배열 또는 값 범위입니다.' },
            arrayY: { name: 'array_y', detail: '두 번째 배열 또는 값 범위입니다.' },
        },
    },
    SUMX2PY2: {
        description: '두 배열에서 해당 값의 제곱 합의 합을 반환합니다',
        abstract: '두 배열에서 해당 값의 제곱 합의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: '첫 번째 배열 또는 값 범위입니다.' },
            arrayY: { name: 'array_y', detail: '두 번째 배열 또는 값 범위입니다.' },
        },
    },
    SUMXMY2: {
        description: '두 배열에서 해당 값 차이의 제곱의 합을 반환합니다',
        abstract: '두 배열에서 해당 값 차이의 제곱의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: '첫 번째 배열 또는 값 범위입니다.' },
            arrayY: { name: 'array_y', detail: '두 번째 배열 또는 값 범위입니다.' },
        },
    },
    TAN: {
        description: '숫자의 탄젠트를 반환합니다',
        abstract: '숫자의 탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '탄젠트를 원하는 각도(라디안)입니다.' },
        },
    },
    TANH: {
        description: '숫자의 쌍곡탄젠트를 반환합니다',
        abstract: '숫자의 쌍곡탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '실수입니다.' },
        },
    },
    TRUNC: {
        description: '숫자를 정수로 자릅니다',
        abstract: '숫자를 정수로 자릅니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '자르려는 숫자입니다.' },
            numDigits: { name: 'num_digits', detail: '소수점 이하 표시할 자릿수를 지정하는 숫자입니다. num_digits의 기본값은 0(영)입니다.' },
        },
    },
};

export default locale;

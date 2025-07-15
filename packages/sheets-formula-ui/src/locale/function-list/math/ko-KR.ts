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
                url: 'https://support.microsoft.com/ko-kr/office/abs-함수-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/ko-kr/office/acos-함수-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/ko-kr/office/acosh-함수-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/ko-kr/office/acot-함수-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/ko-kr/office/acoth-함수-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/ko-kr/office/aggregate-함수-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첫 번째' },
            number2: { name: 'number2', detail: '두 번째' },
        },
    },
    ARABIC: {
        description: '로마 숫자를 아라비아 숫자로 변환합니다',
        abstract: '로마 숫자를 아라비아 숫자로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/arabic-함수-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/ko-kr/office/asin-함수-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/ko-kr/office/asinh-함수-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/ko-kr/office/atan-함수-50746fa8-630a-406b-81d0-4a2aed395543',
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
                url: 'https://support.microsoft.com/ko-kr/office/atan2-함수-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: '점의 x 좌표입니다.' },
            yNum: { name: 'y_num', detail: '점의 y 좌표입니다.' },
        },
    },
    ATANH: {
        description: '숫자의 역쌍곡탄젠트를 반환합니다.',
        abstract: '숫자의 역쌍곡탄젠트를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/atanh-함수-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '1과 -1 사이의 실수입니다.' },
        },
    },
    BASE: {
        description: '숫자를 지정된 기수(밑)의 텍스트 표현으로 변환합니다',
        abstract: '숫자를 지정된 기수(밑)의 텍스트 표현으로 변환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/base-함수-2ef61411-aee9-4f29-a811-1c42456c6342',
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
                url: 'https://support.microsoft.com/ko-kr/office/ceiling-함수-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/ko-kr/office/ceiling-math-함수-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/ko-kr/office/ceiling-precise-함수-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/ko-kr/office/combin-함수-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/ko-kr/office/combina-함수-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/ko-kr/office/cos-함수-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/ko-kr/office/cosh-함수-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/ko-kr/office/cot-함수-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/ko-kr/office/coth-함수-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/ko-kr/office/csc-함수-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/ko-kr/office/csch-함수-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/ko-kr/office/decimal-함수-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/ko-kr/office/degrees-함수-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/ko-kr/office/even-함수-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/ko-kr/office/exp-함수-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/ko-kr/office/fact-함수-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/ko-kr/office/factdouble-함수-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/ko-kr/office/floor-함수-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/ko-kr/office/floor-math-함수-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/ko-kr/office/floor-precise-함수-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/ko-kr/office/gcd-함수-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/ko-kr/office/int-함수-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/ko-kr/office/iso-ceiling-함수-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LCM: {
        description: '최소공배수를 반환합니다',
        abstract: '최소공배수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/lcm-함수-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최소공배수를 찾으려는 첫 번째 숫자로, 쉼표로 구분된 매개 변수 대신 단일 배열 또는 배열에 대한 참조를 사용할 수도 있습니다.' },
            number2: { name: 'number2', detail: '최소공배수를 찾으려는 두 번째 숫자입니다. 이런 방식으로 최대 255개의 숫자를 지정할 수 있습니다.' },
        },
    },
    LET: {
        description: 'Assigns names to calculation results to allow storing intermediate calculations, values, or defining names inside a formula',
        abstract: 'Assigns names to calculation results to allow storing intermediate calculations, values, or defining names inside a formula',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LN: {
        description: '숫자의 자연 로그를 반환합니다',
        abstract: '숫자의 자연 로그를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ln-함수-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/ko-kr/office/log-함수-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/ko-kr/office/log10-함수-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/ko-kr/office/mdeterm-함수-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/ko-kr/office/minverse-함수-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/ko-kr/office/mmult-함수-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/ko-kr/office/mod-함수-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/ko-kr/office/mround-함수-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/ko-kr/office/multinomial-함수-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first value or range to use in the calculation.' },
            number2: { name: 'number2', detail: 'Additional values ​​or ranges to use in calculations.' },
        },
    },
    MUNIT: {
        description: '지정된 차원의 단위 행렬을 반환합니다',
        abstract: '지정된 차원의 단위 행렬을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/munit-함수-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/ko-kr/office/odd-함수-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/ko-kr/office/pi-함수-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/ko-kr/office/power-함수-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/ko-kr/office/product-함수-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/ko-kr/office/quotient-함수-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/ko-kr/office/radians-함수-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/ko-kr/office/rand-함수-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/ko-kr/office/randarray-함수-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/ko-kr/office/randbetween-함수-4cc7f0d1-87dc-4eb7-987f-0a21263ce3e',
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
                url: 'https://support.microsoft.com/ko-kr/office/roman-함수-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/ko-kr/office/round-함수-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '반올림하려는 숫자입니다.' },
            numDigits: { name: 'num_digits', detail: '반올림하려는 자릿수입니다.' },
        },
    },
    ROUNDBANK: {
        description: 'Rounds a number in banker\'s rounding',
        abstract: 'Rounds a number in banker\'s rounding',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number that you want to round in banker\'s rounding.' },
            numDigits: { name: 'num_digits', detail: 'The number of digits to which you want to round in banker\'s rounding.' },
        },
    },
    ROUNDDOWN: {
        description: '숫자를 0 방향으로 내림합니다',
        abstract: '숫자를 0 방향으로 내림합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rounddown-함수-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/ko-kr/office/roundup-함수-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/ko-kr/office/sec-함수-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/ko-kr/office/sech-함수-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '쌍곡시컨트를 원하는 각도(라디안)입니다.' },
        },
    },
    SEQUENCE: {
        description: '1, 2, 3, 4와 같은 순차 숫자 목록을 배열로 생성합니다',
        abstract: '순차 숫자 목록을 배열로 생성합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/sequence-함수-57467a98-57e0-4817-9f14-2eb78519ca90',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: '반환할 행 수입니다.' },
            columns: { name: 'columns', detail: '반환할 열 수입니다.' },
            start: { name: 'start', detail: '순서의 첫 번째 숫자입니다.' },
            step: { name: 'step', detail: '배열의 각 순차 값 사이의 증분입니다.' },
        },
    },
    SERIESSUM: {
        description: '수식을 기반으로 거듭제곱 급수의 합을 반환합니다',
        abstract: '수식을 기반으로 거듭제곱 급수의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/seriessum-함수-a3ab25b5-1093-4f5b-b084-96c49087f637',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '거듭제곱 급수의 입력 값입니다.' },
            n: { name: 'n', detail: 'x를 거듭제곱할 초기 거듭제곱입니다.' },
            m: { name: 'm', detail: '급수의 각 항에서 n을 증가시킬 단계입니다.' },
            coefficients: { name: 'coefficients', detail: 'x의 연속 거듭제곱에 곱할 계수 집합입니다.' },
        },
    },
    SIGN: {
        description: '숫자의 부호를 반환합니다',
        abstract: '숫자의 부호를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/sign-함수-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/ko-kr/office/sin-함수-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/ko-kr/office/sinh-함수-1e4e8b9f-2b65-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/ko-kr/office/sqrt-함수-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/ko-kr/office/sqrtpi-함수-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/ko-kr/office/subtotal-함수-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/ko-kr/office/sum-함수-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumif-함수-169b8c99-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumifs-함수-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumproduct-함수-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumsq-함수-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumx2my2-함수-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumx2py2-함수-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/ko-kr/office/sumxmy2-함수-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/ko-kr/office/tan-함수-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/ko-kr/office/tanh-함수-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/ko-kr/office/trunc-함수-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '자르려는 숫자입니다.' },
            numDigits: { name: 'num_digits', detail: '소수점 이하 표시할 자릿수를 지정하는 숫자입니다. num_digits의 기본값은 0(영)입니다.' },
        },
    },
};

export default locale;

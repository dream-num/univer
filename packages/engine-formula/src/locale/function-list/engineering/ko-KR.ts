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
    BESSELI: {
        description: '순허수 인수를 사용하여 계산된 Bessel 함수인 수정된 Bessel 함수를 반환합니다.',
        abstract: '순허수 인수를 사용하여 계산된 Bessel 함수인 수정된 Bessel 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            n: { name: 'N', detail: '필수 요소입니다. Bessel 함수의 차수입니다. n이 정수가 아니면 소수점 이하는 무시됩니다.' },
        },
    },
    BESSELJ: {
        description: 'Bessel 함수를 반환합니다.',
        abstract: 'Bessel 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            n: { name: 'N', detail: '필수 요소입니다. Bessel 함수의 차수입니다. n이 정수가 아니면 소수점 이하는 무시됩니다.' },
        },
    },
    BESSELK: {
        description: '순허수 인수를 사용하여 계산된 Bessel 함수인 수정된 Bessel 함수를 반환합니다.',
        abstract: '순허수 인수를 사용하여 계산된 Bessel 함수인 수정된 Bessel 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            n: { name: 'N', detail: '필수 요소입니다. 함수의 차수입니다. n이 정수가 아니면 소수점 이하는 무시됩니다.' },
        },
    },
    BESSELY: {
        description: 'Weber 함수 또는 Neumann 함수라고도 하는 Bessel 함수를 반환합니다.',
        abstract: 'Weber 함수 또는 Neumann 함수라고도 하는 Bessel 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            n: { name: 'N', detail: '필수 요소입니다. 함수의 차수입니다. n이 정수가 아니면 소수점 이하는 무시됩니다.' },
        },
    },
    BIN2DEC: {
        description: '2진수를 10진수로 변환합니다.',
        abstract: '2진수를 10진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환하려는 2진수입니다. 숫자는 10자(10비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 9 비트는 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
        },
    },
    BIN2HEX: {
        description: '2진수를 16진수로 변환합니다.',
        abstract: '2진수를 16진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환하려는 2진수입니다. 숫자는 10자(10비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 9 비트는 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택적. 사용할 자릿수입니다. places를 생략하면 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    BIN2OCT: {
        description: '2진수를 8진수로 변환합니다.',
        abstract: '2진수를 8진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환하려는 2진수입니다. 숫자는 10자(10비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 9 비트는 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 BIN2OCT에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    BITAND: {
        description: 'Returns a \'Bitwise And\' of two numbers',
        abstract: 'Returns a \'Bitwise And\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'number2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    BITLSHIFT: {
        description: '지정된 비트만큼 왼쪽으로 이동한 숫자를 반환합니다.',
        abstract: '지정된 비트만큼 왼쪽으로 이동한 숫자를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. number는 0보다 크거나 같은 정수여야 합니다.' },
            shiftAmount: { name: 'shift_amount', detail: '필수. Shift_amount 정수여야 합니다.' },
        },
    },
    BITOR: {
        description: '두 숫자의 비트 단위 \'OR\'를 반환합니다.',
        abstract: '두 숫자의 비트 단위 \'OR\'를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 10진수 형식이어야 하며 0보다 크거나 같아야 합니다.' },
            number2: { name: 'number2', detail: '필수. 10진수 형식이어야 하며 0보다 크거나 같아야 합니다.' },
        },
    },
    BITRSHIFT: {
        description: '지정된 비트만큼 오른쪽으로 이동한 숫자를 반환합니다.',
        abstract: '지정된 비트만큼 오른쪽으로 이동한 숫자를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 0보다 크거나 같은 정수여야 합니다.' },
            shiftAmount: { name: 'shift_amount', detail: '필수. 정수여야 합니다.' },
        },
    },
    BITXOR: {
        description: '두 숫자의 비트 단위 \'XOR\'를 반환합니다.',
        abstract: '두 숫자의 비트 단위 \'XOR\'를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 0보다 크거나 같아야 합니다.' },
            number2: { name: 'number2', detail: '필수. 0보다 크거나 같아야 합니다.' },
        },
    },
    COMPLEX: {
        description: '실수와 허수 계수를 x + yi 또는 x + yj 형태의 복소수로 변환합니다.',
        abstract: '실수와 허수 계수를 x + yi 또는 x + yj 형태의 복소수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: '필수. 복소수의 실수 계수입니다.' },
            iNum: { name: 'i_num', detail: '필수. 복소수의 허수 계수입니다.' },
            suffix: { name: 'suffix', detail: '선택적. 복소수의 허수부에 표시할 접미사입니다. 생략하면 "i"가 사용됩니다.' },
        },
    },
    CONVERT: {
        description: '다른 단위 체계의 숫자로 변환합니다. 예를 들면 CONVERT 함수를 사용하여 마일 단위의 거리를 킬로미터 단위로 변환할 수 있습니다.',
        abstract: '다른 단위 체계의 숫자로 변환합니다. 예를 들면 CONVERT 함수를 사용하여 마일 단위의 거리를 킬로미터 단위로 변환할 수 있습니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'is the value in from_units to convert.' },
            fromUnit: { name: 'from_unit', detail: 'is the units for number.' },
            toUnit: { name: 'to_unit', detail: 'is the units for the result.' },
        },
    },
    DEC2BIN: {
        description: '10진수를 2진수로 변환합니다.',
        abstract: '10진수를 2진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 10진수 정수입니다. number가 음수이면 유효한 위치 값이 무시되고 DEC2BIN 가장 중요한 비트가 부호 비트인 10자(10비트) 이진 번호를 반환합니다. 나머지 9 비트는 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택적. 사용할 자릿수입니다. places를 생략하면 DEC2BIN에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    DEC2HEX: {
        description: '10진수를 16진수로 변환합니다.',
        abstract: '10진수를 16진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 10진수 정수입니다. number가 음수이면 자리가 무시되고 DEC2HEX 가장 중요한 비트가 부호 비트인 10자(40비트) 16진수를 반환합니다. 나머지 39비트 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택적. 사용할 자릿수입니다. places를 생략하면 DEC2HEX에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    DEC2OCT: {
        description: '10진수를 8진수로 변환합니다.',
        abstract: '10진수를 8진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 10진수 정수입니다. number가 음수이면 위치가 무시되고 DEC2OCT 가장 중요한 비트가 부호 비트인 10자(30비트) 8진수를 반환합니다. 나머지 29비트 는 진도 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 DEC2OCT에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    DELTA: {
        description: '두 값이 같은지 여부를 검사합니다. number1 = number2이면 1을 반환하고, 그렇지 않으면 0을 반환합니다. 이 함수를 사용하면 값 집합을 필터링할 수 있습니다. 예를 들어 DELTA 함수 몇 개의 합을 구하여 값이 같은 쌍의 개수를 계산할 수 있습니다. 이 함수는 Kronecker Delta 함수라고도 합니다.',
        abstract: '두 값이 같은지 여부를 검사합니다. number1 = number2이면 1을 반환하고, 그렇지 않으면 0을 반환합니다. 이 함수를 사용하면 값 집합을 필터링할 수 있습니다. 예를 들어 DELTA 함수 몇 개의 합을 구하여 값이 같은 쌍의 개수를 계산할 수 있습니다. 이 함수는 Kronecker Delta 함수라고도 합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 첫 번째 숫자입니다.' },
            number2: { name: 'number2', detail: '선택적. 두 번째 숫자입니다. 생략하면 0으로 간주됩니다.' },
        },
    },
    ERF: {
        description: 'lower_limit에서 upper_limit까지 적분된 오차 함수를 반환합니다.',
        abstract: 'lower_limit에서 upper_limit까지 적분된 오차 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: '필수. ERF 적분의 하한값입니다.' },
            upperLimit: { name: 'upper_limit', detail: '선택적. ERF 적분의 상한값입니다. 생략하면 0에서 lower_limit까지 적분됩니다.' },
        },
    },
    ERF_PRECISE: {
        description: '오차 함수를 반환합니다.',
        abstract: '오차 함수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. ERF.PRECISE 적분의 하한값입니다.' },
        },
    },
    ERFC: {
        description: 'x에서 무한대까지 적분된 ERF 함수의 여값을 반환합니다.',
        abstract: 'x에서 무한대까지 적분된 ERF 함수의 여값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. ERFC 적분의 하한값입니다.' },
        },
    },
    ERFC_PRECISE: {
        description: 'x에서 무한대까지 적분된 ERF 함수의 여값을 반환합니다.',
        abstract: 'x에서 무한대까지 적분된 ERF 함수의 여값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. ERFC.PRECISE 적분의 하한값입니다.' },
        },
    },
    GESTEP: {
        description: 'number ≥ step이면 1을 반환하고 그렇지 않으면 0을 반환합니다. 이 함수를 사용하면 값 집합을 필터링할 수 있습니다. 예를 들어 GESTEP 함수 몇 개를 더하여 임계값을 초과하는 값의 개수를 계산합니다.',
        abstract: 'number ≥ step이면 1을 반환하고 그렇지 않으면 0을 반환합니다. 이 함수를 사용하면 값 집합을 필터링할 수 있습니다. 예를 들어 GESTEP 함수 몇 개를 더하여 임계값을 초과하는 값의 개수를 계산합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. step과 비교할 값입니다.' },
            step: { name: 'step', detail: '선택적. 임계값입니다. 생략하면 GESTEP에서는 0이 사용됩니다.' },
        },
    },
    HEX2BIN: {
        description: '16진수를 2진수로 변환합니다.',
        abstract: '16진수를 2진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 16진수입니다. 숫자는 10자를 초과할 수 없습니다. 숫자의 가장 중요한 비트는 부호 비트(오른쪽에서 40비트)입니다. 나머지 9 비트는 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 HEX2BIN에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    HEX2DEC: {
        description: '16진수를 10진수로 변환합니다.',
        abstract: '16진수를 10진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 16진수입니다. 숫자는 10자(40비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 39비트 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
        },
    },
    HEX2OCT: {
        description: '16진수를 8진수로 변환합니다.',
        abstract: '16진수를 8진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 16진수입니다. 숫자는 10자를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 39비트 크기 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 HEX2OCT에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    IMABS: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 절대값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 절대값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 절대값을 계산할 복소수입니다.' },
        },
    },
    IMAGINARY: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 허수부 계수를 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 허수부 계수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 허수부 계수를 구할 복소수입니다.' },
        },
    },
    IMARGUMENT: {
        description: '다음과 같이 라디안으로 표현된 각도인 (theta) 인수를 반환합니다.',
        abstract: '다음과 같이 라디안으로 표현된 각도인 (theta) 인수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. Theta 인수를 사용할 복소수입니다 .' },
        },
    },
    IMCONJUGATE: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 켤레 복소수를 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 켤레 복소수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 켤레 복소수를 구할 복소수입니다.' },
        },
    },
    IMCOS: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코사인 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코사인 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 코사인 값을 계산할 복소수입니다.' },
        },
    },
    IMCOSH: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 하이퍼볼릭 코사인 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 하이퍼볼릭 코사인 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 하이퍼볼릭 코사인을 원하는 복소수입니다.' },
        },
    },
    IMCOT: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코탄젠트 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코탄젠트 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '코탄젠트를 구할 복소수입니다.' },
        },
    },
    IMCOTH: {
        description: 'IMCOTH 함수는 주어진 복소수의 쌍곡선 코탄젠트값을 반환합니다. 예를 들어 복소수 \'x+yi\'가 주어지면 \'coth(x+yi)\'가 반환됩니다.',
        abstract: 'IMCOTH 함수는 주어진 복소수의 쌍곡선 코탄젠트값을 반환합니다. 예를 들어 복소수 \'x+yi\'가 주어지면 \'coth(x+yi)\'가 반환됩니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=ko',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '쌍곡선 코탄젠트를 구하려는 복소수입니다. 이는 COMPLEX 함수의 결과, 허수부가 0인 복소수로 해석되는 실수 또는 x와 y가 숫자인 \'x + yi\' 형식의 문자열일 수 있습니다.' },
        },
    },
    IMCSC: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코시컨트 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 코시컨트 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 코시컨트를 사용할 복소수입니다.' },
        },
    },
    IMCSCH: {
        description: 'x+yi 또는 x+yj 텍스트 형식으로 복소수의 하이퍼볼릭 코시컨트를 반환합니다.',
        abstract: 'x+yi 또는 x+yj 텍스트 형식으로 복소수의 하이퍼볼릭 코시컨트를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 하이퍼볼릭 코시컨트를 원하는 복소수입니다.' },
        },
    },
    IMDIV: {
        description: 'Returns the quotient of two complex numbers',
        abstract: 'Returns the quotient of two complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'The complex numerator or dividend.' },
            inumber2: { name: 'inumber2', detail: 'The complex denominator or divisor.' },
        },
    },
    IMEXP: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 지수를 계산합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 지수를 계산합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 지수를 계산할 복소수입니다.' },
        },
    },
    IMLN: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 자연 로그값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 자연 로그값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 자연 로그값을 계산할 복소수입니다.' },
        },
    },
    IMLOG: {
        description: 'IMLOG 함수는 지정된 값을 밑으로 하는 복소수의 로그 값을 반환합니다.',
        abstract: 'IMLOG 함수는 지정된 값을 밑으로 하는 복소수의 로그 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=ko',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '로그 함수의 입력값입니다. 1과 같은 일반적인 숫자를 쓸 수 있습니다(실수로 해석됨). 실계수와 복합계수를 모두 지정하기 위해 숫자를 인용된 텍스트로 쓸 수 있습니다.' },
            base: { name: 'base', detail: '대수를 계산하는 데 사용하는 밑입니다. 양의 실수여야 합니다.' },
        },
    },
    IMLOG10: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 상용 로그값(밑이 10)을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 상용 로그값(밑이 10)을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 상용 로그값을 계산할 복소수입니다.' },
        },
    },
    IMLOG2: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 밑이 2인 로그값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 밑이 2인 로그값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 밑이 2인 로그값을 계산할 복소수입니다.' },
        },
    },
    IMPOWER: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 멱을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 멱을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 멱을 계산할 복소수입니다.' },
            number: { name: 'number', detail: '필수 요소입니다. 멱의 지수입니다.' },
        },
    },
    IMPRODUCT: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수를 1개에서 255개까지 곱한 결과를 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수를 1개에서 255개까지 곱한 결과를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'inumber1은 필수 요소이고, 이후의 inumber는 선택 요소입니다. 곱할 복소수로, 1개에서 255개까지 지정할 수 있습니다.' },
            inumber2: { name: 'inumber2', detail: 'inumber1은 필수 요소이고, 이후의 inumber는 선택 요소입니다. 곱할 복소수로, 1개에서 255개까지 지정할 수 있습니다.' },
        },
    },
    IMREAL: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 실수부 계수를 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 실수부 계수를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 실수부 계수를 계산할 복소수입니다.' },
        },
    },
    IMSEC: {
        description: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 시컨트 값을 반환합니다.',
        abstract: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 시컨트 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 시컨트를 구할 복소수입니다.' },
        },
    },
    IMSECH: {
        description: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 하이퍼볼릭 시컨트 값을 반환합니다.',
        abstract: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 하이퍼볼릭 시컨트 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 하이퍼볼릭 시컨트를 구할 복소수입니다.' },
        },
    },
    IMSIN: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 사인 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 사인 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 사인 값을 계산할 복소수입니다.' },
        },
    },
    IMSINH: {
        description: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 하이퍼볼릭 사인 값을 반환합니다.',
        abstract: 'x+yi 또는 x+yj 텍스트 형식인 복소수의 하이퍼볼릭 사인 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 하이퍼볼릭 사인을 구할 복소수입니다.' },
        },
    },
    IMSQRT: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 제곱근을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 제곱근을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 제곱근을 계산할 복소수입니다.' },
        },
    },
    IMSUB: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 두 복소수의 차를 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 두 복소수의 차를 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '필수. 피감수인 복소수입니다.' },
            inumber2: { name: 'inumber2', detail: '필수. 감수인 복소수입니다.' },
        },
    },
    IMSUM: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 두 개 이상의 복소수의 합을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 두 개 이상의 복소수의 합을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Inumber1이 필요하며 후속 숫자는 필요하지 않습니다. 더할 복소수로, 1개에서 255개까지 지정할 수 있습니다.' },
            inumber2: { name: 'inumber2', detail: 'Inumber1이 필요하며 후속 숫자는 필요하지 않습니다. 더할 복소수로, 1개에서 255개까지 지정할 수 있습니다.' },
        },
    },
    IMTAN: {
        description: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 탄젠트 값을 반환합니다.',
        abstract: 'x + yi 또는 x + yj 텍스트 형식인 복소수의 탄젠트 값을 반환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '필수. 탄젠트를 사용할 복소수입니다.' },
        },
    },
    IMTANH: {
        description: 'IMTANH 함수는 주어진 복소수의 쌍곡선 탄젠트값을 반환합니다. 예를 들어 복소수 \'x+yi\'가 주어지면 \'tanh(x+yi)\'가 반환됩니다.',
        abstract: 'IMTANH 함수는 주어진 복소수의 쌍곡선 탄젠트값을 반환합니다. 예를 들어 복소수 \'x+yi\'가 주어지면 \'tanh(x+yi)\'가 반환됩니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=ko',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: '쌍곡선 탄젠트를 구하려는 복소수입니다. 이는 COMPLEX 함수의 결과, 허수부가 0인 복소수로 해석되는 실수 또는 x와 y가 숫자인 \'x + yi\' 형식의 문자열일 수 있습니다.' },
        },
    },
    OCT2BIN: {
        description: '8진수를 2진수로 변환합니다.',
        abstract: '8진수를 2진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 8진수입니다. 숫자는 10자를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 29비트 는 진도 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 OCT2BIN에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
    OCT2DEC: {
        description: '8진수를 10진수로 변환합니다.',
        abstract: '8진수를 10진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 8진수입니다. 숫자는 10 8진수(30비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 29비트 는 진도 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
        },
    },
    OCT2HEX: {
        description: '8진수를 16진수로 변환합니다.',
        abstract: '8진수를 16진수로 변환합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수 요소입니다. 변환할 8진수입니다. 숫자는 10 8진수(30비트)를 초과할 수 없습니다. Number의 최상위 비트는 부호 비트입니다. 나머지 29비트 는 진도 비트입니다. 음수는 2의 보수 표기법으로 표시됩니다.' },
            places: { name: 'places', detail: '선택 사항입니다. 사용할 자릿수입니다. places를 생략하면 OCT2HEX에서는 필요한 최소 자릿수가 사용됩니다. places를 지정하면 반환 값의 앞부분을 0으로 채울 수 있습니다.' },
        },
    },
};

export default locale;

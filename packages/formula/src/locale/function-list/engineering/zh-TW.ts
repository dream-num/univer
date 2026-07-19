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
        description: '傳回修正的貝賽耳函數 In(x)',
        abstract: '傳回修正的貝賽耳函數 In(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用於評估函數的值。' },
            n: { name: 'N', detail: 'Bessel函數的順序。如果n不是整數，則會取至整數。' },
        },
    },
    BESSELJ: {
        description: '傳回貝賽耳函數 Jn(x)',
        abstract: '返回貝賽耳函數 Jn(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用於評估函數的值。' },
            n: { name: 'N', detail: 'Bessel函數的順序。如果n不是整數，則會取至整數。' },
        },
    },
    BESSELK: {
        description: '傳回修正的貝賽耳函數 Kn(x)',
        abstract: '返回修正的貝賽耳函數 Kn(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用於評估函數的值。' },
            n: { name: 'N', detail: 'Bessel函數的順序。如果n不是整數，則會取至整數。' },
        },
    },
    BESSELY: {
        description: '傳回貝賽耳函數 Yn(x)',
        abstract: '返回貝賽耳函數 Yn(x)',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: '用於評估函數的值。' },
            n: { name: 'N', detail: 'Bessel函數的順序。如果n不是整數，則會取至整數。' },
        },
    },
    BIN2DEC: {
        description: '將二進位數轉換為十進位數',
        abstract: '將二進位數轉換為十進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '二進位數', detail: '要轉換的二進位數。' },
        },
    },
    BIN2HEX: {
        description: '將二進位數轉換為十六進位數',
        abstract: '將二進位數轉換為十六進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '二進位數', detail: '要轉換的二進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    BIN2OCT: {
        description: '將二進位數字轉換成八進位。',
        abstract: '將二進位數字轉換成八進位。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '二進位數', detail: '必要。 您要轉換的二進位數字。 Number 不能包含超過 10 個字元 (10 個位元)。 Number 最高有效位元是正負號位元。 其餘的 9 個位元則為量級位元。 負數是使用 2 的補數表示法來表示。' },
            places: { name: '字元數', detail: '可選的。 這是要使用的字元數。 如果省略 places，BIN2OCT 會使用所需字元數的最小值。 當您要使用前置 0 (零) 來填補傳回值時，places 非常有用。' },
        },
    },
    BITAND: {
        description: '傳回兩個數的「位元與」',
        abstract: '傳回兩數的「位元與」',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '必須是十進位格式，且大於或等於 0。' },
            number2: { name: '數值2', detail: '必須是十進位格式，且大於或等於 0。' },
        },
    },
    BITLSHIFT: {
        description: '傳回左移 shift_amount 位的計算值接收數',
        abstract: '傳回左移 shift_amount 位元的計算值接收數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '必須是大於或等於 0 的整數。' },
            shiftAmount: { name: '移位量', detail: '必須是整數。' },
        },
    },
    BITOR: {
        description: '傳回兩個數的「位元或」',
        abstract: '傳回兩個數字的「位元或」',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '必須是十進位格式，且大於或等於 0。' },
            number2: { name: '數值2', detail: '必須是十進位格式，且大於或等於 0。' },
        },
    },
    BITRSHIFT: {
        description: '傳回右移 shift_amount 位元的計算值接收數',
        abstract: '返回右移 shift_amount 位元的計算值接收數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '必須是大於或等於 0 的整數。' },
            shiftAmount: { name: '移位量', detail: '必須是整數。' },
        },
    },
    BITXOR: {
        description: '傳回兩個數的位元「異或」',
        abstract: '傳回兩數的位元「異或」',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '必須是十進位格式，且大於或等於 0。' },
            number2: { name: '數值2', detail: '必須是十進位格式，且大於或等於 0。' },
        },
    },
    COMPLEX: {
        description: '將實係數和虛係數轉換為複數',
        abstract: '將實係數和虛係數轉換為複數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: '實係數', detail: '複數的實係數。' },
            iNum: { name: '虛係數', detail: '複數的虛係數。' },
            suffix: { name: '字尾', detail: '複數虛數元件的字尾。如果省略，會將字尾假設為 "i"。' },
        },
    },
    CONVERT: {
        description: '將數字從一種度量系統轉換為另一種度量系統',
        abstract: '將數字從一種度量系統轉換為另一種度量系統',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要轉換的值。' },
            fromUnit: { name: '轉換前單位', detail: '數值的單位。' },
            toUnit: { name: '轉換后單位', detail: '結果的單位。' },
        },
    },
    DEC2BIN: {
        description: '將十進位數轉換為二進位數',
        abstract: '將十進位數轉換為二進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '十進位數', detail: '要轉換的十進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    DEC2HEX: {
        description: '將十進位數轉換為十六進位數',
        abstract: '將十進位數轉換為十六進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '十進位數', detail: '要轉換的十進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    DEC2OCT: {
        description: '將十進位數轉換為八進位數',
        abstract: '將十進位數轉換為八進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '十進位數', detail: '要轉換的十進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    DELTA: {
        description: '檢驗兩個值是否相等',
        abstract: '檢驗兩個值是否相等',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '第一個數值。' },
            number2: { name: '數值2', detail: '第二個數值。如果省略，會將數值2假設為零。' },
        },
    },
    ERF: {
        description: '返回誤差函數',
        abstract: '返回誤差函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: '下限', detail: '整合ERF的下限。' },
            upperLimit: { name: '上限', detail: '整合ERF的上限。如果省略，ERF會在零和下限之間整合。' },
        },
    },
    ERF_PRECISE: {
        description: '返回誤差函數',
        abstract: '返回誤差函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '整合ERF.PRECISE的下限。' },
        },
    },
    ERFC: {
        description: '返回互補誤差函數',
        abstract: '返回互補誤差函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '整合ERFC的下限。' },
        },
    },
    ERFC_PRECISE: {
        description: '傳回從 x 到無窮大積分的互補 ERF 函數',
        abstract: '傳回從 x 到無窮大積分的互補 ERF 函數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: '下限', detail: '整合ERFC.PRECISE的下限。' },
        },
    },
    GESTEP: {
        description: '檢驗數字是否大於門檻',
        abstract: '檢驗數字是否大於門檻',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要檢定閾值的值。' },
            step: { name: '閾值', detail: '閾值。如果省略閾值的值，GESTEP 會使用零。' },
        },
    },
    HEX2BIN: {
        description: '將十六進位數轉換為二進位數',
        abstract: '將十六進位數轉換為二進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '十六進位數', detail: '要轉換的十六進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    HEX2DEC: {
        description: '將十六進位數轉換為十進位數',
        abstract: '將十六進位數轉換為十進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '十六進位數', detail: '要轉換的十六進位數。' },
        },
    },
    HEX2OCT: {
        description: '將十六進位數轉換為八進位數',
        abstract: '將十六進位數轉換為八進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: '十六進位數', detail: '要轉換的十六進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    IMABS: {
        description: '傳回複數的絕對值（模數）',
        abstract: '傳回複數的絕對值（模）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得絕對值的複數。' },
        },
    },
    IMAGINARY: {
        description: '傳回複數的虛係數',
        abstract: '傳回複數的虛係數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得虛係數的複數。' },
        },
    },
    IMARGUMENT: {
        description: '傳回參數 theta，即以弧度表示的角',
        abstract: '傳回參數 theta，即以弧度表示的角',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求自變數 theta 的複數。' },
        },
    },
    IMCONJUGATE: {
        description: '傳回複數的共軛複數',
        abstract: '傳回複數的共軛複數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得共軛的複數。' },
        },
    },
    IMCOS: {
        description: '傳回複數的餘弦',
        abstract: '傳回複數的餘弦',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得餘弦值的複數。' },
        },
    },
    IMCOSH: {
        description: '傳回複數的雙曲餘弦值',
        abstract: '傳回複數的雙曲餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得雙曲餘弦值的複數。' },
        },
    },
    IMCOT: {
        description: '傳回複數的餘切值',
        abstract: '傳回複數的餘切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得餘切值的複數。' },
        },
    },
    IMCOTH: {
        description: 'IMCOTH 函式會傳回指定複數的雙曲餘切值。 例如，指定值為複數「x+yi」，就會傳回「coth(x+yi)」。',
        abstract: 'IMCOTH 函式會傳回指定複數的雙曲餘切值。 例如，指定值為複數「x+yi」，就會傳回「coth(x+yi)」。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9366256?hl=zh-Hant',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要計算雙曲餘切值的複數。 此引數可以是 COMPLEX 函式得出的值，也可以是實數 (視為虛部等於 0 的複數) 或格式為「x+yi」的字串，其中 x 和 y 為數字。' },
        },
    },
    IMCSC: {
        description: '傳回複數的餘割值',
        abstract: '傳回複數的餘割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得餘割值的複數。' },
        },
    },
    IMCSCH: {
        description: '傳回複數的雙曲餘割值',
        abstract: '傳回複數的雙曲餘割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得雙曲餘割值的複數。' },
        },
    },
    IMDIV: {
        description: '傳回文字格式為 x + yi 或 x + yj 的兩個複數的商數。',
        abstract: '傳回文字格式為 x + yi 或 x + yj 的兩個複數的商數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '複數分子', detail: '必須。 這是複數分子或被除數。' },
            inumber2: { name: '複數分母', detail: '必須。 這是複數分母或除數。' },
        },
    },
    IMEXP: {
        description: '傳回複數的指數',
        abstract: '傳回複數的指數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得指數的複數。' },
        },
    },
    IMLN: {
        description: '傳回複數的自然對數',
        abstract: '傳回複數的自然對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得自然對數的複數。' },
        },
    },
    IMLOG: {
        description: 'IMLOG 函式會傳回指定複數的對數 (根據特定底數)。',
        abstract: 'IMLOG 函式會傳回指定複數的對數 (根據特定底數)。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/9366486?hl=zh-Hant',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '對數函式的輸入值。 可以輸入 1 這樣的純數字，系統會將此解析為一個實數。 也可以輸入引用文字，同時指定實數和複數係數。' },
            base: { name: '底數', detail: '計算對數時所用的底數。 必須是正實數。' },
        },
    },
    IMLOG10: {
        description: '傳回複數的以 10 為底的對數',
        abstract: '傳回複數的以 10 為底的對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得常用對數的複數。' },
        },
    },
    IMLOG2: {
        description: '傳回複數的以 2 為底的對數',
        abstract: '傳回複數的以 2 為底的對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得底數為 2 之對數的複數。' },
        },
    },
    IMPOWER: {
        description: '傳回複數的整數冪',
        abstract: '傳回複數的整數冪',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要遞增至乘冪的複數。' },
            number: { name: '數值', detail: '要遞增至複數的乘冪。' },
        },
    },
    IMPRODUCT: {
        description: '傳回多個複數的乘積',
        abstract: '傳回多個複數的乘積',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '複數1', detail: '1 到 255 個要乘以的複數。' },
            inumber2: { name: '複數2', detail: '1 到 255 個要乘以的複數。' },
        },
    },
    IMREAL: {
        description: '傳回複數的實係數',
        abstract: '傳回複數的實係數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得實係數的複數。' },
        },
    },
    IMSEC: {
        description: '傳回複數的正割值',
        abstract: '傳回複數的正割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得正割值的複數。' },
        },
    },
    IMSECH: {
        description: '傳回複數的雙曲正割值',
        abstract: '傳回複數的雙曲正割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得雙曲正割值的複數。' },
        },
    },
    IMSIN: {
        description: '傳回複數的正弦',
        abstract: '傳回複數的正弦',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得正弦值的複數。' },
        },
    },
    IMSINH: {
        description: '傳回複數的雙曲正弦值',
        abstract: '傳回複數的雙曲正弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得雙曲正弦值的複數。' },
        },
    },
    IMSQRT: {
        description: '傳回複數的平方根',
        abstract: '傳回複數的平方根',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得平方根的複數。' },
        },
    },
    IMSUB: {
        description: '傳回兩個複數的差',
        abstract: '傳回兩個複數的差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '複數1', detail: '複數1。' },
            inumber2: { name: '複數2', detail: '複數2。' },
        },
    },
    IMSUM: {
        description: '傳回多個複數的和',
        abstract: '傳回多個複數的和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: '複數1', detail: '1 到 255 個要相加的複數。' },
            inumber2: { name: '複數2', detail: '1 到 255 個要相加的複數。' },
        },
    },
    IMTAN: {
        description: '傳回複數的正切值',
        abstract: '傳回複數的正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要求得正切值的複數。' },
        },
    },
    IMTANH: {
        description: 'IMTANH 函式會傳回指定複數的雙曲正切值。 例如，指定值為複數「x+yi」，就會傳回「tanh(x+yi)」。',
        abstract: 'IMTANH 函式會傳回指定複數的雙曲正切值。 例如，指定值為複數「x+yi」，就會傳回「tanh(x+yi)」。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/9366655?hl=zh-Hant',
            },
        ],
        functionParameter: {
            inumber: { name: '複數', detail: '要計算雙曲正切值的複數。 此引數可以是 COMPLEX 函式得出的數值，也可以是實數 (視為虛部等於 0 的複數) 或格式為「x+yi」的字串，其中 x 和 y 為數字。' },
        },
    },
    OCT2BIN: {
        description: '將八進位數轉換為二進位數',
        abstract: '將八進位數轉換為二進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: '八進位數', detail: '要轉換的八進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
    OCT2DEC: {
        description: '將八進位數轉換為十進位數',
        abstract: '將八進位數轉換為十進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: '八進位數', detail: '要轉換的八進位數。' },
        },
    },
    OCT2HEX: {
        description: '將八進位數轉換為十六進位數',
        abstract: '將八進位數轉換為十六進位數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: '八進位數', detail: '要轉換的八進位數。' },
            places: { name: '字元數', detail: '要使用的字元數。' },
        },
    },
};

export default locale;

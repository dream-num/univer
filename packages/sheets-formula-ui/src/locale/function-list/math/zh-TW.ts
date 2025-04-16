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

export default {
    ABS: {
        description: '傳回數字的絕對值。一個數字的絕對值是該數字不帶其符號的形式。 ',
        abstract: '傳回數字的絕對值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/abs-%E5%87%BD%E6%95%B0-3420200f-5628-4e8c-99da-c99d7c87713c',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '需要計算其絕對值的實數。 ' },
        },
    },
    ACOS: {
        description:
            '傳回數字的反餘弦值。 反餘弦值是指餘弦值為 number 的角度。 傳回的角度以弧度表示，弧度值在 0（零）到 pi 之間。 ',
        abstract: '傳回數字的反餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/acos-%E5%87%BD%E6%95%B0-cb73173f-d089-4582-afa1-76e5524b5d5b',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '所求角度的餘弦值，必須介於 -1 到 1 之間。 ' },
        },
    },
    ACOSH: {
        description:
            '傳回數字的反雙曲餘弦值。 該數字必須大於或等於 1。 反雙曲餘弦值是指雙曲餘弦值為 number 的值，因此 ACOSH(COSH(number)) 等於 number。 ',
        abstract: '傳回數字的反雙曲餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/acosh-%E5%87%BD%E6%95%B0-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '大於或等於 1 的任意實數。 ' },
        },
    },
    ACOT: {
        description: '傳回數字的反餘切值的主值。 ',
        abstract: '傳回一個數的反餘切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/acot-%E5%87%BD%E6%95%B0-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '數字是需要的角度的正切值。 這必須是實數。 ' },
        },
    },
    ACOTH: {
        description: '傳回一個數的雙曲反餘切值',
        abstract: '傳回一個數的雙曲反餘切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/acoth-%E5%87%BD%E6%95%B0-cc49480f-f684-4171-9fc5-73e4e852300f',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '數字的絕對值必須大於 1。' },
        },
    },
    AGGREGATE: {
        description: '傳回清單或資料庫中的聚合',
        abstract: '傳回清單或資料庫中的聚合',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/aggregate-%E5%87%BD%E6%95%B0-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARABIC: {
        description: '將羅馬數字轉換為阿拉伯數字',
        abstract: '將羅馬數字轉換為阿拉伯數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/arabic-%E5%87%BD%E6%95%B0-9a8da418-c17b-4ef9-a657-9370a30a674f',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '以引弧括住的字串、空字串 (“) ，或包含文字的單元格參照。' },
        },
    },
    ASIN: {
        description: '傳回數字的反正弦值',
        abstract: '傳回數字的反正弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/asin-%E5%87%BD%E6%95%B0-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '欲求角度的正弦值，其值必須介於 -1 到 1。' },
        },
    },
    ASINH: {
        description: '傳回數字的反雙曲正弦值',
        abstract: '傳回數字的反雙曲正弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/asinh-%E5%87%BD%E6%95%B0-4e00475a-067a-43cf-926a-765b0249717c',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '任意實數。' },
        },
    },
    ATAN: {
        description: '傳回數字的反正切值',
        abstract: '傳回數字的反正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/atan-%E5%87%BD%E6%95%B0-50746fa8-630a-406b-81d0-4a2aed395543',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '欲求角度的正切值。' },
        },
    },
    ATAN2: {
        description: '傳回 X 和 Y 座標的反正切值',
        abstract: '傳回 X 和 Y 座標的反正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/atan2-%E5%87%BD%E6%95%B0-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x 座標', detail: '點的 X 座標。' },
            yNum: { name: 'y 座標', detail: '點的 Y 座標。' },
        },
    },
    ATANH: {
        description: '傳回數字的反雙曲正切值',
        abstract: '傳回數字的反雙曲正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/atanh-%E5%87%BD%E6%95%B0-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '任何介於 1 和 -1 之間的實數。' },
        },
    },
    BASE: {
        description: '將一個數轉換為具有給定基數的文字表示',
        abstract: '將一個數轉換為具有給定基數的文字表示',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/base-%E5%87%BD%E6%95%B0-2ef61411-aee9-4f29-a811-1c42456c6342',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要轉換的數位。必須是大於或等於 0 且小於 2^53 的整數。' },
            radix: { name: '基數', detail: '要將數字轉換為底數的基數。必須是大於或等於 2 且小於或等於 36 的整數。' },
            minLength: { name: '最小長度', detail: '傳回之字串的最小長度。必須是大於或等於 0 的整數。' },
        },
    },
    CEILING: {
        description: '將數字舍入為最接近的整數或最接近的指定基數的倍數',
        abstract: '將數字舍入為最接近的整數或最接近的指定基數的倍數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ceiling-%E5%87%BD%E6%95%B0-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
        },
    },
    CEILING_MATH: {
        description: '將數字向上捨入為最接近的整數或最接近的指定基數的倍數',
        abstract: '將數字向上捨入為最接近的整數或最接近的指定基數的倍數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ceiling-math-%E5%87%BD%E6%95%B0-80f95d2f-b499-4eee-9f16-f795a8e306c8',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
            mode: { name: '眾數', detail: '對於負數，請控制數位是否趨於或背離於零。' },
        },
    },
    CEILING_PRECISE: {
        description: '將數字舍入為最接近的整數或最接近的指定基數的倍數。 無論該數字的符號為何，該數字都向上捨入。 ',
        abstract: '將數字捨去為最接近的整數或最接近的指定基數的倍數。 無論該數字的符號為何，該數字都向上捨入。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ceiling-precise-%E5%87%BD%E6%95%B0-f366a774-527a-4c92-ba49-af0a196e66cb',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
        },
    },
    COMBIN: {
        description: '傳回給定數目物件的組合數',
        abstract: '傳回給定數目物件的組合數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/combin-%E5%87%BD%E6%95%B0-12a3f276-0a21-423a-8de6-06990aaf638a',
            },
        ],
        functionParameter: {
            number: { name: '總數', detail: '項目數。' },
            numberChosen: { name: '樣品數量', detail: '每個組合中的項目數。' },
        },
    },
    COMBINA: {
        description: '傳回給定數目物件具有重複項的組合數',
        abstract: '傳回給定數目物件具有重複項的組合數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/combina-%E5%87%BD%E6%95%B0-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
            },
        ],
        functionParameter: {
            number: { name: '總數', detail: '項目數。' },
            numberChosen: { name: '樣品數量', detail: '每個組合中的項目數。' },
        },
    },
    COS: {
        description: '傳回數字的餘弦值',
        abstract: '傳回數字的餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cos-%E5%87%BD%E6%95%B0-0fb808a5-95d6-4553-8148-22aebdce5f05',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '欲求算其餘弦值的角度，以弧度表示。' },
        },
    },
    COSH: {
        description: '傳回數字的雙曲餘弦值',
        abstract: '傳回數字的雙曲餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cosh-%E5%87%BD%E6%95%B0-e460d426-c471-43e8-9540-a57ff3b70555',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '欲求得其雙曲線餘弦值的任意實數。' },
        },
    },
    COT: {
        description: '返回角度的餘弦值',
        abstract: '返回角度的餘弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cot-%E5%87%BD%E6%95%B0-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '欲求餘切值的角度，以弧度表示。' },
        },
    },
    COTH: {
        description: '傳回數字的雙曲餘切值',
        abstract: '傳回數字的雙曲餘切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coth-%E5%87%BD%E6%95%B0-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '想要求雙曲餘切的任意實數。' },
        },
    },
    CSC: {
        description: '傳回角度的餘割值',
        abstract: '傳回角度的餘值值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/csc-%E5%87%BD%E6%95%B0-07379361-219a-4398-8675-07ddc4f135c1',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '想要求餘割的角度，以弧度表示。' },
        },
    },
    CSCH: {
        description: '返回角度的雙曲餘割值',
        abstract: '返回角度的雙曲餘割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/csch-%E5%87%BD%E6%95%B0-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '想要求雙曲餘割值的角度，以弧度表示。' },
        },
    },
    DECIMAL: {
        description: '將給定基數內的數的文字表示轉換為十進制數',
        abstract: '將給定基數內的數的文字表示轉換為十進制數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/decimal-%E5%87%BD%E6%95%B0-ee554665-6176-46ef-82de-0a283658da2e',
            },
        ],
        functionParameter: {
            text: { name: '字串', detail: '字串長度必須小於或等於 255 個字元。' },
            radix: { name: '基數', detail: '要將數字轉換為底數的基數。 必須是大於或等於 2 且小於或等於 36 的整數。' },
        },
    },
    DEGREES: {
        description: '將弧度轉換為度',
        abstract: '將弧度轉換為度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/degrees-%E5%87%BD%E6%95%B0-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
            },
        ],
        functionParameter: {
            angle: { name: '角度', detail: '要轉換的角度，以弧度表示。' },
        },
    },
    EVEN: {
        description: '將數字向上捨入到最接近的偶數',
        abstract: '將數字向上捨入到最接近的偶數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/even-%E5%87%BD%E6%95%B0-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨入的數值。' },
        },
    },
    EXP: {
        description: '返回e的 n 次方',
        abstract: '返回e的 n 次方',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/exp-%E5%87%BD%E6%95%B0-c578f034-2c45-4c37-bc8c-329660a63abe',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '套用至基數 e 的指數。' },
        },
    },
    FACT: {
        description: '傳回數字的階乘',
        abstract: '傳回數字的階乘',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fact-%E5%87%BD%E6%95%B0-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要階乘的非負數數字。 如果數字不是整數，則只會取整數。' },
        },
    },
    FACTDOUBLE: {
        description: '傳回數字的雙倍階乘',
        abstract: '傳回數字的雙倍階乘',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/factdouble-%E5%87%BD%E6%95%B0-e67697ac-d214-48eb-b7b7-cce2589ecac8',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要雙倍階乘的非負數數字。 如果數字不是整數，則只會取整數。' },
        },
    },
    FLOOR: {
        description: '向絕對值減小的方向舍入數字',
        abstract: '向絕對值減小的方向捨去數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/floor-%E5%87%BD%E6%95%B0-14bb497c-24f2-4e04-b327-b0b4de5a8886',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
        },
    },
    FLOOR_MATH: {
        description: '將數字向下捨去為最接近的整數或最接近的指定基數的倍數',
        abstract: '將數字向下捨去為最接近的整數或最接近的指定基數的倍數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/floor-math-%E5%87%BD%E6%95%B0-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
            mode: { name: '眾數', detail: '對於負數，請控制數位是否趨於或背離於零。' },
        },
    },
    FLOOR_PRECISE: {
        description: '將數字向下捨去為最接近的整數或最接近的指定基數的倍數。 無論該數字的符號為何，該數字都向下捨去。 ',
        abstract: '將數字向下捨去為最接近的整數或最接近的指定基數的倍數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/floor-precise-%E5%87%BD%E6%95%B0-f769b468-1452-4617-8dc3-02f842a0702e',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨位的數值。' },
            significance: { name: '倍數', detail: '要捨位的倍數。' },
        },
    },
    GCD: {
        description: '傳回最大公約數',
        abstract: '傳回最大公約數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/gcd-%E5%87%BD%E6%95%B0-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '用於計算的第一項數值或範圍。' },
            number2: { name: '數值2', detail: '用於計算的其他數值或範圍。' },
        },
    },
    INT: {
        description: '將數字向下捨去到最接近的整數',
        abstract: '將數字向下捨去到最接近的整數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/int-%E5%87%BD%E6%95%B0-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要將數字向下捨去到最接近的整數的實數。' },
        },
    },
    ISO_CEILING: {
        description: '傳回一個數字，該數字向上捨入為最接近的整數或最接近的有效位的倍數',
        abstract: '傳回一個數字，該數字向上捨入為最接近的整數或最接近的有效位的倍數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/iso-ceiling-%E5%87%BD%E6%95%B0-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LCM: {
        description: '傳回最小公倍數',
        abstract: '傳回最小公倍數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lcm-%E5%87%BD%E6%95%B0-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '用於計算的第一項數值或範圍。' },
            number2: { name: '數值2', detail: '用於計算的其他數值或範圍。' },
        },
    },
    LET: {
        description: '將名稱指派給計算結果，以允許將中間計算、值或定義名稱儲存在公式內',
        abstract: '將名稱指派給計算結果，以允許將中間計算、值或定義名稱儲存在公式內',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LN: {
        description: '傳回數字的自然對數',
        abstract: '傳回數字的自然對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ln-%E5%87%BD%E6%95%B0-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求得自然對數的正實數。' },
        },
    },
    LOG: {
        description: '傳回數字的以指定底為底的對數',
        abstract: '傳回數字的以指定底為底的對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/log-%E5%87%BD%E6%95%B0-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求得對數的正實數。' },
            base: { name: '底數', detail: '對數的底數。 如果省略 base，則假設其值為 10。' },
        },
    },
    LOG10: {
        description: '傳回數字的以 10 為底的對數',
        abstract: '傳回數字的以 10 為底的對數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/log10-%E5%87%BD%E6%95%B0-c75b881b-49dd-44fb-b6f4-37e3486a0211',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求得底數為 10 之對數的正實數。' },
        },
    },
    MDETERM: {
        description: '傳回數組的矩陣行列式的值',
        abstract: '傳回陣列的矩陣行列式的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mdeterm-%E5%87%BD%E6%95%B0-e7bfa857-3834-422b-b871-0ffd03717020',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '具有相同列數與欄數的數值陣列。' },
        },
    },
    MINVERSE: {
        description: '傳回數組的逆矩陣',
        abstract: '傳回數組的逆矩陣',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/minverse-%E5%87%BD%E6%95%B0-11f55086-adde-4c9f-8eb9-59da2d72efc6',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '具有相同列數與欄數的數值陣列。' },
        },
    },
    MMULT: {
        description: '傳回兩個陣列的矩陣乘積',
        abstract: '傳回兩個陣列的矩陣乘積',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mmult-%E5%87%BD%E6%95%B0-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '要相乘的陣列。' },
            array2: { name: '陣列2', detail: '要相乘的陣列。' },
        },
    },
    MOD: {
        description: '傳回兩數相除的餘數。 結果的符號與除數相同。 ',
        abstract: '傳回除法的餘數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mod-%E5%87%BD%E6%95%B0-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要計算餘數的被除數' },
            divisor: { name: '除數', detail: '除數' },
        },
    },
    MROUND: {
        description: '傳回一個捨入到所需倍數的數字',
        abstract: '傳回一個捨去到所需倍數的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mround-%E5%87%BD%E6%95%B0-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨入的數值。' },
            multiple: { name: '倍數', detail: '要捨入數字的倍數。' },
        },
    },
    MULTINOMIAL: {
        description: '傳回一組數字的多項式',
        abstract: '傳回一組數字的多項式',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/multinomial-%E5%87%BD%E6%95%B0-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '用於計算的第一項數值或範圍。' },
            number2: { name: '數值2', detail: '用於計算的其他數值或範圍。' },
        },
    },
    MUNIT: {
        description: '返回單位矩陣或指定維度',
        abstract: '返回單位矩陣或指定維度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/munit-%E5%87%BD%E6%95%B0-c9fe916a-dc26-4105-997d-ba22799853a3',
            },
        ],
        functionParameter: {
            dimension: { name: '维度', detail: '是指定要傳回之單位矩陣維度的整數。 它會傳回陣列。 維度必須大於零。' },
        },
    },
    ODD: {
        description: '將數字向上捨入為最接近的奇數',
        abstract: '將數字向上捨入為最接近的奇數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/odd-%E5%87%BD%E6%95%B0-deae64eb-e08a-4c88-8b40-6d0b42575c98',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要捨入的數值。' },
        },
    },
    PI: {
        description: '傳回 pi 的值',
        abstract: '傳回 pi 的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pi-%E5%87%BD%E6%95%B0-264199d0-a3ba-46b8-975a-c4a04608989b',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: '傳回數字乘冪的結果。 ',
        abstract: '回傳數的乘冪',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/power-%E5%87%BD%E6%95%B0-d3f2908b-56f4-4c3f-895a-07fb519c362a',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '基數。可為任意實數。' },
            power: { name: '指數', detail: '基數乘冪運算的指數。' },
        },
    },
    PRODUCT: {
        description: '將作為參數提供的所有數字相乘，並傳回乘積。 ',
        abstract: '將其參數相乘',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/product-%E5%87%BD%E6%95%B0-8e6b5b24-90ee-4650-aeec-80982a0512ce',
            },
        ],
        functionParameter: {
            number1: { name: '數值 1', detail: '要相乘的第一個數字或範圍。' },
            number2: { name: '數值 2', detail: '要相乘的其他數字或儲存格區域，最多可以使用 255 個參數。' },
        },
    },
    QUOTIENT: {
        description: '傳回除法的整數部分',
        abstract: '傳回除法的整數部分',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/quotient-%E5%87%BD%E6%95%B0-9f7bf099-2a18-4282-8fa4-65290cc99dee',
            },
        ],
        functionParameter: {
            numerator: { name: '分子', detail: '被除數。' },
            denominator: { name: '分母', detail: '除數。' },
        },
    },
    RADIANS: {
        description: '將度轉換為弧度',
        abstract: '將度轉換為弧度',
        links: [{
            title: '教導',
            url: 'https://support.microsoft.com/zh-tw/office/radians-%E5%87%BD%E6%95%B0-ac409508-3d48-45f5-ac02-1497c92de5bf',
        }],
        functionParameter: {
            angle: { name: '角度', detail: '要轉換的角度 (以度數為單位)。' },
        },
    },
    RAND: {
        description: '傳回 0 和 1 之間的一個隨機數',
        abstract: '傳回 0 和 1 之間的隨機數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rand-%E5%87%BD%E6%95%B0-4cbfa695-8869-4788-8d90-021ea9f5be73',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'RANDARRAY 函數傳回 0 和 1 之間的隨機數字數組。但是，你可以指定要填滿的行數和列數、最小值和最大值，以及是否會傳回整個數字或小數值。',
        abstract: 'RANDARRAY 函數傳回 0 和 1 之間的隨機數字數組。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/randarray-%E5%87%BD%E6%95%B0-21261e55-3bec-4885-86a6-8b0a47fd4d33',
            },
        ],
        functionParameter: {
            rows: { name: '列數', detail: '要傳回的列數' },
            columns: { name: '欄數', detail: '要傳回的欄數' },
            min: { name: '最小值', detail: '想要傳回的最小數字' },
            max: { name: '最大值', detail: '想要傳回的最大數字' },
            wholeNumber: { name: '整數', detail: '傳回整數或小數數值' },
        },
    },
    RANDBETWEEN: {
        description: '傳回位於兩個指定數之間的一個隨機數',
        abstract: '傳回位於兩個指定數之間的一個隨機數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/randbetween-%E5%87%BD%E6%95%B0-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
            },
        ],
        functionParameter: {
            bottom: { name: '最小值', detail: '會傳回的最小整數。' },
            top: { name: '最大值', detail: '會傳回的最大整數。' },
        },
    },
    ROMAN: {
        description: '將阿拉伯數字轉換為文本式羅馬數字',
        abstract: '將阿拉伯數字轉換為文本式羅馬數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/roman-%E5%87%BD%E6%95%B0-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '這是要轉換的阿拉伯數字。' },
            form: { name: '形式', detail: '這是指定所需羅馬數字類型的數字。羅馬數位風格從經典到簡化，隨著形式值的增加而變得更加簡潔。' },
        },
    },
    ROUND: {
        description: '將數字按指定位數舍入',
        abstract: '將數字依指定位數捨去',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/round-%E5%87%BD%E6%95%B0-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要四捨五入的數字。' },
            numDigits: { name: '位數', detail: '要對數字引數進位的位數。' },
        },
    },
    ROUNDBANK: {
        description: '依照「四舍六入五成雙」舍入數字',
        abstract: '依照「四舍六入五成雙」舍入數字',
        links: [
            {
                title: '教導',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要「四舍六入五成雙」的數字。' },
            numDigits: { name: '位數', detail: '要進行「四舍六入五成雙」運算的位數。' },
        },
    },
    ROUNDDOWN: {
        description: '向絕對值減小的方向舍入數字',
        abstract: '向絕對值減小的方向捨去數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rounddown-%E5%87%BD%E6%95%B0-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要四捨五入的數字。' },
            numDigits: { name: '位數', detail: '要對數字引數進位的位數。' },
        },
    },
    ROUNDUP: {
        description: '向絕對值增大的方向舍入數字',
        abstract: '向絕對值增大的方向舍入數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/roundup-%E5%87%BD%E6%95%B0-f8bc9b23-e795-47db-8703-db171d0c42a7',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要四捨五入的數字。' },
            numDigits: { name: '位數', detail: '要對數字引數進位的位數。' },
        },
    },
    SEC: {
        description: '傳回角度的正割值',
        abstract: '返回角度的正割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sec-%E5%87%BD%E6%95%B0-ff224717-9c87-4170-9b58-d069ced6d5f7',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '數值是要求得正割值的角度，以弧度表示。' },
        },
    },
    SECH: {
        description: '返回角度的雙曲正割值',
        abstract: '返回角度的雙曲正割值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sech-%E5%87%BD%E6%95%B0-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '數值是要求得雙曲正割值的角度，以弧度表示。' },
        },
    },
    SERIESSUM: {
        description: '傳回基於公式的冪級數的和',
        abstract: '傳回基於公式的冪級數的和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/seriessum-%E5%87%BD%E6%95%B0-a3ab25b5-1093-4f5b-b084-96c49087f637',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '冪級數的輸入值。' },
            n: { name: 'n', detail: '要增加 x 的初始乘冪。' },
            m: { name: 'm', detail: '要將級數中的每一項增加 n 所用的間距。' },
            coefficients: { name: '係數集', detail: '一組由 x 的每一個連續乘冪相乘的係數集。' },
        },
    },
    SEQUENCE: {
        description: 'SEQUENCE 函數可在陣列中產生一系列連續數字，例如，1、2、3、4。 ',
        abstract: 'SEQUENCE 函數可在陣列中產生一系列連續數字，例如，1、2、3、4。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sequence-%E5%87%BD%E6%95%B0-57467a98-57e0-4817-9f14-2eb78519ca90',
            },
        ],
        functionParameter: {
            rows: { name: '列數', detail: '要傳回的列數。' },
            columns: { name: '欄數', detail: '要傳回的欄數。' },
            start: { name: '起始數字', detail: '連續值的第一個數字。' },
            step: { name: '遞增量', detail: '陣列中每個連續值遞增的量。' },
        },
    },
    SIGN: {
        description: '傳回數字的符號',
        abstract: '傳回數字的符號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sign-%E5%87%BD%E6%95%B0-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '任意實數。' },
        },
    },
    SIN: {
        description: '傳回給定角度的正弦值',
        abstract: '傳回給定角度的正弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sin-%E5%87%BD%E6%95%B0-cf0e3432-8b9e-483c-bc55-a76651c95602',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求出正弦值的角度，以弧度表示。' },
        },
    },
    SINH: {
        description: '傳回數字的雙曲正弦值',
        abstract: '傳回數字的雙曲正弦值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sinh-%E5%87%BD%E6%95%B0-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '任意實數。' },
        },
    },
    SQRT: {
        description: '返回正平方根',
        abstract: '返回正平方根',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sqrt-%E5%87%BD%E6%95%B0-654975c2-05c4-4831-9a24-2c65e4040fdf',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求得平方根的數字。' },
        },
    },
    SQRTPI: {
        description: '傳回某數與 pi 的乘積的平方根',
        abstract: '傳回某數與 pi 的乘積的平方根',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sqrtpi-%E5%87%BD%E6%95%B0-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要乘以 pi 的數值。' },
        },
    },
    SUBTOTAL: {
        description: '傳回清單或資料庫中的分類總計。 ',
        abstract: '傳回清單或資料庫中的分類總和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/subtotal-%E5%87%BD%E6%95%B0-7b027003-f060-4ade-9040-e478765b9939',
            },
        ],
        functionParameter: {
            functionNum: { name: '函數編號', detail: '數字 1-11 或 101-111，用於指定要為分類總和所使用的函數。 如果使用 1-11，將包括手動隱藏的行，如果使用 101-111，則排除手動隱藏的行；始終排除已篩選掉的儲存格。 ' },
            ref1: { name: '引用1', detail: '要對其進行分類總和計算的第一個命名區域或引用。 ' },
            ref2: { name: '引用2', detail: '要對其進行分類匯總計算的第 2 個至第 254 個命名區域或引用。 ' },
        },
    },
    SUM: {
        description: '將單一值、儲存格引用或是區域相加，或將三者的組合相加。 ',
        abstract: '求參數的和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sum-%E5%87%BD%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
            },
        ],
        functionParameter: {
            number1: {
                name: '數值 1',
                detail: '要相加的第一個數字。 該數字可以是 4 之類的數字，B6 之類的單元格引用或 B2:B8 之類的單元格範圍。 ',
            },
            number2: {
                name: '數值 2',
                detail: '第二個要相加的數字。 可以按照這種方式指定最多 255 個數字。 ',
            },
        },
    },
    SUMIF: {
        description: '範圍中符合指定條件的值求和。 ',
        abstract: '按給定條件對指定單元格求和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b',
            },
        ],
        functionParameter: {
            range: {
                name: '範圍',
                detail: '要根據條件進行偵測的範圍。 ',
            },
            criteria: {
                name: '條件',
                detail: '以數字、表達式、單元格引用、文字或函數的形式來定義將要新增哪些單元格。可包含的通配符字符 - 問號（？）以匹配任意單個字符，星號（*）以匹配任意字符序列。 如果要尋找實際的問號或星號，請在該字元前鍵入波形符號（~）。 ',
            },
            sumRange: {
                name: '求和範圍',
                detail: '要新增的實際儲存格，如果要新增在範圍參數指定以外的其他儲存格。 如果省略sum_range參數，Excel就會加入範圍參數中指定的儲存格（與套用標準的儲存格相同）。 ',
            },
        },
    },
    SUMIFS: {
        description: '會加總符合多項準則的所有引數。',
        abstract: '會加總符合多項準則的所有引數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumifs-%E5%87%BD%E6%95%B0-c9e748f5-7ea7-455d-9406-611cebce642b',
            },
        ],
        functionParameter: {
            sumRange: { name: '求和範圍', detail: '要求和的單元格區域。 ' },
            criteriaRange1: { name: '條件範圍 1', detail: '使用條件 1 測試的區域。條件範圍 1 和條件 1 設定用於搜尋某個區域是否符合特定條件的搜尋對。 一旦在該區域中找到了項，將計算求和範圍中的相應值的總和。 ' },
            criteria1: { name: '條件 1', detail: '定義將計算條件範圍 1 中的哪些單元格的和的條件。 例如，條件可以輸入為 32、">32"、B4、"蘋果" 或 "32"。 ' },
            criteriaRange2: { name: '條件範圍 2', detail: '附加的區域，最多可以輸入 127 個區域。 ' },
            criteria2: { name: '條件 2', detail: '附加的關聯條件，最多可以輸入 127 個條件。 ' },
        },
    },
    SUMPRODUCT: {
        description: '傳回對應的陣列元素的乘積和',
        abstract: '傳回對應的陣列元素的乘積和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumproduct-%E5%87%BD%E6%95%B0-16753e75-9f68-4874-94ac-4d2145a2fd2e',
            },
        ],
        functionParameter: {
            array1: { name: '陣列', detail: '要求元素乘積和的第一個陣列引數。' },
            array2: { name: '陣列', detail: '要求元素乘積和的第 2 個到第 255 個陣列引數。' },
        },
    },
    SUMSQ: {
        description: '傳回參數的平方和',
        abstract: '傳回參數的平方和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumsq-%E5%87%BD%E6%95%B0-e3313c02-51cc-4963-aae6-31442d9ec307',
            },
        ],
        functionParameter: {
            number1: { name: '數值1', detail: '要求出平方總和的第1個數字。也可以使用單一陣列或陣列參照來取代以逗點分隔的引數。' },
            number2: { name: '數值2', detail: '要求出平方總和的第2個數字。可以按照這種方式指定最多 255 個數字。' },
        },
    },
    SUMX2MY2: {
        description: '傳回兩數組中對應值平方差之和',
        abstract: '傳回兩數組中對應值平方差之和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumx2my2-%E5%87%BD%E6%95%B0-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
            },
        ],
        functionParameter: {
            arrayX: { name: '值陣列1', detail: '第一個值陣列或範圍。' },
            arrayY: { name: '值陣列2', detail: '第二個值陣列或範圍。' },
        },
    },
    SUMX2PY2: {
        description: '傳回兩數組中對應值的平方和總和',
        abstract: '傳回兩數組中對應值的平方和總和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumx2py2-%E5%87%BD%E6%95%B0-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
            },
        ],
        functionParameter: {
            arrayX: { name: '值陣列1', detail: '第一個值陣列或範圍。' },
            arrayY: { name: '值陣列2', detail: '第二個值陣列或範圍。' },
        },
    },
    SUMXMY2: {
        description: '傳回兩個陣列中對應值差的平方和',
        abstract: '傳回兩個陣列中對應值差的平方和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sumxmy2-%E5%87%BD%E6%95%B0-9d144ac1-4d79-43de-b524-e2ecee23b299',
            },
        ],
        functionParameter: {
            arrayX: { name: '值陣列1', detail: '第一個值陣列或範圍。' },
            arrayY: { name: '值陣列2', detail: '第二個值陣列或範圍。' },
        },
    },
    TAN: {
        description: '傳回數字的正切值',
        abstract: '傳回數字的正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tan-%E5%87%BD%E6%95%B0-08851a40-179f-4052-b789-d7f699447401',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要求出正切值的角度，以弧度表示。' },
        },
    },
    TANH: {
        description: '傳回數字的雙曲正切值',
        abstract: '傳回數字的雙曲正切值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tanh-%E5%87%BD%E6%95%B0-017222f0-a0c3-4f69-9787-b3202295dc6c',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '任意實數。' },
        },
    },
    TRUNC: {
        description: '將數字截尾取整',
        abstract: '將數字截尾取整',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/trunc-%E5%87%BD%E6%95%B0-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要取至整數的數字。' },
            numDigits: { name: '位數', detail: '指定要捨去之精確位數的數字。其預設值為 0 (零)。' },
        },
    },
};

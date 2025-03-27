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
    CELL: {
        description: 'セルの書式、位置、内容についての情報を返します。',
        abstract: 'セルの書式、位置、内容についての情報を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cell-%E9%96%A2%E6%95%B0-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            infoType: { name: '検査の種類', detail: '返すセル情報の種類を指定するテキスト値。' },
            reference: { name: '範囲', detail: '情報が必要なセルを指定します。' },
        },
    },
    ERROR_TYPE: {
        description: 'エラーの種類に対応する数値を返します。',
        abstract: 'エラーの種類に対応する数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/error-type-%E9%96%A2%E6%95%B0-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: 'エラー値', detail: '評価するエラー値を指定します。' },
        },
    },
    INFO: {
        description: '現在の操作環境についての情報を返します。',
        abstract: '現在の操作環境についての情報を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/info-%E9%96%A2%E6%95%B0-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISBETWEEN: {
        description: '指定した値が他の 2 つの値の範囲内にあるかどうかを確認します',
        abstract: '指定した値が他の 2 つの値の範囲内にあるかどうかを確認します',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/10538337?hl=ja&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比較する値', detail: '\'最小値\' と \'最大値\' の範囲内にあるかどうかを確認する値です。' },
            lowerValue: { name: '最小値', detail: '\'比較する値\' が含まれる可能性のある値の範囲の下限を指定します。' },
            upperValue: { name: '最大値', detail: '\'比較する値\' が含まれる可能性のある値の範囲の上限を指定します。' },
            lowerValueIsInclusive: { name: '最小値を含む', detail: '値の範囲に \'最小値\' を含めるかどうかを指定します（デフォルトは TRUE）。' },
            upperValueIsInclusive: { name: '最大値を含む', detail: '値の範囲に \'最大値\' を含めるかどうかを指定します（デフォルトは TRUE）。' },
        },
    },
    ISBLANK: {
        description: '対象が空白セルを参照するときに TRUE を返します。',
        abstract: '対象が空白セルを参照するときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISDATE: {
        description: 'は、値が日付かどうかを返します',
        abstract: 'は、値が日付かどうかを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9061381?hl=ja&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '日付であるかを検証する値です。' },
        },
    },
    ISEMAIL: {
        description: '値が有効なメールアドレスであるかどうかを検証します',
        abstract: '値が有効なメールアドレスであるかどうかを検証します',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3256503?hl=ja&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'メールアドレスであるかどうかを検証する値です。' },
        },
    },
    ISERR: {
        description: '対象が #N/A 以外のエラー値のときに TRUE を返します。',
        abstract: '対象が #N/A 以外のエラー値のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISERROR: {
        description: '対象が任意のエラー値のときに TRUE を返します。',
        abstract: '対象が任意のエラー値のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISEVEN: {
        description: '数値が偶数のときに TRUE を返します。',
        abstract: '数値が偶数のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/iseven-%E9%96%A2%E6%95%B0-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '検定する値を指定します。数値が整数でない場合は、小数点以下が切り捨てられます。' },
        },
    },
    ISFORMULA: {
        description: '数式が含まれるセルへの参照がある場合に TRUE を返します。',
        abstract: '数式が含まれるセルへの参照がある場合に TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/isformula-%E9%96%A2%E6%95%B0-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: '範囲', detail: '参照とは、テストするセルへの参照のことです。' },
        },
    },
    ISLOGICAL: {
        description: '対象が論理値のときに TRUE を返します。',
        abstract: '対象が論理値のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNA: {
        description: '対象がエラー値 #N/A のときに TRUE を返します。',
        abstract: '対象がエラー値 #N/A のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNONTEXT: {
        description: '対象が文字列以外のときに TRUE を返します。',
        abstract: '対象が文字列以外のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNUMBER: {
        description: '対象が数値のときに TRUE を返します。',
        abstract: '対象が数値のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISODD: {
        description: '数値が奇数のときに TRUE を返します。',
        abstract: '数値が奇数のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/isodd-%E9%96%A2%E6%95%B0-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '検定する値を指定します。数値が整数でない場合は、小数点以下が切り捨てられます。' },
        },
    },
    ISOMITTED: {
        description: 'LAMBDA の値が見つからないかどうかを確認し、TRUE または FALSE を返します',
        abstract: 'LAMBDA の値が見つからないかどうかを確認し、TRUE または FALSE を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/isomitted-%E9%96%A2%E6%95%B0-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISREF: {
        description: '対象がセル参照のときに TRUE を返します。',
        abstract: '対象がセル参照のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISTEXT: {
        description: '対象が文字列のときに TRUE を返します。',
        abstract: '対象が文字列のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/is-%E9%96%A2%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISURL: {
        description: '値が有効な URL であるかどうかを検証します。',
        abstract: '値が有効な URL であるかどうかを検証します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3256501?hl=ja&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'URL であるかを検証する値を指定します。' },
        },
    },
    N: {
        description: '値を数値に変換します。',
        abstract: '値を数値に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/n-%E9%96%A2%E6%95%B0-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '変換する値を指定します。' },
        },
    },
    NA: {
        description: 'エラー値 #N/A を返します。',
        abstract: 'エラー値 #N/A を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/na-%E9%96%A2%E6%95%B0-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: '参照されるシートのシート番号を返します。',
        abstract: '参照されるシートのシート番号を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sheet-%E9%96%A2%E6%95%B0-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'シート番号を求めるシートまたは参照の名前を指定します。 値を省略すると、この関数を含むシートの番号が返されます。' },
        },
    },
    SHEETS: {
        description: 'ワークブック内のシート数を返します',
        abstract: 'ワークブック内のシート数を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sheets-%E9%96%A2%E6%95%B0-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'データ型を表す数値を返します。',
        abstract: 'データ型を表す数値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/type-%E9%96%A2%E6%95%B0-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '数値、文字列、論理値など、の任意の値を指定です。' },
        },
    },
};

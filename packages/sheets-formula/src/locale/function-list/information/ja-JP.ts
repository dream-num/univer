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
    CELL: {
        description: 'セルの書式、位置、内容についての情報を返します。',
        abstract: 'セルの書式、位置、内容についての情報を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cell-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/error-type-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: '検査の種類', detail: '返す情報の種類を指定する文字列です。' },
        },
    },
    ISBETWEEN: {
        description: '指定した値が他の 2 つの値の範囲内にあるかどうかを確認します（両端の値を含むかどうかを選択可能）。',
        abstract: '指定した値が他の 2 つの値の範囲内にあるかどうかを確認します（両端の値を含むかどうかを選択可能）。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/10538337?hl=ja',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比較する値', detail: '\'最小値\' と \'最大値\' の範囲内にあるかどうかを確認する値です。' },
            lowerValue: { name: '最小値', detail: '’比較する値\' が含まれる可能性のある値の範囲の下限を指定します。' },
            upperValue: { name: '最大値', detail: '’比較する値\' が含まれる可能性のある値の範囲の上限を指定します。' },
            lowerValueIsInclusive: { name: '最小値を含む', detail: '値の範囲に \'最小値\' を含めるかどうかを指定します（デフォルトは TRUE）。' },
            upperValueIsInclusive: { name: '最大値を含む', detail: '値の範囲に \'最大値\' を含めるかどうかを指定します（デフォルトは TRUE）。' },
        },
    },
    ISBLANK: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISDATE: {
        description: 'ISDATE 関数は、値が日付かどうかを返します。',
        abstract: 'ISDATE 関数は、値が日付かどうかを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/9061381?hl=ja',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '日付であるかを検証する値です。' },
        },
    },
    ISEMAIL: {
        description: '値が有効なメールアドレスかどうかを確認するには、ISEMAIL 関数を使用します。この関数は、値が一般的に受け入れられているメールアドレスの形式に準拠しているかどうかを確認しますが、実在するメールアドレスかどうかは検証しません。',
        abstract: '値が有効なメールアドレスかどうかを確認するには、ISEMAIL 関数を使用します。この関数は、値が一般的に受け入れられているメールアドレスの形式に準拠しているかどうかを確認しますが、実在するメールアドレスかどうかは検証しません。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3256503?hl=ja',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'ISEMAIL("johndoe@yourname.com")' },
        },
    },
    ISERR: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISERROR: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISEVEN: {
        description: '数値が偶数のときに TRUE を返します。',
        abstract: '数値が偶数のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/iseven-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: '範囲', detail: '参照とは、テストするセルへの参照のことです。' },
        },
    },
    ISLOGICAL: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNA: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNONTEXT: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISNUMBER: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISODD: {
        description: '数値が奇数のときに TRUE を返します。',
        abstract: '数値が奇数のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/isodd-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: '引数', detail: 'LAMBDA のパラメーターなど、引数が省略されているかどうかを検査する値です。' },
        },
    },
    ISREF: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISTEXT: {
        description: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        abstract: 'これらの各関数は、まとめて IS 関数と呼ばれ、指定された値をチェックして、その結果に従って TRUE または FALSE を返します。 たとえば、 ISBLANK 関数は、引数値が空白セルへの参照の場合に論理値 TRUE を返し、それ以外の場合に FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '必須。 テストする値を指定します。 テストの対象引数には、空白セル、エラー、論理値、文字列、数値、参照値、または対象となるデータを参照する名前を指定することができます。' },
        },
    },
    ISURL: {
        description: '値が有効な URL であるかどうかを検証します。',
        abstract: '値が有効な URL であるかどうかを検証します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3256501?hl=ja',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'ISURL("www.google.com")' },
        },
    },
    N: {
        description: '値を数値に変換します。',
        abstract: '値を数値に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/n-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/na-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sheet-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/sheets-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '数値、文字列、論理値など、の任意の値を指定です。' },
        },
    },
};

export default locale;

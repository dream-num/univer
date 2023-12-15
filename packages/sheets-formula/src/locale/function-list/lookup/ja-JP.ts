/**
 * Copyright 2023-present DreamNum Inc.
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
    ADDRESS: {
        description: `ワークシート上のセル参照を文字列として返します。`,
        abstract: `ワークシート上のセル参照を文字列として返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/address-%E9%96%A2%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AREAS: {
        description: `指定された範囲に含まれる領域の個数を返します。`,
        abstract: `指定された範囲に含まれる領域の個数を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/areas-%E9%96%A2%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSE: {
        description: `引数リストの値の中から特定の値を 1 つ選択します。`,
        abstract: `引数リストの値の中から特定の値を 1 つ選択します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/choose-%E9%96%A2%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSECOLS: {
        description: `配列から指定された列を返します`,
        abstract: `配列から指定された列を返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/choosecols-%E9%96%A2%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSEROWS: {
        description: `配列から指定された行を返します`,
        abstract: `配列から指定された行を返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chooserows-%E9%96%A2%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMN: {
        description: `セル参照の列番号を返します。`,
        abstract: `セル参照の列番号を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/column-%E9%96%A2%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMNS: {
        description: `セル参照の列数を返します。`,
        abstract: `セル参照の列数を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/columns-%E9%96%A2%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DROP: {
        description: `配列の先頭または末尾から指定した数の行または列を除外します`,
        abstract: `配列の先頭または末尾から指定した数の行または列を除外します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/drop-%E9%96%A2%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPAND: {
        description: `指定した行と列のディメンションに配列を展開または埋め込みます`,
        abstract: `指定した行と列のディメンションに配列を展開または埋め込みます`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/expand-%E9%96%A2%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FILTER: {
        description: `フィルターは定義した条件に基づいたデータ範囲です。`,
        abstract: `フィルターは定義した条件に基づいたデータ範囲です。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/filter-%E9%96%A2%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORMULATEXT: {
        description: `指定された参照の位置にある数式をテキストとして返します。`,
        abstract: `指定された参照の位置にある数式をテキストとして返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/formulatext-%E9%96%A2%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GETPIVOTDATA: {
        description: `ピボットテーブル レポートに格納されているデータを返します。`,
        abstract: `ピボットテーブル レポートに格納されているデータを返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/getpivotdata-%E9%96%A2%E6%95%B0-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: `配列の上端行で特定の値を検索し、対応するセルの値を返します。`,
        abstract: `配列の上端行で特定の値を検索し、対応するセルの値を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hlookup-%E9%96%A2%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HSTACK: {
        description: `配列を水平方向および順番に追加して、大きな配列を返します`,
        abstract: `配列を水平方向および順番に追加して、大きな配列を返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hstack-%E9%96%A2%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPERLINK: {
        description: `ネットワーク サーバー、イントラネット、またはインターネット上に格納されているドキュメントを開くために、ショートカットまたはジャンプを作成します。`,
        abstract: `ネットワーク サーバー、イントラネット、またはインターネット上に格納されているドキュメントを開くために、ショートカットまたはジャンプを作成します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hyperlink-%E9%96%A2%E6%95%B0-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGE: {
        description: `特定のソースからイメージを返します`,
        abstract: `特定のソースからイメージを返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/image-%E9%96%A2%E6%95%B0-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDEX: {
        description: `セル参照または配列から、指定された位置の値を返します。`,
        abstract: `セル参照または配列から、指定された位置の値を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/index-%E9%96%A2%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDIRECT: {
        description: `参照文字列によって指定されるセルに入力されている文字列を介して、間接的にセルを指定します。`,
        abstract: `参照文字列によって指定されるセルに入力されている文字列を介して、間接的にセルを指定します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/indirect-%E9%96%A2%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOOKUP: {
        description: `ベクトル (1 行または 1 列で構成されるセル範囲) または配列を検索し、対応する値を返します。`,
        abstract: `ベクトル (1 行または 1 列で構成されるセル範囲) または配列を検索し、対応する値を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lookup-%E9%96%A2%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MATCH: {
        description: `照合の型に従って参照または配列に含まれる値を検索し、検査値と一致する要素の相対的な位置を数値で返します。`,
        abstract: `照合の型に従って参照または配列に含まれる値を検索し、検査値と一致する要素の相対的な位置を数値で返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/match-%E9%96%A2%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OFFSET: {
        description: `指定された行数と列数だけシフトした位置にあるセルまたはセル範囲への参照 (オフセット参照) を返します。`,
        abstract: `指定された行数と列数だけシフトした位置にあるセルまたはセル範囲への参照 (オフセット参照) を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/offset-%E9%96%A2%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROW: {
        description: `セル参照の行番号を返します。`,
        abstract: `セル参照の行番号を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/row-%E9%96%A2%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROWS: {
        description: `セル参照の行数を返します。`,
        abstract: `セル参照の行数を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rows-%E9%96%A2%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RTD: {
        description: `COM オートメーションに対応するプログラムからリアルタイムのデータを取得します。`,
        abstract: `COM オートメーションに対応するプログラムからリアルタイムのデータを取得します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rtd-%E9%96%A2%E6%95%B0-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORT: {
        description: `SORTでは、範囲または配列の内容を並べ替えます。`,
        abstract: `SORTでは、範囲または配列の内容を並べ替えます。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sort-%E9%96%A2%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORTBY: {
        description: `範囲または配列の内容を、対応する範囲または配列の値に基づいて並べ替えます。`,
        abstract: `範囲または配列の内容を、対応する範囲または配列の値に基づいて並べ替えます。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sortby-%E9%96%A2%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TAKE: {
        description: `配列の先頭または末尾から、指定した数の連続する行または列を返します。`,
        abstract: `配列の先頭または末尾から、指定した数の連続する行または列を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/take-%E9%96%A2%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOCOL: {
        description: `1 つの列の配列を返します`,
        abstract: `1 つの列の配列を返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tocol-%E9%96%A2%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOROW: {
        description: `1 行の配列を返します`,
        abstract: `1 行の配列を返します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/torow-%E9%96%A2%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRANSPOSE: {
        description: `配列で指定された範囲のデータの行列変換を行います。`,
        abstract: `配列で指定された範囲のデータの行列変換を行います。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/transpose-%E9%96%A2%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNIQUE: {
        description: `一覧または範囲内の一意の値の一覧を返します。&nbsp;`,
        abstract: `一覧または範囲内の一意の値の一覧を返します。&nbsp;`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/unique-%E9%96%A2%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VLOOKUP: {
        description: `配列の左端列で特定の値を検索し、対応するセルの値を返します。`,
        abstract: `配列の左端列で特定の値を検索し、対応するセルの値を返します。`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vlookup-%E9%96%A2%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VSTACK: {
        description: `より大きな配列を返すために、配列を垂直方向および順番に追加します`,
        abstract: `より大きな配列を返すために、配列を垂直方向および順番に追加します`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vstack-%E9%96%A2%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPCOLS: {
        description: `指定した数の要素の後に、指定した行または列の値を列でラップします`,
        abstract: `指定した数の要素の後に、指定した行または列の値を列でラップします`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/wrapcols-%E9%96%A2%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPROWS: {
        description: `指定した数の要素の後に、指定された行または値の列を行ごとにラップします`,
        abstract: `指定した数の要素の後に、指定された行または値の列を行ごとにラップします`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/wraprows-%E9%96%A2%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XLOOKUP: {
        description: `範囲または配列を検索し、最初に見つかった一致に対応する項目を返します。 一致するものがない場合、XLOOKUP は最も近い (近似) 一致を返します。&nbsp;`,
        abstract: `範囲または配列を検索し、最初に見つかった一致に対応する項目を返します。 一致するものがない場合、XLOOKUP は最も近い (近似) 一致を返します。&nbsp;`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xlookup-%E9%96%A2%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XMATCH: {
        description: `セルの配列またはセルの範囲内で指定された項目の相対的な位置を返します。&nbsp;`,
        abstract: `セルの配列またはセルの範囲内で指定された項目の相対的な位置を返します。&nbsp;`,
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xmatch-%E9%96%A2%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};

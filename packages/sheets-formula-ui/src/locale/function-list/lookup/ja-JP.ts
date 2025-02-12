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
    ADDRESS: {
        description: 'ADDRESS 関数を使うと、行番号と列番号を指定して、ワークシート内のセルのアドレスを取得できます。 たとえば、ADDRESS(2,3) は $C$2 を返します。 また、ADDRESS(77,300) は $KN$77 を返します。 ROW 関数や COLUMN 関数などの他の関数を使って、ADDRESS 関数の行番号と列番号の引数を指定できます。',
        abstract: 'ワークシート上のセル参照を文字列として返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/address-%E9%96%A2%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: { name: '行番号', detail: 'セル参照に使用する行番号を指定する数値。' },
            column_num: { name: '列番号', detail: 'セル参照に使用する列番号を指定する数値。' },
            abs_num: { name: '参照の型', detail: '返される参照の種類を指定する数値。' },
            a1: {
                name: '参照形式',
                detail: 'A1 または R1C1 参照スタイルを指定する論理値。 A1 スタイルでは、列はアルファベット順にラベル付けされ、行は数値でラベル付けされます。 R1C1 参照スタイルでは、列と行の両方に数値ラベルが付けされます。 A1 引数が TRUE または省略された場合 、ADDRESS 関数は A1 スタイルの参照を返します。FALSE の場合 、ADDRESS 関数 は R1C1 スタイルの参照を返します。',
            },
            sheet_text: {
                name: 'ワークシート名',
                detail: '外部参照として使用するワークシートの名前を指定するテキスト値。 たとえば、数式 =ADDRESS(1,1,,,"Sheet2") は Sheet2!$A $1 を返します。 sheet_text 引数 を 省略した場合、シート名は使用されません。関数によって返されるアドレスは、現在のシート上のセルを参照します。',
            },
        },
    },
    AREAS: {
        description: '指定された範囲に含まれる領域の個数を返します。',
        abstract: '指定された範囲に含まれる領域の個数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/areas-%E9%96%A2%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            reference: { name: '範囲', detail: 'セルまたはセル範囲への参照であり、複数の領域を参照できます。' },
        },
    },
    CHOOSE: {
        description: '引数リストの値の中から特定の値を 1 つ選択します。',
        abstract: '引数リストの値の中から特定の値を 1 つ選択します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/choose-%E9%96%A2%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: { name: 'インデックス', detail: 'どの値引数が選択されるかを指定します。 インデックスには 1 ～ 254 の数値、または 1 ～ 254 の数値を返す数式またはセル参照を指定します。\nインデックスが 1 の場合は、値 1 が返され、2 の場合は値 2 が返されます (以下同様)。\nインデックスが 1 未満またはリスト内の最後の値の数値よりも大きい場合は、エラー値 #VALUE! が返されます。\nインデックスに小数部がある場合は、使用される前に切り捨てられて、整数値が使用されます。' },
            value1: { name: '値 1', detail: 'CHOOSE 関数はこれらの引数から、インデックスに基づいて 1 つの値または実行する動作を選択します。 引数には、数値、セル参照、定義名、数式、関数、または文字列を指定できます。' },
            value2: { name: '値 2', detail: ' 1 ～ 254 個の値引数を指定します。' },
        },
    },
    CHOOSECOLS: {
        description: '配列から指定された列を返します',
        abstract: '配列から指定された列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/choosecols-%E9%96%A2%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '新しい配列で返される列を含む配列。' },
            colNum1: { name: '列番号1', detail: '返される最初の列。' },
            colNum2: { name: '列番号2', detail: '返される追加の列。' },
        },
    },
    CHOOSEROWS: {
        description: '配列から指定された行を返します',
        abstract: '配列から指定された行を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/chooserows-%E9%96%A2%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '新しい配列で返される行を含む配列。' },
            rowNum1: { name: '行番号1', detail: '返される最初の行番号。' },
            rowNum2: { name: '行番号2', detail: '返される追加の行番号。' },
        },
    },
    COLUMN: {
        description: '指定された セル参照の列番号を返します。',
        abstract: 'セル参照の列番号を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/column-%E9%96%A2%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: '範囲', detail: '列番号を調べるセルまたは範囲を指定します。' },
        },
    },
    COLUMNS: {
        description: '配列またはセル参照の列数を返します。',
        abstract: 'セル参照の列数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/columns-%E9%96%A2%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '列数を計算する配列、配列数式、またはセル範囲の参照を指定します。' },
        },
    },
    DROP: {
        description: '配列の先頭または末尾から指定した数の行または列を削除します',
        abstract: '配列の先頭または末尾から指定した数の行または列を削除します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/drop-%E9%96%A2%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行または列を削除する配列。' },
            rows: { name: '行の数', detail: '削除する行の数。 負の値は配列の末尾から削除されます。' },
            columns: { name: '列の数', detail: '削除する列の数。 負の値は配列の末尾から削除されます。' },
        },
    },
    EXPAND: {
        description: '指定した行と列のディメンションに配列を展開または埋め込みます',
        abstract: '指定した行と列のディメンションに配列を展開または埋め込みます',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/expand-%E9%96%A2%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '展開する配列。' },
            rows: { name: '行の数', detail: '展開された配列内の行数。 存在しない場合、行は展開されません。' },
            columns: { name: '列の数', detail: '展開された配列内の列の数。 存在しない場合、列は展開されません。' },
            padWith: { name: '埋め込む値', detail: '埋め込む値。 既定値は #N/A です。' },
        },
    },
    FILTER: {
        description: 'フィルターは定義した条件に基づいたデータ範囲です。',
        abstract: 'フィルターは定義した条件に基づいたデータ範囲です。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/filter-%E9%96%A2%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: 'フィルターする範囲または配列。' },
            include: { name: 'ブール配列', detail: 'ブール値の配列。TRUE は保持する行または列を示します。' },
            ifEmpty: { name: '空の値を返す', detail: 'アイテムが保持されていない場合に返されます。' },
        },
    },
    FORMULATEXT: {
        description: '指定された参照の位置にある数式をテキストとして返します。',
        abstract: '指定された参照の位置にある数式をテキストとして返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/formulatext-%E9%96%A2%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            reference: { name: '参照', detail: 'セルまたはセル範囲を参照します。' },
        },
    },
    GETPIVOTDATA: {
        description: 'ピボットテーブル レポートに格納されているデータを返します。',
        abstract: 'ピボットテーブル レポートに格納されているデータを返します。',
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
        description: '配テーブルの上端行または配列内の特定の値を検索し、テーブルまたは配列内の指定した行から同じ列の値を返します。',
        abstract: '配列の上端行で特定の値を検索し、対応するセルの値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hlookup-%E9%96%A2%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '検索値',
                detail: '必ず指定します。 テーブルの上端行で検索する値を指定します。',
            },
            tableArray: {
                name: '範囲',
                detail: 'データを検索する情報のテーブルです。 セル範囲への参照またはセル範囲名を使用します。',
            },
            rowIndexNum: {
                name: '行番号',
                detail: ' 一致する値を返す、範囲内の行番号。 行番号に 1 を指定すると、範囲の最初の行の値が返され、行番号に 2 を指定すると、範囲の 2 番目の行の値が返され、以降同様に処理されます。',
            },
            rangeLookup: {
                name: '検索の型',
                detail: 'HLOOKUP を使用して検索値と完全に一致する値だけを検索するか、その近似値を含めて検索するかを指定する論理値です。',
            },
        },
    },
    HSTACK: {
        description: '配列を水平方向および順番に追加して、大きな配列を返します',
        abstract: '配列を水平方向および順番に追加して、大きな配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hstack-%E9%96%A2%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: '配列', detail: '追加する配列。' },
            array2: { name: '配列', detail: '追加する配列。' },
        },
    },
    HYPERLINK: {
        description: 'ネットワーク サーバー、イントラネット、またはインターネット上に格納されているドキュメントを開くために、ショートカットまたはジャンプを作成します。',
        abstract: 'ネットワーク サーバー、イントラネット、またはインターネット上に格納されているドキュメントを開くために、ショートカットまたはジャンプを作成します。',
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
        description: '特定のソースからイメージを返します',
        abstract: '特定のソースからイメージを返します',
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
        description: '指定された行と列が交差する位置にあるセルの参照を返します。 隣接しない複数のセル範囲を指定した場合、その中から任意の領域を選択できます。',
        abstract: 'セル参照または配列から、指定された位置の値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/index-%E9%96%A2%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: '参照', detail: '1 つまたは複数のセルの参照を指定します。' },
            rowNum: { name: '行番号', detail: '範囲の中にあり、セル参照を返すセルの行位置を数値で返します。' },
            columnNum: { name: '列番号', detail: '範囲の中にあり、セル参照を返すセルの列位置を数値で返します。' },
            areaNum: { name: '領域番号', detail: '行番号と列番号の共通部分を返す参照の範囲を選択します。' },
        },
    },
    INDIRECT: {
        description: '指定される文字列への参照を返します。 セル参照はすぐに計算され、結果としてセルの内容が表示されます。',
        abstract: '参照文字列によって指定されるセルに入力されている文字列を介して、間接的にセルを指定します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/indirect-%E9%96%A2%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: '参照文字列', detail: ' A1 形式、R1C1 形式の参照、参照として定義されている名前が入力されているセルへの参照、または文字列としてのセルへの参照を指定します。' },
            a1: { name: '参照形式', detail: '参照文字列で指定されたセルに含まれるセル参照の種類を、論理値で指定します。' },
        },
    },
    LOOKUP: {
        description: 'つの行または列から、他の行または列の同じ場所にある値を見つけるときは、検索/行列関数 の 1 つである LOOKUP を使います',
        abstract: 'ベクトル (1 行または 1 列で構成されるセル範囲) または配列を検索し、対応する値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lookup-%E9%96%A2%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '検索値',
                detail: 'LOOKUP が最初のベクトルで検索する値。 検査値には、数値、文字列、論理値、または値を参照する名前やセル参照を指定できます',
            },
            lookupVectorOrArray: {
                name: '検査範囲/配列',
                detail: '1 行または 1 列のみの範囲を指定します。 検査範囲には、文字列、数値、または論理値を指定できます。',
            },
            resultVector: {
                name: '範囲',
                detail: '1 つの行または列のみを含む範囲。 result_vector引数は、lookup_vectorと同じサイズにする必要があります。 同じサイズにする必要があります',
            },
        },
    },
    MATCH: {
        description: 'MATCH 関数は、範囲 のセルの範囲で指定した項目を検索し、その範囲内の項目の相対的な位置を返します。',
        abstract: '照合の型に従って参照または配列に含まれる値を検索し、検査値と一致する要素の相対的な位置を数値で返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/match-%E9%96%A2%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: '検査値', detail: '検査範囲の中で照合する値を指定します。' },
            lookupArray: { name: '検査範囲', detail: '検索するセルの範囲を指定します。' },
            matchType: { name: '照合の型', detail: '-1、0、1 の数値のいずれかを指定します。' },
        },
    },
    OFFSET: {
        description: '指定された行数と列数だけシフトした位置にあるセルまたはセル範囲への参照 (オフセット参照) を返します。',
        abstract: '指定された行数と列数だけシフトした位置にあるセルまたはセル範囲への参照 (オフセット参照) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/offset-%E9%96%A2%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: '参照', detail: 'オフセットの基準となる参照を指定します。' },
            rows: { name: '行数', detail: '基準の左上隅のセルを上方向または下方向へシフトする距離を行数単位で指定します。' },
            cols: { name: '列数', detail: '結果の左上隅のセルを左方向または右方向へシフトする距離を列数単位で指定します。' },
            height: { name: '高さ', detail: 'オフセット参照の行数を指定します。高さは正の数である必要がありま。' },
            width: { name: '太さ', detail: 'オフセット参照の列数を指定します。幅は正の数である必要があります。' },
        },
    },
    ROW: {
        description: '引数として指定された配列の行番号を返します。',
        abstract: 'セル参照の行番号を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/row-%E9%96%A2%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: '範囲', detail: '行番号を調べるセルまたはセル範囲の参照を指定します。' },
        },
    },
    ROWS: {
        description: 'セル範囲または配列の行数を返します。',
        abstract: 'セル参照の行数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rows-%E9%96%A2%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行数を計算する配列、配列数式、またはセル範囲の参照を指定します。' },
        },
    },
    RTD: {
        description: 'COM オートメーションに対応するプログラムからリアルタイムのデータを取得します。',
        abstract: 'COM オートメーションに対応するプログラムからリアルタイムのデータを取得します。',
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
        description: 'SORTでは、範囲または配列の内容を並べ替えます。',
        abstract: 'SORTでは、範囲または配列の内容を並べ替えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sort-%E9%96%A2%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '並べ替える範囲または配列。' },
            sortIndex: { name: 'ソートインデックス', detail: '(行または列) による順序を表す数値。' },
            sortOrder: { name: '並べ替え順序', detail: '希望の並べ替え順序を表す数値。連続 (デフォルト) の場合は 1、降順の場合は -1。' },
            byCol: { name: '仕分け方向', detail: '希望するソート方向を示す論理値。行でソートする場合は FALSE (デフォルト)、列でソートする場合は TRUE。' },
        },
    },
    SORTBY: {
        description: '範囲または配列の内容を、対応する範囲または配列の値に基づいて並べ替えます。',
        abstract: '範囲または配列の内容を、対応する範囲または配列の値に基づいて並べ替えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sortby-%E9%96%A2%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '並べ替える範囲または配列。' },
            byArray1: { name: '配列の並べ替え1', detail: '並べ替えに基づいて並べ替える範囲または配列。' },
            sortOrder1: { name: '並べ替え順序1', detail: '希望の並べ替え順序を表す数値。連続 (デフォルト) の場合は 1、降順の場合は -1。' },
            byArray2: { name: '配列の並べ替え2', detail: '並べ替えに基づいて並べ替える範囲または配列。' },
            sortOrder2: { name: '並べ替え順序2', detail: '希望の並べ替え順序を表す数値。連続 (デフォルト) の場合は 1、降順の場合は -1。' },
        },
    },
    TAKE: {
        description: '配列の先頭または末尾から、指定した数の連続する行または列を返します。',
        abstract: '配列の先頭または末尾から、指定した数の連続する行または列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/take-%E9%96%A2%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行または列を取得する配列。' },
            rows: { name: '行の数', detail: '取得する行の数。 負の値は配列の最後から取得します。' },
            columns: { name: '列の数', detail: '取得する列の数。 負の値は配列の最後から取得します。' },
        },
    },
    TOCOL: {
        description: '1 つの列の配列を返します',
        abstract: '1 つの列の配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tocol-%E9%96%A2%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '列として返す配列または参照。' },
            ignore: { name: '無視値', detail: '特定の種類の値を無視するかどうか。 既定では、値は無視されません。 次のいずれかを指定します。\n0 すべての値を保持する (既定)\n1 空白を無視する\n2 エラーを無視する\n3 空白とエラーを無視する' },
            scanByColumn: { name: '配列を列でスキャンします', detail: '配列を列でスキャンします。 既定では、配列は行ごとにスキャンされます。 スキャンにより、値が行順か列順かが決まります。' },
        },
    },
    TOROW: {
        description: '1 行の配列を返します',
        abstract: '1 行の配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/torow-%E9%96%A2%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行として返す配列または参照。' },
            ignore: { name: '無視値', detail: '特定の種類の値を無視するかどうか。 既定では、値は無視されません。 次のいずれかを指定します。\n0 すべての値を保持する (既定)\n1 空白を無視する\n2 エラーを無視する\n3 空白とエラーを無視する' },
            scanByColumn: { name: '配列を列でスキャンします', detail: '配列を列でスキャンします。 既定では、配列は行ごとにスキャンされます。 スキャンにより、値が行順か列順かが決まります。' },
        },
    },
    TRANSPOSE: {
        description: '配列で指定された範囲のデータの行列変換を行います。',
        abstract: '配列で指定された範囲のデータの行列変換を行います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/transpose-%E9%96%A2%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: 'ワークシート内のセルの範囲または配列。' },
        },
    },
    UNIQUE: {
        description: '一覧または範囲内の一意の値の一覧を返します。&nbsp;',
        abstract: '一覧または範囲内の一意の値の一覧を返します。&nbsp;',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/unique-%E9%96%A2%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '一意の行または列が返される範囲または配列を返します。' },
            byCol: { name: '列ごと', detail: '論理値です。行を相互に比較して一意の値 = FALSE を返します。省略されます。列を相互に比較して一意の値 = TRUE を返します。' },
            exactlyOnce: { name: '1回だけ', detail: '論理値です。配列から 1 回だけ出現する行または列を返します = TRUE; 配列からすべての個別の行または列を返します = FALSE、または省略されます。' },
        },
    },
    VLOOKUP: {
        description: 'テーブルまたは範囲の内容を行ごとに検索する場合は、VLOOKUP を使用します。 たとえば、自動車部品の価格を部品番号で検索するか、従業員 ID に基づいて従業員名を検索します。',
        abstract: '配列の左端列で特定の値を検索し、対応するセルの値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vlookup-%E9%96%A2%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '検索値',
                detail: '検索の対象となる値。 調べたい値は、引数の 範囲 で指定したセル範囲の最初の列になければなりません。',
            },
            tableArray: {
                name: '範囲',
                detail: 'VLOOKUP が検索値と戻り値を検索するセル範囲。 名前付き範囲またはテーブルを使用でき、セル参照の代わりに引数に名前を使用できます。 ',
            },
            colIndexNum: {
                name: '列番号',
                detail: '戻り値を含む列の番号 (範囲 の左端の列は 1 で始まります)。',
            },
            rangeLookup: {
                name: '検索の型',
                detail: 'VLOOKUP を使用して、近似一致を検索するか、完全一致を検索するかを指定する論理値です。',
            },
        },
    },
    VSTACK: {
        description: 'より大きな配列を返すために、配列を垂直方向および順番に追加します',
        abstract: 'より大きな配列を返すために、配列を垂直方向および順番に追加します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vstack-%E9%96%A2%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            array1: { name: '配列', detail: '追加する配列。' },
            array2: { name: '配列', detail: '追加する配列。' },
        },
    },
    WRAPCOLS: {
        description: '指定した数の要素の後に、指定された値の行または列を列ごとにラップして、新しい配列を形成します。',
        abstract: '指定した数の要素の後に、指定された値の行または列を列ごとにラップして、新しい配列を形成します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/wrapcols-%E9%96%A2%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: 'ベクター', detail: 'ラップするベクターまたは参照。' },
            wrapCount: { name: '改行の数', detail: '各列の値の最大数。' },
            padWith: { name: '埋め込む値', detail: '埋め込む値。 既定値は #N/A です。' },
        },
    },
    WRAPROWS: {
        description: '指定した数の要素の後に、指定された行または値の列を行ごとにラップして、新しい配列を形成します。',
        abstract: '指定した数の要素の後に、指定された行または値の列を行ごとにラップして、新しい配列を形成します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/wraprows-%E9%96%A2%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: 'ベクター', detail: 'ラップするベクターまたは参照。' },
            wrapCount: { name: '改行の数', detail: '各行の値の最大数。' },
            padWith: { name: '埋め込む値', detail: '埋め込む値。 既定値は #N/A です。' },
        },
    },
    XLOOKUP: {
        description: '範囲または配列を検索し、最初に見つかった一致に対応する項目を返します。 一致するものがない場合、XLOOKUP は最も近い (近似) 一致を返します。&nbsp;',
        abstract: '範囲または配列を検索し、最初に見つかった一致に対応する項目を返します。 一致するものがない場合、XLOOKUP は最も近い (近似) 一致を返します。&nbsp;',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xlookup-%E9%96%A2%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '検索値',
                detail: '検索する値は, 省略した場合、XLOOKUPは検索範囲に空白のセルを返します。',
            },
            lookupArray: { name: '検索範囲', detail: '検索する配列または範囲' },
            returnArray: { name: '戻り配列', detail: '返す配列または範囲' },
            ifNotFound: {
                name: '見つからない場合',
                detail: '有効な一致が見つからない場合は、指定した [見つからない場合] テキストを返します。有効な一致が見つからず、[見つからない場合] が見つからない場合、#N/A が返されます。',
            },
            matchMode: {
                name: '一致モード',
                detail: '一致の種類を指定します: 0 完全一致。 見つからない場合は、#N/A が返されます。 これが既定の設定です。-1 完全一致。 見つからない場合は、次の小さなアイテムが返されます。1 完全一致。 見つからない場合は、次の大きなアイテムが返されます。 2 *、?、および 〜 が特別な意味を持つワイルドカードの一致。',
            },
            searchMode: {
                name: '検索モード',
                detail: '使用する検索モードを指定します: 1 先頭の項目から検索を実行します。 これが既定の設定です。-1 末尾の項目から逆方向に検索を実行します。2 昇順で並べ替えられた検索範囲を使用してバイナリ検索を実行します。 並べ替えられていない場合、無効な結果が返されます。-2 降順で並べ替えられた検索範囲を使用してバイナリ検索を実行します。 並べ替えられていない場合、無効な結果が返されます。',
            },
        },
    },
    XMATCH: {
        description: '指定された項目を配列内またはセル範囲内で検索し、項目の相対位置を返します。 ',
        abstract: 'セルの配列またはセルの範囲内で指定された項目の相対的な位置を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xmatch-%E9%96%A2%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: '検索値', detail: '参照値' },
            lookupArray: { name: '検索範囲', detail: '検索する配列または範囲' },
            matchMode: { name: '一致モード', detail: '一致の種類を指定します:\n0 - 完全一致 (既定)\n-1 - 完全一致または最も近い小さな値の項目\n1 - 完全一致または最も近い大きな値の項目\n2 - *、?、および 〜 が特別な意味を持つワイルドカードの一致。' },
            searchMode: { name: '検索モード', detail: '検索モードを指定します。\n1 - 先頭から末尾へ検索 (既定)\n-1 - 末尾から先頭へ検索 (逆方向検索)。\n2 - 検索範囲が昇順に並んでいることを前提にしてバイナリ検索を実行する。 並べ替えられていない場合、無効な結果が返されます。\n-2 - 降順で並べ替えられた検索範囲を使用してバイナリ検索を実行します。 並べ替えられていない場合、無効な結果が返されます。' },
        },
    },
};

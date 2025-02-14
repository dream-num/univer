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
    ASC: {
        description: '全角 (2 バイト) の英数カナ文字を半角 (1 バイト) の文字に変換します。',
        abstract: '全角 (2 バイト) の英数カナ文字を半角 (1 バイト) の文字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/asc-%E9%96%A2%E6%95%B0-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字列または変換する文字列を含むセルの参照を指定します。 文字列に全角文字が含まれない場合は、文字列は変換されません。' },
        },
    },
    ARRAYTOTEXT: {
        description: '指定した範囲のテキスト値の配列を返します。',
        abstract: '指定した範囲のテキスト値の配列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/arraytotext-%E9%96%A2%E6%95%B0-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '文字列として返す配列。' },
            format: { name: '書式', detail: '返されるデータの形式。次の 2 つの値のいずれかを指定できます。\n0 既定。 読みやすい簡潔な形式。 \n1 エスケープ文字と行の区切り文字を含む厳格なフォーマット。 数式バーに入力したときに解析できる文字列を生成します。 返された文字列は、ブーリアン、数値、エラーを除き、引用符でカプセル化されます。' },
        },
    },
    BAHTTEXT: {
        description: '数値を四捨五入し、バーツ通貨書式を設定した文字列に変換します。',
        abstract: '数値を四捨五入し、バーツ通貨書式を設定した文字列に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bahttext-%E9%96%A2%E6%95%B0-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '文字列に変換する数値、数値を含むセルの参照、または戻り値が数値となる数式を指定します。' },
        },
    },
    CHAR: {
        description: '数値で指定された文字を返します。',
        abstract: '数値で指定された文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/char-%E9%96%A2%E6%95%B0-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '変換する文字を表す 1 ～ 255 の範囲内の数値を指定します。 文字は、コンピューターで使用されている文字セットから返されます。' },
        },
    },
    CLEAN: {
        description: '文字列から印刷できない文字を削除します。',
        abstract: '文字列から印刷できない文字を削除します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/clean-%E9%96%A2%E6%95%B0-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '印刷できない文字を削除するワークシートの文字データを指定します。' },
        },
    },
    CODE: {
        description: 'テキスト文字列内の先頭文字の数値コードを返します。',
        abstract: 'テキスト文字列内の先頭文字の数値コードを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/code-%E9%96%A2%E6%95%B0-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '先頭文字のコード番号を調べる文字列を指定します。' },
        },
    },
    CONCAT: {
        description: '複数の範囲や文字列からのテキストを結合しますが、区切り記号または IgnoreEmpty 引数は提供しません。',
        abstract: '複数の範囲や文字列からのテキストを結合しますが、区切り記号または IgnoreEmpty 引数は提供しません',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/concat-%E9%96%A2%E6%95%B0-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: '文字列 1', detail: '結合するテキスト項目。 文字列またはセルの範囲などの文字列の配列。' },
            text2: { name: '文字列 2', detail: '結合する追加のテキスト項目。 テキスト項目には最大 253 のテキスト引数がを設定可能です。 各引数には、文字列、またはセルの範囲などの文字列の配列を指定できます。' },
        },
    },
    CONCATENATE: {
        description: '複数の文字列を結合して 1 つの文字列にまとめます。',
        abstract: '複数の文字列を結合して 1 つの文字列にまとめます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/concatenate-%E9%96%A2%E6%95%B0-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: '文字列 1', detail: '結合する最初の項目です。 この項目には、テキスト値、数字、セル参照のいずれかを指定できます。' },
            text2: { name: '文字列 2', detail: '結合するその他の文字列です。 最大で 255 個の項目、合計 8,192 文字を指定できます。' },
        },
    },
    DBCS: {
        description: '文字列内の半角 (1 バイト) の英数カナ文字を全角 (2 バイト) の文字に変換します。',
        abstract: '文字列内の半角 (1 バイト) の英数カナ文字を全角 (2 バイト) の文字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dbcs-%E9%96%A2%E6%95%B0-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字列または変換する文字列を含むセルの参照を指定します。 文字列に半角の英数カナ文字が含まれない場合は、文字列は変更されません。' },
        },
    },
    DOLLAR: {
        aliasFunctionName: 'YEN',
        description: '通貨形式を使用して数値をテキストに変換します',
        abstract: '通貨形式を使用して数値をテキストに変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dollar-%E9%96%A2%E6%95%B0-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '数値、数値を含むセルの参照、または結果が数値になる数式を指定します。' },
            decimals: { name: '桁数', detail: '小数点以下の桁数を指定します。 負の値の場合、数値は小数点の左側に丸められます。 桁数を省略すると、2 を指定したと見なされます。' },
        },
    },
    EXACT: {
        description: '2 つの文字列が等しいかどうかを判定します。',
        abstract: '2 つの文字列が等しいかどうかを判定します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/exact-%E9%96%A2%E6%95%B0-d3087698-fc15-4a15-9631-12575cf29926',
            },
        ],
        functionParameter: {
            text1: { name: '文字列1', detail: '一方の文字列を指定します。' },
            text2: { name: '文字列2', detail: 'もう一方の文字列を指定します。' },
        },
    },
    FIND: {
        description: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されます。',
        abstract: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/find-%E9%96%A2%E6%95%B0-findb-%E9%96%A2%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: '検索文字列', detail: '「検索するテキスト」で検索する文字列。' },
            withinText: { name: '検索するテキスト', detail: '「検索文字列」を検索する最初のテキスト。' },
            startNum: { name: '開始位置', detail: '「検索するテキスト」内の検索を開始する文字位置。省略した場合は、値 1 が想定されます。' },
        },
    },
    FINDB: {
        description: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されます。',
        abstract: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/find-%E9%96%A2%E6%95%B0-findb-%E9%96%A2%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            findText: { name: '検索文字列', detail: '「検索するテキスト」で検索する文字列。' },
            withinText: { name: '検索するテキスト', detail: '「検索文字列」を検索する最初のテキスト。' },
            startNum: { name: '開始位置', detail: '「検索するテキスト」内の検索を開始する文字位置。省略した場合は、値 1 が想定されます。' },
        },
    },
    FIXED: {
        description: '数値を四捨五入し、書式設定した文字列に変換します。',
        abstract: '数値を四捨五入し、書式設定した文字列に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fixed-%E9%96%A2%E6%95%B0-ffd5723c-324c-45e9-8b96-e41be2a8274a',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '四捨五入して文字列に変換する数値を指定します。' },
            decimals: { name: '桁数', detail: '小数点以下の桁数を指定します。 負の値の場合、数値は小数点の左側に丸められます。 桁数を省略すると、2 を指定したと見なされます。' },
            noCommas: { name: '桁区切り', detail: '返される文字列をカンマ (,) で桁区切りするかどうかを論理値で指定します。TRUE を指定すると、桁区切りは行われません。' },
        },
    },
    LEFT: {
        description: '文字列の先頭 (左端) から指定された文字数の文字を返します。',
        abstract: '文字列の先頭 (左端) から指定された文字数の文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/left-%E9%96%A2%E6%95%B0-leftb-%E9%96%A2%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            numChars: { name: '文字数', detail: '取り出す文字数 (文字列の左端からの文字数) を指定します。' },
        },
    },
    LEFTB: {
        description: '文字列の先頭 (左端) から指定された文字数の文字を返します。',
        abstract: '文字列の先頭 (左端) から指定された文字数の文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/left-%E9%96%A2%E6%95%B0-leftb-%E9%96%A2%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            numBytes: { name: 'バイト数', detail: '取り出す文字数をバイト数で指定します。' },
        },
    },
    LEN: {
        description: 'は、文字列の文字数を返します。',
        abstract: 'は、文字列の文字数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/len-%E9%96%A2%E6%95%B0-lenb-%E9%96%A2%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字数またはバイト数を調べる文字列を指定します。 スペースは文字として数えられます。' },
        },
    },
    LENB: {
        description: 'は、文字列のバイト数を返します。',
        abstract: 'は、文字列のバイト数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/len-%E9%96%A2%E6%95%B0-lenb-%E9%96%A2%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字数またはバイト数を調べる文字列を指定します。 スペースは文字として数えられます。' },
        },
    },
    LOWER: {
        description: '文字列に含まれる英字をすべて小文字に変換します。',
        abstract: '文字列に含まれる英字をすべて小文字に変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lower-%E9%96%A2%E6%95%B0-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '小文字に変換する文字列を指定します。' },
        },
    },
    MID: {
        description: '文字列の任意の位置から指定された文字数の文字を返します。',
        abstract: '文字列の任意の位置から指定された文字数の文字を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mid-%E9%96%A2%E6%95%B0-midb-%E9%96%A2%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            startNum: { name: '開始位置', detail: '文字列から取り出す先頭文字の位置を数値で指定します。' },
            numChars: { name: '文字数', detail: '取り出す文字数を指定します。' },
        },
    },
    MIDB: {
        description: '文字列の任意の位置から指定された文字数の文字を返します。',
        abstract: '文字列の任意の位置から指定された文字数の文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mid-%E9%96%A2%E6%95%B0-midb-%E9%96%A2%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            startNum: { name: '開始位置', detail: '文字列から取り出す先頭文字の位置を数値で指定します。' },
            numBytes: { name: 'バイト数', detail: '取り出す文字数をバイト数で指定します。' },
        },
    },
    NUMBERSTRING: {
        description: '数字を中国語の文字列に変換する',
        abstract: '数字を中国語の文字列に変換する',
        links: [
            {
                title: '指導',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '中国語の文字列に変換される数値。' },
            type: { name: 'タイプ', detail: '返される結果のタイプ。\n1. 中国語小文字 \n2. 中国語の文字を大文字にする \n3. 漢字の読み書き' },
        },
    },
    NUMBERVALUE: {
        description: '文字列をロケールに依存しない方法で数値に変換します。',
        abstract: '文字列をロケールに依存しない方法で数値に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/numbervalue-%E9%96%A2%E6%95%B0-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '数値に変換するテキスト。' },
            decimalSeparator: { name: '小数点区切り文字', detail: '結果の整数部分と小数部を区切るために使用される文字。' },
            groupSeparator: { name: 'グループ区切り文字', detail: 'の数値のグループを区切るために使用される文字。' },
        },
    },
    PHONETIC: {
        description: '文字列からふりがなを抽出します。',
        abstract: '文字列からふりがなを抽出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/phonetic-%E9%96%A2%E6%95%B0-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: '文字列に含まれる英単語の先頭文字だけを大文字に変換します。',
        abstract: '文字列に含まれる英単語の先頭文字だけを大文字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/proper-%E9%96%A2%E6%95%B0-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '引用符で囲まれたテキスト、テキストを返す数式、または部分的に大文字にするテキストを含むセルへの参照。' },
        },
    },
    REGEXEXTRACT: {
        description: '正規表現と最初に一致する部分文字列を抽出します。',
        abstract: '正規表現と最初に一致する部分文字列を抽出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3098244?sjid=5628197291201472796-AP&hl=ja',
            },
        ],
        functionParameter: {
            text: { name: 'テキスト', detail: '代入するテキストです。' },
            regularExpression: { name: '正規表現', detail: 'この正規表現に一致する最初のテキスト部分が返されます。' },
        },
    },
    REGEXMATCH: {
        description: '正規表現に一致するテキストの一部を検索します。',
        abstract: '正規表現に一致するテキストの一部を検索します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3098292?sjid=5628197291201472796-AP&hl=ja',
            },
        ],
        functionParameter: {
            text: { name: 'テキスト', detail: '正規表現に対して検証するテキストです。' },
            regularExpression: { name: '正規表現', detail: 'テキストを検証する正規表現です。' },
        },
    },
    REGEXREPLACE: {
        description: '正規表現を使用して、テキスト文字列の一部を別のテキスト文字列に置き換えます。',
        abstract: '正規表現を使用して、テキスト文字列の一部を別のテキスト文字列に置き換えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3098245?sjid=5628197291201472796-AP&hl=ja',
            },
        ],
        functionParameter: {
            text: { name: 'テキスト', detail: '一部を置換する対象のテキストです。' },
            regularExpression: { name: '正規表現', detail: 'この正規表現に一致するテキスト内のすべてのインスタンスが置き換えられます。' },
            replacement: { name: '置換', detail: '元のテキストに挿入されるテキストです。' },
        },
    },
    REPLACE: {
        description: '文字列中の指定された数の文字を他の文字に置き換えます。',
        abstract: '文字列中の指定された数の文字を他の文字に置き換えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: '文字列', detail: '置き換えを行う文字列を指定します。' },
            startNum: { name: '開始位置', detail: '置換されるテキスト内の最初の文字の位置。' },
            numChars: { name: '文字数', detail: '置換す文字数を指定します。' },
            newText: { name: '置換文字列', detail: '文字列の一部と置き換える文字列を指定します。' },
        },
    },
    REPLACEB: {
        description: '文字列中の指定された数の文字を他の文字に置き換えます。',
        abstract: '文字列中の指定された数の文字を他の文字に置き換えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            oldText: { name: '文字列', detail: '置き換えを行う文字列を指定します。' },
            startNum: { name: '開始位置', detail: '置換されるテキスト内の最初の文字の位置。' },
            numBytes: { name: 'バイト数', detail: '置換す文字数をバイト数で指定します。' },
            newText: { name: '置換文字列', detail: '文字列の一部と置き換える文字列を指定します。' },
        },
    },
    REPT: {
        description: '文字列を指定された回数だけ繰り返して表示します。',
        abstract: '文字列を指定された回数だけ繰り返して表示します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rept-%E9%96%A2%E6%95%B0-04c4d778-e712-43b4-9c15-d656582bb061',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '繰り返す文字列を指定します。' },
            numberTimes: { name: '繰り返し回数', detail: '文字列を繰り返す回数を、正の数値で指定します。' },
        },
    },
    RIGHT: {
        description: '文字列の末尾 (右端) から指定された文字数の文字を返します。',
        abstract: '文字列の末尾 (右端) から指定された文字数の文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/right-%E9%96%A2%E6%95%B0-rightb-%E9%96%A2%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            numChars: { name: '文字数', detail: '取り出す文字数 (文字列の末尾からの文字数) を指定します。' },
        },
    },
    RIGHTB: {
        description: '文字列の末尾 (右端) から指定された文字数の文字を返します。',
        abstract: '文字列の末尾 (右端) から指定された文字数の文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/right-%E9%96%A2%E6%95%B0-rightb-%E9%96%A2%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '取り出す文字を含む文字列を指定します。' },
            numBytes: { name: 'バイト数', detail: '取り出す文字数をバイト数で指定します。' },
        },
    },
    SEARCH: {
        description: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されません。',
        abstract: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されません。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/search-%E9%96%A2%E6%95%B0-searchb-%E9%96%A2%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: '検索文字列', detail: '「検索するテキスト」で検索する文字列。' },
            withinText: { name: '検索するテキスト', detail: '「検索文字列」を検索する最初のテキスト。' },
            startNum: { name: '開始位置', detail: '「検索するテキスト」内の検索を開始する文字位置。省略した場合は、値 1 が想定されます。' },
        },
    },
    SEARCHB: {
        description: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されません。',
        abstract: '指定された文字列を他の文字列の中で検索します。大文字と小文字は区別されません。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/search-%E9%96%A2%E6%95%B0-searchb-%E9%96%A2%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            findText: { name: '検索文字列', detail: '「検索するテキスト」で検索する文字列。' },
            withinText: { name: '検索するテキスト', detail: '「検索文字列」を検索する最初のテキスト。' },
            startNum: { name: '開始位置', detail: '「検索するテキスト」内の検索を開始する文字位置。省略した場合は、値 1 が想定されます。' },
        },
    },
    SUBSTITUTE: {
        description: '文字列中の指定された文字を他の文字に置き換えます。',
        abstract: '文字列中の指定された文字を他の文字に置き換えます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/substitute-%E9%96%A2%E6%95%B0-6434944e-a904-4336-a9b0-1e58df3bc332',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字を置き換えるテキストを含むセルへのテキストまたは参照。' },
            oldText: { name: '検索文字列', detail: '置換する文字列を指定します。' },
            newText: { name: '置換文字列', detail: '検索文字列を検索して置き換える文字列を指定します。' },
            instanceNum: { name: '置換対象を指定', detail: '検索文字列に含まれるどの文字列を置換文字列と置き換えるかを指定します。 置換対象を指定した場合、検索文字列中の置換対象文字列だけが置き換えられます。 指定しない場合、検索文字列中のすべての文字列が置換文字列に置き換えられます。' },
        },
    },
    T: {
        description: '引数を文字列に変換します。',
        abstract: '引数を文字列に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/t-%E9%96%A2%E6%95%B0-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テストする値を指定します。' },
        },
    },
    TEXT: {
        description: '数値を書式設定した文字列に変換します。',
        abstract: '数値を書式設定した文字列に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/text-%E9%96%A2%E6%95%B0-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'テキストに変換する数値。' },
            formatText: { name: '数値形式', detail: '指定された値に適用する書式を定義するテキスト文字列。' },
        },
    },
    TEXTAFTER: {
        description: '指定された文字または文字列の後に発生するテキストを返します',
        abstract: '指定された文字または文字列の後に発生するテキストを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/textafter-%E9%96%A2%E6%95%B0-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '検索対象のテキスト。ワイルドカード文字は使用できません。' },
            delimiter: { name: 'デリミタ', detail: '抽出した後のポイントをマークするテキスト。' },
            instanceNum: { name: 'インスタンス番号', detail: 'テキストを抽出する区切り記号のインスタンス。' },
            matchMode: { name: 'マッチモード', detail: 'テキスト検索で大文字と小文字を区別するかどうかを指定します。既定では大文字と小文字が区別されます。' },
            matchEnd: { name: 'マッチ終了', detail: 'テキストの末尾を区切り記号として扱います。既定では、テキストは完全一致です。' },
            ifNotFound: { name: '比類のない価値', detail: '一致するものが見つからない場合に返される値。既定では、#N/A が返されます。' },
        },
    },
    TEXTBEFORE: {
        description: '指定された文字または文字列の前に発生するテキストを返します',
        abstract: '指定された文字または文字列の前に発生するテキストを返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/textbefore-%E9%96%A2%E6%95%B0-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '検索対象のテキスト。ワイルドカード文字は使用できません。' },
            delimiter: { name: 'デリミタ', detail: '抽出した後のポイントをマークするテキスト。' },
            instanceNum: { name: 'インスタンス番号', detail: 'テキストを抽出する区切り記号のインスタンス。' },
            matchMode: { name: 'マッチモード', detail: 'テキスト検索で大文字と小文字を区別するかどうかを指定します。既定では大文字と小文字が区別されます。' },
            matchEnd: { name: 'マッチ終了', detail: 'テキストの末尾を区切り記号として扱います。既定では、テキストは完全一致です。' },
            ifNotFound: { name: '比類のない価値', detail: '一致するものが見つからない場合に返される値。既定では、#N/A が返されます。' },
        },
    },
    TEXTJOIN: {
        description: 'テキスト：複数の範囲または文字列のテキストを結合します',
        abstract: 'テキスト：複数の範囲または文字列のテキストを結合します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/textjoin-%E9%96%A2%E6%95%B0-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            delimiter: { name: '区切り記号', detail: '空のテキスト文字列、または二重引用符で囲まれた 1 つ以上の文字、または有効なテキスト文字列への参照。' },
            ignoreEmpty: { name: '空のセルは無視', detail: 'TRUE の場合、空のセルは無視されます。' },
            text1: { name: '文字列1', detail: '結合するテキスト項目。 文字列またはセルの範囲などの文字列の配列。' },
            text2: { name: '文字列2', detail: '結合する追加のテキスト項目。 テキスト項目には、text1 を含め、最大 252 のテキスト引数を設定できます。 各引数には、文字列、またはセルの範囲などの文字列の配列を指定できます。' },
        },
    },
    TEXTSPLIT: {
        description: '列区切り記号と行区切り記号を使用してテキスト文字列を分割します',
        abstract: '列区切り記号と行区切り記号を使用してテキスト文字列を分割します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/textsplit-%E9%96%A2%E6%95%B0-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '分割するテキスト。' },
            colDelimiter: { name: '列デリミタ', detail: '列を分割する文字または文字列。' },
            rowDelimiter: { name: '行デリミタ', detail: '行を分割する文字または文字列。' },
            ignoreEmpty: { name: '空のセルを無視する', detail: '空のセルを無視するかどうか。デフォルトはFALSEです。' },
            matchMode: { name: 'マッチモード', detail: 'テキスト内の区切り文字の一致を検索します。デフォルトでは、大文字と小文字が区別された照合が行われます。' },
            padWith: { name: '塗りつぶし値', detail: 'パディングに使用する値。デフォルトでは、#N/A が使用されます。' },
        },
    },
    TRIM: {
        description: '各単語間のスペースは 1 つ残し、不要なスペースをすべて削除します。',
        abstract: '文字列から余分なスペースを削除します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/trim-%E9%96%A2%E6%95%B0-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '余分なスペースを削除するテキストを指定します。' },
        },
    },
    UNICHAR: {
        description: '指定された数値により参照される Unicode 文字を返します。',
        abstract: '指定された数値により参照される Unicode 文字を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/unichar-%E9%96%A2%E6%95%B0-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
            },
        ],
        functionParameter: {
            number: { name: '数値', detail: '文字に対応する Unicode 番号を指定します。' },
        },
    },
    UNICODE: {
        description: '文字列の最初の文字に対応する番号 (コード ポイント) を返します。',
        abstract: '文字列の最初の文字に対応する番号 (コード ポイント) を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/unicode-%E9%96%A2%E6%95%B0-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: 'Unicode 値を求める文字を指定します。' },
        },
    },
    UPPER: {
        description: '文字列に含まれる英字をすべて大文字に変換します。',
        abstract: '文字列に含まれる英字をすべて大文字に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/upper-%E9%96%A2%E6%95%B0-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '大文字に変換する文字列を指定します。' },
        },
    },
    VALUE: {
        description: '文字列を数値に変換して返します。',
        abstract: '文字列を数値に変換して返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/value-%E9%96%A2%E6%95%B0-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
            },
        ],
        functionParameter: {
            text: { name: '文字列', detail: '文字列を半角の二重引用符 (") で囲んで指定するか、または変換する文字列を含むセル参照を指定します。' },
        },
    },
    VALUETOTEXT: {
        description: '指定した値からテキストを返します。',
        abstract: '指定した値からテキストを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/valetotext-%E9%96%A2%E6%95%B0-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '文字列として返す値。' },
            format: { name: '書式', detail: '返されるデータの形式。次の 2 つの値のいずれかを指定できます。\n0 既定。 読みやすい簡潔な形式。 \n1 エスケープ文字と行の区切り文字を含む厳格なフォーマット。 数式バーに入力したときに解析できる文字列を生成します。 返された文字列は、ブーリアン、数値、エラーを除き、引用符でカプセル化されます。' },
        },
    },
    CALL: {
        description: 'ダイナミック リンク ライブラリまたはコード リソースで、プロシージャを呼び出します。',
        abstract: 'ダイナミック リンク ライブラリまたはコード リソースで、プロシージャを呼び出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/call-%E9%96%A2%E6%95%B0-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EUROCONVERT: {
        description: '数値からユーロ通貨への換算、ユーロ通貨からユーロ通貨使用国の現地通貨への換算、またはユーロ通貨を基にしてユーロ通貨を使用する参加国間の通貨の換算を行います。',
        abstract: '数値からユーロ通貨への換算、ユーロ通貨からユーロ通貨使用国の現地通貨への換算、またはユーロ通貨を基にしてユーロ通貨を使用する参加国間の通貨の換算を行います。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/euroconvert-%E9%96%A2%E6%95%B0-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REGISTER_ID: {
        description: 'あらかじめ登録されている、指定のダイナミック リンク ライブラリ (DLL) またはコード リソースのレジスタ ID を返します。',
        abstract: 'あらかじめ登録されている、指定のダイナミック リンク ライブラリ (DLL) またはコード リソースのレジスタ ID を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/register-id-%E9%96%A2%E6%95%B0-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};

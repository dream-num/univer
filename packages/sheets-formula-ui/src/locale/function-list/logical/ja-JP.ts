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
    AND: {
        description: 'すべての引数が TRUE のときに TRUE を返します。',
        abstract: 'すべての引数が TRUE のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/and-%E9%96%A2%E6%95%B0-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            logical1: { name: '論理式 1', detail: 'TRUE または FALSE に評価できるテスト対象の 1 つ目の条件。' },
            logical2: { name: '論理式 2', detail: ' 最大 255 個の条件まで、TRUE または FALSE のいずれかに評価できるテストする追加の条件。' },
        },
    },
    BYCOL: {
        description: '各列に LAMBDA を適用し、結果の配列を返します',
        abstract: '各列に LAMBDA を適用し、結果の配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/bycol-%E9%96%A2%E6%95%B0-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '列で区切られる配列。' },
            lambda: { name: 'lambda', detail: '列を 1 つのパラメーターとして受け取り、1 つの結果を計算する LAMBDA。LAMBDA は以下のシングル パラメーターを取ります: 配列からの列。' },
        },
    },
    BYROW: {
        description: '各行に LAMBDA を適用し、結果の配列を返します',
        abstract: '各行に LAMBDA を適用し、結果の配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/byrow-%E9%96%A2%E6%95%B0-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            array: { name: '配列', detail: '行で区切られる配列。' },
            lambda: { name: 'lambda', detail: '行を 1 つのパラメーターとして受け取り、1 つの結果を計算する LAMBDA。 LAMBDA は以下のシングル パラメーターを取ります: 配列からの行。' },
        },
    },
    FALSE: {
        description: '論理値 FALSE を返します。',
        abstract: '論理値 FALSE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/false-%E9%96%A2%E6%95%B0-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: '値または数式が条件を満たしているかどうかを判定します。',
        abstract: '値または数式が条件を満たしているかどうかを判定します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/if-%E9%96%A2%E6%95%B0-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            logicalTest: { name: '論理式', detail: 'テストする条件' },
            valueIfTrue: { name: '値が真の場合', detail: 'logical_test の結果が TRUE の場合に返す値' },
            valueIfFalse: { name: '値が偽の場合', detail: 'logical_test の結果が FALSE の場合に返す値' },
        },
    },
    IFERROR: {
        description: '数式の結果がエラーの場合は指定した値を返し、それ以外の場合は数式の結果を返します。',
        abstract: '数式の結果がエラーの場合は指定した値を返し、それ以外の場合は数式の結果を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/iferror-%E9%96%A2%E6%95%B0-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'エラーかどうかをチェックする引数です。' },
            valueIfError: { name: 'エラー時の戻り値', detail: '数式がエラー値と評価された場合に返す値を指定します。 次のエラーの種類はが評価されます: #N/A、#VALUE!、#REF!、#DIV/0!、#NUM!、#NAME?、#NULL!。' },
        },
    },
    IFNA: {
        description: '式の結果が #N/A になる場合に指定した値を返し、それ以外の場合は式の結果を返します',
        abstract: '式の結果が #N/A になる場合に指定した値を返し、それ以外の場合は式の結果を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ifna-%E9%96%A2%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'エラー値 #N/A があるかどうかを確認する引数。' },
            valueIfNa: { name: '値_if_na', detail: '式が #N/A エラー値と評価された場合に返される値。' },
        },
    },
    IFS: {
        description: '1 つ以上の条件が満たされているかどうかを確認し、最初の TRUE 条件に対応する値を返します。',
        abstract: '1 つ以上の条件が満たされているかどうかを確認し、最初の TRUE 条件に対応する値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ifs-%E9%96%A2%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            logicalTest1: { name: '論理1', detail: '評価される最初の条件。ブール値、数値、配列、またはこれらの値のいずれかへの参照を指定できます。' },
            valueIfTrue1: { name: '値1', detail: '“条件1”が“TRUE”の場合に返される値。' },
            logicalTest2: { name: '論理2', detail: '前の条件の前に評価される他の条件は FALSE です。' },
            valueIfTrue2: { name: '値2', detail: '対応する条件が“TRUE”の場合に返される追加の値。' },
        },
    },
    LAMBDA: {
        description: 'LAMBDA 関数を使用して、再利用可能なカスタム関数を作成し、フレンドリ名で呼び出します。 新しい関数はブック全体で使用でき、ネイティブ Excel 関数と同様に呼び出されます。',
        abstract: 'カスタムで再利用可能な関数を作成し、フレンドリ名で呼び出す',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/lambda-%E9%96%A2%E6%95%B0-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'パラメーター',
                detail: 'セル参照、文字列、数値などの関数に渡す値。 最大 253 個のパラメーターを入力できます。 この引数は省略可能です。',
            },
            calculation: {
                name: '計算',
                detail: '関数の結果として実行して返す数式。 最後の引数である必要性があり、結果を返す必要があります。 この引数は必須です。',
            },
        },
    },
    LET: {
        description: '計算結果に名前を割り当てます',
        abstract: '計算結果に名前を割り当てます',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/let-%E9%96%A2%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: '名前1', detail: '最初に割り当てる名前。文字で始まる必要があります。数式の出力であったり、範囲の構文と競合していたりしてはなりません。' },
            nameValue1: { name: '値1', detail: 'name1 に割り当てられている値。' },
            calculationOrName2: { name: '計算または名前2', detail: '以下のいずれかになります。\n1.LET 関数内のすべての名前を使用する計算。LET 関数の最後の引数でなければなりません。\n2.2 番目の name_value に割り当てる 2 番目の名前。名前が指定されている場合、name_value2 と calculation_or_name3 が必須です。' },
            nameValue2: { name: '値2', detail: 'calculation_or_name2 に割り当てられている値。' },
            calculationOrName3: { name: '計算または名前3', detail: '以下のいずれかになります。\n1.LET 関数内のすべての名前を使用する計算。LET 関数の最後の引数は計算でなければなりません。\n2.3 番目の name_value に割り当てる 3 番目の名前。名前が指定されている場合、name_value3 と calculation_or_name4 が必須です。' },
        },
    },
    MAKEARRAY: {
        description: 'LAMBDA を適用して、指定した行と列のサイズの計算された配列を返します',
        abstract: 'LAMBDA を適用して、指定した行と列のサイズの計算された配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/makearray-%E9%96%A2%E6%95%B0-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: '行', detail: '配列内の行数。 ゼロより大きい値にする必要があります。' },
            number2: { name: '列', detail: '配列内の列数。 ゼロより大きい値にする必要があります。' },
            value3: {
                name: 'lambda',
                detail: '配列を作成するために呼び出される LAMBDA。 LAMBDA は 2 つのパラメーターを取ります: 行 (配列の行インデックス), 列 (配列の列インデックス)',
            },
        },
    },
    MAP: {
        description: 'LAMBDA を適用して新しい値を作成することにより、配列内の各値を新しい値にマッピングして形成された配列を返します。',
        abstract: 'LAMBDA を適用して新しい値を作成することにより、配列内の各値を新しい値にマッピングして形成された配列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/map-%E9%96%A2%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: '配列1', detail: 'マップする配列1。' },
            array2: { name: '配列2', detail: 'マップする配列2。' },
            lambda: { name: 'lambda', detail: 'LAMBDAは最後の引数でなければならず、渡される配列ごとにパラメータを持つ必要があります。' },
        },
    },
    NOT: {
        description: '引数の論理を反転します。',
        abstract: '引数の論理を反転します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/not-%E9%96%A2%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            logical: { name: '論理式', detail: '論理を反転する条件。TRUE または FALSE に評価されます。' },
        },
    },
    OR: {
        description: 'OR 関数は、いずれかの引数が TRUE と評価された場合は TRUE を返し、すべての引数が FALSE と評価された場合は FALSE を返します。',
        abstract: 'いずれかの引数が TRUE のときに TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/or-%E9%96%A2%E6%95%B0-7d17ad14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            logical1: { name: '論理式 1', detail: 'TRUE または FALSE に評価できるテスト対象の 1 つ目の条件。' },
            logical2: { name: '論理式 2', detail: '最大 255 個の条件まで、TRUE または FALSE のいずれかに評価できるテストする追加の条件。' },
        },
    },
    REDUCE: {
        description: '各値に LAMBDA を適用し、アキュムレータの合計値を返すことで、配列を累積値に減らします。',
        abstract: '各値に LAMBDA を適用し、アキュムレータの合計値を返すことで、配列を累積値に減らします。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/reduce-%E9%96%A2%E6%95%B0-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            initialValue: { name: '開始値', detail: 'アキュムレーターの開始値を設定します。' },
            array: { name: '配列', detail: '減らす配列。' },
            lambda: { name: 'lambda', detail: '配列を減らすために呼び出される LAMBDA。 LAMBDA は、次の 3 つのパラメーターを受け取ります。1.値が合計され、最終結果として返されました。2.配列の現在の値。3.配列内の各要素に適用される計算。' },
        },
    },
    SCAN: {
        description: '各値に LAMBDA を適用して配列をスキャンし、各中間値を持つ配列を返します',
        abstract: '各値に LAMBDA を適用して配列をスキャンし、各中間値を持つ配列を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/scan-%E9%96%A2%E6%95%B0-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            initialValue: { name: '開始値', detail: 'アキュムレーターの開始値を設定します。' },
            array: { name: '配列', detail: 'スキャンする配列。' },
            lambda: { name: 'lambda', detail: '配列をスキャンする呼び出される LAMBDA。 LAMBDA は、次の 3 つのパラメーターを受け取ります。1.値が合計され、最終結果として返されました。2.配列の現在の値。3.配列内の各要素に適用される計算。' },
        },
    },
    SWITCH: {
        description: '式を値のリストと比較し、最初に一致する値に対応する結果を返します。一致する値がない場合は、オプションで既定値が返される場合があります。',
        abstract: '式を値のリストと比較し、最初に一致する値に対応する結果を返します。一致する値がない場合は、オプションで既定値が返される場合があります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/switch-%E9%96%A2%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            expression: { name: '式', detail: '式は、値1...値126 と比較される値です（数値、日付、テキストなど）。' },
            value1: { name: '値1', detail: '値N は式と比較される値です。' },
            result1: { name: '結果1', detail: '結果N は対応する値N 引数が式と一致した場合に返される値です。結果N は対応する値N 引数ごとに提供する必要があります。' },
            defaultOrValue2: { name: 'デフォルトまたは値2', detail: '既定は、値N 式で一致するものが見つからなかった場合に返される値です。既定の引数は、対応する結果N 式がないことで識別されます（例を参照）。既定は関数の最後の引数でなければなりません。' },
            result2: { name: '結果2', detail: '結果N は対応する値N 引数が式と一致した場合に返される値です。結果N は対応する値N 引数ごとに提供する必要があります。' },
        },
    },
    TRUE: {
        description: '論理値 TRUE を返します。',
        abstract: '論理値 TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/true-%E9%96%A2%E6%95%B0-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: '引数のうち奇数個の条件が TRUE の場合に TRUE を返し、偶数個の条件が TRUE の場合に FALSE を返します。',
        abstract: '引数のうち奇数個の条件が TRUE の場合に TRUE を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xor-%E9%96%A2%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: '論理式 1', detail: 'TRUE または FALSE に評価できるテスト対象の 1 つ目の条件。' },
            logical2: { name: '論理式 2', detail: '最大 255 個の条件まで、TRUE または FALSE のいずれかに評価できるテストする追加の条件。' },
        },
    },
};

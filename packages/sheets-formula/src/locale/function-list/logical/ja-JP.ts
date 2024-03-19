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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
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
            valueIfError: { name: 'エラーの場合の値', detail: '数式がエラー値と評価された場合に返す値を指定します。 次のエラーの種類はが評価されます: #N/A、#VALUE!、#REF!、#DIV/0!、#NUM!、#NAME?、#NULL!。' },
        },
    },
    IFNA: {
        description: 'それ以外の場合は、式の結果を返します。',
        abstract: 'それ以外の場合は、式の結果を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ifna-%E9%96%A2%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IFS: {
        description: '1つ以上の条件が満たされているかどうかをチェックして、最初の TRUE 条件に対応する値を返します。',
        abstract: '1つ以上の条件が満たされているかどうかをチェックして、最初の TRUE 条件に対応する値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ifs-%E9%96%A2%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
        description: 'LAMBDA を適用して新しい値を作成することで、配列内の各値を新しい値にマッピングして形成された配列を返します。',
        abstract: 'LAMBDA を適用して新しい値を作成することで、配列内の各値を新しい値にマッピングして形成された配列を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/map-%E9%96%A2%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NOT: {
        description: '引数の論理値 (TRUE または FALSE) を逆にして返します。',
        abstract: '引数の論理値 (TRUE または FALSE) を逆にして返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/not-%E9%96%A2%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SWITCH: {
        description: '値の一覧に対して式を評価し、最初に一致する値に対応する結果を返します。 いずれにも一致しない場合は、任意指定の既定値が返されます。',
        abstract: '値の一覧に対して式を評価し、最初に一致する値に対応する結果を返します。 いずれにも一致しない場合は、任意指定の既定値が返されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/switch-%E9%96%A2%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
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
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XOR: {
        description: 'すべての引数の排他的論理和を返します。',
        abstract: 'すべての引数の排他的論理和を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xor-%E9%96%A2%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};

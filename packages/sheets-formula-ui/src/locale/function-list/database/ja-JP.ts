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
    DAVERAGE: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの平均値を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの平均値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/daverage-%E9%96%A2%E6%95%B0-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DCOUNT: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの中で数値が入力されているセルの個数を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの中で数値が入力されているセルの個数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dcount-%E9%96%A2%E6%95%B0-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DCOUNTA: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの中の空白でないセルの個数を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの中の空白でないセルの個数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dcounta-%E9%96%A2%E6%95%B0-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DGET: {
        description: 'リストまたはデータベースの列から、指定された条件を満たす 1 つの値を抽出します。',
        abstract: 'リストまたはデータベースの列から、指定された条件を満たす 1 つの値を抽出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dget-%E9%96%A2%E6%95%B0-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DMAX: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの最大値を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの最大値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dmax-%E9%96%A2%E6%95%B0-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DMIN: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの最小値を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの最小値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dmin-%E9%96%A2%E6%95%B0-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DPRODUCT: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの特定のフィールド値の積を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの特定のフィールド値の積を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dproduct-%E9%96%A2%E6%95%B0-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DSTDEV: {
        description: 'リストまたはデータベースの列を検索し、指定された条件を満たすレコードを母集団の標本と見なして、母集団に対する標準偏差を返します。',
        abstract: 'リストまたはデータベースの列を検索し、指定された条件を満たすレコードを母集団の標本と見なして、母集団に対する標準偏差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dstdev-%E9%96%A2%E6%95%B0-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DSTDEVP: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団全体と見なして、母集団の標準偏差を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団全体と見なして、母集団の標準偏差を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dstdevp-%E9%96%A2%E6%95%B0-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DSUM: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの合計を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードの合計を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dsum-%E9%96%A2%E6%95%B0-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DVAR: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団の標本と見なして、母集団に対する分散を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団の標本と見なして、母集団に対する分散を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dvar-%E9%96%A2%E6%95%B0-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
    DVARP: {
        description: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団全体と見なして、母集団の分散を返します。',
        abstract: 'リストまたはデータベースの指定された列を検索し、条件を満たすレコードを母集団全体と見なして、母集団の分散を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dvarp-%E9%96%A2%E6%95%B0-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: 'データベース', detail: 'リストまたはデータベースを構成するセル範囲を指定します。' },
            field: { name: 'フィールド', detail: '関数の中で使用する列を指定します。' },
            criteria: { name: '検索条件', detail: '指定した条件が設定されているセル範囲を指定します。' },
        },
    },
};

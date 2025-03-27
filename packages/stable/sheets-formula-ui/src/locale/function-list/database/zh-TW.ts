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
        description: '傳回所選資料庫條目的平均值',
        abstract: '傳回所選資料庫條目的平均值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/daverage-%E5%87%BD%E6%95%B0-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DCOUNT: {
        description: '計算資料庫中包含數字的單元格的數量',
        abstract: '計算資料庫中包含數字的單元格的數量',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dcount-%E5%87%BD%E6%95%B0-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DCOUNTA: {
        description: '計算資料庫中非空單元格的數量',
        abstract: '計算資料庫中非空單元格的數量',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dcounta-%E5%87%BD%E6%95%B0-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DGET: {
        description: '從資料庫提取符合指定條件的單一記錄',
        abstract: '從資料庫擷取符合指定條件的單一記錄',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dget-%E5%87%BD%E6%95%B0-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DMAX: {
        description: '傳回所選資料庫項目的最大值',
        abstract: '傳回所選資料庫項目的最大值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dmax-%E5%87%BD%E6%95%B0-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DMIN: {
        description: '傳回所選資料庫條目的最小值',
        abstract: '傳回所選資料庫條目的最小值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dmin-%E5%87%BD%E6%95%B0-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DPRODUCT: {
        description: '將資料庫中符合條件的記錄的特定欄位中的值相乘',
        abstract: '將資料庫中符合條件的記錄的特定欄位中的值相乘',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dproduct-%E5%87%BD%E6%95%B0-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DSTDEV: {
        description: '基於所選資料庫條目的樣本估算標準差',
        abstract: '基於所選資料庫條目的樣本估算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dstdev-%E5%87%BD%E6%95%B0-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DSTDEVP: {
        description: '基於所選資料庫條目的樣本總體計算標準差',
        abstract: '基於所選資料庫條目的樣本總體計算標準差',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dstdevp-%E5%87%BD%E6%95%B0-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DSUM: {
        description: '對資料庫中符合條件的記錄的欄位列中的數字求和',
        abstract: '資料庫中符合條件的記錄的欄位列中的數字求和',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dsum-%E5%87%BD%E6%95%B0-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DVAR: {
        description: '基於所選資料庫項目的樣本估算變異數',
        abstract: '基於所選資料庫條目的樣本估算變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dvar-%E5%87%BD%E6%;95%B0-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
    DVARP: {
        description: '基於所選資料庫項目的樣本總體計算變異數',
        abstract: '基於所選資料庫條目的樣本總體計算變異數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dvarp-%E5%87%BD%E6%95%B0-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: '資料庫', detail: '組成清單或資料庫的儲存格範圍。' },
            field: { name: '欄位', detail: '指出函數中所使用的欄。' },
            criteria: { name: '條件', detail: '含有指定條件的儲存格範圍。' },
        },
    },
};

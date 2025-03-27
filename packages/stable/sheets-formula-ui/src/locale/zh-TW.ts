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

import array from './function-list/array/zh-TW';
import compatibility from './function-list/compatibility/zh-TW';
import cube from './function-list/cube/zh-TW';
import database from './function-list/database/zh-TW';
import date from './function-list/date/zh-TW';
import engineering from './function-list/engineering/zh-TW';
import financial from './function-list/financial/zh-TW';
import information from './function-list/information/zh-TW';
import logical from './function-list/logical/zh-TW';
import lookup from './function-list/lookup/zh-TW';
import math from './function-list/math/zh-TW';
import statistical from './function-list/statistical/zh-TW';
import text from './function-list/text/zh-TW';
import univer from './function-list/univer/zh-TW';
import web from './function-list/web/zh-TW';

export default {
    formula: {
        insert: {
            tooltip: '函數',
            sum: '求和',
            average: '平均值',
            count: '計數',
            max: '最大值',
            min: '最小值',
            more: '更多函數...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
        },

        prompt: {
            helpExample: '範例',
            helpAbstract: '簡介',
            required: '必要。 ',
            optional: '可選。 ',
        },

        error: {
            title: '錯誤',
            divByZero: '除數為零',
            name: '無效名稱',
            value: '值中的錯誤',
            num: '數值錯誤',
            na: '值不可用',
            cycle: '循環引用',
            ref: '無效的單元格引用',
            spill: '溢出區域不是空白區域',
            calc: '計算錯誤',
            error: '錯誤',
            connect: '正在連線中',
            null: '空值錯誤',
        },

        functionType: {
            financial: '財務',
            date: '日期與時間',
            math: '數學與三角函數',
            statistical: '統計',
            lookup: '尋找與引用',
            database: '資料庫',
            text: '文字',
            logical: '邏輯',
            information: '訊息',
            engineering: '工程',
            cube: '多維資料集',
            compatibility: '相容性',
            web: 'Web',
            array: '數組',
            univer: 'Univer',
            user: '使用者自訂',
            definedname: '定義名稱',
        },

        moreFunctions: {
            confirm: '應用',
            prev: '上一步',
            next: '下一步',
            searchFunctionPlaceholder: '搜尋函數',
            allFunctions: '全部函數',
            syntax: '語法',
        },

        operation: {
            pasteFormula: '僅貼上公式',
        },
    },
};

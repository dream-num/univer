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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': '快速求和',
        },

        insert: {
            tooltip: '函數',
            common: '常用函數',
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
            ref: '無效的儲存格引用',
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
            array: '陣列',
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
            copyFormulaOnly: '僅複製公式',
            pasteFormula: '僅貼上公式',
        },

        rangeSelector: {
            title: '選擇一個資料範圍',
            addAnotherRange: '新增範圍',
            buttonTooltip: '選擇資料範圍',
            placeHolder: '框選範圍或輸入',
            confirm: '確認',
            cancel: '取消',
        },
    },
};

export default locale;

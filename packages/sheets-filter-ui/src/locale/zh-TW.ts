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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': '篩選',
            'clear-filter-criteria': '清除篩選條件',
            're-calc-filter-conditions': '重新計算',
        },
        command: {
            'not-valid-filter-range': '選取的區域只有一行，無法進行篩選',
        },
        shortcut: {
            'smart-toggle-filter': '切換篩選',
        },
        panel: {
            'clear-filter': '清除篩選',
            cancel: '取消',
            confirm: '確認',
            'by-values': '按值',
            'by-conditions': '按條件',
            'filter-only': '僅篩選',
            'search-placeholder': '使用空格分隔關鍵字',
            'select-all': '全選',
            'input-values-placeholder': '請輸入',
            or: '或',
            and: '和',
            empty: '(空白)',
            '?': '可用 ? 代表單一字元',
            '*': '可用 * 代表任意多個字元',
        },
        conditions: {
            none: '無',
            empty: '為空',
            'not-empty': '不為空',
            'text-contains': '文字包含',
            'does-not-contain': '文本不包含',
            'starts-with': '文字開頭',
            'ends-with': '文本結尾',
            equals: '文字相符',
            'greater-than': '大於',
            'greater-than-or-equal': '大於等於',
            'less-than': '小於',
            'less-than-or-equal': '小於等於',
            equal: '等於',
            'not-equal': '不等於',
            between: '介於',
            'not-between': '不介於',
            custom: '自訂',
        },
        msg: {
            'filter-header-forbidden': '無法移動篩選行頭',
        },
        date: {
            1: '1月',
            2: '2月',
            3: '3月',
            4: '4月',
            5: '5月',
            6: '6月',
            7: '7月',
            8: '8月',
            9: '9月',
            10: '10月',
            11: '11月',
            12: '12月',
        },
    },
};

export default locale;

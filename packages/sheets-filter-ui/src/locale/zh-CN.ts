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

const locale = {
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': '筛选',
            'clear-filter-criteria': '清除筛选条件',
            're-calc-filter-conditions': '重新计算',
        },
        command: {
            'not-valid-filter-range': '选中的区域只有一行，无法进行筛选',
        },
        shortcut: {
            'smart-toggle-filter': '切换筛选',
        },
        panel: {
            'clear-filter': '清除筛选',
            cancel: '取消',
            confirm: '确认',
            'by-values': '按值',
            'by-conditions': '按条件',
            'filter-only': '仅筛选',
            'search-placeholder': '使用空格分隔关键字',
            'select-all': '全选',
            'input-values-placeholder': '请输入',
            or: '或',
            and: '和',
            empty: '(空白)',
            '?': '可用 ? 代表单个字符',
            '*': '可用 * 代表任意多个字符',
        },
        conditions: {
            none: '无',
            empty: '为空',
            'not-empty': '不为空',
            'text-contains': '文本包含',
            'does-not-contain': '文本不包含',
            'starts-with': '文本开头',
            'ends-with': '文本结尾',
            equals: '文本相符',
            'greater-than': '大于',
            'greater-than-or-equal': '大于等于',
            'less-than': '小于',
            'less-than-or-equal': '小于等于',
            equal: '等于',
            'not-equal': '不等于',
            between: '介于',
            'not-between': '不介于',
            custom: '自定义',
        },
        msg: {
            'filter-header-forbidden': '无法移动筛选行头',
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

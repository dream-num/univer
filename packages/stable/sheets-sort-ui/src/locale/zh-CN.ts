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
    'sheets-sort': {
        general: {
            sort: '排序',
            'sort-asc': '升序',
            'sort-desc': '降序',
            'sort-custom': '自定义排序',
            'sort-asc-ext': '拓展区域升序',
            'sort-desc-ext': '拓展区域降序',
            'sort-asc-cur': '当前区域升序',
            'sort-desc-cur': '当前区域降序',
        },
        error: {
            'merge-size': '所选区域的合并单元格的大小不一致，无法排序。',
            empty: '所选区域无内容，无法排序。',
            single: '所选区域仅有一行，无法排序。',
            'formula-array': '所选区域含数组公式，无法排序。',
        },
        dialog: {
            'sort-reminder': '排序提醒',
            'sort-reminder-desc': '当前仅会对选中区域进行排序，是否拓展排序范围？',
            'sort-reminder-ext': '拓展排序范围',
            'sort-reminder-no': '保持所选排序范围',
            'first-row-check': '标题不参与排序',
            'add-condition': '添加排序条件',
            cancel: '取消',
            confirm: '确认',
        },
    },
};

export default locale;

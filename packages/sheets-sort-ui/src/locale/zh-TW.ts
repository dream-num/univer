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
    'sheets-sort': {
        general: {
            sort: '排序',
            'sort-asc': '升序',
            'sort-desc': '降序',
            'sort-custom': '自訂排序',
            'sort-asc-ext': '拓展區域升序',
            'sort-desc-ext': '拓展區域降序',
            'sort-asc-cur': '目前區域升序',
            'sort-desc-cur': '當前區域降序',
        },
        error: {
            'merge-size': '所選區域的合併儲存格的大小不一致，無法排序。 ',
            empty: '所選區域無內容，無法排序。 ',
            single: '所選區域只有一行，無法排序。 ',
            'formula-array': '所選區域含數組公式，無法排序。 ',
        },
        dialog: {
            'sort-reminder': '排序提醒',
            'sort-reminder-desc': '目前只會對選取區域進行排序，是否拓展排序範圍？ ',
            'sort-reminder-ext': '拓展排序範圍',
            'sort-reminder-no': '保持所選排序範圍',
            'first-row-check': '標題不參與排序',
            'add-condition': '新增排序條件',
            cancel: '取消',
            confirm: '確認',
        },
    },
};

export default locale;

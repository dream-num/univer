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
    'find-replace': {
        toolbar: '尋找替換',
        shortcut: {
            'open-find-dialog': '開啟尋找對話框',
            'open-replace-dialog': '開啟替換對話框',
            'close-dialog': '關閉查找替換對話框',
            'go-to-next-match': '下一個匹配項',
            'go-to-previous-match': '下一個匹配項',
            'focus-selection': '聚焦選區',
        },
        dialog: {
            title: '找',
            find: '找',
            replace: '替換',
            'replace-all': '替換全部',
            'find-placeholder': '輸入查找內容',
            'advanced-finding': '取代 / 進階查找',
            'replace-placeholder': '輸入替換內容',
            'case-sensitive': '匹配大小寫',
            'match-the-whole-cell': '符合整個儲存格',
            'find-scope': {
                title: '找出範圍',
                'current-sheet': '目前子表',
                workbook: '整個工作簿',
            },
            'find-direction': {
                title: '找出順序',
                column: '按列查找',
                row: '按行查找',
            },
            'find-by': {
                title: '找出方式',
                formula: '找出公式',
                value: '查找值',
            },
            'no-match': '已完成搜索，但是未找到任何匹配項',
            'no-result': '無結果',
        },
        replace: {
            'all-success': '已全部替換 {0} 個匹配項',
            'all-failure': '替換失敗',
            confirm: {
                title: '確定要取代所有的符合項目嗎？ ',
            },
        },
    },
    'find-replace-shortcuts': '尋找替換',
};

export default locale;

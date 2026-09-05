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
import emojiLocale from './emoji-locale/zh-TW.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            document: '文件',
            section: '節',
            paragraph: '段落',
            entity: '物件',
            presentation: '簡報',
            page: '頁面',
            master: '母版檢視',
            base: '多維表格',
            table: '資料表',
            field: '欄位',
            record: '記錄',
            view: '檢視',
            board: '白板',
            objectName: '{0}：{1}',

            search: '搜尋物件',
            empty: '沒有匹配的物件',
            more: '顯示前 100 個物件，請搜尋以缩小範圍。',
            title: '權限設定',
            cancel: '取消',
            save: '儲存',
            saving: '正在儲存…',
            loading: '正在載入…',
            conflict: '權限已被修改，請重新載入后再儲存。',
            error: '无法讀取或儲存權限，已保留你的修改。',
            reload: '重新載入',
            denied: '你沒有管理此物件權限的權限。',
            edit: '誰可以編輯',
            all: '所有文件編輯者',
            owner: '僅物件所有者',
            members: '指定成員',
            copy: '允許編輯者複製',
            print: '允許編輯者列印',
            export: '允許編輯者匯出',
            comment: '允許編輯者評論',
            parentHint: '仍受檔案及上級物件權限的限制。',
        },
        featureSearch: {
            title: '搜尋功能',
            placeholder: '輸入功能或選單名稱…',
            empty: '找不到目前可用的功能',
            ribbon: '功能區',
            contextMenu: '快顯功能表',
        },
        emojiPicker: {
            search: '搜尋',
            random: '隨機表情',
            recents: '最近使用',
            emojis: '表情',
            animals: '動物',
            food: '食物',
            activities: '活動',
            places: '地點',
            objects: '物品',
            symbols: '符號',
            searchResults: '搜尋結果',
            noResults: '找不到表情',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: '數學',
            greek: '希臘字母',
            common: '常用',
        },
        toolbar: {
            heading: {
                normal: '正文',
                title: '標題',
                subTitle: '副標題',
                1: '標題 1',
                2: '標題 2',
                3: '標題 3',
                4: '標題 4',
                5: '標題 5',
            },
        },
        ribbon: {
            start: '開始',
            startDesc: '初始化工作表並設定基本參數。',
            insert: '插入',
            insertDesc: '插入行、列、圖表和各種其他元素。',
            formulas: '公式',
            formulasDesc: '使用函數和公式進行數據計算。',
            data: '資料',
            dataDesc: '管理資料，包括匯入、排序和篩選。',
            view: '視圖',
            viewDesc: '切換視圖模式並調整顯示效果。',
            others: '其他',
            othersDesc: '其他功能和設定。',
            more: '更多',
        },
        fontFamily: {
            'not-supported': '系統中未找到該字體，使用預設字體。',
        },
        'shortcut-panel': {
            title: '快捷鍵面板',
        },
        shortcut: {
            undo: '撤銷',
            redo: '重做',
            cut: '剪切',
            copy: '複製',
            paste: '貼上',
            'shortcut-panel': '開啟收起快捷鍵面板',
        },
        'common-edit': '常用編輯',
        'toggle-shortcut-panel': '開啟收起快速鍵面板',
        navigation: {
            back: '返回',
            previous: '上一個',
            next: '下一個',
        },
        sidebar: {
            panel: '側邊欄',
            resize: '調整側邊欄大小',
            close: '關閉側邊欄',
        },
        beforeClose: {
            title: '部分變更尚未儲存',
        },
        clipboard: {
            authentication: {
                title: '無法存取剪貼簿',
                content: '請允許 Univer 存取您的剪貼簿。 ',
            },
        },
        rangeSelector: {
            cancel: '取消',
        },
        'global-shortcut': '全域快捷鍵',
        row: '列',
        column: '欄',
    },
};

export default locale;

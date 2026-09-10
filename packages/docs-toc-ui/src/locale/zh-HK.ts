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
    'docs-toc-ui': {
        tableOfContents: {
            title: '目錄',
            insertTitle: '插入目錄',
            automaticTitle: '自動目錄',
            customTitle: '自訂目錄…',
            contentsTitle: '目錄',
            levels: '顯示級別',
            showPageNumbers: '顯示頁碼',
            rightAlignPageNumbers: '頁碼靠右對齊',
            tabLeader: '定位點前置字元',
            leaderNone: '無',
            leaderDots: '點線',
            leaderDashes: '短劃線',
            leaderUnderline: '底線',
            format: '格式',
            formatFromTemplate: '來自範本',
            formatClassic: '傳統',
            formatModern: '現代',
            formatSimple: '簡潔',
            preview: '預覽列印',
            previewHeading: '標題',
            noHeadings: '找不到標題。請先套用標題 1–3 樣式，或選擇相符的標題級別。',
            updateTitle: '更新目錄',
            removeTitle: '刪除目錄',
            updatePageNumbersOnly: '只更新頁碼',
            updateEntireTable: '更新整個目錄',
            updateHint: '請選擇 Univer 更新此目錄的方式。',
        },
    },
};

export default locale;

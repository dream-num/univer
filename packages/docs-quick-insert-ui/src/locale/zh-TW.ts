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
    docQuickInsert: {
        menu: {
            numberedList: '有序列表',
            bulletedList: '無序列表',
            divider: '分隔線',
            text: '文本',
            table: '表格',
            image: '圖片',
        },
        group: {
            basics: '基礎',
        },
        placeholder: '無結果',
        keywordInputPlaceholder: '輸入關鍵詞',
    },
};

export default locale;

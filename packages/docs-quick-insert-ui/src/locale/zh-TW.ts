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
            todoList: '待辦事項',
            code: '程式碼',
            image: '圖片',
            table: '表格',
            formula: '公式',
            hyperlink: '超連結',
            comment: '評論',
        },
        group: {
            basics: '基礎',
            media: '媒體',
        },
    },
};

export default locale;

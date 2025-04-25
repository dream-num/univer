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

const enUS: typeof zhCN = {
    threadCommentUI: {
        panel: {
            title: '評論管理',
            empty: '暫無評論',
            filterEmpty: '沒有符合的結果',
            reset: '重置',
            addComment: '新增評論',
            solved: '已解決',
        },
        editor: {
            placeholder: '回覆',
            reply: '回覆',
            cancel: '取消',
            save: '儲存',
        },
        item: {
            edit: '編輯',
            delete: '刪除',
        },
        filter: {
            sheet: {
                all: '所有表格',
                current: '當前表格',
            },
            status: {
                all: '所有評論',
                resolved: '已解決',
                unsolved: '未解決',
                concernMe: '與我有關',
            },
        },
    },
};

export default enUS;

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
            title: 'Comment Management',
            empty: 'No comments yet',
            filterEmpty: 'No match result',
            reset: 'Reset Filter',
            addComment: 'Add Comment',
        },
        editor: {
            placeholder: 'Reply or add others with @',
            reply: 'Comment',
            cancel: 'Cancel',
            save: 'Save',
        },
        item: {
            edit: 'Edit',
            delete: 'Delete This Comment',
        },
        filter: {
            sheet: {
                all: 'All sheet',
                current: 'Current sheet',
            },
            status: {
                all: 'All comments',
                resolved: 'Resolved',
                unsolved: 'Not resolved',
                concernMe: 'Concern me',
            },
        },
    },
};

export default enUS;

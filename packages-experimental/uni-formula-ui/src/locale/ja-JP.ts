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
    'uni-formula': {
        popup: {
            title: {
                new: '新しい数式を作成',
                existing: '数式を編集',
            },
            placeholder: '数式を挿入するか、入力を続けて閉じます...',
            button: {
                confirm: '確定',
                cancel: 'キャンセル',
            },
        },
        command: {
            'stream-placeholder': 'Uni Formula',
        },
    },
};

export default locale;

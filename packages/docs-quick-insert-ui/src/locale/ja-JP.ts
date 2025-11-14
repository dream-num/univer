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
    docQuickInsert: {
        menu: {
            numberedList: '番号付きリスト',
            bulletedList: '箇条書き',
            divider: '区切り線',
            text: 'テキスト',
            table: '表',
            image: '画像',
        },
        group: {
            basics: '基本',
        },
        placeholder: '結果がありません',
        keywordInputPlaceholder: 'キーワードを入力',
    },
};

export default locale;

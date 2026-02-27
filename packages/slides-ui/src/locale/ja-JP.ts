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
    slide: {
        append: 'スライドを追加',

        text: {
            insert: {
                title: 'テキストの挿入',
            },
        },

        shape: {
            insert: {
                title: '図形の挿入',
                rectangle: '四角形を挿入',
                ellipse: '楕円を挿入',
            },
        },

        image: {
            insert: {
                title: '画像の挿入',
                float: 'フローティング画像を挿入',
            },
        },

        popup: {
            edit: '編集',
            delete: '削除',
        },

        sidebar: {
            text: 'テキスト編集',
            shape: '図形編集',
            image: '画像編集',
        },

        panel: {
            fill: {
                title: '塗りつぶしの色',
            },
        },
    },
};

export default locale;

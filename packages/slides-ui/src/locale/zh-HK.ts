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
    'slides-ui': {
        append: '新增投影片',

        text: {
            insert: {
                title: '插入文字',
            },
        },

        shape: {
            insert: {
                title: '插入圖形',
                rectangle: '插入矩形',
                ellipse: '插入橢圓',
            },
        },

        image: {
            insert: {
                title: '插入圖片',
                float: '插入浮動圖片',
            },
        },

        popup: {
            edit: '編輯',
            delete: '刪除',
        },

        sidebar: {
            text: '編輯文字',
            shape: '編輯圖形',
            image: '編輯圖片',
        },

        'image-panel': {
            arrange: {
                title: '排列',
                forward: '上移一層',
                backward: '下移一層',
                front: '至頂',
                back: '至底',
            },
            transform: {
                title: '變換',
                width: '寬度 (px)',
                height: '高度 (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: '旋轉 (°)',
            },
        },
        panel: {
            fill: {
                title: '填色',
            },
        },
    },
};

export default locale;

/**
 * Copyright 2023-present DreamNum Inc.
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
    slide: {
        append: 'Append Slide',

        text: {
            insert: {
                title: 'Insert Text',
            },
        },

        shape: {
            insert: {
                title: 'Insert Shape',
                rectangle: 'Insert Rectangle',
            },
        },

        image: {
            insert: {
                title: 'Insert Image',
                float: 'Insert Float Image',
            },
        },

        popup: {
            edit: 'Edit',
            delete: 'Delete',
        },

        sidebar: {
            text: 'Edit Text',
            shape: 'Edit Shape',
            image: 'Edit Image',
        },

        panel: {
            fill: {
                title: 'Fill Color',
            },
        },
    },
};

export default locale;

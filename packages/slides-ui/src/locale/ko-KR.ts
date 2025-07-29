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
        append: '슬라이드 추가',

        text: {
            insert: {
                title: '텍스트 삽입',
            },
        },

        shape: {
            insert: {
                title: '도형 삽입',
                rectangle: '사각형 삽입',
                ellipse: '타원 삽입',
            },
        },

        image: {
            insert: {
                title: '이미지 삽입',
                float: '플로팅 이미지 삽입',
            },
        },

        popup: {
            edit: '편집',
            delete: '삭제',
        },

        sidebar: {
            text: '텍스트 편집',
            shape: '도형 편집',
            image: '이미지 편집',
        },

        panel: {
            fill: {
                title: '채우기 색상',
            },
        },
    },
};

export default locale;

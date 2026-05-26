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
        append: 'Dodaj slajd',

        text: {
            insert: {
                title: 'Wstaw tekst',
            },
        },

        shape: {
            insert: {
                title: 'Wstaw kształt',
                rectangle: 'Wstaw prostokąt',
                ellipse: 'Wstaw elipsę',
            },
        },

        image: {
            insert: {
                title: 'Wstaw obraz',
                float: 'Wstaw obraz swobodny',
            },
        },

        popup: {
            edit: 'Edytuj',
            delete: 'Usuń',
        },

        sidebar: {
            text: 'Edytuj tekst',
            shape: 'Edytuj kształt',
            image: 'Edytuj obraz',
        },

        'image-panel': {
            arrange: {
                title: 'Rozmieść',
                forward: 'Przesuń do przodu',
                backward: 'Przesuń do tyłu',
                front: 'Przesuń na wierzch',
                back: 'Przesuń na spód',
            },
            transform: {
                title: 'Przekształć',
                width: 'Szerokość (px)',
                height: 'Wysokość (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Obrót (°)',
            },
        },
        panel: {
            fill: {
                title: 'Kolor wypełnienia',
            },
        },
    },
};

export default locale;

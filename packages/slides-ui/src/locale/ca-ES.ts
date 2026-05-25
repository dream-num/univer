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
        append: 'Afegeix diapositiva',

        text: {
            insert: {
                title: 'Insereix text',
            },
        },

        shape: {
            insert: {
                title: 'Insereix forma',
                rectangle: 'Insereix rectangle',
                ellipse: 'Insereix el·lipse',
            },
        },

        image: {
            insert: {
                title: 'Insereix imatge',
                float: 'Insereix imatge flotant',
            },
        },

        popup: {
            edit: 'Edita',
            delete: 'Elimina',
        },

        sidebar: {
            text: 'Edita text',
            shape: 'Edita forma',
            image: 'Edita imatge',
        },

        'image-panel': {
            arrange: {
                title: 'Organitza',
                forward: 'Porta endavant',
                backward: 'Envia enrere',
                front: 'Porta al davant',
                back: 'Envia al fons',
            },
            transform: {
                title: 'Transforma',
                width: 'Amplada (px)',
                height: 'Alçada (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Gira (°)',
            },
        },
        panel: {
            fill: {
                title: 'Color de farciment',
            },
        },
    },
};

export default locale;

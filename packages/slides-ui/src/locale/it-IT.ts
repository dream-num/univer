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
        append: 'Aggiungi Diapositiva',

        text: {
            insert: {
                title: 'Inserisci Testo',
            },
        },

        shape: {
            insert: {
                title: 'Inserisci Forma',
                rectangle: 'Inserisci Rettangolo',
                ellipse: 'Inserisci Ellisse',
            },
        },

        image: {
            insert: {
                title: 'Inserisci Immagine',
                float: 'Inserisci Immagine Fluttuante',
            },
        },

        popup: {
            edit: 'Modifica',
            delete: 'Elimina',
        },

        sidebar: {
            text: 'Modifica Testo',
            shape: 'Modifica Forma',
            image: 'Modifica Immagine',
        },

        'image-panel': {
            arrange: {
                title: 'Disposizione',
                forward: 'Porta Avanti',
                backward: 'Manda Indietro',
                front: 'Porta in Primo Piano',
                back: 'Manda in Secondo Piano',
            },
            transform: {
                title: 'Trasforma',
                width: 'Larghezza (px)',
                height: 'Altezza (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Ruota (°)',
            },
        },
        panel: {
            fill: {
                title: 'Colore Riempimento',
            },
        },
    },
};

export default locale;

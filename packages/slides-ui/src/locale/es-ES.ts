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
        append: 'Añadir diapositiva',

        text: {
            insert: {
                title: 'Insertar texto',
            },
        },

        shape: {
            insert: {
                title: 'Insertar forma',
                rectangle: 'Insertar rectángulo',
                ellipse: 'Insertar elipse',
            },
        },

        image: {
            insert: {
                title: 'Insertar imagen',
                float: 'Insertar imagen flotante',
            },
        },

        popup: {
            edit: 'Editar',
            delete: 'Eliminar',
        },

        sidebar: {
            text: 'Editar texto',
            shape: 'Editar forma',
            image: 'Editar imagen',
        },

        'image-panel': {
            arrange: {
                title: 'Organizar',
                forward: 'Traer adelante',
                backward: 'Enviar atrás',
                front: 'Traer al frente',
                back: 'Enviar al fondo',
            },
            transform: {
                title: 'Transformar',
                width: 'Ancho (px)',
                height: 'Alto (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Rotar (°)',
            },
        },
        panel: {
            fill: {
                title: 'Color de relleno',
            },
        },
    },
};

export default locale;

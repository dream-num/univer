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
        append: 'Adicionar Slide',

        text: {
            insert: {
                title: 'Inserir Texto',
            },
        },

        shape: {
            insert: {
                title: 'Inserir Forma',
                rectangle: 'Inserir Retângulo',
                ellipse: 'Inserir Elipse',
            },
        },

        image: {
            insert: {
                title: 'Inserir Imagem',
                float: 'Inserir Imagem Flutuante',
            },
        },

        popup: {
            edit: 'Editar',
            delete: 'Excluir',
        },

        sidebar: {
            text: 'Editar Texto',
            shape: 'Editar Forma',
            image: 'Editar Imagem',
        },

        'image-panel': {
            arrange: {
                title: 'Organizar',
                forward: 'Trazer para Frente',
                backward: 'Enviar para Trás',
                front: 'Trazer para a Frente',
                back: 'Enviar para Trás',
            },
            transform: {
                title: 'Transformar',
                width: 'Largura (px)',
                height: 'Altura (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Rotacionar (°)',
            },
        },
        panel: {
            fill: {
                title: 'Cor de Preenchimento',
            },
        },
    },
};

export default locale;

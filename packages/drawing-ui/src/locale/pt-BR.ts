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
    'drawing-ui': {
        'image-cropper': {
            error: 'Não é possível cortar objetos que não são imagens.',
        },
        'image-panel': {
            arrange: {
                title: 'Organizar',
                forward: 'Trazer para frente',
                backward: 'Enviar para trás',
                front: 'Trazer para a frente',
                back: 'Enviar para trás',
            },
            transform: {
                title: 'Transformar',
                rotate: 'Girar (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Largura (px)',
                height: 'Altura (px)',
                lock: 'Bloquear proporção (%)',
            },
            crop: {
                title: 'Cortar',
                start: 'Iniciar corte',
                mode: 'Livre',
            },
            group: {
                title: 'Agrupar',
                group: 'Agrupar',
                unGroup: 'Desagrupar',
            },
            align: {
                title: 'Alinhar',
                default: 'Selecionar tipo de alinhamento',
                left: 'Alinhar à esquerda',
                center: 'Alinhar ao centro',
                right: 'Alinhar à direita',
                top: 'Alinhar ao topo',
                middle: 'Alinhar ao meio',
                bottom: 'Alinhar à base',
                horizon: 'Distribuir horizontalmente',
                vertical: 'Distribuir verticalmente',
            },
            null: 'Nenhum objeto selecionado',
        },
        shortcut: {
            'drawing-move-down': 'Mover desenho para baixo',
            'drawing-move-up': 'Mover desenho para cima',
            'drawing-move-left': 'Mover desenho para esquerda',
            'drawing-move-right': 'Mover desenho para direita',
            'drawing-delete': 'Excluir desenho',
        },
    },
};

export default locale;

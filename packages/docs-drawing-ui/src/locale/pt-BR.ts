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
    'docs-drawing-ui': {
        title: 'Imagem',
        upload: {
            float: 'Inserir imagem',
        },
        shape: {
            insert: {
                title: 'Inserir Forma',
                rectangle: 'Inserir Retângulo',
                ellipse: 'Inserir Elipse',
            },
        },
        panel: {
            title: 'Editar imagem',
        },
        'image-popup': {
            replace: 'Substituir',
            delete: 'Excluir',
            edit: 'Editar',
            crop: 'Cortar',
            reset: 'Redefinir tamanho',
        },
        'image-text-wrap': {
            title: 'Quebra de texto',
            wrappingStyle: 'Estilo de quebra',
            square: 'Quadrado',
            topAndBottom: 'Superior e inferior',
            inline: 'Em linha com o texto',
            behindText: 'Atrás do texto',
            inFrontText: 'À frente do texto',
            wrapText: 'Quebrar texto automaticamente',
            bothSide: 'Ambos os lados',
            leftOnly: 'Somente esquerda',
            rightOnly: 'Somente direita',
            distanceFromText: 'Distância do texto',
            top: 'Superior(px)',
            left: 'Esquerda(px)',
            bottom: 'Inferior(px)',
            right: 'Direita(px)',
        },
        'image-position': {
            title: 'Posição',
            horizontal: 'Horizontal',
            vertical: 'Vertical',
            absolutePosition: 'Posição absoluta(px)',
            relativePosition: 'Posição relativa',
            toTheRightOf: 'à direita de',
            relativeTo: 'relativo a',
            bellow: 'abaixo',
            options: 'Opções',
            moveObjectWithText: 'Mover objeto com o texto',
            column: 'Coluna',
            margin: 'Margem',
            page: 'Página',
            line: 'Linha',
            paragraph: 'Parágrafo',
        },
        'update-status': {
            exceedMaxSize: 'O tamanho da imagem excede o limite, o limite é {0}M',
            invalidImageType: 'Tipo de imagem inválido',
            exceedMaxCount: 'Apenas {0} imagens podem ser enviadas de cada vez',
            invalidImage: 'Imagem inválida',
        },
        shortcut: {
            'drawing-view': 'Visualização do desenho',
            'drawing-move-down': 'Mover desenho para baixo',
            'drawing-move-up': 'Mover desenho para cima',
            'drawing-move-left': 'Mover desenho para esquerda',
            'drawing-move-right': 'Mover desenho para direita',
            'drawing-delete': 'Excluir desenho',
        },
    },
};

export default locale;

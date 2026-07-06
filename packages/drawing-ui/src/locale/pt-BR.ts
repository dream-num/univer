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
        objectListPanel: {
            title: 'Objetos',
            empty: 'Nenhum objeto',
            showAll: 'Mostrar tudo',
            hideAll: 'Ocultar tudo',
            moveForward: 'Trazer para frente',
            moveBackward: 'Enviar para tras',
            close: 'Fechar',
            show: 'Mostrar',
            hide: 'Ocultar',
            lock: 'Bloquear',
            unlock: 'Desbloquear',
            name: 'Nome',
            nameInput: 'Nome do objeto',
            description: 'Descricao',
            descriptionPlaceholder: 'Adicionar descricao',
            details: 'Detalhes',
            locate: 'Localizar',
            expand: 'Expandir',
            collapse: 'Recolher',
            dragToReorder: 'Arraste para reordenar',
            search: 'Pesquisar objetos',
            filterAll: 'Todos',
            filterHidden: 'Ocultos',
            filterLocked: 'Bloqueados',
            sectionCanvas: 'Camada da tela',
            sectionFloating: 'Camada flutuante',
            typeNames: {
                object: 'Objeto',
                shape: 'Forma',
                connector: 'Conector',
                image: 'Imagem',
                chart: 'Gráfico',
                table: 'Tabela',
                smartArt: 'SmartArt',
                video: 'Vídeo',
                group: 'Grupo',
                unit: 'Unidade',
                dom: 'DOM',
                text: 'Texto',
                placeholder: 'Espaço reservado',
                container: 'Contêiner',
            },
            noSelection: 'Selecione um objeto para editar seus detalhes',
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
        'image-popup': {
            replace: 'Substituir',
            delete: 'Excluir',
            edit: 'Editar',
            crop: 'Cortar',
            reset: 'Redefinir tamanho',
        },
    },
};

export default locale;

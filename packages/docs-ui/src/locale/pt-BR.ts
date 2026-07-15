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
    'docs-ui': {
        toolbar: {
            undo: 'Desfazer',
            redo: 'Refazer',
            font: 'Fonte',
            fontSize: 'Tamanho da fonte',
            bold: 'Negrito',
            italic: 'Itálico',
            strikethrough: 'Tachado',
            subscript: 'Subscrito',
            superscript: 'Sobrescrito',
            underline: 'Sublinhado',
            textColor: {
                main: 'Cor do texto',
            },
            fillColor: {
                main: 'Cor de fundo do texto',
            },
            table: {
                main: 'Tabela',
                insert: 'Inserir tabela',
                colCount: 'Número de colunas',
                rowCount: 'Número de linhas',
            },
            resetColor: 'Redefinir',
            order: 'Lista ordenada',
            unorder: 'Lista não ordenada',
            checklist: 'Lista de tarefas',
            documentFlavor: 'Modo Moderno',
            alignLeft: 'Alinhar à esquerda',
            alignCenter: 'Alinhar ao centro',
            alignRight: 'Alinhar à direita',
            alignJustify: 'Justificar',
            horizontalLine: 'Linha horizontal',
            headerFooter: 'Cabeçalho e rodapé',
            pageSetup: 'Configurar página',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'Inserir',
            insertRowAbove: 'Inserir linha acima',
            insertRowBelow: 'Inserir linha abaixo',
            insertColumnLeft: 'Inserir coluna à esquerda',
            insertColumnRight: 'Inserir coluna à direita',
            delete: 'Excluir tabela',
            deleteRows: 'Excluir linha',
            deleteColumns: 'Excluir coluna',
            deleteTable: 'Excluir tabela',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Cabeçalho',
            footer: 'Rodapé',
            panel: 'Configurações de cabeçalho e rodapé',
            firstPageCheckBox: 'Primeira página diferente',
            oddEvenCheckBox: 'Páginas ímpares e pares diferentes',
            headerTopMargin: 'Margem superior do cabeçalho (px)',
            footerBottomMargin: 'Margem inferior do rodapé (px)',
            closeHeaderFooter: 'Fechar cabeçalho e rodapé',
            disableText: 'As configurações de cabeçalho e rodapé estão desativadas',
        },
        placeholder: {
            heading1: 'Título 1',
            heading2: 'Título 2',
            heading3: 'Título 3',
            heading4: 'Título 4',
            heading5: 'Título 5',
            normalText: 'Digite o texto ou pressione "/" para usar comandos',
            listItem: 'Item',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Arrastar bloco',
            },

            menu: {
                paragraphSetting: 'Configurações de parágrafo',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Configurações de parágrafo',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Alinhamento',
                indentation: 'Recuo',
                left: 'Esquerda',
                right: 'Direita',
                firstLine: 'Primeira linha',
                hanging: 'Recuo negativo',
                spacing: 'Espaçamento',
                before: 'Antes',
                after: 'Depois',
                lineSpace: 'Espaçamento entre linhas',
                multiSpace: 'Espaçamento múltiplo',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Valor fixo (px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'Copiar',
            cut: 'Recortar',
            paste: 'Colar',
            delete: 'Excluir',
            bulletList: 'Lista com marcadores',
            orderList: 'Lista ordenada',
            checkList: 'Lista de tarefas',
            insertBellow: 'Inserir abaixo',
        },
        paragraphMenu: {
            alignAndIndent: 'Alinhamento e recuo',
            align: 'Alinhamento',
            indent: 'Recuo',
            color: 'Cores',
            increase: 'Aumentar',
            decrease: 'Diminuir',
            increaseIndent: 'Aumentar recuo',
            decreaseIndent: 'Diminuir recuo',
            defaultTextColor: 'Cor de texto padrão',
            noBackground: 'Sem plano de fundo',
        },
        'page-settings': {
            'document-setting': 'Configuração do documento',
            mode: 'Modo',
            'modern-mode': 'Moderno',
            'classic-mode': 'Clássico',
            'modern-width': 'Largura do conteúdo',
            'modern-width-narrow': 'Estreito',
            'modern-width-medium': 'Médio',
            'modern-width-wide': 'Amplo',
            'paper-size': 'Tamanho do papel',
            'page-size': {
                main: 'Tamanho do papel',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Letter',
                legal: 'Legal',
                tabloid: 'Tabloid',
                statement: 'Statement',
                executive: 'Executive',
                folio: 'Folio',
            },
            orientation: 'Orientação',
            portrait: 'Retrato',
            landscape: 'Paisagem',
            'custom-paper-size': 'Tamanho de papel personalizado',
            top: 'Superior',
            bottom: 'Inferior',
            left: 'Esquerda',
            right: 'Direita',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
    },
};

export default locale;

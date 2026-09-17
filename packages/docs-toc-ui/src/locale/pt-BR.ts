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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'Sumário',
            insertTitle: 'Sumário',
            automaticTitle: 'Sumário automático',
            customTitle: 'Sumário personalizado…',
            contentsTitle: 'Sumário',
            levels: 'Mostrar níveis',
            showPageNumbers: 'Mostrar números de página',
            rightAlignPageNumbers: 'Alinhar números de página à direita',
            tabLeader: 'Preenchimento de tabulação',
            leaderNone: 'Nenhum',
            leaderDots: 'Pontos',
            leaderDashes: 'Traços',
            leaderUnderline: 'Sublinhado',
            format: 'Formatos',
            formatFromTemplate: 'Do modelo',
            formatClassic: 'Clássico',
            formatModern: 'Moderno',
            formatSimple: 'Simples',
            preview: 'Visualização de impressão',
            previewHeading: 'Título',
            noHeadings: 'Nenhum título encontrado. Aplique os estilos Título 1–3 ou escolha os níveis correspondentes.',
            updateTitle: 'Atualizar sumário',
            removeTitle: 'Remover sumário',
            updatePageNumbersOnly: 'Atualizar apenas os números de página',
            updateEntireTable: 'Atualizar o sumário inteiro',
            updateHint: 'Escolha como atualizar este sumário.',
        },
    },
};

export default locale;

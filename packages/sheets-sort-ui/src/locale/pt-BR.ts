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
    'sheets-sort-ui': {
        general: {
            sort: 'Ordenar',
            'sort-asc': 'Crescente',
            'sort-desc': 'Decrescente',
            'sort-custom': 'Ordenação Personalizada',
            'sort-asc-ext': 'Expandir Crescente',
            'sort-desc-ext': 'Expandir Decrescente',
            'sort-asc-cur': 'Crescente',
            'sort-desc-cur': 'Decrescente',
        },
        error: {
            'merge-size': 'O intervalo selecionado contém células mescladas de tamanhos diferentes e não pode ser ordenado.',
            empty: 'O intervalo selecionado não tem conteúdo e não pode ser ordenado.',
            single: 'O intervalo selecionado tem apenas uma linha e não pode ser ordenado.',
            'formula-array': 'O intervalo selecionado possui fórmulas de matriz e não pode ser ordenado.',
        },
        dialog: {
            'sort-reminder': 'Lembrete de Ordenação',
            'sort-reminder-desc': 'Expandir a ordenação do intervalo ou manter a ordenação do intervalo?',
            'sort-reminder-ext': 'Expandir ordenação do intervalo',
            'sort-reminder-no': 'Manter ordenação do intervalo',
            'first-row-check': 'A primeira linha não participa da ordenação',
            'add-condition': 'Adicionar condição',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
        info: {
            tooltip: 'Dica',
        },
    },
};

export default locale;

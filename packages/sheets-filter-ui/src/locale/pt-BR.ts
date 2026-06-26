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
    'sheets-filter-ui': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Alternar Filtro',
            'clear-filter-criteria': 'Limpar Condições de Filtro',
            're-calc-filter-conditions': 'Recalcular Condições de Filtro',
        },
        shortcut: {
            'smart-toggle-filter': 'Alternar Filtro',
        },
        permission: {
            filterErr: 'Você não tem permissão para usar o filtro.',
        },
        panel: {
            'clear-filter': 'Limpar Filtro',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            'by-values': 'Por Valores',
            'by-colors': 'Por Cores',
            'filter-by-cell-fill-color': 'Filtrar por cor de preenchimento da célula',
            'filter-by-cell-text-color': 'Filtrar por cor do texto da célula',
            'filter-by-color-none': 'A coluna contém apenas uma cor',
            'by-conditions': 'Por Condições',
            'filter-only': 'Apenas Filtrar',
            'search-placeholder': 'Use espaço para separar palavras-chave',
            'select-all': 'Selecionar Todos',
            'input-values-placeholder': 'Inserir Valores',
            and: 'E',
            or: 'OU',
            empty: '(vazio)',
            '?': 'Use "?" para representar um único caractere.',
            '*': 'Use "*" para representar vários caracteres.',
        },
        conditions: {
            none: 'Nenhum',
            empty: 'Está Vazio',
            'not-empty': 'Não Está Vazio',
            'text-contains': 'O Texto Contém',
            'does-not-contain': 'O Texto Não Contém',
            'starts-with': 'O Texto Começa Com',
            'ends-with': 'O Texto Termina Com',
            equals: 'O Texto É Igual A',
            'greater-than': 'Maior Que',
            'greater-than-or-equal': 'Maior Ou Igual A',
            'less-than': 'Menor Que',
            'less-than-or-equal': 'Menor Ou Igual A',
            equal: 'Igual',
            'not-equal': 'Diferente',
            between: 'Entre',
            'not-between': 'Não Está Entre',
            custom: 'Personalizado',
        },
        date: {
            1: 'Janeiro',
            2: 'Fevereiro',
            3: 'Março',
            4: 'Abril',
            5: 'Maio',
            6: 'Junho',
            7: 'Julho',
            8: 'Agosto',
            9: 'Setembro',
            10: 'Outubro',
            11: 'Novembro',
            12: 'Dezembro',
        },
        sync: {
            title: 'O filtro é visível para todos',
            statusTips: {
                on: 'Uma vez ativado, todos os colaboradores verão os resultados do filtro',
                off: 'Uma vez desativado, apenas você verá os resultados do filtro',
            },
            switchTips: {
                on: '"O filtro é visível para todos" está ativado, todos os colaboradores verão os resultados do filtro',
                off: '"O filtro é visível para todos" está desativado, apenas você verá os resultados do filtro',
            },
        },
    },
};

export default locale;

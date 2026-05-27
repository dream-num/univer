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
    'sheets-table-ui': {
        title: 'Tabela',
        selectRange: 'Selecionar Intervalo da Tabela',
        rename: 'Renomear Tabela',
        renamePlaceholder: 'Digite o nome da tabela',
        updateRange: 'Atualizar Intervalo da Tabela',
        tableRangeWithMergeError: 'O intervalo da tabela não pode sobrepor células mescladas',
        tableRangeWithOtherTableError: 'O intervalo da tabela não pode sobrepor outras tabelas',
        tableRangeSingleRowError: 'O intervalo da tabela não pode ser uma única linha',
        updateError: 'Não é possível definir o intervalo da tabela para uma área que não se sobreponha à original e não esteja na mesma linha',
        tableStyle: 'Estilo da Tabela',
        defaultStyle: 'Estilo Padrão',
        customStyle: 'Estilo Personalizado',
        customTooMore: 'O número de temas personalizados excede o limite máximo. Exclua alguns temas desnecessários e adicione-os novamente',
        setTheme: 'Definir Tema da Tabela',
        removeTable: 'Remover Tabela',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        header: 'Cabeçalho',
        footer: 'Rodapé',
        firstLine: 'Primeira Linha',
        secondLine: 'Segunda Linha',
        columnPrefix: 'Coluna',
        tablePrefix: 'Tabela',
        tableNameError: 'O nome da tabela não pode conter espaços, não pode começar com um número e não pode ser idêntico ao nome de uma tabela existente',
        columnMenu: {
            'insert-left': 'Inserir 1 coluna à esquerda',
            'insert-right': 'Inserir 1 coluna à direita',
            delete: 'Excluir coluna da tabela',
        },

        sort: {
            'sort-asc': 'Crescente',
            'sort-desc': 'Decrescente',
        },

        insert: {
            main: 'Inserir Tabela',
            row: 'Inserir Linha na Tabela',
            col: 'Inserir Coluna na Tabela',
        },

        remove: {
            main: 'Remover Tabela',
            row: 'Remover Linha da Tabela',
            col: 'Remover Coluna da Tabela',
        },
        condition: {
            string: 'Texto',
            number: 'Número',
            date: 'Data',

            empty: '(Vazio)',
        },
        string: {
            compare: {
                equal: 'Igual a',
                notEqual: 'Diferente de',
                contains: 'Contém',
                notContains: 'Não contém',
                startsWith: 'Começa com',
                endsWith: 'Termina com',
            },
        },
        number: {
            compare: {
                equal: 'Igual a',
                notEqual: 'Diferente de',
                greaterThan: 'Maior que',
                greaterThanOrEqual: 'Maior ou igual a',
                lessThan: 'Menor que',
                lessThanOrEqual: 'Menor ou igual a',
                between: 'Entre',
                notBetween: 'Não está entre',
                above: 'Acima',
                below: 'Abaixo',
                topN: 'Superior {0}',
            },
        },
        date: {
            compare: {
                equal: 'Igual a',
                notEqual: 'Diferente de',
                after: 'Depois',
                afterOrEqual: 'Depois ou igual a',
                before: 'Antes',
                beforeOrEqual: 'Antes ou igual a',
                between: 'Entre',
                notBetween: 'Não está entre',
                today: 'Hoje',
                yesterday: 'Ontem',
                tomorrow: 'Amanhã',
                thisWeek: 'Esta semana',
                lastWeek: 'Semana passada',
                nextWeek: 'Próxima semana',
                thisMonth: 'Este mês',
                lastMonth: 'Mês passado',
                nextMonth: 'Próximo mês',
                thisQuarter: 'Este trimestre',
                lastQuarter: 'Trimestre passado',
                nextQuarter: 'Próximo trimestre',
                thisYear: 'Este ano',
                nextYear: 'Próximo ano',
                lastYear: 'Ano passado',
                quarter: 'Por trimestre',
                month: 'Por mês',
                q1: 'Primeiro trimestre',
                q2: 'Segundo trimestre',
                q3: 'Terceiro trimestre',
                q4: 'Quarto trimestre',
                m1: 'Janeiro',
                m2: 'Fevereiro',
                m3: 'Março',
                m4: 'Abril',
                m5: 'Maio',
                m6: 'Junho',
                m7: 'Julho',
                m8: 'Agosto',
                m9: 'Setembro',
                m10: 'Outubro',
                m11: 'Novembro',
                m12: 'Dezembro',
            },
        },
        filter: {
            'by-values': 'Por Valores',
            'by-conditions': 'Por Condições',
            'clear-filter': 'Limpar Filtro',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            'search-placeholder': 'Use espaço para separar palavras-chave',
            'select-all': 'Selecionar Tudo',
        },
    },
};

export default locale;

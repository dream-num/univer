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
    'sheets-conditional-formatting-ui': {
        title: 'Formatação Condicional',
        menu: {
            manageConditionalFormatting: 'Gerenciar Formatação Condicional',
            createConditionalFormatting: 'Criar Formatação Condicional',
            clearRangeRules: 'Limpar Regras do Intervalo Selecionado',
            clearWorkSheetRules: 'Limpar Regras da Planilha Inteira',

        },
        form: {
            lessThan: 'O valor deve ser menor que {0}',
            lessThanOrEqual: 'O valor deve ser menor ou igual a {0}',
            greaterThan: 'O valor deve ser maior que {0}',
            greaterThanOrEqual: 'O valor deve ser maior ou igual a {0}',
            rangeSelector: 'Selecione o Intervalo ou Digite o Valor',
        },
        iconSet: {
            direction: 'Direção',
            shape: 'Forma',
            mark: 'Marca',
            rank: 'Classificação',
            rule: 'Regra',
            icon: 'Ícone',
            type: 'Tipo',
            value: 'Valor',
            reverseIconOrder: 'Inverter Ordem dos Ícones',
            and: 'E',
            when: 'Quando',
            onlyShowIcon: 'Mostrar Apenas Ícone',
            noCellIcon: 'Sem ícone de célula',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'Criar Regra',
            clear: 'Limpar Todas as Regras',
            range: 'Aplicar ao Intervalo',
            styleType: 'Tipo de Estilo',
            submit: 'Aplicar',
            cancel: 'Cancelar',
            rankAndAverage: 'Superior/Inferior/Média',
            styleRule: 'Regra de Estilo',
            isNotBottom: 'Superior',
            isBottom: 'Inferior',
            greaterThanAverage: 'Maior que a Média',
            lessThanAverage: 'Menor que a Média',
            medianValue: 'Valor Mediano',
            fillType: 'Tipo de Preenchimento',
            pureColor: 'Cor Sólida',
            gradient: 'Gradiente',
            colorSet: 'Conjunto de Cores',
            positive: 'Positivo',
            native: 'Negativo',
            workSheet: 'Planilha Inteira',
            selectedRange: 'Intervalo Selecionado',
            managerRuleSelect: 'Gerenciar Regras de {0}',
            onlyShowDataBar: 'Mostrar Apenas Barras de Dados',
        },
        preview: {
            describe: {
                beginsWith: 'Começa com {0}',
                endsWith: 'Termina com {0}',
                containsText: 'O texto contém {0}',
                notContainsText: 'O texto não contém {0}',
                equal: 'Igual a {0}',
                notEqual: 'Diferente de {0}',
                containsBlanks: 'Contém Em Branco',
                notContainsBlanks: 'Não Contém Em Branco',
                containsErrors: 'Contém Erros',
                notContainsErrors: 'Não Contém Erros',
                greaterThan: 'Maior que {0}',
                greaterThanOrEqual: 'Maior ou igual a {0}',
                lessThan: 'Menor que {0}',
                lessThanOrEqual: 'Menor ou igual a {0}',
                notBetween: 'Não está entre {0} e {1}',
                between: 'Entre {0} e {1}',
                yesterday: 'Ontem',
                tomorrow: 'Amanhã',
                last7Days: 'Últimos 7 Dias',
                thisMonth: 'Este Mês',
                lastMonth: 'Mês Passado',
                nextMonth: 'Próximo Mês',
                thisWeek: 'Esta Semana',
                lastWeek: 'Semana Passada',
                nextWeek: 'Próxima Semana',
                today: 'Hoje',
                topN: 'Superior {0}',
                bottomN: 'Inferior {0}',
                topNPercent: 'Superior {0}%',
                bottomNPercent: 'Inferior {0}%',
            },
        },
        operator: {
            beginsWith: 'Começa com',
            endsWith: 'Termina com',
            containsText: 'O texto contém',
            notContainsText: 'O texto não contém',
            equal: 'Igual a',
            notEqual: 'Diferente de',
            containsBlanks: 'Contém Em Branco',
            notContainsBlanks: 'Não Contém Em Branco',
            containsErrors: 'Contém Erros',
            notContainsErrors: 'Não Contém Erros',
            greaterThan: 'Maior que',
            greaterThanOrEqual: 'Maior ou igual a',
            lessThan: 'Menor que',
            lessThanOrEqual: 'Menor ou igual a',
            notBetween: 'Não está entre',
            between: 'Entre',
            yesterday: 'Ontem',
            tomorrow: 'Amanhã',
            last7Days: 'Últimos 7 Dias',
            thisMonth: 'Este Mês',
            lastMonth: 'Mês Passado',
            nextMonth: 'Próximo Mês',
            thisWeek: 'Esta Semana',
            lastWeek: 'Semana Passada',
            nextWeek: 'Próxima Semana',
            today: 'Hoje',
        },
        ruleType: {
            highlightCell: 'Realçar Célula',
            dataBar: 'Barra de Dados',
            colorScale: 'Escala de Cores',
            formula: 'Fórmula Personalizada',
            iconSet: 'Conjunto de Ícones',
            duplicateValues: 'Valores Duplicados',
            uniqueValues: 'Valores Únicos',
        },
        subRuleType: {
            uniqueValues: 'Valores Únicos',
            duplicateValues: 'Valores Duplicados',
            rank: 'Classificação',
            text: 'Texto',
            timePeriod: 'Período',
            number: 'Número',
            average: 'Média',
        },
        valueType: {
            num: 'Número',
            min: 'Mínimo',
            max: 'Máximo',
            percent: 'Porcentagem',
            percentile: 'Percentil',
            formula: 'Fórmula',
            none: 'Nenhum',
        },
        errorMessage: {
            notBlank: 'A condição não pode estar vazia',
            formulaError: 'Fórmula incorreta',
            rangeError: 'Seleção inválida',
        },
        permission: {
            dialog: {
                setStyleErr: 'O intervalo está protegido e você não tem permissão para definir estilos. Para definir estilos, entre em contato com o criador.',
            },
        },
    },
};

export default locale;

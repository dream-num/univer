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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Soma Rápida',
        },

        insert: {
            tooltip: 'Funções',
            common: 'Funções Comuns',
        },
        prompt: {
            helpExample: 'EXEMPLO',
            helpAbstract: 'SOBRE',
            required: 'Obrigatório.',
            optional: 'Opcional.',
        },
        error: {
            title: 'Erro',
            divByZero: 'Erro de divisão por zero',
            name: 'Erro de nome inválido',
            value: 'Erro no valor',
            num: 'Erro numérico',
            na: 'Erro de valor não disponível',
            cycle: 'Erro de referência circular',
            ref: 'Erro de referência de célula inválida',
            spill: 'O intervalo de derramamento não está em branco',
            calc: 'Erro de cálculo',
            error: 'Erro',
            connect: 'Obtendo dados',
            null: 'Erro Nulo',
        },

        functionType: {
            financial: 'Financeira',
            date: 'Data e Hora',
            math: 'Matemática e Trigonométrica',
            statistical: 'Estatística',
            lookup: 'Procura e Referência',
            database: 'Banco de Dados',
            text: 'Texto',
            logical: 'Lógica',
            information: 'Informação',
            engineering: 'Engenharia',
            cube: 'Cubo',
            compatibility: 'Compatibilidade',
            web: 'Web',
            array: 'Matriz',
            univer: 'Univer',
            user: 'Definida pelo Usuário',
            definedname: 'Nome Definido',
        },
        moreFunctions: {
            confirm: 'Confirmar',
            prev: 'Anterior',
            next: 'Próxima',
            searchFunctionPlaceholder: 'Pesquisar função',
            allFunctions: 'Todas as Funções',
            syntax: 'SINTAXE',
        },
        operation: {
            copyFormulaOnly: 'Copiar Apenas Fórmula',
            pasteFormula: 'Colar Fórmula',
        },

        rangeSelector: {
            title: 'Selecionar um intervalo de dados',
            addAnotherRange: 'Adicionar intervalo',
            buttonTooltip: 'Selecionar intervalo de dados',
            placeHolder: 'Selecione o intervalo ou digite.',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
        },
    },
};

export default locale;

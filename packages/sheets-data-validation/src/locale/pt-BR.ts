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
    'sheets-data-validation': {
        operators: {
            between: 'entre',
            greaterThan: 'maior que',
            greaterThanOrEqual: 'maior ou igual',
            lessThan: 'menor que',
            lessThanOrEqual: 'menor ou igual',
            equal: 'igual',
            notEqual: 'diferente',
            notBetween: 'não está entre',
            legal: 'é tipo válido',
        },
        ruleName: {
            between: 'Está entre {FORMULA1} e {FORMULA2}',
            greaterThan: 'É maior que {FORMULA1}',
            greaterThanOrEqual: 'É maior ou igual a {FORMULA1}',
            lessThan: 'É menor que {FORMULA1}',
            lessThanOrEqual: 'É menor ou igual a {FORMULA1}',
            equal: 'É igual a {FORMULA1}',
            notEqual: 'É diferente de {FORMULA1}',
            notBetween: 'Não está entre {FORMULA1} e {FORMULA2}',
            legal: 'É um {TYPE} válido',
        },
        errorMsg: {
            between: 'O valor deve estar entre {FORMULA1} e {FORMULA2}',
            greaterThan: 'O valor deve ser maior que {FORMULA1}',
            greaterThanOrEqual: 'O valor deve ser maior ou igual a {FORMULA1}',
            lessThan: 'O valor deve ser menor que {FORMULA1}',
            lessThanOrEqual: 'O valor deve ser menor ou igual a {FORMULA1}',
            equal: 'O valor deve ser igual a {FORMULA1}',
            notEqual: 'O valor deve ser diferente de {FORMULA1}',
            notBetween: 'O valor não deve estar entre {FORMULA1} e {FORMULA2}',
            legal: 'O valor deve ser um {TYPE} válido',
        },
        date: {
            operators: {
                between: 'entre',
                greaterThan: 'depois de',
                greaterThanOrEqual: 'em ou depois de',
                lessThan: 'antes de',
                lessThanOrEqual: 'em ou antes de',
                equal: 'igual',
                notEqual: 'diferente',
                notBetween: 'não está entre',
                legal: 'é uma data válida',
            },
            ruleName: {
                between: 'está entre {FORMULA1} e {FORMULA2}',
                greaterThan: 'é depois de {FORMULA1}',
                greaterThanOrEqual: 'é em ou depois de {FORMULA1}',
                lessThan: 'é antes de {FORMULA1}',
                lessThanOrEqual: 'é em ou antes de {FORMULA1}',
                equal: 'é {FORMULA1}',
                notEqual: 'não é {FORMULA1}',
                notBetween: 'não está entre {FORMULA1} e {FORMULA2}',
                legal: 'é uma data válida',
            },
            errorMsg: {
                between: 'O valor deve ser uma data válida e estar entre {FORMULA1} e {FORMULA2}',
                greaterThan: 'O valor deve ser uma data válida e ser depois de {FORMULA1}',
                greaterThanOrEqual: 'O valor deve ser uma data válida e ser em ou depois de {FORMULA1}',
                lessThan: 'O valor deve ser uma data válida e ser antes de {FORMULA1}',
                lessThanOrEqual: 'O valor deve ser uma data válida e ser em ou antes de {FORMULA1}',
                equal: 'O valor deve ser uma data válida e {FORMULA1}',
                notEqual: 'O valor deve ser uma data válida e não ser {FORMULA1}',
                notBetween: 'O valor deve ser uma data válida e não estar entre {FORMULA1} e {FORMULA2}',
                legal: 'O valor deve ser uma data válida',
            },
            title: 'Data',
        },
        textLength: {
            errorMsg: {
                between: 'O comprimento do texto deve estar entre {FORMULA1} e {FORMULA2}',
                greaterThan: 'O comprimento do texto deve ser maior que {FORMULA1}',
                greaterThanOrEqual: 'O comprimento do texto deve ser maior ou igual a {FORMULA1}',
                lessThan: 'O comprimento do texto deve ser menor que {FORMULA1}',
                lessThanOrEqual: 'O comprimento do texto deve ser menor ou igual a {FORMULA1}',
                equal: 'O comprimento do texto deve ser {FORMULA1}',
                notEqual: 'O comprimento do texto não deve ser {FORMULA1}',
                notBetween: 'O comprimento do texto não deve estar entre {FORMULA1} e {FORMULA2}',
            },
            title: 'Comprimento do texto',
        },
        custom: {
            ruleName: 'A fórmula personalizada é {FORMULA1}',
            title: 'Fórmula personalizada',
            validFail: 'Por favor, insira uma fórmula válida',
            error: 'O conteúdo desta célula viola sua regra de validação',
        },
        validFail: {
            value: 'Por favor, insira um valor',
            common: 'Por favor, insira um valor ou fórmula',
            number: 'Por favor, insira um número ou fórmula',
            formula: 'Por favor, insira uma fórmula',
            integer: 'Por favor, insira um inteiro ou fórmula',
            date: 'Por favor, insira uma data ou fórmula',
            list: 'Por favor, insira opções',
            listInvalid: 'A fonte da lista deve ser uma lista delimitada ou uma referência a uma única linha ou coluna',
            checkboxEqual: 'Insira valores diferentes para o conteúdo das células marcadas e desmarcadas.',
            formulaError: 'O intervalo de referência contém dados invisíveis, por favor, reajuste o intervalo',
            listIntersects: 'O intervalo selecionado não pode intersectar com o escopo das regras',
            primitive: 'Fórmulas não são permitidas para valores personalizados de marcado e desmarcado.',
        },
        any: {
            title: 'Qualquer valor',
            error: 'O conteúdo desta célula viola a regra de validação',
        },
        list: {
            title: 'Lista suspensa',
            name: 'O valor contém um do intervalo',
            error: 'A entrada deve estar dentro do intervalo especificado',
            emptyError: 'Por favor, insira um valor',
            add: 'Adicionar',
            dropdown: 'Selecionar',
            options: 'Opções',
            customOptions: 'Personalizado',
            refOptions: 'De um intervalo',
            formulaError: 'A fonte da lista deve ser uma lista delimitada de dados, ou uma referência a uma única linha ou coluna.',
            edit: 'Editar',
        },
        listMultiple: {
            title: 'Lista suspensa - Múltipla',
            dropdown: 'Seleção múltipla',
        },
        decimal: {
            title: 'Número',
        },
        whole: {
            title: 'Número inteiro',
        },
        checkbox: {
            title: 'Caixa de seleção',
            error: 'O conteúdo desta célula viola sua regra de validação',
            tips: 'Use valores personalizados dentro das células',
            checked: 'Valor selecionado',
            unchecked: 'Valor não selecionado',
        },
    },
};

export default locale;

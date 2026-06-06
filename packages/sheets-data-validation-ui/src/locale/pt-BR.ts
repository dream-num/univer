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
    'sheets-data-validation-ui': {
        title: 'Validação de dados',
        operators: {
            legal: 'é tipo válido',
        },
        validFail: {
            value: 'Insira um valor',
            common: 'Insira um valor ou fórmula',
            number: 'Insira um número ou fórmula',
            formula: 'Insira uma fórmula',
            integer: 'Insira um número inteiro ou fórmula',
            date: 'Insira uma data ou fórmula',
            list: 'Insira as opções',
            listInvalid: 'A fonte da lista deve ser uma lista delimitada ou uma referência a uma única linha ou coluna',
            checkboxEqual: 'Insira valores diferentes para o conteúdo da célula marcada e desmarcada.',
            formulaError: 'O intervalo de referência contém dados invisíveis, ajuste o intervalo',
            listIntersects: 'O intervalo selecionado não pode intersectar o escopo das regras',
            primitive: 'Fórmulas não são permitidas para valores personalizados de marcado e desmarcado.',
        },
        panel: {
            title: 'Gerenciamento de validação de dados',
            addTitle: 'Criar nova validação de dados',
            removeAll: 'Remover tudo',
            add: 'Adicionar regra',
            range: 'Intervalos',
            type: 'Tipo',
            options: 'Opções avançadas',
            operator: 'Operador',
            removeRule: 'Remover',
            done: 'Concluir',
            formulaPlaceholder: 'Insira um valor ou fórmula',
            valuePlaceholder: 'Insira um valor',
            formulaAnd: 'e',
            invalid: 'Inválido',
            showWarning: 'Mostrar aviso',
            rejectInput: 'Rejeitar entrada',
            messageInfo: 'Mensagem de ajuda',
            showInfo: 'Mostrar texto de ajuda para uma célula selecionada',
            rangeError: 'Os intervalos não são válidos',
            allowBlank: 'Permitir valores em branco',
        },
        any: {
            title: 'Qualquer valor',
            error: 'O conteúdo desta célula viola a regra de validação',
        },
        date: {
            title: 'Data',
        },
        list: {
            title: 'Lista suspensa',
            name: 'O valor contém um do intervalo',
            error: 'A entrada deve estar dentro do intervalo especificado',
            emptyError: 'Insira um valor',
            add: 'Adicionar',
            dropdown: 'Selecionar',
            options: 'Opções',
            customOptions: 'Personalizado',
            refOptions: 'De um intervalo',
            formulaError: 'A fonte da lista deve ser uma lista delimitada de dados ou uma referência a uma única linha ou coluna.',
            edit: 'Editar',
        },
        listMultiple: {
            title: 'Lista suspensa - Múltipla',
            dropdown: 'Seleção múltipla',
        },
        textLength: {
            title: 'Comprimento do texto',
        },
        decimal: {
            title: 'Número',
        },
        whole: {
            title: 'Número inteiro',
        },
        checkbox: {
            title: 'Caixa de seleção',
            error: 'O conteúdo desta célula viola a regra de validação',
            tips: 'Use valores personalizados dentro das células',
            checked: 'Valor selecionado',
            unchecked: 'Valor não selecionado',
        },
        custom: {
            title: 'Fórmula personalizada',
            error: 'O conteúdo desta célula viola a regra de validação',
            validFail: 'Insira uma fórmula válida',
        },
        alert: {
            title: 'Erro',
            ok: 'OK',
        },
        error: {
            title: 'Inválido:',
        },
        renderMode: {
            arrow: 'Seta',
            chip: 'Chip',
            text: 'Texto simples',
            label: 'Estilo de exibição',
        },
        showTime: {
            label: 'Mostrar seletor de hora',
        },
        permission: {
            dialog: {
                setStyleErr: 'O intervalo está protegido e você não tem permissão para definir estilos. Para definir estilos, entre em contato com o criador.',
            },
        },
    },
};

export default locale;

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
    ARRAY_CONSTRAIN: {
        description: 'Restringe o resultado de uma matriz ao tamanho especificado.',
        abstract: 'Restringe o resultado de uma matriz ao tamanho especificado.',
        links: [{ title: 'Instruções', url: 'https://support.google.com/docs/answer/3267036?hl=pt-BR' }],
        functionParameter: {
            inputRange: { name: 'intervalo_de_entrada', detail: 'O intervalo a ser restringido.' },
            numRows: { name: 'número_de_linhas', detail: 'O número de linhas que o resultado deve conter.' },
            numCols: { name: 'número_de_colunas', detail: 'O número de colunas que o resultado deve conter.' },
        },
    },
    FLATTEN: {
        description: 'Reúne todos os valores de um ou mais intervalos em uma única coluna.',
        abstract: 'Reúne todos os valores de um ou mais intervalos em uma única coluna.',
        links: [{ title: 'Instruções', url: 'https://support.google.com/docs/answer/10307761?hl=pt-BR' }],
        functionParameter: {
            range1: { name: 'intervalo1', detail: 'O primeiro intervalo a ser reunido.' },
            range2: { name: 'intervalo2', detail: '[opcional, repetível] Outros intervalos a serem reunidos.' },
        },
    },
};

export default locale;

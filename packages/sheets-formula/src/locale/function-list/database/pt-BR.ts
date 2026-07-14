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
    DAVERAGE: {
        description: 'Obtém uma média dos valores em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        abstract: 'Obtém uma média dos valores em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'é o intervalo de células que compõe a lista ou base de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'indica que coluna é utilizada na função . Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'é o intervalo de células que contém as condições que especificar. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DCOUNT: {
        description: 'Conta as células que contêm números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        abstract: 'Conta as células que contêm números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obrigatório. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Obrigatório. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Obrigatório. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DCOUNTA: {
        description: 'Conta as células não vazias em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        abstract: 'Conta as células não vazias em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obrigatório. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Opcional. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Obrigatório. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DGET: {
        description: 'Extrai um único valor em uma coluna de uma lista ou banco de dados que coincide com as condições especificadas.',
        abstract: 'Extrai um único valor em uma coluna de uma lista ou banco de dados que coincide com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DMAX: {
        description: 'Retorna o maior número em um campo (coluna) de registros em uma lista ou banco de dados que coincida com as condições especificadas.',
        abstract: 'Retorna o maior número em um campo (coluna) de registros em uma lista ou banco de dados que coincida com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DMIN: {
        description: 'Retorna o menor número em um campo (coluna) de registros em uma lista ou banco de dados que coincida com as condições especificadas.',
        abstract: 'Retorna o menor número em um campo (coluna) de registros em uma lista ou banco de dados que coincida com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplica os valores em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        abstract: 'Multiplica os valores em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DSTDEV: {
        description: 'Estima o desvio padrão de uma população com base em uma amostra, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        abstract: 'Estima o desvio padrão de uma população com base em uma amostra, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DSTDEVP: {
        description: 'Calcula o desvio padrão de uma população com base na população total, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        abstract: 'Calcula o desvio padrão de uma população com base na população total, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidirem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obrigatório. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Obrigatório. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Obrigatório. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DSUM: {
        description: 'Em uma lista ou banco de dados, o DSUM fornece a soma dos números em campos (colunas) de registros que correspondem às suas condições especificadas.',
        abstract: 'Em uma lista ou banco de dados, o DSUM fornece a soma dos números em campos (colunas) de registros que correspondem às suas condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. Esse é o intervalo de células que compõe a lista ou o banco de dados. Um banco de dados é uma lista de dados relacionados em que linhas de informações relacionadas são registros e colunas de dados são campos . A primeira linha de uma lista contém rótulos para cada coluna nela.' },
            field: { name: 'field', detail: 'Necessário. Isso especifica qual coluna é usada na função. Especifique o rótulo de coluna entre aspas duplas, como "Age" ou "Yield", por exemplo. Como alternativa, você pode especificar um número (sem aspas) que representa a posição da coluna dentro da lista: por exemplo, 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. Esse é o intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DVAR: {
        description: 'Estima a variação de uma população com base em uma amostra, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        abstract: 'Estima a variação de uma população com base em uma amostra, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
    DVARP: {
        description: 'Calcula a variação de uma população com base na população total, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        abstract: 'Calcula a variação de uma população com base na população total, usando os números em um campo (coluna) de registros em uma lista ou banco de dados que coincidem com as condições especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Necessário. O intervalo de células da lista ou do banco de dados. Um banco de dados é uma lista de dados relacionados em que as linhas de informações relacionadas são os registros e as colunas de dados são os campos. A primeira linha da lista contém os rótulos de cada coluna.' },
            field: { name: 'field', detail: 'Necessário. Indica a coluna que será usada na função. Digite o rótulo da coluna entre aspas, como "Idade" ou "Rendimento", ou como um número (sem aspas) que represente a posição da coluna dentro da lista: 1 para a primeira coluna, 2 para a segunda coluna e assim por diante.' },
            criteria: { name: 'criteria', detail: 'Necessário. O intervalo de células que contém as condições especificadas. Você pode usar qualquer intervalo para o argumento de critérios, desde que ele inclua pelo menos um rótulo de coluna e pelo menos uma célula abaixo do rótulo de coluna para especificar uma condição para a coluna.' },
        },
    },
};

export default locale;

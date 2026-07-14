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
    CUBEKPIMEMBER: {
        description: 'Retorna una propietat d\'indicador clau de rendiment (KPI) i mostra el nom del KPI a la cel·la. Un KPI és una mesura quantificable, com el benefici brut mensual o la rotació trimestral d\'empleats, que s\'utilitza per supervisar el rendiment d\'una organització.',
        abstract: 'Retorna una propietat d\'indicador clau de rendiment (KPI) i mostra el nom del KPI a la cel·la. Un KPI és una mesura quantificable, com el benefici brut mensual o la rotació trimestral d\'empleats, que s\'utilitza per supervisar el rendiment d\'una organització.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            kpiName: { name: 'Nom de l’KPI', detail: 'Text amb el nom de l’indicador clau de rendiment (KPI) del cub.' },
            kpiProperty: { name: 'Propietat de l’KPI', detail: 'Component de l’KPI que s’ha de retornar.' },
            caption: { name: 'Títol', detail: 'Opcional. Text alternatiu que es mostra a la cel·la.' },
        },
    },
    CUBEMEMBER: {
        description: 'Retorna un membre o tupla del cub. Utilitzeu-lo per validar que el membre o la tupla existeix al cub.',
        abstract: 'Retorna un membre o tupla del cub. Utilitzeu-lo per validar que el membre o la tupla existeix al cub.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            memberExpression: { name: 'Expressió de membre', detail: 'Text d’una expressió multidimensional (MDX) que avalua un membre o una tupla del cub.' },
            caption: { name: 'Títol', detail: 'Opcional. Text alternatiu que es mostra a la cel·la.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Retorna el valor d\'una propietat de membre del cub. Utilitzeu-lo per validar que existeix un nom de membre dins del cub i per retornar la propietat especificada per a aquest membre.',
        abstract: 'Retorna el valor d\'una propietat de membre del cub. Utilitzeu-lo per validar que existeix un nom de membre dins del cub i per retornar la propietat especificada per a aquest membre.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            memberExpression: { name: 'Expressió de membre', detail: 'Text d’una expressió multidimensional (MDX) d’un membre del cub.' },
            property: { name: 'Propietat', detail: 'Nom de la propietat que s’ha de retornar.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Retorna l\'enèsim membre, o classificat, en un conjunt. Utilitzeu-lo per retornar un o més elements en un conjunt, com el millor venedor o els 10 millors estudiants.',
        abstract: 'Retorna l\'enèsim membre, o classificat, en un conjunt. Utilitzeu-lo per retornar un o més elements en un conjunt, com el millor venedor o els 10 millors estudiants.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            setExpression: { name: 'Expressió de conjunt', detail: 'Text d’una expressió que defineix un conjunt del cub.' },
            rank: { name: 'Rang', detail: 'Enter que indica la posició del membre que s’ha de retornar.' },
            caption: { name: 'Títol', detail: 'Opcional. Text alternatiu que es mostra a la cel·la.' },
        },
    },
    CUBESET: {
        description: 'Defineix un conjunt calculat de membres o tuples enviant una expressió de conjunt al cub del servidor, que crea el conjunt i després retorna aquest conjunt a Microsoft Excel.',
        abstract: 'Defineix un conjunt calculat de membres o tuples enviant una expressió de conjunt al cub del servidor, que crea el conjunt i després retorna aquest conjunt a Microsoft Excel.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            setExpression: { name: 'Expressió de conjunt', detail: 'Text d’una expressió que produeix un conjunt de membres o tuples.' },
            caption: { name: 'Títol', detail: 'Opcional. Text alternatiu que es mostra a la cel·la.' },
            sortOrder: { name: 'Ordre', detail: 'Opcional. Tipus d’ordenació que s’ha d’aplicar.' },
            sortBy: { name: 'Ordena per', detail: 'Opcional. Valor pel qual s’ha d’ordenar el conjunt.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Retorna el nombre d\'elements en un conjunt.',
        abstract: 'Retorna el nombre d\'elements en un conjunt.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Conjunt', detail: 'Expressió que avalua un conjunt definit per CUBESET, o una referència que el conté.' },
        },
    },
    CUBEVALUE: {
        description: 'Retorna un valor agregat del cub.',
        abstract: 'Retorna un valor agregat del cub.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connexió', detail: 'Text amb el nom de la connexió al cub.' },
            memberExpression: { name: 'Expressió de membre', detail: 'Opcional. Expressió MDX que avalua un membre o una tupla del cub.' },
        },
    },
};

export default locale;

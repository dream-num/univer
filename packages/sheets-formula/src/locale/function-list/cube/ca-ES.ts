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
                url: 'https://support.microsoft.com/en-us/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBEMEMBER: {
        description: 'Retorna un membre o tupla del cub. Utilitzeu-lo per validar que el membre o la tupla existeix al cub.',
        abstract: 'Retorna un membre o tupla del cub. Utilitzeu-lo per validar que el membre o la tupla existeix al cub.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Retorna el valor d\'una propietat de membre del cub. Utilitzeu-lo per validar que existeix un nom de membre dins del cub i per retornar la propietat especificada per a aquest membre.',
        abstract: 'Retorna el valor d\'una propietat de membre del cub. Utilitzeu-lo per validar que existeix un nom de membre dins del cub i per retornar la propietat especificada per a aquest membre.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Retorna l\'enèsim membre, o classificat, en un conjunt. Utilitzeu-lo per retornar un o més elements en un conjunt, com el millor venedor o els 10 millors estudiants.',
        abstract: 'Retorna l\'enèsim membre, o classificat, en un conjunt. Utilitzeu-lo per retornar un o més elements en un conjunt, com el millor venedor o els 10 millors estudiants.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBESET: {
        description: 'Defineix un conjunt calculat de membres o tuples enviant una expressió de conjunt al cub del servidor, que crea el conjunt i després retorna aquest conjunt a Microsoft Excel.',
        abstract: 'Defineix un conjunt calculat de membres o tuples enviant una expressió de conjunt al cub del servidor, que crea el conjunt i després retorna aquest conjunt a Microsoft Excel.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBESETCOUNT: {
        description: 'Retorna el nombre d\'elements en un conjunt.',
        abstract: 'Retorna el nombre d\'elements en un conjunt.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
    CUBEVALUE: {
        description: 'Retorna un valor agregat del cub.',
        abstract: 'Retorna un valor agregat del cub.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primer' },
            number2: { name: 'número2', detail: 'segon' },
        },
    },
};

export default locale;

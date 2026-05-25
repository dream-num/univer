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
        description: 'Vracia vlastnosť kľúčového ukazovateľa výkonnosti (KPI) a zobrazí názov KPI v bunke. KPI je merateľný ukazovateľ, napríklad mesačný hrubý zisk alebo štvrťročná fluktuácia zamestnancov, ktorý sa používa na sledovanie výkonnosti organizácie.',
        abstract: 'Vracia vlastnosť KPI a zobrazí názov KPI v bunke.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBEMEMBER: {
        description: 'Vracia člena alebo n-ticu z kocky. Použite na overenie, že člen alebo n-tica existuje v kocke.',
        abstract: 'Vracia člena alebo n-ticu z kocky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Vracia hodnotu vlastnosti člena z kocky. Použite na overenie, že názov člena existuje v kocke, a na vrátenie zadanej vlastnosti tohto člena.',
        abstract: 'Vracia hodnotu vlastnosti člena z kocky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Vracia n-tého (zoradeného) člena v množine. Použite na vrátenie jedného alebo viacerých prvkov v množine, napríklad najlepšieho predajcu alebo top 10 študentov.',
        abstract: 'Vracia n-tého (zoradeného) člena v množine.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBESET: {
        description: 'Definuje vypočítanú množinu členov alebo n-tíc odoslaním výrazu množiny do kocky na serveri, ktorá množinu vytvorí, a potom ju vráti do Microsoft Excelu.',
        abstract: 'Definuje vypočítanú množinu členov alebo n-tíc a vráti ju do Excelu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBESETCOUNT: {
        description: 'Vracia počet položiek v množine.',
        abstract: 'Vracia počet položiek v množine.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    CUBEVALUE: {
        description: 'Vracia agregovanú hodnotu z kocky.',
        abstract: 'Vracia agregovanú hodnotu z kocky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
};

export default locale;

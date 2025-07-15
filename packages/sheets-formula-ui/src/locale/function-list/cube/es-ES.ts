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
        description: 'Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como el beneficio bruto mensual o la rotación trimestral de empleados, que se utiliza para supervisar el rendimiento de una organización.',
        abstract: 'Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como el beneficio bruto mensual o la rotación trimestral de empleados, que se utiliza para supervisar el rendimiento de una organización.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBEMEMBER: {
        description: 'Devuelve un miembro o tupla del cubo. Úselo para validar que el miembro o la tupla existe en el cubo.',
        abstract: 'Devuelve un miembro o tupla del cubo. Úselo para validar que el miembro o la tupla existe en el cubo.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Devuelve el valor de una propiedad de miembro del cubo. Úselo para validar que existe un nombre de miembro dentro del cubo y para devolver la propiedad especificada para este miembro.',
        abstract: 'Devuelve el valor de una propiedad de miembro del cubo. Úselo para validar que existe un nombre de miembro dentro del cubo y para devolver la propiedad especificada para este miembro.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Devuelve el enésimo miembro, o clasificado, en un conjunto. Úselo para devolver uno o más elementos en un conjunto, como el mejor vendedor o los 10 mejores estudiantes.',
        abstract: 'Devuelve el enésimo miembro, o clasificado, en un conjunto. Úselo para devolver uno o más elementos en un conjunto, como el mejor vendedor o los 10 mejores estudiantes.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBESET: {
        description: 'Define un conjunto calculado de miembros o tuplas enviando una expresión de conjunto al cubo en el servidor, que crea el conjunto y luego devuelve ese conjunto a Microsoft Excel.',
        abstract: 'Define un conjunto calculado de miembros o tuplas enviando una expresión de conjunto al cubo en el servidor, que crea el conjunto y luego devuelve ese conjunto a Microsoft Excel.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBESETCOUNT: {
        description: 'Devuelve el número de elementos en un conjunto.',
        abstract: 'Devuelve el número de elementos en un conjunto.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    CUBEVALUE: {
        description: 'Devuelve un valor agregado del cubo.',
        abstract: 'Devuelve un valor agregado del cubo.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
};

export default locale;

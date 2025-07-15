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
        description: 'Devuelve el promedio de las entradas de base de datos seleccionadas',
        abstract: 'Devuelve el promedio de las entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/daverage-function-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DCOUNT: {
        description: 'Cuenta las celdas que contienen números en una base de datos',
        abstract: 'Cuenta las celdas que contienen números en una base de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dcount-function-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DCOUNTA: {
        description: 'Cuenta las celdas no vacías en una base de datos',
        abstract: 'Cuenta las celdas no vacías en una base de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dcounta-function-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DGET: {
        description: 'Extrae de una base de datos un único registro que coincide con los criterios especificados',
        abstract: 'Extrae de una base de datos un único registro que coincide con los criterios especificados',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dget-function-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DMAX: {
        description: 'Devuelve el valor máximo de las entradas de base de datos seleccionadas',
        abstract: 'Devuelve el valor máximo de las entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dmax-function-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DMIN: {
        description: 'Devuelve el valor mínimo de las entradas de base de datos seleccionadas',
        abstract: 'Devuelve el valor mínimo de las entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dmin-function-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplica los valores en un campo particular de registros que coinciden con los criterios en una base de datos',
        abstract: 'Multiplica los valores en un campo particular de registros que coinciden con los criterios en una base de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dproduct-function-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DSTDEV: {
        description: 'Estima la desviación estándar basada en una muestra de entradas de base de datos seleccionadas',
        abstract: 'Estima la desviación estándar basada en una muestra de entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dstdev-function-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DSTDEVP: {
        description: 'Calcula la desviación estándar basada en la población completa de entradas de base de datos seleccionadas',
        abstract: 'Calcula la desviación estándar basada en la población completa de entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dstdevp-function-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DSUM: {
        description: 'Suma los números en la columna de campo de registros en la base de datos que coinciden con los criterios',
        abstract: 'Suma los números en la columna de campo de registros en la base de datos que coinciden con los criterios',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dsum-function-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DVAR: {
        description: 'Estima la varianza basada en una muestra de entradas de base de datos seleccionadas',
        abstract: 'Estima la varianza basada en una muestra de entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dvar-function-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
    DVARP: {
        description: 'Calcula la varianza basada en la población completa de entradas de base de datos seleccionadas',
        abstract: 'Calcula la varianza basada en la población completa de entradas de base de datos seleccionadas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/dvarp-function-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'El rango de celdas que compone la lista o base de datos.' },
            field: { name: 'campo', detail: 'Indica qué columna se utiliza en la función.' },
            criteria: { name: 'criterios', detail: 'El rango de celdas que contiene las condiciones que especifica.' },
        },
    },
};

export default locale;

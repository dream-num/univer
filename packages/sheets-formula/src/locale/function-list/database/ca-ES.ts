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
        description: 'Retorna la mitjana de les entrades de base de dades seleccionades',
        abstract: 'Retorna la mitjana de les entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/daverage-function-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DCOUNT: {
        description: 'Compta les cel·les que contenen números en una base de dades',
        abstract: 'Compta les cel·les que contenen números en una base de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dcount-function-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DCOUNTA: {
        description: 'Compta les cel·les no buides en una base de dades',
        abstract: 'Compta les cel·les no buides en una base de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dcounta-function-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DGET: {
        description: 'Extreu d\'una base de dades un únic registre que coincideix amb els criteris especificats',
        abstract: 'Extreu d\'una base de dades un únic registre que coincideix amb els criteris especificats',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dget-function-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DMAX: {
        description: 'Retorna el valor màxim de les entrades de base de dades seleccionades',
        abstract: 'Retorna el valor màxim de les entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dmax-function-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DMIN: {
        description: 'Retorna el valor mínim de les entrades de base de dades seleccionades',
        abstract: 'Retorna el valor mínim de les entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dmin-function-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplica els valors en un camp particular de registres que coincideixen amb els criteris en una base de dades',
        abstract: 'Multiplica els valors en un camp particular de registres que coincideixen amb els criteris en una base de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dproduct-function-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DSTDEV: {
        description: 'Estima la desviació estàndard basada en una mostra d\'entrades de base de dades seleccionades',
        abstract: 'Estima la desviació estàndard basada en una mostra d\'entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dstdev-function-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DSTDEVP: {
        description: 'Calcula la desviació estàndard basada en la població completa d\'entrades de base de dades seleccionades',
        abstract: 'Calcula la desviació estàndard basada en la població completa d\'entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dstdevp-function-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DSUM: {
        description: 'Suma els números a la columna de camp de registres a la base de dades que coincideixen amb els criteris',
        abstract: 'Suma els números a la columna de camp de registres a la base de dades que coincideixen amb els criteris',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dsum-function-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DVAR: {
        description: 'Estima la variància basada en una mostra d\'entrades de base de dades seleccionades',
        abstract: 'Estima la variància basada en una mostra d\'entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dvar-function-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
    DVARP: {
        description: 'Calcula la variància basada en la població completa d\'entrades de base de dades seleccionades',
        abstract: 'Calcula la variància basada en la població completa d\'entrades de base de dades seleccionades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/dvarp-function-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: 'base_dades', detail: 'El rang de cel·les que constitueix la llista o base de dades.' },
            field: { name: 'camp', detail: 'Indica quina columna s\'utilitza en la funció.' },
            criteria: { name: 'criteris', detail: 'El rang de cel·les que conté les condicions que especifiqueu.' },
        },
    },
};

export default locale;

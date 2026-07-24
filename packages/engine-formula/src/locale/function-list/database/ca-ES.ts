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
                url: 'https://support.microsoft.com/ca-es/excel/functions/daverage-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dcount-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dcounta-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dget-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dmax-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dmin-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dproduct-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dstdev-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dstdevp-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dsum-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dvar-function',
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
                url: 'https://support.microsoft.com/ca-es/excel/functions/dvarp-function',
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

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
    CELL: {
        description: 'Retorna informació sobre el format, la ubicació o el contingut d\'una cel·la',
        abstract: 'Retorna informació sobre el format, la ubicació o el contingut d\'una cel·la',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'tipus_info', detail: 'Un valor de text que especifica quin tipus d\'informació de cel·la voleu que es retorni.' },
            reference: { name: 'referència', detail: 'La cel·la de la qual voleu obtenir informació.' },
        },
    },
    ERROR_TYPE: {
        description: 'Retorna un número que correspon a un tipus d’error',
        abstract: 'Retorna un número que correspon a un tipus d’error',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'valor_error', detail: 'El valor d\'error del qual voleu trobar el número d\'identificació.' },
        },
    },
    INFO: {
        description: 'Retorna informació sobre l\'entorn operatiu actual',
        abstract: 'Retorna informació sobre l\'entorn operatiu actual',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Tipus de text', detail: 'Text que especifica el tipus d’informació que s’ha de retornar.' },
        },
    },
    ISBETWEEN: {
        description: 'Comprova si un nombre proporcionat es troba entre altres dos nombres, de forma inclusiva o exclusiva.',
        abstract: 'Comprova si un nombre proporcionat es troba entre altres dos nombres, de forma inclusiva o exclusiva.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/10538337?hl=ca',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'valor_a_comparar', detail: 'El valor a comprovar si està entre `valor_inferior` i `valor_superior`.' },
            lowerValue: { name: 'valor_inferior', detail: 'El límit inferior de l\'interval de valors en què pot caure `valor_a_comparar`.' },
            upperValue: { name: 'valor_superior', detail: 'El límit superior de l\'interval de valors en què pot caure `valor_a_comparar`.' },
            lowerValueIsInclusive: { name: 'valor_inferior_es_inclusiu', detail: 'Indica si l\'interval de valors inclou el `valor_inferior`. Per defecte és CERT.' },
            upperValueIsInclusive: { name: 'valor_superior_es_inclusiu', detail: 'Indica si l\'interval de valors inclou el `valor_superior`. Per defecte és CERT.' },
        },
    },
    ISBLANK: {
        description: 'Retorna CERT si el valor és buit',
        abstract: 'Retorna CERT si el valor és buit',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISDATE: {
        description: 'Retorna si un valor és una data.',
        abstract: 'Retorna si un valor és una data.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/9061381?hl=ca',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que es verificarà com a data.' },
        },
    },
    ISEMAIL: {
        description: 'Comprova si un valor és una adreça de correu electrònic vàlida',
        abstract: 'Comprova si un valor és una adreça de correu electrònic vàlida',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/3256503?hl=ca',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que es verificarà com a adreça de correu electrònic.' },
        },
    },
    ISERR: {
        description: 'Retorna CERT si el valor és qualsevol valor d\'error excepte #N/A',
        abstract: 'Retorna CERT si el valor és qualsevol valor d\'error excepte #N/A',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISERROR: {
        description: 'Retorna CERT si el valor és qualsevol valor d\'error',
        abstract: 'Retorna CERT si el valor és qualsevol valor d\'error',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISEVEN: {
        description: 'Retorna CERT si el número és parell',
        abstract: 'Retorna CERT si el número és parell',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que cal provar. Si el nombre no és un enter, es trunca.' },
        },
    },
    ISFORMULA: {
        description: 'Retorna CERT si hi ha una referència a una cel·la que conté una fórmula',
        abstract: 'Retorna CERT si hi ha una referència a una cel·la que conté una fórmula',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'La referència és una referència a la cel·la que voleu provar.' },
        },
    },
    ISLOGICAL: {
        description: 'Retorna CERT si el valor és un valor lògic',
        abstract: 'Retorna CERT si el valor és un valor lògic',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISNA: {
        description: 'Retorna CERT si el valor és el valor d\'error #N/A',
        abstract: 'Retorna CERT si el valor és el valor d\'error #N/A',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISNONTEXT: {
        description: 'Retorna CERT si el valor no és text',
        abstract: 'Retorna CERT si el valor no és text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISNUMBER: {
        description: 'Retorna CERT si el valor és un número',
        abstract: 'Retorna CERT si el valor és un número',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISODD: {
        description: 'Retorna CERT si el número és senar',
        abstract: 'Retorna CERT si el número és senar',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que cal provar. Si el nombre no és un enter, es trunca.' },
        },
    },
    ISOMITTED: {
        description: 'Comprova si falta el valor en una&nbsp;LAMBDA&nbsp;i retorna CERT o FALS',
        abstract: 'Comprova si falta el valor en una&nbsp;LAMBDA&nbsp;i retorna CERT o FALS',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argument', detail: 'Valor que es comprova per determinar si s’ha omès, com ara un paràmetre LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Retorna CERT si el valor és una referència',
        abstract: 'Retorna CERT si el valor és una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISTEXT: {
        description: 'Retorna CERT si el valor és text',
        abstract: 'Retorna CERT si el valor és text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu comprovar. L\'argument de valor pot ser un valor en blanc (cel·la buida), un error, un valor lògic, text, un número o un valor de referència, o un nom que faci referència a qualsevol d\'aquests.' },
        },
    },
    ISURL: {
        description: 'Comprova si un valor és un URL vàlid.',
        abstract: 'Comprova si un valor és un URL vàlid.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/3256501?hl=ca',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'ISURL("www.google.com")' },
        },
    },
    N: {
        description: 'Retorna un valor convertit a un número',
        abstract: 'Retorna un valor convertit a un número',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que voleu convertir.' },
        },
    },
    NA: {
        description: 'Retorna el valor d\'error #N/A',
        abstract: 'Retorna el valor d\'error #N/A',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Retorna el número de full del full de referència',
        abstract: 'Retorna el número de full del full de referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor és el nom d\'un full o una referència per a la qual voleu el número de full. Si s\'omet el valor, FULL retorna el número del full que conté la funció.' },
        },
    },
    SHEETS: {
        description: 'Retorna el nombre de fulls d\'un llibre',
        abstract: 'Retorna el nombre de fulls d\'un llibre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Retorna un número que indica el tipus de dades d\'un valor',
        abstract: 'Retorna un número que indica el tipus de dades d\'un valor',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Pot ser qualsevol valor, com ara un número, text, valor lògic, etc.' },
        },
    },
};

export default locale;

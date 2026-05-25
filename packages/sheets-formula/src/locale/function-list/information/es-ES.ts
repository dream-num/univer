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
        description: 'Devuelve información sobre el formato, la ubicación o el contenido de una celda',
        abstract: 'Devuelve información sobre el formato, la ubicación o el contenido de una celda',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/cell-function-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            infoType: { name: 'tipo_info', detail: 'Un valor de texto que especifica qué tipo de información de celda desea devolver.' },
            reference: { name: 'referencia', detail: 'La celda sobre la que desea obtener información.' },
        },
    },
    ERROR_TYPE: {
        description: 'Devuelve un número correspondiente a un tipo de error',
        abstract: 'Devuelve un número correspondiente a un tipo de error',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/error-type-function-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: 'valor_error', detail: 'El valor de error cuyo número de identificación desea encontrar.' },
        },
    },
    INFO: {
        description: 'Devuelve información sobre el entorno operativo actual',
        abstract: 'Devuelve información sobre el entorno operativo actual',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/info-function-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    ISBETWEEN: {
        description: 'Comprueba si un número proporcionado se encuentra entre otros dos números, de forma inclusiva o exclusiva.',
        abstract: 'Comprueba si un número proporcionado se encuentra entre otros dos números, de forma inclusiva o exclusiva.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/10538337?hl=es',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'valor_a_comparar', detail: 'El valor a comprobar si está entre `valor_inferior` y `valor_superior`.' },
            lowerValue: { name: 'valor_inferior', detail: 'El límite inferior del rango de valores en el que puede caer `valor_a_comparar`.' },
            upperValue: { name: 'valor_superior', detail: 'El límite superior del rango de valores en el que puede caer `valor_a_comparar`.' },
            lowerValueIsInclusive: { name: 'valor_inferior_es_inclusivo', detail: 'Indica si el rango de valores incluye el `valor_inferior`. Por defecto es VERDADERO.' },
            upperValueIsInclusive: { name: 'valor_superior_es_inclusivo', detail: 'Indica si el rango de valores incluye el `valor_superior`. Por defecto es VERDADERO.' },
        },
    },
    ISBLANK: {
        description: 'Devuelve VERDADERO si el valor está en blanco',
        abstract: 'Devuelve VERDADERO si el valor está en blanco',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISDATE: {
        description: 'Devuelve si un valor es una fecha.',
        abstract: 'Devuelve si un valor es una fecha.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/9061381?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que se verificará como fecha.' },
        },
    },
    ISEMAIL: {
        description: 'Comprueba si un valor es una dirección de correo electrónico válida',
        abstract: 'Comprueba si un valor es una dirección de correo electrónico válida',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/3256503?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que se verificará como una dirección de correo electrónico.' },
        },
    },
    ISERR: {
        description: 'Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A',
        abstract: 'Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISERROR: {
        description: 'Devuelve VERDADERO si el valor es cualquier valor de error',
        abstract: 'Devuelve VERDADERO si el valor es cualquier valor de error',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISEVEN: {
        description: 'Devuelve VERDADERO si el número es par',
        abstract: 'Devuelve VERDADERO si el número es par',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/iseven-function-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor a probar. Si el número no es un entero, se trunca.' },
        },
    },
    ISFORMULA: {
        description: 'Devuelve VERDADERO si hay una referencia a una celda que contiene una fórmula',
        abstract: 'Devuelve VERDADERO si hay una referencia a una celda que contiene una fórmula',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/isformula-function-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'Referencia es una referencia a la celda que desea probar.' },
        },
    },
    ISLOGICAL: {
        description: 'Devuelve VERDADERO si el valor es un valor lógico',
        abstract: 'Devuelve VERDADERO si el valor es un valor lógico',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISNA: {
        description: 'Devuelve VERDADERO si el valor es el valor de error #N/A',
        abstract: 'Devuelve VERDADERO si el valor es el valor de error #N/A',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISNONTEXT: {
        description: 'Devuelve VERDADERO si el valor no es texto',
        abstract: 'Devuelve VERDADERO si el valor no es texto',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISNUMBER: {
        description: 'Devuelve VERDADERO si el valor es un número',
        abstract: 'Devuelve VERDADERO si el valor es un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISODD: {
        description: 'Devuelve VERDADERO si el número es impar',
        abstract: 'Devuelve VERDADERO si el número es impar',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/isodd-function-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor a probar. Si el número no es un entero, se trunca.' },
        },
    },
    ISOMITTED: {
        description: 'Comprueba si falta el valor en una LAMBDA y devuelve VERDADERO o FALSO',
        abstract: 'Comprueba si falta el valor en una LAMBDA y devuelve VERDADERO o FALSO',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/isomitted-function-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    ISREF: {
        description: 'Devuelve VERDADERO si el valor es una referencia',
        abstract: 'Devuelve VERDADERO si el valor es una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISTEXT: {
        description: 'Devuelve VERDADERO si el valor es texto',
        abstract: 'Devuelve VERDADERO si el valor es texto',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISURL: {
        description: 'Comprueba si un valor es una URL válida.',
        abstract: 'Comprueba si un valor es una URL válida.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/3256501?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que se verificará como una URL.' },
        },
    },
    N: {
        description: 'Devuelve un valor convertido en un número',
        abstract: 'Devuelve un valor convertido en un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/n-function-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea convertir.' },
        },
    },
    NA: {
        description: 'Devuelve el valor de error #N/A',
        abstract: 'Devuelve el valor de error #N/A',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/na-function-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Devuelve el número de hoja de la hoja de referencia',
        abstract: 'Devuelve el número de hoja de la hoja de referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/sheet-function-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Valor es el nombre de una hoja o una referencia para la que desea el número de hoja. Si se omite el valor, HOJA devuelve el número de la hoja que contiene la función.' },
        },
    },
    SHEETS: {
        description: 'Devuelve el número de hojas en un libro',
        abstract: 'Devuelve el número de hojas en un libro',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/sheets-function-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Devuelve un número que indica el tipo de datos de un valor',
        abstract: 'Devuelve un número que indica el tipo de datos de un valor',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/type-function-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Puede ser cualquier valor, como un número, texto, valor lógico, etc.' },
        },
    },
};

export default locale;

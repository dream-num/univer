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
                url: 'https://support.microsoft.com/es-es/excel/functions/cell-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/error-type-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Tipo de texto', detail: 'Texto que especifica el tipo de información que se devuelve.' },
        },
    },
    ISBETWEEN: {
        description: 'Comprueba si un número proporcionado se encuentra entre otros dos números, ya sea de forma inclusiva o exclusiva.',
        abstract: 'Comprueba si un número proporcionado se encuentra entre otros dos números, ya sea de forma inclusiva o exclusiva.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/10538337?hl=es',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'valor_a_comparar', detail: 'Valor que se va a comprobar si se encuentra entre `valor_inferior` y `valor_superior`.' },
            lowerValue: { name: 'valor_inferior', detail: 'Límite inferior del intervalo de valores dentro del cual puede encontrarse el `valor_para_comparar`.' },
            upperValue: { name: 'valor_superior', detail: 'Límite superior del intervalo de valores dentro del cual puede encontrarse el `valor_para_comparar`.' },
            lowerValueIsInclusive: { name: 'valor_inferior_es_inclusivo', detail: 'Comprueba si el intervalo de valores incluye el `valor_inferior`; de manera predeterminada, está establecido en TRUE' },
            upperValueIsInclusive: { name: 'valor_superior_es_inclusivo', detail: 'Comprueba si el intervalo de valores incluye el `valor_superior`; de manera predeterminada, está establecido en TRUE' },
        },
    },
    ISBLANK: {
        description: 'Devuelve VERDADERO si el valor está en blanco',
        abstract: 'Devuelve VERDADERO si el valor está en blanco',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISDATE: {
        description: 'La función ISDATE devuelve si el valor es una fecha.',
        abstract: 'La función ISDATE devuelve si el valor es una fecha.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/9061381?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Valor que se comprueba si es una fecha.' },
        },
    },
    ISEMAIL: {
        description: 'Para comprobar si un valor es una dirección de correo válida, usa la función ISEMAIL. Comprueba si el valor sigue un formato aceptado habitualmente para las direcciones de correo, pero no verifica si existe.',
        abstract: 'Para comprobar si un valor es una dirección de correo válida, usa la función ISEMAIL. Comprueba si el valor sigue un formato aceptado habitualmente para las direcciones de correo, pero no verifica si existe.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/3256503?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'ISEMAIL("juangarcia@tunombre.com")' },
        },
    },
    ISERR: {
        description: 'Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A',
        abstract: 'Devuelve VERDADERO si el valor es cualquier valor de error excepto #N/A',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar. El argumento de valor puede ser una celda en blanco (vacía), error, valor lógico, texto, número o valor de referencia, o un nombre que se refiera a cualquiera de estos.' },
        },
    },
    ISEVEN: {
        description: 'Devuelve VERDADERO si el número es par y FALSO si el número es impar.',
        abstract: 'Devuelve VERDADERO si el número es par y FALSO si el número es impar.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Obligatorio. El valor que se desea probar. Si el argumento número no es un entero, se trunca.' },
        },
    },
    ISFORMULA: {
        description: 'Comprueba si existe una referencia a una celda que contiene una fórmula y devuelve TRUE o FALSE.',
        abstract: 'Comprueba si existe una referencia a una celda que contiene una fórmula y devuelve TRUE o FALSE.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'Obligatorio. Referencia es una referencia a la celda que se desea probar. Referencia puede ser una referencia de celda, una fórmula o un nombre que hace referencia a una celda.' },
        },
    },
    ISLOGICAL: {
        description: 'Devuelve VERDADERO si el valor es un valor lógico',
        abstract: 'Devuelve VERDADERO si el valor es un valor lógico',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/isodd-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argumento', detail: 'Valor que se comprueba para determinar si se ha omitido, como un parámetro de LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Devuelve VERDADERO si el valor es una referencia',
        abstract: 'Devuelve VERDADERO si el valor es una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/is-functions',
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
            value: { name: 'valor', detail: 'ISURL("www.google.com")' },
        },
    },
    N: {
        description: 'Devuelve un valor convertido en un número',
        abstract: 'Devuelve un valor convertido en un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/n-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/na-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/sheet-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/sheets-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Puede ser cualquier valor, como un número, texto, valor lógico, etc.' },
        },
    },
};

export default locale;

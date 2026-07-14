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
        description: 'Devuelve el promedio de los valores de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        abstract: 'Devuelve el promedio de los valores de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'es el rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DCOUNT: {
        description: 'Cuenta las celdas que contienen números en un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Cuenta las celdas que contienen números en un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. El rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento Criterios mientras este incluya por lo menos un rótulo de columna y al menos una celda debajo del rótulo de columna en la que se pueda especificar una condición de columna.' },
        },
    },
    DCOUNTA: {
        description: 'Cuenta las celdas que no están en blanco de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Cuenta las celdas que no están en blanco de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Opcional. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DGET: {
        description: 'Extrae un único valor de una columna de una lista o una base de datos que cumple las condiciones especificadas.',
        abstract: 'Extrae un único valor de una columna de una lista o una base de datos que cumple las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DMAX: {
        description: 'Devuelve el valor máximo de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        abstract: 'Devuelve el valor máximo de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DMIN: {
        description: 'Devuelve el valor mínimo de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        abstract: 'Devuelve el valor mínimo de un campo (columna) de registros en una lista o base de datos que cumple las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DPRODUCT: {
        description: 'Multiplica los valores de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Multiplica los valores de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DSTDEV: {
        description: 'Calcula la desviación estándar de una población basándose en una muestra y usando los números de un campo (columna) de registros en una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Calcula la desviación estándar de una población basándose en una muestra y usando los números de un campo (columna) de registros en una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DSTDEVP: {
        description: 'Calcula la desviación estándar de una población basándose en toda la población y usa los números de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Calcula la desviación estándar de una población basándose en toda la población y usa los números de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DSUM: {
        description: 'En una lista o base de datos, DSUMA proporciona la suma de los números de los campos (columnas) de registros que cumplen las condiciones especificadas.',
        abstract: 'En una lista o base de datos, DSUMA proporciona la suma de los números de los campos (columnas) de registros que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. Este es el rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos son campos . La primera fila de una lista contiene etiquetas para cada columna en ella.' },
            field: { name: 'campo', detail: 'Obligatorio. Esto especifica qué columna se usa en la función. Especifique el rótulo de columna entre comillas, como "Edad" o "Rendimiento", por ejemplo. Como alternativa, puede especificar un número (sin comillas) que represente la posición de la columna dentro de la lista: por ejemplo, 1 para la primera columna, 2 para la segunda, etc.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Este es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DVAR: {
        description: 'Calcula la varianza de una población basándose en una muestra y usando los números de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        abstract: 'Calcula la varianza de una población basándose en una muestra y usando los números de un campo (columna) de registros de una lista o base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
    DVARP: {
        description: 'Calcula la varianza de una población basándose en toda la población y usando los números de un campo (columna) de registros en una lista o una base de datos que cumplen las condiciones especificadas.',
        abstract: 'Calcula la varianza de una población basándose en toda la población y usando los números de un campo (columna) de registros en una lista o una base de datos que cumplen las condiciones especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'base_datos', detail: 'Obligatorio. El rango de celdas que compone la lista o base de datos. Una base de datos es una lista de datos relacionados en la que las filas de información son registros y las columnas de datos, campos. La primera fila de la lista contiene los rótulos de cada columna.' },
            field: { name: 'campo', detail: 'Obligatorio. Indica qué columna se usa en la función. Escriba el rótulo de la columna entre comillas, como por ejemplo "Edad" o "Rendimiento", o un número (sin las comillas) que represente la posición de la columna en la lista: 1 para la primera columna, 2 para la segunda y así sucesivamente.' },
            criteria: { name: 'criterios', detail: 'Obligatorio. Es el rango de celdas que contiene las condiciones especificadas. Puede usar cualquier rango en el argumento criterios mientras este incluya al menos un rótulo de columna y una celda debajo del mismo en la que se pueda especificar una condición para la columna.' },
        },
    },
};

export default locale;

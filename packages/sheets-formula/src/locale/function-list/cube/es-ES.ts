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
        description: 'Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como los beneficios brutos mensuales o la facturación trimestral por empleado, que se usa para supervisar el rendimiento de una organización.',
        abstract: 'Devuelve una propiedad de indicador clave de rendimiento (KPI) y muestra el nombre del KPI en la celda. Un KPI es una medida cuantificable, como los beneficios brutos mensuales o la facturación trimestral por empleado, que se usa para supervisar el rendimiento de una organización.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            kpiName: { name: 'Kpi_name', detail: 'Obligatorio. Una cadena de texto del nombre del KPI en el cubo.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Obligatorio. El componente KPI devuelto, que puede ser uno de los siguientes:' },
            caption: { name: 'Título', detail: 'Opcional. Una cadena de texto alternativa que se muestra en la celda en lugar de nombre_kpi y propiedad_kpi.' },
        },
    },
    CUBEMEMBER: {
        description: 'Devuelve un miembro o tupla del cubo. Se usa para validar la existencia del miembro o tupla en el cubo.',
        abstract: 'Devuelve un miembro o tupla del cubo. Se usa para validar la existencia del miembro o tupla en el cubo.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Obligatorio. Una cadena de texto de una expresión multidimensional (MDX) que evalúa en un miembro único del cubo. Como alternativa, expresión_miembro puede ser una tupla, especificada como un rango de celdas o una constante matricial.' },
            caption: { name: 'Título', detail: 'Opcional. Una cadena de texto mostrada en la celda en vez del título, si se define uno, del cubo. Cuando se devuelve una tupla, el título usado es el del último miembro de la tupla.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'La función PROPIEDADMIEMBROCUBO , una de las funciones de Cubo en Excel, devuelve el valor de una propiedad miembro de un cubo. Se usa para validar la existencia de un nombre de miembro en el cubo y para devolver la propiedad especificada para este miembro.',
        abstract: 'La función PROPIEDADMIEMBROCUBO , una de las funciones de Cubo en Excel, devuelve el valor de una propiedad miembro de un cubo. Se usa para validar la existencia de un nombre de miembro en el cubo y para devolver la propiedad especificada para este miembro.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Obligatorio. Una cadena de texto de una expresión multidimensional (MDX) de un miembro dentro del cubo.' },
            property: { name: 'Propiedad', detail: 'Obligatorio. Una cadena de texto del nombre de la propiedad devuelta o una referencia a una celda que contiene el nombre de la propiedad.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Devuelve el miembro n, o clasificado, en un conjunto. Se usa para devolver uno o más elementos de un conjunto, por ejemplo, el cantante que más discos vende o los 10 mejores alumnos.',
        abstract: 'Devuelve el miembro n, o clasificado, en un conjunto. Se usa para devolver uno o más elementos de un conjunto, por ejemplo, el cantante que más discos vende o los 10 mejores alumnos.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            setExpression: { name: 'Set_expression', detail: 'Obligatorio. Una cadena de texto de una expresión de conjunto, como "{[Elemento1].hijos}". Expresión_conjunto también puede ser la función CONJUNTOCUBO o una referencia a una celda que contiene la función CONJUNTOCUBO.' },
            rank: { name: 'Rango', detail: 'Obligatorio. Un valor entero que especifica el valor superior que se va a devolver. Si la clasificación es un valor de 1, devuelve el valor superior, si la clasificación es un valor de 2, devuelve el segundo más alto y así sucesivamente. Para devolver los 5 primeros valores, use MIEMBRORANGOCUBO cinco veces, especificando una clasificación diferente, del 1 al 5, cada vez.' },
            caption: { name: 'Título', detail: 'Opcional. Una cadena de texto mostrada en la celda en vez del título, si se define uno, del cubo.' },
        },
    },
    CUBESET: {
        description: 'Define un conjunto calculado de miembros o tuplas mediante el envío de una expresión de conjunto al cubo en el servidor, lo que crea el conjunto y, después, devuelve dicho conjunto a Microsoft Excel.',
        abstract: 'Define un conjunto calculado de miembros o tuplas mediante el envío de una expresión de conjunto al cubo en el servidor, lo que crea el conjunto y, después, devuelve dicho conjunto a Microsoft Excel.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            setExpression: { name: 'Set_expression', detail: 'Obligatorio. Una cadena de texto de una expresión de conjunto que tiene como resultado un conjunto de miembros o tuplas. Expresión_conjunto también puede ser una referencia de celda a un rango de Excel que contiene uno o más miembros, tuplas o conjuntos incluidos en el conjunto.' },
            caption: { name: 'Título', detail: 'Opcional. Una cadena de texto mostrada en la celda en vez del título, si se define uno, del cubo.' },
            sortOrder: { name: 'Sort_order', detail: 'Opcional. El tipo de ordenación, de haber alguno, que se va a realizar, que puede ser uno de los siguientes:' },
            sortBy: { name: 'Sort_by', detail: 'Opcional. Una cadena de texto del valor por el que ordenar. Por ejemplo, para obtener la ciudad con las ventas más elevadas, expresión_conjunto sería un conjunto de ciudades y ordenar_por sería la medición de ventas. O bien, para obtener la ciudad con la población más elevada, expresión_conjunto sería un conjunto de ciudades y ordenar_por sería la medición de la población. Si criterio_ordenación requiere ordenar_por, y ordenar_por se omite, CONJUNTOCUBO devuelve el mensaje de error #¡VALOR!. mensaje de error.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Devuelve el número de elementos de un conjunto.',
        abstract: 'Devuelve el número de elementos de un conjunto.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Establecer', detail: 'Obligatorio. Una cadena de texto de una expresión de Microsoft Excel que se evalúa como un conjunto definido por la función CONJUNTOCUBO. El conjunto también puede ser la función CONJUNTOCUBO o una referencia a una celda que contiene la función CONJUNTOCUBO.' },
        },
    },
    CUBEVALUE: {
        description: 'Devuelve un valor agregado del cubo.',
        abstract: 'Devuelve un valor agregado del cubo.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexión', detail: 'Obligatorio. Una cadena de texto del nombre de la conexión al cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Opcional. Una cadena de texto de una expresión multidimensional (MDX) que se evalúa como un miembro o tupla dentro del cubo. Como alternativa, expresión_miembro puede ser un conjunto definido con la función CONJUNTOCUBO. Use expresión_miembro como rebanador para definir la parte del cubo para la que se devuelve el valor agregado. Si no se especifica ninguna medida en expresión_miembro, se usa la medida predeterminada para dicho cubo.' },
        },
    },
};

export default locale;

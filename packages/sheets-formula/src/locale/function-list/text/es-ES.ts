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
    ASC: {
        description: 'Cambia las letras inglesas o katakana de ancho completo (doble byte) dentro de una cadena de caracteres a caracteres de ancho medio (un solo byte)',
        abstract: 'Cambia las letras inglesas o katakana de ancho completo (doble byte) dentro de una cadena de caracteres a caracteres de ancho medio (un solo byte)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto o una referencia a una celda que contiene el texto que desea cambiar. Si el texto no contiene ninguna letra de ancho completo, el texto no se cambia.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Devuelve una matriz de valores de texto desde cualquier rango especificado',
        abstract: 'Devuelve una matriz de valores de texto desde cualquier rango especificado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz a devolver como texto.' },
            format: { name: 'formato', detail: 'El formato de los datos devueltos. Puede ser uno de dos valores: \n0 Predeterminado. Formato conciso y fácil de leer. \n1 Formato estricto que incluye caracteres de escape y delimitadores de fila. Genera una cadena que se puede analizar al introducirla en la barra de fórmulas. Encapsula las cadenas devueltas entre comillas, excepto para valores booleanos, números y errores.' },
        },
    },
    BAHTTEXT: {
        description: 'Convierte un número a texto, usando el formato de moneda ß (baht)',
        abstract: 'Convierte un número a texto, usando el formato de moneda ß (baht)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Un número que desea convertir a texto, o una referencia a una celda que contiene un número, o una fórmula que se evalúa como un número.' },
        },
    },
    CHAR: {
        description: 'Devuelve el carácter especificado por el número de código',
        abstract: 'Devuelve el carácter especificado por el número de código',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Un número entre 1 y 255 que especifica qué carácter desea. El carácter es del juego de caracteres utilizado por su ordenador.' },
        },
    },
    CLEAN: {
        description: 'Elimina todos los caracteres no imprimibles del texto',
        abstract: 'Elimina todos los caracteres no imprimibles del texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Cualquier información de la hoja de cálculo de la que desee eliminar caracteres no imprimibles.' },
        },
    },
    CODE: {
        description: 'Devuelve un código numérico para el primer carácter de una cadena de texto',
        abstract: 'Devuelve un código numérico para el primer carácter de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto del que desea el código del primer carácter.' },
        },
    },
    CONCAT: {
        description: 'Combina el texto de múltiples rangos y/o cadenas, pero no proporciona los argumentos de delimitador o IgnoreEmpty.',
        abstract: 'Combina el texto de múltiples rangos y/o cadenas, pero no proporciona los argumentos de delimitador o IgnoreEmpty',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'texto1', detail: 'Elemento de texto a unir. Una cadena, o una matriz de cadenas, como un rango de celdas.' },
            text2: { name: 'texto2', detail: 'Elementos de texto adicionales a unir. Puede haber un máximo de 253 argumentos de texto para los elementos de texto. Cada uno puede ser una cadena, o una matriz de cadenas, como un rango de celdas.' },
        },
    },
    CONCATENATE: {
        description: 'Une varios elementos de texto en uno solo',
        abstract: 'Une varios elementos de texto en uno solo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'texto1', detail: 'El primer elemento a unir. El elemento puede ser un valor de texto, un número o una referencia de celda.' },
            text2: { name: 'texto2', detail: 'Elementos de texto adicionales a unir. Puede tener hasta 255 elementos, hasta un total de 8,192 caracteres.' },
        },
    },
    DBCS: {
        description: 'Cambia las letras inglesas o katakana de ancho medio (un solo byte) dentro de una cadena de caracteres a caracteres de ancho completo (doble byte)',
        abstract: 'Cambia las letras inglesas o katakana de ancho medio (un solo byte) dentro de una cadena de caracteres a caracteres de ancho completo (doble byte)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto o una referencia a una celda que contiene el texto que desea cambiar. Si el texto no contiene ninguna letra inglesa de ancho medio o katakana, el texto no se cambia.' },
        },
    },
    DOLLAR: {
        description: 'Convierte un número a texto usando el formato de moneda',
        abstract: 'Convierte un número a texto usando el formato de moneda',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Un número, una referencia a una celda que contiene un número, o una fórmula que se evalúa como un número.' },
            decimals: { name: 'decimales', detail: 'El número de dígitos a la derecha del punto decimal. Si es negativo, el número se redondea a la izquierda del punto decimal. Si omite los decimales, se asume que son 2.' },
        },
    },
    EXACT: {
        description: 'Comprueba si dos valores de texto son idénticos',
        abstract: 'Comprueba si dos valores de texto son idénticos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'texto1', detail: 'La primera cadena de texto.' },
            text2: { name: 'texto2', detail: 'La segunda cadena de texto.' },
        },
    },
    FIND: {
        description: 'Busca un valor de texto dentro de otro (distingue mayúsculas y minúsculas)',
        abstract: 'Busca un valor de texto dentro de otro (distingue mayúsculas y minúsculas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'texto_buscado', detail: 'El texto que desea buscar.' },
            withinText: { name: 'dentro_del_texto', detail: 'El texto que contiene el texto que desea buscar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el carácter en el que iniciar la búsqueda. Si omite núm_inicial, se asume que es 1.' },
        },
    },
    FINDB: {
        description: 'Busca un valor de texto dentro de otro (distingue mayúsculas y minúsculas)',
        abstract: 'Busca un valor de texto dentro de otro (distingue mayúsculas y minúsculas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'texto_buscado', detail: 'El texto que desea buscar.' },
            withinText: { name: 'dentro_del_texto', detail: 'El texto que contiene el texto que desea buscar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el carácter en el que iniciar la búsqueda. Si omite núm_inicial, se asume que es 1.' },
        },
    },
    FIXED: {
        description: 'Formatea un número como texto con un número fijo de decimales',
        abstract: 'Formatea un número como texto con un número fijo de decimales',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea redondear y convertir a texto.' },
            decimals: { name: 'decimales', detail: 'El número de dígitos a la derecha del punto decimal. Si es negativo, el número se redondea a la izquierda del punto decimal. Si omite los decimales, se asume que son 2.' },
            noCommas: { name: 'sin_comas', detail: 'Un valor lógico que, si es VERDADERO, evita que DECIMAL incluya comas en el texto devuelto.' },
        },
    },
    LEFT: {
        description: 'Devuelve los caracteres del principio de una cadena de texto',
        abstract: 'Devuelve los caracteres del principio de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            numChars: { name: 'núm_de_caracteres', detail: 'Especifica el número de caracteres que desea que IZQUIERDA extraiga.' },
        },
    },
    LEFTB: {
        description: 'Devuelve los caracteres del principio de una cadena de texto',
        abstract: 'Devuelve los caracteres del principio de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            numBytes: { name: 'núm_de_bytes', detail: 'Especifica el número de caracteres que desea que IZQUIERDAB extraiga, basado en bytes.' },
        },
    },
    LEN: {
        description: 'Devuelve el número de caracteres de una cadena de texto',
        abstract: 'Devuelve el número de caracteres de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto cuya longitud desea encontrar. Los espacios cuentan como caracteres.' },
        },
    },
    LENB: {
        description: 'Devuelve el número de bytes utilizados para representar los caracteres de una cadena de texto.',
        abstract: 'Devuelve el número de bytes utilizados para representar los caracteres de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto cuya longitud desea encontrar. Los espacios cuentan como caracteres.' },
        },
    },
    LOWER: {
        description: 'Convierte el texto a minúsculas.',
        abstract: 'Convierte el texto a minúsculas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto que desea convertir a minúsculas.' },
        },
    },
    MID: {
        description: 'Devuelve un número específico de caracteres de una cadena de texto, comenzando en la posición que especifique.',
        abstract: 'Devuelve un número específico de caracteres de una cadena de texto, comenzando en la posición que especifique',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            startNum: { name: 'núm_inicial', detail: 'La posición del primer carácter que desea extraer en el texto.' },
            numChars: { name: 'núm_de_caracteres', detail: 'Especifica el número de caracteres que desea que EXTRAE extraiga.' },
        },
    },
    MIDB: {
        description: 'Devuelve un número específico de caracteres de una cadena de texto, comenzando en la posición que especifique',
        abstract: 'Devuelve un número específico de caracteres de una cadena de texto, comenzando en la posición que especifique',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            startNum: { name: 'núm_inicial', detail: 'La posición del primer carácter que desea extraer en el texto.' },
            numBytes: { name: 'núm_de_bytes', detail: 'Especifica el número de caracteres que desea que EXTRAEB extraiga, basado en bytes.' },
        },
    },
    NUMBERSTRING: {
        description: 'Convertir números a cadenas chinas',
        abstract: 'Convertir números a cadenas chinas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor convertido a una cadena china.' },
            type: { name: 'tipo', detail: 'El tipo del resultado devuelto. \n1. Minúsculas chinas \n2. Mayúsculas chinas \n3. Caracteres chinos para lectura y escritura' },
        },
    },
    NUMBERVALUE: {
        description: 'Convierte texto a número de una manera independiente de la configuración regional',
        abstract: 'Convierte texto a número de una manera independiente de la configuración regional',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto a convertir en número.' },
            decimalSeparator: { name: 'separador_decimal', detail: 'El carácter utilizado para separar la parte entera y la fraccionaria del resultado.' },
            groupSeparator: { name: 'separador_de_grupo', detail: 'El carácter utilizado para separar agrupaciones de números.' },
        },
    },
    PHONETIC: {
        description: 'Extrae los caracteres fonéticos (furigana) de una cadena de texto',
        abstract: 'Extrae los caracteres fonéticos (furigana) de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Referencia', detail: 'Texto, rango o referencia que contiene el texto fonético que desea extraer.' },
        },
    },
    PROPER: {
        description: 'Pone en mayúscula la primera letra de cada palabra de un valor de texto',
        abstract: 'Pone en mayúscula la primera letra de cada palabra de un valor de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Texto entre comillas, una fórmula que devuelve texto o una referencia a una celda que contiene el texto que desea capitalizar parcialmente.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extrae las primeras cadenas secundarias que coincidan con una expresión regular.',
        abstract: 'Extrae las primeras cadenas secundarias que coincidan con una expresión regular.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/3098244?hl=es',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Nota: El ejemplo anterior devolverá dos columnas de datos, "extraer" en la primera y "valores" en la segunda.' },
            regularExpression: { name: 'expresión_regular', detail: 'Se devolverá la primera parte del texto que coincida con esta expresión.' },
        },
    },
    REGEXMATCH: {
        description: 'Indica si parte de un texto coincide con una expresión regular.',
        abstract: 'Indica si parte de un texto coincide con una expresión regular.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/3098292?hl=es',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'texto que se va a comprobar con la expresión regular.' },
            regularExpression: { name: 'expresión_regular', detail: 'expresión regular que se va a usar para comprobar el texto.' },
        },
    },
    REGEXREPLACE: {
        description: 'Sustituye parte de una cadena de texto por otra cadena mediante expresiones regulares.',
        abstract: 'Sustituye parte de una cadena de texto por otra cadena mediante expresiones regulares.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/3098245?hl=es',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'texto del que se va a sustituir una parte.' },
            regularExpression: { name: 'expresión_regular', detail: 'la expresión regular. Se sustituirán todas las instancias que coincidan con texto .' },
            replacement: { name: 'reemplazo', detail: 'texto que se insertará en el texto original.' },
        },
    },
    REPLACE: {
        description: 'Reemplaza caracteres dentro del texto',
        abstract: 'Reemplaza caracteres dentro del texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'texto_antiguo', detail: 'Texto en el que desea reemplazar algunos caracteres.' },
            startNum: { name: 'núm_inicial', detail: 'La posición del carácter en texto_antiguo que desea reemplazar con texto_nuevo.' },
            numChars: { name: 'núm_de_caracteres', detail: 'El número de caracteres en texto_antiguo que desea que REEMPLAZAR reemplace con texto_nuevo.' },
            newText: { name: 'texto_nuevo', detail: 'El texto que reemplazará los caracteres en texto_antiguo.' },
        },
    },
    REPLACEB: {
        description: 'Reemplaza caracteres dentro del texto',
        abstract: 'Reemplaza caracteres dentro del texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'texto_antiguo', detail: 'Texto en el que desea reemplazar algunos caracteres.' },
            startNum: { name: 'núm_inicial', detail: 'La posición del carácter en texto_antiguo que desea reemplazar con texto_nuevo.' },
            numBytes: { name: 'núm_de_bytes', detail: 'El número de bytes en texto_antiguo que desea que REEMPLAZARB reemplace con texto_nuevo.' },
            newText: { name: 'texto_nuevo', detail: 'El texto que reemplazará los caracteres en texto_antiguo.' },
        },
    },
    REPT: {
        description: 'Repite el texto un número determinado de veces',
        abstract: 'Repite el texto un número determinado de veces',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto que desea repetir.' },
            numberTimes: { name: 'núm_de_veces', detail: 'Un número positivo que especifica el número de veces que se debe repetir el texto.' },
        },
    },
    RIGHT: {
        description: 'Devuelve los caracteres del final de una cadena de texto',
        abstract: 'Devuelve los caracteres del final de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            numChars: { name: 'núm_de_caracteres', detail: 'Especifica el número de caracteres que desea que DERECHA extraiga.' },
        },
    },
    RIGHTB: {
        description: 'Devuelve los caracteres del final de una cadena de texto',
        abstract: 'Devuelve los caracteres del final de una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La cadena de texto que contiene los caracteres que desea extraer.' },
            numBytes: { name: 'núm_de_bytes', detail: 'Especifica el número de caracteres que desea que DERECHAB extraiga, basado en bytes.' },
        },
    },
    SEARCH: {
        description: 'Busca un valor de texto dentro de otro (no distingue mayúsculas y minúsculas)',
        abstract: 'Busca un valor de texto dentro de otro (no distingue mayúsculas y minúsculas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'texto_buscado', detail: 'El texto que desea buscar.' },
            withinText: { name: 'dentro_del_texto', detail: 'El texto que contiene el texto que desea buscar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el carácter en el que iniciar la búsqueda. Si omite núm_inicial, se asume que es 1.' },
        },
    },
    SEARCHB: {
        description: 'Busca un valor de texto dentro de otro (no distingue mayúsculas y minúsculas)',
        abstract: 'Busca un valor de texto dentro de otro (no distingue mayúsculas y minúsculas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'texto_buscado', detail: 'El texto que desea buscar.' },
            withinText: { name: 'dentro_del_texto', detail: 'El texto que contiene el texto que desea buscar.' },
            startNum: { name: 'núm_inicial', detail: 'Especifica el carácter en el que iniciar la búsqueda. Si omite núm_inicial, se asume que es 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Sustituye el texto antiguo por texto nuevo en una cadena de texto',
        abstract: 'Sustituye el texto antiguo por texto nuevo en una cadena de texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto o la referencia a una celda que contiene el texto en el que desea sustituir caracteres.' },
            oldText: { name: 'texto_antiguo', detail: 'El texto que desea reemplazar.' },
            newText: { name: 'texto_nuevo', detail: 'El texto con el que desea reemplazar texto_antiguo.' },
            instanceNum: { name: 'núm_de_instancia', detail: 'Especifica qué ocurrencia de texto_antiguo desea reemplazar con texto_nuevo. Si especifica núm_de_instancia, solo se reemplaza esa instancia de texto_antiguo. De lo contrario, cada ocurrencia de texto_antiguo en texto se cambia por texto_nuevo.' },
        },
    },
    T: {
        description: 'Convierte sus argumentos a texto',
        abstract: 'Convierte sus argumentos a texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor que desea probar.' },
        },
    },
    TEXT: {
        description: 'Da formato a un número y lo convierte en texto',
        abstract: 'Da formato a un número y lo convierte en texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'Un valor numérico que desea convertir a texto.' },
            formatText: { name: 'formato_texto', detail: 'Una cadena de texto que define el formato que desea aplicar al valor suministrado.' },
        },
    },
    TEXTAFTER: {
        description: 'Devuelve el texto que aparece después de un carácter o cadena dados',
        abstract: 'Devuelve el texto que aparece después de un carácter o cadena dados',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto en el que está buscando. No se permiten caracteres comodín.' },
            delimiter: { name: 'delimitador', detail: 'El texto que marca el punto después del cual desea extraer.' },
            instanceNum: { name: 'núm_de_instancia', detail: 'La instancia del delimitador después de la cual desea extraer el texto.' },
            matchMode: { name: 'modo_de_coincidencia', detail: 'Determina si la búsqueda de texto distingue entre mayúsculas y minúsculas. El valor predeterminado es sensible a mayúsculas y minúsculas.' },
            matchEnd: { name: 'coincidir_final', detail: 'Trata el final del texto como un delimitador. Por defecto, el texto es una coincidencia exacta.' },
            ifNotFound: { name: 'si_no_se_encuentra', detail: 'Valor devuelto si no se encuentra ninguna coincidencia. Por defecto, se devuelve #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'Devuelve el texto que aparece antes de un carácter o cadena dados',
        abstract: 'Devuelve el texto que aparece antes de un carácter o cadena dados',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto en el que está buscando. No se permiten caracteres comodín.' },
            delimiter: { name: 'delimitador', detail: 'El texto que marca el punto antes del cual desea extraer.' },
            instanceNum: { name: 'núm_de_instancia', detail: 'La instancia del delimitador antes de la cual desea extraer el texto.' },
            matchMode: { name: 'modo_de_coincidencia', detail: 'Determina si la búsqueda de texto distingue entre mayúsculas y minúsculas. El valor predeterminado es sensible a mayúsculas y minúsculas.' },
            matchEnd: { name: 'coincidir_final', detail: 'Trata el final del texto como un delimitador. Por defecto, el texto es una coincidencia exacta.' },
            ifNotFound: { name: 'si_no_se_encuentra', detail: 'Valor devuelto si no se encuentra ninguna coincidencia. Por defecto, se devuelve #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'Texto: Combina el texto de múltiples rangos y/o cadenas',
        abstract: 'Texto: Combina el texto de múltiples rangos y/o cadenas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimitador', detail: 'Una cadena de texto, ya sea vacía, o uno o más caracteres entre comillas dobles, o una referencia a una cadena de texto válida.' },
            ignoreEmpty: { name: 'ignorar_vacías', detail: 'Si es VERDADERO, ignora las celdas vacías.' },
            text1: { name: 'texto1', detail: 'Elemento de texto a unir. Una cadena de texto, o una matriz de cadenas, como un rango de celdas.' },
            text2: { name: 'texto2', detail: 'Elementos de texto adicionales a unir. Puede haber un máximo de 252 argumentos de texto para los elementos de texto, incluido texto1. Cada uno puede ser una cadena de texto, o una matriz de cadenas, como un rango de celdas.' },
        },
    },
    TEXTSPLIT: {
        description: 'Divide cadenas de texto usando delimitadores de columna y fila',
        abstract: 'Divide cadenas de texto usando delimitadores de columna y fila',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto a dividir.' },
            colDelimiter: { name: 'delimitador_col', detail: 'El carácter o cadena por el cual dividir la columna.' },
            rowDelimiter: { name: 'delimitador_fila', detail: 'El carácter o cadena en el que dividir la línea.' },
            ignoreEmpty: { name: 'ignorar_vacías', detail: 'Si se deben ignorar las celdas vacías. El valor predeterminado es FALSO.' },
            matchMode: { name: 'modo_de_coincidencia', detail: 'Busca una coincidencia de delimitador en el texto. Por defecto, se realiza una coincidencia sensible a mayúsculas y minúsculas.' },
            padWith: { name: 'rellenar_con', detail: 'El valor a usar para el relleno. Por defecto, se usa #N/A.' },
        },
    },
    TRIM: {
        description: 'Elimina todos los espacios del texto excepto los espacios individuales entre palabras.',
        abstract: 'Elimina espacios del texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto del que desea eliminar los espacios.' },
        },
    },
    UNICHAR: {
        description: 'Devuelve el carácter Unicode al que hace referencia el valor numérico dado',
        abstract: 'Devuelve el carácter Unicode al que hace referencia el valor numérico dado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Número es el número Unicode que representa el carácter.' },
        },
    },
    UNICODE: {
        description: 'Devuelve el número (punto de código) que corresponde al primer carácter del texto',
        abstract: 'Devuelve el número (punto de código) que corresponde al primer carácter del texto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Texto es el carácter del que desea el valor Unicode.' },
        },
    },
    UPPER: {
        description: 'Convierte el texto a mayúsculas',
        abstract: 'Convierte el texto a mayúsculas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto que desea convertir a mayúsculas.' },
        },
    },
    VALUE: {
        description: 'Convierte un argumento de texto a un número',
        abstract: 'Convierte un argumento de texto a un número',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'El texto entre comillas o una referencia a una celda que contiene el texto que desea convertir.' },
        },
    },
    VALUETOTEXT: {
        description: 'Devuelve texto desde cualquier valor especificado',
        abstract: 'Devuelve texto desde cualquier valor especificado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El valor a devolver como texto.' },
            format: { name: 'formato', detail: 'El formato de los datos devueltos. Puede ser uno de dos valores: \n0 Predeterminado. Formato conciso y fácil de leer. \n1 Formato estricto que incluye caracteres de escape y delimitadores de fila. Genera una cadena que se puede analizar al introducirla en la barra de fórmulas. Encapsula las cadenas devueltas entre comillas, excepto para valores booleanos, números y errores.' },
        },
    },
    CALL: {
        description: 'Llama a un procedimiento en una biblioteca de vínculos dinámicos o recurso de código',
        abstract: 'Llama a un procedimiento en una biblioteca de vínculos dinámicos o recurso de código',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Texto del módulo', detail: 'Nombre de la biblioteca de vínculos dinámicos (DLL) que contiene el procedimiento.' },
            procedure: { name: 'Procedimiento', detail: 'Nombre o número ordinal del procedimiento de la DLL.' },
            typeText: { name: 'Texto del tipo', detail: 'Texto que especifica los tipos de datos de los argumentos y del valor devuelto.' },
            argument1: { name: 'Argumento 1', detail: 'Opcional. Primer argumento que se pasa al procedimiento.' },
        },
    },
    EUROCONVERT: {
        description: 'Convierte un número a euros, convierte un número de euros a una moneda de un miembro del euro, o convierte un número de una moneda de un miembro del euro a otra usando el euro como intermediario (triangulación)',
        abstract: 'Convierte un número a euros, convierte un número de euros a una moneda de un miembro del euro, o convierte un número de una moneda de un miembro del euro a otra usando el euro como intermediario (triangulación)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Número', detail: 'Valor de moneda que se va a convertir.' },
            source: { name: 'Origen', detail: 'Código de la moneda de origen.' },
            target: { name: 'Destino', detail: 'Código de la moneda de destino.' },
            fullPrecision: { name: 'Precisión completa', detail: 'Valor lógico que controla el redondeo según las reglas específicas de la moneda.' },
            triangulationPrecision: { name: 'Precisión de triangulación', detail: 'Opcional. Número de dígitos significativos de la conversión intermedia a euros.' },
        },
    },
    REGISTER_ID: {
        description: 'Devuelve el ID de registro de la biblioteca de vínculos dinámicos (DLL) especificada o del recurso de código que se ha registrado previamente',
        abstract: 'Devuelve el ID de registro de la biblioteca de vínculos dinámicos (DLL) especificada o del recurso de código que se ha registrado previamente',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Texto del módulo', detail: 'Nombre de la DLL o del recurso de código que contiene el procedimiento.' },
            procedure: { name: 'Procedimiento', detail: 'Nombre o número ordinal del procedimiento.' },
            typeText: { name: 'Texto del tipo', detail: 'Opcional. Texto que especifica los tipos de datos de los argumentos y del valor devuelto.' },
        },
    },
};

export default locale;

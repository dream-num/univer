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
    ABS: {
        description: 'Devuelve el valor absoluto de un número. El valor absoluto de un número es el número sin su signo.',
        abstract: 'Devuelve el valor absoluto de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número real del que desea obtener el valor absoluto.' },
        },
    },
    ACOS: {
        description: 'Devuelve el arcocoseno, o coseno inverso, de un número. El arcocoseno es el ángulo cuyo coseno es el número. El ángulo devuelto se da en radianes en el rango de 0 (cero) a pi.',
        abstract: 'Devuelve el arcocoseno de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El coseno del ángulo que desea y debe estar entre -1 y 1.' },
        },
    },
    ACOSH: {
        description: 'Devuelve el coseno hiperbólico inverso de un número. El número debe ser mayor o igual que 1. El coseno hiperbólico inverso es el valor cuyo coseno hiperbólico es el número, por lo que ACOSH(COSH(número)) es igual a número.',
        abstract: 'Devuelve el coseno hiperbólico inverso de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real igual o mayor que 1.' },
        },
    },
    ACOT: {
        description: 'Devuelve el valor principal del arcocotangente, o cotangente inversa, de un número.',
        abstract: 'Devuelve el arcocotangente de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'número',
                detail: 'Número es la cotangente del ángulo que desea. Debe ser un número real.',
            },
        },
    },
    ACOTH: {
        description: 'Devuelve el arcocotangente hiperbólico de un número',
        abstract: 'Devuelve el arcocotangente hiperbólico de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor absoluto de Número debe ser mayor que 1.' },
        },
    },
    AGGREGATE: {
        description: 'Devuelve un agregado en una lista o base de datos',
        abstract: 'Devuelve un agregado en una lista o base de datos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'núm_función', detail: 'Un número de 1 a 19 que especifica la función que se usará.' },
            options: { name: 'opciones', detail: 'Un valor numérico que determina qué valores del rango de evaluación de la función se omitirán.' },
            ref1: { name: 'ref1', detail: 'El primer argumento numérico para las funciones que tienen varios argumentos numéricos de los que desea obtener el valor agregado.' },
            ref2: { name: 'ref2', detail: 'Argumentos numéricos 2 a 252 cuyo valor agregado desea obtener.' },
        },
    },
    ARABIC: {
        description: 'Convierte un número romano a arábigo, como un número',
        abstract: 'Convierte un número romano a arábigo, como un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'Una cadena entre comillas, una cadena vacía (""), o una referencia a una celda que contiene texto.' },
        },
    },
    ASIN: {
        description: 'Devuelve el arcoseno de un número.',
        abstract: 'Devuelve el arcoseno de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El seno del ángulo que desea y debe estar entre -1 y 1.' },
        },
    },
    ASINH: {
        description: 'Devuelve el seno hiperbólico inverso de un número.',
        abstract: 'Devuelve el seno hiperbólico inverso de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real.' },
        },
    },
    ATAN: {
        description: 'Devuelve el arcotangente de un número.',
        abstract: 'Devuelve el arcotangente de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'La tangente del ángulo que desea.' },
        },
    },
    ATAN2: {
        description: 'Devuelve el arcotangente de las coordenadas x e y.',
        abstract: 'Devuelve el arcotangente de las coordenadas x e y',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_núm', detail: 'La coordenada x del punto.' },
            yNum: { name: 'y_núm', detail: 'La coordenada y del punto.' },
        },
    },
    ATANH: {
        description: 'Devuelve la tangente hiperbólica inversa de un número. El número debe estar entre -1 y 1 (excluyendo -1 y 1). La tangente hiperbólica inversa es el valor cuya tangente hiperbólica es número , de modo que ATANH(TANH(número)) es igual a número .',
        abstract: 'Devuelve la tangente hiperbólica inversa de un número. El número debe estar entre -1 y 1 (excluyendo -1 y 1). La tangente hiperbólica inversa es el valor cuya tangente hiperbólica es número , de modo que ATANH(TANH(número)) es igual a número .',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Obligatorio. Cualquier número real entre 1 y -1.' },
        },
    },
    BASE: {
        description: 'Convierte un número en una representación de texto con la base dada.',
        abstract: 'Convierte un número en una representación de texto con la base dada.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Obligatorio. El número que desea convertir. Debe ser un entero mayor o igual que 0 y menor que 2^53.' },
            radix: { name: 'base', detail: 'Obligatorio. La base a la que desea convertir el número. Debe ser un entero mayor o igual a 2 y menor o igual a 36.' },
            minLength: { name: 'longitud_mínima', detail: 'Opcional. La longitud mínima de la cadena que se devuelve. Debe ser un entero mayor o igual a 0.' },
        },
    },
    CEILING: {
        description: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa',
        abstract: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
        },
    },
    CEILING_MATH: {
        description: 'Redondea un número hacia arriba, al entero más cercano o al múltiplo más cercano de la cifra significativa',
        abstract: 'Redondea un número hacia arriba, al entero más cercano o al múltiplo más cercano de la cifra significativa',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
            mode: { name: 'modo', detail: 'Para números negativos, controla si el Número se redondea hacia cero o en dirección contraria a cero.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa. Independientemente del signo del número, el número se redondea hacia arriba.',
        abstract: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa. Independientemente del signo del número, el número se redondea hacia arriba.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
        },
    },
    COMBIN: {
        description: 'Devuelve el número de combinaciones para un número dado de objetos',
        abstract: 'Devuelve el número de combinaciones para un número dado de objetos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número de elementos.' },
            numberChosen: { name: 'número_elegido', detail: 'El número de elementos en cada combinación.' },
        },
    },
    COMBINA: {
        description: 'Devuelve el número de combinaciones con repeticiones para un número dado de elementos',
        abstract: 'Devuelve el número de combinaciones con repeticiones para un número dado de elementos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número de elementos.' },
            numberChosen: { name: 'número_elegido', detail: 'El número de elementos en cada combinación.' },
        },
    },
    COS: {
        description: 'Devuelve el coseno de un número.',
        abstract: 'Devuelve el coseno de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea el coseno.' },
        },
    },
    COSH: {
        description: 'Devuelve el coseno hiperbólico de un número',
        abstract: 'Devuelve el coseno hiperbólico de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real del que desee encontrar el coseno hiperbólico.' },
        },
    },
    COT: {
        description: 'Devuelve la cotangente de un ángulo',
        abstract: 'Devuelve la cotangente de un ángulo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea la cotangente.' },
        },
    },
    COTH: {
        description: 'Devuelve la cotangente hiperbólica de un número',
        abstract: 'Devuelve la cotangente hiperbólica de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real del que desee encontrar la cotangente hiperbólica.' },
        },
    },
    CSC: {
        description: 'Devuelve la cosecante de un ángulo',
        abstract: 'Devuelve la cosecante de un ángulo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea la cosecante.' },
        },
    },
    CSCH: {
        description: 'Devuelve la cosecante hiperbólica de un ángulo',
        abstract: 'Devuelve la cosecante hiperbólica de un ángulo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea la cosecante hiperbólica.' },
        },
    },
    DECIMAL: {
        description: 'Convierte una representación de texto de un número en una base dada en un número decimal',
        abstract: 'Convierte una representación de texto de un número en una base dada en un número decimal',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'texto', detail: 'La longitud de la cadena de Texto debe ser menor o igual a 255 caracteres.' },
            radix: { name: 'base', detail: 'La base a la que desea convertir el número. Debe ser un entero mayor o igual a 2 y menor o igual a 36.' },
        },
    },
    DEGREES: {
        description: 'Convierte radianes a grados',
        abstract: 'Convierte radianes a grados',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'ángulo', detail: 'El ángulo en radianes que desea convertir.' },
        },
    },
    EVEN: {
        description: 'Redondea un número hacia arriba al entero par más cercano',
        abstract: 'Redondea un número hacia arriba al entero par más cercano',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor a redondear.' },
        },
    },
    EXP: {
        description: 'Devuelve e elevado a la potencia de un número dado',
        abstract: 'Devuelve e elevado a la potencia de un número dado',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El exponente aplicado a la base e.' },
        },
    },
    FACT: {
        description: 'Devuelve el factorial de un número',
        abstract: 'Devuelve el factorial de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número no negativo del que desea el factorial. Si el número no es un entero, se trunca.' },
        },
    },
    FACTDOUBLE: {
        description: 'Devuelve el doble factorial de un número',
        abstract: 'Devuelve el doble factorial de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número no negativo del que desea el doble factorial. Si el número no es un entero, se trunca.' },
        },
    },
    FLOOR: {
        description: 'Redondea un número hacia abajo, hacia cero',
        abstract: 'Redondea un número hacia abajo, hacia cero',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
        },
    },
    FLOOR_MATH: {
        description: 'Redondea un número hacia abajo, al entero más cercano o al múltiplo más cercano de la cifra significativa',
        abstract: 'Redondea un número hacia abajo, al entero más cercano o al múltiplo más cercano de la cifra significativa',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
            mode: { name: 'modo', detail: 'Para números negativos, controla si el Número se redondea hacia cero o en dirección contraria a cero.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Redondea un número hacia abajo al entero más cercano o al múltiplo más cercano de la cifra significativa. Independientemente del signo del número, el número se redondea hacia abajo.',
        abstract: 'Redondea un número hacia abajo al entero más cercano o al múltiplo más cercano de la cifra significativa.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
        },
    },
    GCD: {
        description: 'Devuelve el máximo común divisor',
        abstract: 'Devuelve el máximo común divisor',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Para encontrar el primer número del máximo común divisor, también puede usar una sola matriz o una referencia a una matriz en lugar de los parámetros separados por comas.' },
            number2: { name: 'número2', detail: 'El segundo número cuyo máximo común divisor se va a encontrar. Se pueden especificar hasta 255 números de esta manera.' },
        },
    },
    INT: {
        description: 'Redondea un número hacia abajo al entero más cercano',
        abstract: 'Redondea un número hacia abajo al entero más cercano',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número real que desea redondear hacia abajo a un entero.' },
        },
    },
    ISO_CEILING: {
        description: 'Devuelve un número redondeado hacia arriba al entero más cercano o al múltiplo más cercano de la cifra significativa',
        abstract: 'Devuelve un número redondeado hacia arriba al entero más cercano o al múltiplo más cercano de la cifra significativa',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que desea redondear.' },
            significance: { name: 'cifra_significativa', detail: 'El múltiplo al que desea redondear.' },
        },
    },
    LCM: {
        description: 'Devuelve el mínimo común múltiplo',
        abstract: 'Devuelve el mínimo común múltiplo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Para encontrar el primer número del mínimo común múltiplo, también puede usar una sola matriz o una referencia a una matriz en lugar de los parámetros separados por comas.' },
            number2: { name: 'número2', detail: 'El segundo número cuyo mínimo común múltiplo se va a encontrar. Se pueden especificar hasta 255 números de esta manera.' },
        },
    },
    LN: {
        description: 'Devuelve el logaritmo natural de un número',
        abstract: 'Devuelve el logaritmo natural de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número real positivo del que desea el logaritmo natural.' },
        },
    },
    LOG: {
        description: 'Devuelve el logaritmo de un número en una base especificada',
        abstract: 'Devuelve el logaritmo de un número en una base especificada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número real positivo del que desea el logaritmo.' },
            base: { name: 'base', detail: 'La base del logaritmo. Si se omite la base, se asume que es 10.' },
        },
    },
    LOG10: {
        description: 'Devuelve el logaritmo en base 10 de un número',
        abstract: 'Devuelve el logaritmo en base 10 de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número real positivo del que desea el logaritmo en base 10.' },
        },
    },
    MDETERM: {
        description: 'Devuelve el determinante matricial de una matriz',
        abstract: 'Devuelve el determinante matricial de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Una matriz numérica con un número igual de filas y columnas.' },
        },
    },
    MINVERSE: {
        description: 'Devuelve la matriz inversa de una matriz',
        abstract: 'Devuelve la matriz inversa de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Una matriz numérica con un número igual de filas y columnas.' },
        },
    },
    MMULT: {
        description: 'Devuelve el producto matricial de dos matrices',
        abstract: 'Devuelve el producto matricial de dos matrices',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Las matrices que desea multiplicar.' },
            array2: { name: 'matriz2', detail: 'Las matrices que desea multiplicar.' },
        },
    },
    MOD: {
        description: 'Devuelve el resto después de que el número se divida por el divisor. El resultado tiene el mismo signo que el divisor.',
        abstract: 'Devuelve el resto de la división',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número del que desea encontrar el resto.' },
            divisor: { name: 'divisor', detail: 'El número por el que desea dividir el número.' },
        },
    },
    MROUND: {
        description: 'Devuelve un número redondeado al múltiplo deseado',
        abstract: 'Devuelve un número redondeado al múltiplo deseado',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor a redondear.' },
            multiple: { name: 'múltiplo', detail: 'El múltiplo al que desea redondear el número.' },
        },
    },
    MULTINOMIAL: {
        description: 'Devuelve el multinomial de un conjunto de números',
        abstract: 'Devuelve el multinomial de un conjunto de números',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer valor o rango a usar en el cálculo.' },
            number2: { name: 'número2', detail: 'Valores o rangos adicionales a usar en los cálculos.' },
        },
    },
    MUNIT: {
        description: 'Devuelve la matriz unitaria o la dimensión especificada',
        abstract: 'Devuelve la matriz unitaria o la dimensión especificada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimensión', detail: 'Dimensión es un entero que especifica la dimensión de la matriz unitaria que desea devolver. Devuelve una matriz. La dimensión debe ser mayor que cero.' },
        },
    },
    ODD: {
        description: 'Redondea un número hacia arriba al entero impar más cercano',
        abstract: 'Redondea un número hacia arriba al entero impar más cercano',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor a redondear.' },
        },
    },
    PI: {
        description: 'Devuelve el valor de pi',
        abstract: 'Devuelve el valor de pi',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Devuelve el resultado de un número elevado a una potencia.',
        abstract: 'Devuelve el resultado de un número elevado a una potencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número base. Puede ser cualquier número real.' },
            power: { name: 'potencia', detail: 'El exponente al que se eleva el número base.' },
        },
    },
    PRODUCT: {
        description: 'Multiplica todos los números dados como argumentos y devuelve el producto.',
        abstract: 'Multiplica sus argumentos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número o rango que desea multiplicar.' },
            number2: { name: 'número2', detail: 'Números o rangos adicionales que desea multiplicar, hasta un máximo de 255 argumentos.' },
        },
    },
    QUOTIENT: {
        description: 'Devuelve la parte entera de una división',
        abstract: 'Devuelve la parte entera de una división',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerador', detail: 'El dividendo.' },
            denominator: { name: 'denominador', detail: 'El divisor.' },
        },
    },
    RADIANS: {
        description: 'Convierte grados a radianes',
        abstract: 'Convierte grados a radianes',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'ángulo', detail: 'Un ángulo en grados que desea convertir.' },
        },
    },
    RAND: {
        description: 'Devuelve un número aleatorio entre 0 y 1',
        abstract: 'Devuelve un número aleatorio entre 0 y 1',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Devuelve una matriz de números aleatorios entre 0 y 1. Sin embargo, puede especificar el número de filas y columnas a rellenar, los valores mínimos y máximos, y si se devuelven números enteros o valores decimales.',
        abstract: 'Devuelve una matriz de números aleatorios entre 0 y 1.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'filas', detail: 'El número de filas que se devolverán' },
            columns: { name: 'columnas', detail: 'El número de columnas que se devolverán' },
            min: { name: 'min', detail: 'El número mínimo que le gustaría que se devolviera' },
            max: { name: 'max', detail: 'El número máximo que le gustaría que se devolviera' },
            wholeNumber: { name: 'número_entero', detail: 'Devolver un número entero o un valor decimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Devuelve un número aleatorio entre los números que especifique',
        abstract: 'Devuelve un número aleatorio entre los números que especifique',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'inferior', detail: 'El entero más pequeño que devolverá ALEATORIO.ENTRE.' },
            top: { name: 'superior', detail: 'El entero más grande que devolverá ALEATORIO.ENTRE.' },
        },
    },
    ROMAN: {
        description: 'Convierte un número arábigo a romano, como texto',
        abstract: 'Convierte un número arábigo a romano, como texto',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número arábigo que desea convertir.' },
            form: { name: 'forma', detail: 'Un número que especifica el tipo de número romano que desea. El estilo del número romano varía de Clásico a Simplificado, volviéndose más conciso a medida que aumenta el valor de la forma.' },
        },
    },
    ROUND: {
        description: 'Redondea un número a un número especificado de dígitos',
        abstract: 'Redondea un número a un número especificado de dígitos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea redondear.' },
            numDigits: { name: 'num_dígitos', detail: 'El número de dígitos al que desea redondear el argumento de número.' },
        },
    },
    ROUNDBANK: {
        description: 'Redondea un número con redondeo bancario',
        abstract: 'Redondea un número con redondeo bancario',
        links: [
            {
                title: 'Instrucción',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea redondear con redondeo bancario.' },
            numDigits: { name: 'num_dígitos', detail: 'El número de dígitos al que desea redondear con redondeo bancario.' },
        },
    },
    ROUNDDOWN: {
        description: 'Redondea un número hacia abajo, hacia cero',
        abstract: 'Redondea un número hacia abajo, hacia cero',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea redondear.' },
            numDigits: { name: 'num_dígitos', detail: 'El número de dígitos al que desea redondear el argumento de número.' },
        },
    },
    ROUNDUP: {
        description: 'Redondea un número hacia arriba, en dirección contraria a cero',
        abstract: 'Redondea un número hacia arriba, en dirección contraria a cero',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea redondear.' },
            numDigits: { name: 'num_dígitos', detail: 'El número de dígitos al que desea redondear el argumento de número.' },
        },
    },
    SEC: {
        description: 'Devuelve la secante de un ángulo',
        abstract: 'Devuelve la secante de un ángulo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Número es el ángulo en radianes del que desea la secante.' },
        },
    },
    SECH: {
        description: 'Devuelve la secante hiperbólica de un ángulo',
        abstract: 'Devuelve la secante hiperbólica de un ángulo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Número es el ángulo en radianes del que desea la secante hiperbólica.' },
        },
    },
    SERIESSUM: {
        description: 'Devuelve la suma de una serie de potencias basada en la fórmula',
        abstract: 'Devuelve la suma de una serie de potencias basada en la fórmula',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor de entrada a la serie de potencias.' },
            n: { name: 'n', detail: 'La potencia inicial a la que desea elevar x.' },
            m: { name: 'm', detail: 'El paso por el cual aumentar n para cada término de la serie.' },
            coefficients: { name: 'coeficientes', detail: 'Un conjunto de coeficientes por los que se multiplica cada potencia sucesiva de x.' },
        },
    },
    SEQUENCE: {
        description: 'Genera una lista de números secuenciales en una matriz, como 1, 2, 3, 4',
        abstract: 'Genera una lista de números secuenciales en una matriz, como 1, 2, 3, 4',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'filas', detail: 'El número de filas a devolver.' },
            columns: { name: 'columnas', detail: 'El número de columnas a devolver.' },
            start: { name: 'inicio', detail: 'El primer número en la secuencia.' },
            step: { name: 'paso', detail: 'La cantidad a incrementar cada valor subsiguiente en la matriz.' },
        },
    },
    SIGN: {
        description: 'Devuelve el signo de un número',
        abstract: 'Devuelve el signo de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real.' },
        },
    },
    SIN: {
        description: 'Devuelve el seno del ángulo dado',
        abstract: 'Devuelve el seno del ángulo dado',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea el seno.' },
        },
    },
    SINH: {
        description: 'Devuelve el seno hiperbólico de un número',
        abstract: 'Devuelve el seno hiperbólico de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real.' },
        },
    },
    SQRT: {
        description: 'Devuelve una raíz cuadrada positiva',
        abstract: 'Devuelve una raíz cuadrada positiva',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número del que desea la raíz cuadrada.' },
        },
    },
    SQRTPI: {
        description: 'Devuelve la raíz cuadrada de (número * pi)',
        abstract: 'Devuelve la raíz cuadrada de (número * pi)',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número por el que se multiplica pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Devuelve un subtotal en una lista o base de datos.',
        abstract: 'Devuelve un subtotal en una lista o base de datos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'núm_función', detail: 'El número 1-11 o 101-111 que especifica la función a usar para el subtotal. 1-11 incluye filas ocultas manualmente, mientras que 101-111 las excluye; las celdas filtradas siempre se excluyen.' },
            ref1: { name: 'ref1', detail: 'El primer rango con nombre o referencia para el que desea el subtotal.' },
            ref2: { name: 'ref2', detail: 'Rangos con nombre o referencias 2 a 254 para los que desea el subtotal.' },
        },
    },
    SUM: {
        description: 'Puede sumar valores individuales, referencias de celda o rangos, o una mezcla de los tres.',
        abstract: 'Suma sus argumentos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Número 1',
                detail: 'El primer número que desea sumar. El número puede ser como 4, una referencia de celda como B6, o un rango de celdas como B2:B8.',
            },
            number2: {
                name: 'Número 2',
                detail: 'Este es el segundo número que desea sumar. Puede especificar hasta 255 números de esta manera.',
            },
        },
    },
    SUMIF: {
        description: 'Suma los valores en un rango que cumplen con los criterios que especifique.',
        abstract: 'Suma las celdas especificadas por un criterio dado',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: 'rango',
                detail: 'El rango de celdas que desea evaluar por criterios.',
            },
            criteria: {
                name: 'criterio',
                detail: 'El criterio en forma de número, expresión, una referencia de celda, texto o una función que define qué celdas se sumarán. Se pueden incluir caracteres comodín: un signo de interrogación (?) para coincidir con cualquier carácter individual, un asterisco (*) para coincidir con cualquier secuencia de caracteres. Si desea encontrar un signo de interrogación o asterisco real, escriba una tilde (~) antes del carácter.',
            },
            sumRange: {
                name: 'rango_suma',
                detail: 'Las celdas reales a sumar, si desea sumar celdas distintas a las especificadas en el argumento de rango. Si se omite el argumento rango_suma, Excel suma las celdas especificadas en el argumento de rango (las mismas celdas a las que se aplica el criterio).',
            },
        },
    },
    SUMIFS: {
        description: 'Suma todos sus argumentos que cumplen con múltiples criterios.',
        abstract: 'Suma todos sus argumentos que cumplen con múltiples criterios.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'rango_suma', detail: 'El rango de celdas a sumar.' },
            criteriaRange1: { name: 'rango_criterio1 ', detail: 'El rango que se prueba usando criterio1. rango_criterio1 y criterio1 establecen un par de búsqueda mediante el cual se busca un rango para criterios específicos. Una vez que se encuentran los elementos en el rango, se suman sus valores correspondientes en rango_suma.' },
            criteria1: { name: 'criterio1', detail: 'El criterio que define qué celdas en rango_criterio1 se sumarán. Por ejemplo, el criterio se puede introducir como 32, ">32", B4, "manzanas" o "32".' },
            criteriaRange2: { name: 'rango_criterio2', detail: 'Rangos adicionales. Puede introducir hasta 127 pares de rangos.' },
            criteria2: { name: 'criterio2', detail: 'Criterios asociados adicionales. Puede introducir hasta 127 pares de criterios.' },
        },
    },
    SUMPRODUCT: {
        description: 'Devuelve la suma de los productos de los componentes correspondientes de la matriz',
        abstract: 'Devuelve la suma de los productos de los componentes correspondientes de la matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz', detail: 'El primer argumento de matriz cuyos componentes desea multiplicar y luego sumar.' },
            array2: { name: 'matriz', detail: 'Argumentos de matriz 2 a 255 cuyos componentes desea multiplicar y luego sumar.' },
        },
    },
    SUMSQ: {
        description: 'Devuelve la suma de los cuadrados de los argumentos',
        abstract: 'Devuelve la suma de los cuadrados de los argumentos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Para elevar al cuadrado y encontrar el primer número, también puede usar una sola matriz o una referencia a una matriz en lugar de parámetros separados por comas.' },
            number2: { name: 'número2', detail: 'El segundo número que se elevará al cuadrado y se sumará. Se pueden especificar hasta 255 números de esta manera.' },
        },
    },
    SUMX2MY2: {
        description: 'Devuelve la suma de la diferencia de cuadrados de los valores correspondientes en dos matrices',
        abstract: 'Devuelve la suma de la diferencia de cuadrados de los valores correspondientes en dos matrices',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriz_x', detail: 'La primera matriz o rango de valores.' },
            arrayY: { name: 'matriz_y', detail: 'La segunda matriz o rango de valores.' },
        },
    },
    SUMX2PY2: {
        description: 'Devuelve la suma de la suma de cuadrados de los valores correspondientes en dos matrices',
        abstract: 'Devuelve la suma de la suma de cuadrados de los valores correspondientes en dos matrices',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriz_x', detail: 'La primera matriz o rango de valores.' },
            arrayY: { name: 'matriz_y', detail: 'La segunda matriz o rango de valores.' },
        },
    },
    SUMXMY2: {
        description: 'Devuelve la suma de los cuadrados de las diferencias de los valores correspondientes en dos matrices',
        abstract: 'Devuelve la suma de los cuadrados de las diferencias de los valores correspondientes en dos matrices',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriz_x', detail: 'La primera matriz o rango de valores.' },
            arrayY: { name: 'matriz_y', detail: 'La segunda matriz o rango de valores.' },
        },
    },
    TAN: {
        description: 'Devuelve la tangente de un número.',
        abstract: 'Devuelve la tangente de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El ángulo en radianes del que desea la tangente.' },
        },
    },
    TANH: {
        description: 'Devuelve la tangente hiperbólica de un número.',
        abstract: 'Devuelve la tangente hiperbólica de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real.' },
        },
    },
    TRUNC: {
        description: 'Trunca un número a un entero',
        abstract: 'Trunca un número a un entero',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea truncar.' },
            numDigits: { name: 'num_dígitos', detail: 'Un número que especifica la precisión del truncamiento. El valor predeterminado para num_dígitos es 0 (cero).' },
        },
    },
};

export default locale;

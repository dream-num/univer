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
                url: 'https://support.microsoft.com/es-es/office/abs-function-3420200f-5628-4e8c-99da-c99d7c87713c',
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
                url: 'https://support.microsoft.com/es-es/office/acos-function-cb73173f-d089-4582-afa1-76e5524b5d5b',
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
                url: 'https://support.microsoft.com/es-es/office/acosh-function-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
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
                url: 'https://support.microsoft.com/es-es/office/acot-function-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
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
                url: 'https://support.microsoft.com/es-es/office/acoth-function-cc49480f-f684-4171-9fc5-73e4e852300f',
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
                url: 'https://support.microsoft.com/es-es/office/aggregate-function-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    ARABIC: {
        description: 'Convierte un número romano a arábigo, como un número',
        abstract: 'Convierte un número romano a arábigo, como un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/arabic-function-9a8da418-c17b-4ef9-a657-9370a30a674f',
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
                url: 'https://support.microsoft.com/es-es/office/asin-function-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
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
                url: 'https://support.microsoft.com/es-es/office/asinh-function-4e00475a-067a-43cf-926a-765b0249717c',
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
                url: 'https://support.microsoft.com/es-es/office/atan-function-50746fa8-630a-406b-81d0-4a2aed395543',
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
                url: 'https://support.microsoft.com/es-es/office/atan2-function-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_núm', detail: 'La coordenada x del punto.' },
            yNum: { name: 'y_núm', detail: 'La coordenada y del punto.' },
        },
    },
    ATANH: {
        description: 'Devuelve la tangente hiperbólica inversa de un número.',
        abstract: 'Devuelve la tangente hiperbólica inversa de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/atanh-function-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Cualquier número real entre 1 y -1.' },
        },
    },
    BASE: {
        description: 'Convierte un número en una representación de texto con la base dada (raíz)',
        abstract: 'Convierte un número en una representación de texto con la base dada (raíz)',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/base-function-2ef61411-aee9-4f29-a811-1c42456c6342',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea convertir. Debe ser un entero mayor o igual a 0 y menor que 2^53.' },
            radix: { name: 'base', detail: 'La base a la que desea convertir el número. Debe ser un entero mayor o igual a 2 y menor o igual a 36.' },
            minLength: { name: 'longitud_mínima', detail: 'La longitud mínima de la cadena devuelta. Debe ser un entero mayor o igual a 0.' },
        },
    },
    CEILING: {
        description: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa',
        abstract: 'Redondea un número al entero más cercano o al múltiplo más cercano de la cifra significativa',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/ceiling-function-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
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
                url: 'https://support.microsoft.com/es-es/office/ceiling-math-function-80f95d2f-b499-4eee-9f16-f795a8e306c8',
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
                url: 'https://support.microsoft.com/es-es/office/ceiling-precise-function-f366a774-527a-4c92-ba49-af0a196e66cb',
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
                url: 'https://support.microsoft.com/es-es/office/combin-function-12a3f276-0a21-423a-8de6-06990aaf638a',
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
                url: 'https://support.microsoft.com/es-es/office/combina-function-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
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
                url: 'https://support.microsoft.com/es-es/office/cos-function-0fb808a5-95d6-4553-8148-22aebdce5f05',
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
                url: 'https://support.microsoft.com/es-es/office/cosh-function-e460d426-c471-43e8-9540-a57ff3b70555',
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
                url: 'https://support.microsoft.com/es-es/office/cot-function-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
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
                url: 'https://support.microsoft.com/es-es/office/coth-function-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
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
                url: 'https://support.microsoft.com/es-es/office/csc-function-07379361-219a-4398-8675-07ddc4f135c1',
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
                url: 'https://support.microsoft.com/es-es/office/csch-function-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
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
                url: 'https://support.microsoft.com/es-es/office/decimal-function-ee554665-6176-46ef-82de-0a283658da2e',
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
                url: 'https://support.microsoft.com/es-es/office/degrees-function-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
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
                url: 'https://support.microsoft.com/es-es/office/even-function-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
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
                url: 'https://support.microsoft.com/es-es/office/exp-function-c578f034-2c45-4c37-bc8c-329660a63abe',
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
                url: 'https://support.microsoft.com/es-es/office/fact-function-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
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
                url: 'https://support.microsoft.com/es-es/office/factdouble-function-e67697ac-d214-48eb-b7b7-cce2589ecac8',
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
                url: 'https://support.microsoft.com/es-es/office/floor-function-14bb497c-24f2-4e04-b327-b0b4de5a8886',
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
                url: 'https://support.microsoft.com/es-es/office/floor-math-function-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
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
                url: 'https://support.microsoft.com/es-es/office/floor-precise-function-f769b468-1452-4617-8dc3-02f842a0702e',
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
                url: 'https://support.microsoft.com/es-es/office/gcd-function-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
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
                url: 'https://support.microsoft.com/es-es/office/int-function-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
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
                url: 'https://support.microsoft.com/es-es/office/iso-ceiling-function-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    LCM: {
        description: 'Devuelve el mínimo común múltiplo',
        abstract: 'Devuelve el mínimo común múltiplo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/lcm-function-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Para encontrar el primer número del mínimo común múltiplo, también puede usar una sola matriz o una referencia a una matriz en lugar de los parámetros separados por comas.' },
            number2: { name: 'número2', detail: 'El segundo número cuyo mínimo común múltiplo se va a encontrar. Se pueden especificar hasta 255 números de esta manera.' },
        },
    },
    LET: {
        description: 'Asigna nombres a los resultados de los cálculos para permitir el almacenamiento de cálculos intermedios, valores o la definición de nombres dentro de una fórmula',
        abstract: 'Asigna nombres a los resultados de los cálculos para permitir el almacenamiento de cálculos intermedios, valores o la definición de nombres dentro de una fórmula',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    LN: {
        description: 'Devuelve el logaritmo natural de un número',
        abstract: 'Devuelve el logaritmo natural de un número',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/ln-function-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
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
                url: 'https://support.microsoft.com/es-es/office/log-function-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
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
                url: 'https://support.microsoft.com/es-es/office/log10-function-c75b881b-49dd-44fb-b6f4-37e3486a0211',
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
                url: 'https://support.microsoft.com/es-es/office/mdeterm-function-e7bfa857-3834-422b-b871-0ffd03717020',
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
                url: 'https://support.microsoft.com/es-es/office/minverse-function-11f55086-adde-4c9f-8eb9-59da2d72efc6',
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
                url: 'https://support.microsoft.com/es-es/office/mmult-function-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
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
                url: 'https://support.microsoft.com/es-es/office/mod-function-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
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
                url: 'https://support.microsoft.com/es-es/office/mround-function-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
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
                url: 'https://support.microsoft.com/es-es/office/multinomial-function-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
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
                url: 'https://support.microsoft.com/es-es/office/munit-function-c9fe916a-dc26-4105-997d-ba22799853a3',
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
                url: 'https://support.microsoft.com/es-es/office/odd-function-deae64eb-e08a-4c88-8b40-6d0b42575c98',
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
                url: 'https://support.microsoft.com/es-es/office/pi-function-264199d0-a3ba-46b8-975a-c4a04608989b',
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
                url: 'https://support.microsoft.com/es-es/office/power-function-d3f2908b-56f4-4c3f-895a-07fb519c362a',
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
                url: 'https://support.microsoft.com/es-es/office/product-function-8e6b5b24-90ee-4650-aeec-80982a0512ce',
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
                url: 'https://support.microsoft.com/es-es/office/quotient-function-9f7bf099-2a18-4282-8fa4-65290cc99dee',
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
                url: 'https://support.microsoft.com/es-es/office/radians-function-ac409508-3d48-45f5-ac02-1497c92de5bf',
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
                url: 'https://support.microsoft.com/es-es/office/rand-function-4cbfa695-8869-4788-8d90-021ea9f5be73',
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
                url: 'https://support.microsoft.com/es-es/office/randarray-function-21261e55-3bec-4885-86a6-8b0a47fd4d33',
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
                url: 'https://support.microsoft.com/es-es/office/randbetween-function-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
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
                url: 'https://support.microsoft.com/es-es/office/roman-function-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
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
                url: 'https://support.microsoft.com/es-es/office/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
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
                url: 'https://support.microsoft.com/es-es/office/rounddown-function-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
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
                url: 'https://support.microsoft.com/es-es/office/roundup-function-f8bc9b23-e795-47db-8703-db171d0c42a7',
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
                url: 'https://support.microsoft.com/es-es/office/sec-function-ff224717-9c87-4170-9b58-d069ced6d5f7',
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
                url: 'https://support.microsoft.com/es-es/office/sech-function-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
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
                url: 'https://support.microsoft.com/es-es/office/seriessum-function-a3ab25b5-1093-4f5b-b084-96c49087f637',
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
                url: 'https://support.microsoft.com/es-es/office/sequence-function-57467a98-57e0-4817-9f14-2eb78519ca90',
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
                url: 'https://support.microsoft.com/es-es/office/sign-function-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
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
                url: 'https://support.microsoft.com/es-es/office/sin-function-cf0e3432-8b9e-483c-bc55-a76651c95602',
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
                url: 'https://support.microsoft.com/es-es/office/sinh-function-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
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
                url: 'https://support.microsoft.com/es-es/office/sqrt-function-654975c2-05c4-4831-9a24-2c65e4040fdf',
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
                url: 'https://support.microsoft.com/es-es/office/sqrtpi-function-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
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
                url: 'https://support.microsoft.com/es-es/office/subtotal-function-7b027003-f060-4ade-9040-e478765b9939',
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
                url: 'https://support.microsoft.com/es-es/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89',
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
                url: 'https://support.microsoft.com/es-es/office/sumif-function-169b8c99-c05c-4483-a712-1697a653039b',
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
                url: 'https://support.microsoft.com/es-es/office/sumifs-function-c9e748f5-7ea7-455d-9406-611cebce642b',
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
                url: 'https://support.microsoft.com/es-es/office/sumproduct-function-16753e75-9f68-4874-94ac-4d2145a2fd2e',
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
                url: 'https://support.microsoft.com/es-es/office/sumsq-function-e3313c02-51cc-4963-aae6-31442d9ec307',
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
                url: 'https://support.microsoft.com/es-es/office/sumx2my2-function-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
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
                url: 'https://support.microsoft.com/es-es/office/sumx2py2-function-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
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
                url: 'https://support.microsoft.com/es-es/office/sumxmy2-function-9d144ac1-4d79-43de-b524-e2ecee23b299',
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
                url: 'https://support.microsoft.com/es-es/office/tan-function-08851a40-179f-4052-b789-d7f699447401',
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
                url: 'https://support.microsoft.com/es-es/office/tanh-function-017222f0-a0c3-4f69-9787-b3202295dc6c',
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
                url: 'https://support.microsoft.com/es-es/office/trunc-function-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número que desea truncar.' },
            numDigits: { name: 'num_dígitos', detail: 'Un número que especifica la precisión del truncamiento. El valor predeterminado para num_dígitos es 0 (cero).' },
        },
    },
};

export default locale;

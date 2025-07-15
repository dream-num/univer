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
    BETADIST: {
        description: 'Devuelve la función de distribución acumulativa beta.',
        abstract: 'Devuelve la función de distribución acumulativa beta.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-beta-function-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor entre A y B en el que se evalúa la función.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            A: { name: 'A', detail: 'Un límite inferior para el intervalo de x.' },
            B: { name: 'B', detail: 'Un límite superior para el intervalo de x.' },
        },
    },
    BETAINV: {
        description: 'Devuelve la función inversa de la función de distribución acumulativa para una distribución beta especificada.',
        abstract: 'Devuelve la función inversa de la función de distribución acumulativa para una distribución beta especificada.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-beta-inv-function-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución beta.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            A: { name: 'A', detail: 'Un límite inferior para el intervalo de x.' },
            B: { name: 'B', detail: 'Un límite superior para el intervalo de x.' },
        },
    },
    BINOMDIST: {
        description: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial.',
        abstract: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-binom-function-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: 'núm_éxito', detail: 'El número de éxitos en los ensayos.' },
            trials: { name: 'ensayos', detail: 'El número de ensayos independientes.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de éxito en cada ensayo.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.BINOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de masa de probabilidad.' },
        },
    },
    CHIDIST: {
        description: 'Devuelve la probabilidad de cola derecha de la distribución chi-cuadrado.',
        abstract: 'Devuelve la probabilidad de cola derecha de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-chi-function-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se desea evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
        },
    },
    CHIINV: {
        description: 'Devuelve la inversa de la probabilidad de cola derecha de la distribución chi-cuadrado.',
        abstract: 'Devuelve la inversa de la probabilidad de cola derecha de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/inv-chi-function-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución chi-cuadrado.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
        },
    },
    CHITEST: {
        description: 'Devuelve la prueba de independencia.',
        abstract: 'Devuelve la prueba de independencia.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/prueba-chi-function-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: 'rango_real', detail: 'El rango de datos que contiene las observaciones para contrastar con los valores esperados.' },
            expectedRange: { name: 'rango_esperado', detail: 'El rango de datos que contiene la proporción del producto de los totales de fila y los totales de columna con respecto al total general.' },
        },
    },
    CONFIDENCE: {
        description: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución normal.',
        abstract: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución normal.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/intervalo-confianza-function-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivel de significación usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la población para el rango de datos y se asume que es conocida.' },
            size: { name: 'tamaño', detail: 'El tamaño de la muestra.' },
        },
    },
    COVAR: {
        description: 'Devuelve la covarianza de la población, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.',
        abstract: 'Devuelve la covarianza de la población.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/covar-function-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Un primer rango de valores de celda.' },
            array2: { name: 'matriz2', detail: 'Un segundo rango de valores de celda.' },
        },
    },
    CRITBINOM: {
        description: 'Devuelve el menor valor para el cual la distribución binomial acumulativa es menor o igual a un valor de criterio.',
        abstract: 'Devuelve el menor valor para el cual la distribución binomial acumulativa es menor o igual a un valor de criterio.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/critbinom-function-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: 'ensayos', detail: 'El número de ensayos de Bernoulli.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de éxito en cada ensayo.' },
            alpha: { name: 'alfa', detail: 'El valor de criterio.' },
        },
    },
    EXPONDIST: {
        description: 'Devuelve la distribución exponencial.',
        abstract: 'Devuelve la distribución exponencial.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-exp-function-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se desea evaluar la distribución.' },
            lambda: { name: 'lambda', detail: 'El valor del parámetro.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.EXP devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    FDIST: {
        description: 'Devuelve la distribución de probabilidad F (de cola derecha).',
        abstract: 'Devuelve la distribución de probabilidad F (de cola derecha).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-f-function-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se evalúa la función.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
        },
    },
    FINV: {
        description: 'Devuelve la inversa de la distribución de probabilidad F (de cola derecha).',
        abstract: 'Devuelve la inversa de la distribución de probabilidad F (de cola derecha).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-f-inv-function-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución F acumulativa.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
        },
    },
    FTEST: {
        description: 'Devuelve el resultado de una prueba F.',
        abstract: 'Devuelve el resultado de una prueba F.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/prueba-f-function-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La primera matriz o rango de datos.' },
            array2: { name: 'matriz2', detail: 'La segunda matriz o rango de datos.' },
        },
    },
    GAMMADIST: {
        description: 'Devuelve la distribución gamma.',
        abstract: 'Devuelve la distribución gamma.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-gamma-function-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.GAMMA devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    GAMMAINV: {
        description: 'Devuelve la inversa de la distribución gamma acumulativa.',
        abstract: 'Devuelve la inversa de la distribución gamma acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gamma-inv-function-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución gamma.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Devuelve la distribución hipergeométrica.',
        abstract: 'Devuelve la distribución hipergeométrica.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-hipergeom-function-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: 'muestra_éxito', detail: 'El número de éxitos en la muestra.' },
            numberSample: { name: 'núm_muestra', detail: 'El tamaño de la muestra.' },
            populationS: { name: 'población_éxito', detail: 'El número de éxitos en la población.' },
            numberPop: { name: 'núm_población', detail: 'El tamaño de la población.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.HIPERGEOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    LOGINV: {
        description: 'Devuelve la inversa de la función de distribución logarítmico-normal acumulativa.',
        abstract: 'Devuelve la inversa de la función de distribución logarítmico-normal acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-log-inv-function-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución logarítmico-normal.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    LOGNORMDIST: {
        description: 'Devuelve la distribución logarítmico-normal acumulativa.',
        abstract: 'Devuelve la distribución logarítmico-normal acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-log-norm-function-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DIST.LOGNORM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    MODE: {
        description: 'Devuelve el valor más común en un conjunto de datos.',
        abstract: 'Devuelve el valor más común en un conjunto de datos.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/moda-function-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea calcular la moda.' },
            number2: { name: 'número2', detail: 'Números, referencias de celda o rangos adicionales para los que desea calcular la moda, hasta un máximo de 255.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Devuelve la distribución binomial negativa.',
        abstract: 'Devuelve la distribución binomial negativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-neg-bin-function-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: 'núm_fracasos', detail: 'El número de fracasos.' },
            numberS: { name: 'núm_éxitos', detail: 'El número umbral de éxitos.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de un éxito.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.NEGBINOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    NORMDIST: {
        description: 'Devuelve la distribución normal acumulativa.',
        abstract: 'Devuelve la distribución normal acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-norm-function-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.NORM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    NORMINV: {
        description: 'Devuelve la inversa de la distribución normal acumulativa.',
        abstract: 'Devuelve la inversa de la distribución normal acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-norm-inv-function-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución normal.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    NORMSDIST: {
        description: 'Devuelve la distribución normal estándar acumulativa.',
        abstract: 'Devuelve la distribución normal estándar acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-norm-estand-function-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor para el que desea la distribución.' },
        },
    },
    NORMSINV: {
        description: 'Devuelve la inversa de la distribución normal estándar acumulativa.',
        abstract: 'Devuelve la inversa de la distribución normal estándar acumulativa.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-norm-estand-inv-function-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución normal.' },
        },
    },
    PERCENTILE: {
        description: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (incluye 0 y 1).',
        abstract: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (incluye 0 y 1).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/percentil-function-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rango de 0 a 1 (incluidos).' },
        },
    },
    PERCENTRANK: {
        description: 'Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1).',
        abstract: 'Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/rango-percentil-function-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            x: { name: 'x', detail: 'El valor cuyo rango desea conocer.' },
            significance: { name: 'cifras_significativas', detail: 'Un valor que identifica el número de dígitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.INC usa tres dígitos (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Devuelve la distribución de Poisson.',
        abstract: 'Devuelve la distribución de Poisson.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/poisson-function-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, POISSON devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de masa de probabilidad.' },
        },
    },
    QUARTILE: {
        description: 'Devuelve el cuartil de un conjunto de datos (incluye 0 y 1).',
        abstract: 'Devuelve el cuartil de un conjunto de datos (incluye 0 y 1).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/cuartil-function-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos para el que desea los valores de cuartil.' },
            quart: { name: 'cuartil', detail: 'El valor de cuartil a devolver.' },
        },
    },
    RANK: {
        description: 'Devuelve el rango de un número en una lista de números.',
        abstract: 'Devuelve el rango de un número en una lista de números.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/jerarquia-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número cuyo rango desea encontrar.' },
            ref: { name: 'ref', detail: 'Una referencia a una lista de números. Los valores no numéricos en ref se ignoran.' },
            order: { name: 'orden', detail: 'Un número que especifica cómo clasificar el número. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden ascendente.' },
        },
    },
    STDEV: {
        description: 'Estima la desviación estándar basándose en una muestra. La desviación estándar es una medida de la dispersión de los valores con respecto al valor promedio (la media).',
        abstract: 'Estima la desviación estándar basándose en una muestra.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/desvest-function-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una muestra de una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 255 correspondientes a una muestra de una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    STDEVP: {
        description: 'Calcula la desviación estándar basándose en la población total dada como argumentos.',
        abstract: 'Calcula la desviación estándar basándose en la población total.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/desvestp-function-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 255 correspondientes a una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    TDIST: {
        description: 'Devuelve la probabilidad de la distribución t de Student.',
        abstract: 'Devuelve la probabilidad de la distribución t de Student.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/distr-t-function-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numérico en el que evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
            tails: { name: 'colas', detail: 'Especifica el número de colas de distribución a devolver. Si Colas = 1, DISTR.T devuelve la distribución de una cola. Si Colas = 2, DISTR.T devuelve la distribución de dos colas.' },
        },
    },
    TINV: {
        description: 'Devuelve la inversa de la probabilidad de la distribución t de Student (dos colas).',
        abstract: 'Devuelve la inversa de la probabilidad de la distribución t de Student (dos colas).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/inv-t-function-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'La probabilidad asociada con la distribución t de Student.' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
        },
    },
    TTEST: {
        description: 'Devuelve la probabilidad asociada con una prueba t de Student.',
        abstract: 'Devuelve la probabilidad asociada con una prueba t de Student.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/prueba-t-function-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La primera matriz o rango de datos.' },
            array2: { name: 'matriz2', detail: 'La segunda matriz o rango de datos.' },
            tails: { name: 'colas', detail: 'Especifica el número de colas de distribución. Si colas = 1, PRUEBA.T usa la distribución de una cola. Si colas = 2, PRUEBA.T usa la distribución de dos colas.' },
            type: { name: 'tipo', detail: 'El tipo de prueba t a realizar.' },
        },
    },
    VAR: {
        description: 'Estima la varianza basándose en una muestra.',
        abstract: 'Estima la varianza basándose en una muestra.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/var-function-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una muestra de una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 255 correspondientes a una muestra de una población.' },
        },
    },
    VARP: {
        description: 'Calcula la varianza basándose en la población total.',
        abstract: 'Calcula la varianza basándose en la población total.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/varp-function-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 255 correspondientes a una población.' },
        },
    },
    WEIBULL: {
        description: 'Devuelve la distribución de Weibull.',
        abstract: 'Devuelve la distribución de Weibull.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/weibull-function-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, WEIBULL devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    ZTEST: {
        description: 'Devuelve el valor de probabilidad de una cola de una prueba z.',
        abstract: 'Devuelve el valor de probabilidad de una cola de una prueba z.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/prueba-z-function-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos contra el que probar x.' },
            x: { name: 'x', detail: 'El valor a probar.' },
            sigma: { name: 'sigma', detail: 'La desviación estándar de la población (conocida). Si se omite, se usa la desviación estándar de la muestra.' },
        },
    },
};

export default locale;

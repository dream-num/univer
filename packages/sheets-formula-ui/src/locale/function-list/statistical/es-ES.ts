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
    AVEDEV: {
        description: 'Devuelve el promedio de las desviaciones absolutas de los puntos de datos con respecto a su media.',
        abstract: 'Devuelve el promedio de las desviaciones absolutas de los puntos de datos con respecto a su media',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/avedev-function-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea el promedio.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea el promedio, hasta un máximo de 255.' },
        },
    },
    AVERAGE: {
        description: 'Devuelve el promedio (media aritmética) de los argumentos.',
        abstract: 'Devuelve el promedio de sus argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: {
                name: 'número1',
                detail: 'El primer número, referencia de celda o rango para el que desea el promedio.',
            },
            number2: {
                name: 'número2',
                detail: 'Números adicionales, referencias de celda o rangos para los que desea el promedio, hasta un máximo de 255.',
            },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Encuentra el promedio ponderado de un conjunto de valores, dados los valores y las ponderaciones correspondientes.',
        abstract: 'Encuentra el promedio ponderado de un conjunto de valores, dados los valores y las ponderaciones correspondientes.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9084098?hl=es&ref_topic=3105600&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Los valores para los que se va a calcular el promedio.' },
            weights: { name: 'ponderaciones', detail: 'La lista de ponderaciones correspondientes a aplicar.' },
            additionalValues: { name: 'valores_adicionales', detail: 'Otros valores para los que se va a calcular el promedio.' },
            additionalWeights: { name: 'ponderaciones_adicionales', detail: 'Otras ponderaciones a aplicar.' },
        },
    },
    AVERAGEA: {
        description: 'Devuelve el promedio de sus argumentos, incluyendo números, texto y valores lógicos.',
        abstract: 'Devuelve el promedio de sus argumentos, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/averagea-function-f5f84098-d453-4f4c-bbba-3d2c66356091',
            },
        ],
        functionParameter: {
            value1: {
                name: 'valor1',
                detail: 'El primer número, referencia de celda o rango para el que desea el promedio.',
            },
            value2: {
                name: 'valor2',
                detail: 'Números adicionales, referencias de celda o rangos para los que desea el promedio, hasta un máximo de 255.',
            },
        },
    },
    AVERAGEIF: {
        description: 'Devuelve el promedio (media aritmética) de todas las celdas en un rango que cumplen un criterio determinado.',
        abstract: 'Devuelve el promedio (media aritmética) de todas las celdas en un rango que cumplen un criterio determinado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/averageif-function-faec8e2e-0dec-4308-af69-f5576d8ac642',
            },
        ],
        functionParameter: {
            range: { name: 'rango', detail: 'Una o más celdas para promediar, incluyendo números o nombres, matrices o referencias que contengan números.' },
            criteria: { name: 'criterio', detail: 'El criterio en forma de número, expresión, referencia de celda o texto que define qué celdas se promedian. Por ejemplo, el criterio puede expresarse como 32, "32", ">32", "manzanas" o B4.' },
            averageRange: { name: 'rango_promedio', detail: 'El conjunto real de celdas a promediar. Si se omite, se utiliza el rango.' },
        },
    },
    AVERAGEIFS: {
        description: 'Devuelve el promedio (media aritmética) de todas las celdas que cumplen múltiples criterios.',
        abstract: 'Devuelve el promedio (media aritmética) de todas las celdas que cumplen múltiples criterios',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/averageifs-function-48910c45-1fc0-4389-a028-f7c5c3001690',
            },
        ],
        functionParameter: {
            averageRange: { name: 'rango_promedio', detail: 'Una o más celdas para promediar, incluyendo números o nombres, matrices o referencias que contengan números.' },
            criteriaRange1: { name: 'rango_criterios1', detail: 'Es el conjunto de celdas a evaluar con el criterio.' },
            criteria1: { name: 'criterio1', detail: 'Se utiliza para definir las celdas cuyo promedio se calculará. Por ejemplo, el criterio puede expresarse como 32, "32", ">32", "manzana" o B4' },
            criteriaRange2: { name: 'rango_criterios2', detail: 'Rangos adicionales. Puede introducir hasta 127 rangos.' },
            criteria2: { name: 'criterio2', detail: 'Criterios adicionales asociados. Puede introducir hasta 127 criterios.' },
        },
    },
    BETA_DIST: {
        description: 'Devuelve la función de distribución acumulativa beta',
        abstract: 'Devuelve la función de distribución acumulativa beta',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/beta-dist-function-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor entre A y B en el que se evalúa la función.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.BETA devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
            A: { name: 'A', detail: 'Un límite inferior para el intervalo de x.' },
            B: { name: 'B', detail: 'Un límite superior para el intervalo de x.' },
        },
    },
    BETA_INV: {
        description: 'Devuelve la inversa de la función de distribución acumulativa para una distribución beta especificada',
        abstract: 'Devuelve la inversa de la función de distribución acumulativa para una distribución beta especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/beta-inv-function-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
    BINOM_DIST: {
        description: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial',
        abstract: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/binom-dist-function-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            numberS: { name: 'núm_éxito', detail: 'El número de éxitos en los ensayos.' },
            trials: { name: 'ensayos', detail: 'El número de ensayos independientes.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de éxito en cada ensayo.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.BINOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Devuelve la probabilidad de un resultado de ensayo usando una distribución binomial',
        abstract: 'Devuelve la probabilidad de un resultado de ensayo usando una distribución binomial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/binom-dist-range-function-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            trials: { name: 'ensayos', detail: 'El número de ensayos independientes.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de éxito en cada ensayo.' },
            numberS: { name: 'núm_éxito', detail: 'El número de éxitos en los ensayos.' },
            numberS2: { name: 'núm_éxito2', detail: 'Si se proporciona, devuelve la probabilidad de que el número de ensayos exitosos se encuentre entre núm_éxito y núm_éxito2.' },
        },
    },
    BINOM_INV: {
        description: 'Devuelve el menor valor para el cual la distribución binomial acumulativa es menor o igual a un valor de criterio',
        abstract: 'Devuelve el menor valor para el cual la distribución binomial acumulativa es menor o igual a un valor de criterio',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/binom-inv-function-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            trials: { name: 'ensayos', detail: 'El número de ensayos de Bernoulli.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de éxito en cada ensayo.' },
            alpha: { name: 'alfa', detail: 'El valor de criterio.' },
        },
    },
    CHISQ_DIST: {
        description: 'Devuelve la probabilidad de cola izquierda de la distribución chi-cuadrado.',
        abstract: 'Devuelve la probabilidad de cola izquierda de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/chisq-dist-function-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se desea evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.CHI devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Devuelve la probabilidad de cola derecha de la distribución chi-cuadrado.',
        abstract: 'Devuelve la probabilidad de cola derecha de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/chisq-dist-rt-function-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se desea evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
        },
    },
    CHISQ_INV: {
        description: 'Devuelve la inversa de la probabilidad de cola izquierda de la distribución chi-cuadrado.',
        abstract: 'Devuelve la inversa de la probabilidad de cola izquierda de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/chisq-inv-function-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución chi-cuadrado.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Devuelve la inversa de la probabilidad de cola derecha de la distribución chi-cuadrado.',
        abstract: 'Devuelve la inversa de la probabilidad de cola derecha de la distribución chi-cuadrado.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/chisq-inv-rt-function-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución chi-cuadrado.' },
            degFreedom: { name: 'grados_libertad', detail: 'El número de grados de libertad.' },
        },
    },
    CHISQ_TEST: {
        description: 'Devuelve la prueba de independencia',
        abstract: 'Devuelve la prueba de independencia',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/chisq-test-function-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            actualRange: { name: 'rango_real', detail: 'El rango de datos que contiene las observaciones para contrastar con los valores esperados.' },
            expectedRange: { name: 'rango_esperado', detail: 'El rango de datos que contiene la proporción del producto de los totales de fila y los totales de columna con respecto al total general.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución normal.',
        abstract: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución normal.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/confidence-norm-function-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivel de significación usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la población para el rango de datos y se asume que es conocida.' },
            size: { name: 'tamaño', detail: 'El tamaño de la muestra.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución t de Student',
        abstract: 'Devuelve el intervalo de confianza para la media de una población, usando una distribución t de Student',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/confidence-t-function-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivel de significación usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, o en otras palabras, un alfa de 0,05 indica un nivel de confianza del 95 por ciento.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la población para el rango de datos y se asume que es conocida.' },
            size: { name: 'tamaño', detail: 'El tamaño de la muestra.' },
        },
    },
    CORREL: {
        description: 'Devuelve el coeficiente de correlación entre dos conjuntos de datos',
        abstract: 'Devuelve el coeficiente de correlación entre dos conjuntos de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/correl-function-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Un primer rango de valores de celda.' },
            array2: { name: 'matriz2', detail: 'Un segundo rango de valores de celda.' },
        },
    },
    COUNT: {
        description: 'Cuenta el número de celdas que contienen números y cuenta los números dentro de la lista de argumentos.',
        abstract: 'Cuenta cuántos números hay en la lista de argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c',
            },
        ],
        functionParameter: {
            value1: {
                name: 'valor1',
                detail: 'El primer elemento, referencia de celda o rango dentro del cual desea contar números.',
            },
            value2: {
                name: 'valor2',
                detail: 'Hasta 255 elementos, referencias de celda o rangos adicionales dentro de los cuales desea contar números.',
            },
        },
    },
    COUNTA: {
        description: `Cuenta las celdas que contienen cualquier tipo de información, incluyendo valores de error y texto vacío ("")
        Si no necesita contar valores lógicos, texto o valores de error`,
        abstract: 'Cuenta cuántos valores hay en la lista de argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/counta-function-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'valor1',
                detail: 'El primer argumento que representa los valores que desea contar.',
            },
            number2: {
                name: 'valor2',
                detail: 'Argumentos adicionales que representan los valores que desea contar, hasta un máximo de 255 argumentos.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Cuenta el número de celdas en blanco dentro de un rango.',
        abstract: 'Cuenta el número de celdas en blanco dentro de un rango',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/countblank-function-6a92d772-675c-4bee-b346-24af6bd3ac22',
            },
        ],
        functionParameter: {
            range: { name: 'rango', detail: 'El rango desde el cual desea contar las celdas en blanco.' },
        },
    },
    COUNTIF: {
        description: 'Cuenta el número de celdas dentro de un rango que cumplen el criterio dado.',
        abstract: 'Cuenta el número de celdas dentro de un rango que cumplen el criterio dado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34',
            },
        ],
        functionParameter: {
            range: { name: 'rango', detail: 'El grupo de celdas que desea contar. El rango puede contener números, matrices, un rango con nombre o referencias que contengan números. Los valores en blanco y de texto se ignoran.' },
            criteria: { name: 'criterio', detail: 'Un número, expresión, referencia de celda o cadena de texto que determina qué celdas se contarán.\nPor ejemplo, puede usar un número como 32, una comparación como ">32", una celda como B4 o una palabra como "manzanas".\nCONTAR.SI usa solo un único criterio. Use CONTAR.SI.CONJUNTO si desea usar múltiples criterios.' },
        },
    },
    COUNTIFS: {
        description: 'Cuenta el número de celdas dentro de un rango que cumplen múltiples criterios.',
        abstract: 'Cuenta el número de celdas dentro de un rango que cumplen múltiples criterios',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'rango_criterios1', detail: 'El primer rango en el que evaluar los criterios asociados.' },
            criteria1: { name: 'criterio1', detail: 'El criterio en forma de número, expresión, referencia de celda o texto que define qué celdas se contarán. Por ejemplo, los criterios pueden expresarse como 32, ">32", B4, "manzanas" o "32".' },
            criteriaRange2: { name: 'rango_criterios2', detail: 'Rangos adicionales. Puede introducir hasta 127 rangos.' },
            criteria2: { name: 'criterio2', detail: 'Criterios adicionales asociados. Puede introducir hasta 127 criterios.' },
        },
    },
    COVARIANCE_P: {
        description: 'Devuelve la covarianza de la población, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.',
        abstract: 'Devuelve la covarianza de la población',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/covariance-p-function-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Un primer rango de valores de celda.' },
            array2: { name: 'matriz2', detail: 'Un segundo rango de valores de celda.' },
        },
    },
    COVARIANCE_S: {
        description: 'Devuelve la covarianza de la muestra, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.',
        abstract: 'Devuelve la covarianza de la muestra',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Un primer rango de valores de celda.' },
            array2: { name: 'matriz2', detail: 'Un segundo rango de valores de celda.' },
        },
    },
    DEVSQ: {
        description: 'Devuelve la suma de los cuadrados de las desviaciones',
        abstract: 'Devuelve la suma de los cuadrados de las desviaciones',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/devsq-function-8b739616-8376-4df5-8bd0-cfe0a6caf444',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento para el que desea calcular la suma de las desviaciones al cuadrado.' },
            number2: { name: 'número2', detail: 'Los argumentos del 2 al 255 para los que desea calcular la suma de las desviaciones al cuadrado.' },
        },
    },
    EXPON_DIST: {
        description: 'Devuelve la distribución exponencial',
        abstract: 'Devuelve la distribución exponencial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/expon-dist-function-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se desea evaluar la distribución.' },
            lambda: { name: 'lambda', detail: 'El valor del parámetro.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.EXP devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    F_DIST: {
        description: 'Devuelve la distribución de probabilidad F',
        abstract: 'Devuelve la distribución de probabilidad F',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/f-dist-function-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se evalúa la función.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.F devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    F_DIST_RT: {
        description: 'Devuelve la distribución de probabilidad F (de cola derecha)',
        abstract: 'Devuelve la distribución de probabilidad F (de cola derecha)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/f-dist-rt-function-d74cbb00-6017-4ac9-b7d7-6049badc0520',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en el que se evalúa la función.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
        },
    },
    F_INV: {
        description: 'Devuelve la inversa de la distribución de probabilidad F',
        abstract: 'Devuelve la inversa de la distribución de probabilidad F',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/f-inv-function-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución F acumulativa.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
        },
    },
    F_INV_RT: {
        description: 'Devuelve la inversa de la distribución de probabilidad F (de cola derecha)',
        abstract: 'Devuelve la inversa de la distribución de probabilidad F (de cola derecha)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/f-inv-rt-function-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución F acumulativa.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Los grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Los grados de libertad del denominador.' },
        },
    },
    F_TEST: {
        description: 'Devuelve el resultado de una prueba F',
        abstract: 'Devuelve el resultado de una prueba F',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/f-test-function-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La primera matriz o rango de datos.' },
            array2: { name: 'matriz2', detail: 'La segunda matriz o rango de datos.' },
        },
    },
    FISHER: {
        description: 'Devuelve la transformación de Fisher',
        abstract: 'Devuelve la transformación de Fisher',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/fisher-function-d656523c-5076-4f95-b87b-7741bf236c69',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Un valor numérico para el que desea la transformación.' },
        },
    },
    FISHERINV: {
        description: 'Devuelve la inversa de la transformación de Fisher',
        abstract: 'Devuelve la inversa de la transformación de Fisher',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/fisherinv-function-62504b39-415a-4284-a285-19c8e82f86bb',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'El valor para el que desea realizar la inversa de la transformación.' },
        },
    },
    FORECAST: {
        description: 'Devuelve un valor a lo largo de una tendencia lineal',
        abstract: 'Devuelve un valor a lo largo de una tendencia lineal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El punto de datos para el que desea predecir un valor.' },
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    FORECAST_ETS: {
        description: 'Devuelve un valor futuro basado en valores existentes (históricos) utilizando la versión AAA del algoritmo de Suavizado Exponencial (ETS)',
        abstract: 'Devuelve un valor futuro basado en valores existentes (históricos) utilizando la versión AAA del algoritmo de Suavizado Exponencial (ETS)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Devuelve un intervalo de confianza para el valor de pronóstico en la fecha objetivo especificada',
        abstract: 'Devuelve un intervalo de confianza para el valor de pronóstico en la fecha objetivo especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Devuelve la longitud del patrón repetitivo que Excel detecta para la serie temporal especificada',
        abstract: 'Devuelve la longitud del patrón repetitivo que Excel detecta para la serie temporal especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Devuelve un valor estadístico como resultado de la previsión de series temporales',
        abstract: 'Devuelve un valor estadístico como resultado de la previsión de series temporales',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Devuelve un valor futuro basado en valores existentes',
        abstract: 'Devuelve un valor futuro basado en valores existentes',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El punto de datos para el que desea predecir un valor.' },
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    FREQUENCY: {
        description: 'Devuelve una distribución de frecuencia como una matriz vertical',
        abstract: 'Devuelve una distribución de frecuencia como una matriz vertical',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/frequency-function-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            dataArray: { name: 'matriz_datos', detail: 'Una matriz o referencia a un conjunto de valores para los que desea contar frecuencias. Si matriz_datos no contiene valores, FRECUENCIA devuelve una matriz de ceros.' },
            binsArray: { name: 'matriz_bins', detail: 'Una matriz o referencia a intervalos en los que desea agrupar los valores de matriz_datos. Si matriz_bins no contiene valores, FRECUENCIA devuelve el número de elementos en matriz_datos.' },
        },
    },
    GAMMA: {
        description: 'Devuelve el valor de la función Gamma',
        abstract: 'Devuelve el valor de la función Gamma',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gamma-function-ce1702b1-cf55-471d-8307-f83be0fc5297',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Valor de entrada para la función gamma.' },
        },
    },
    GAMMA_DIST: {
        description: 'Devuelve la distribución gamma',
        abstract: 'Devuelve la distribución gamma',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gamma-dist-function-9b6f1538-d11c-4d5f-8966-21f6a2201def',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.GAMMA devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    GAMMA_INV: {
        description: 'Devuelve la inversa de la distribución gamma acumulativa',
        abstract: 'Devuelve la inversa de la distribución gamma acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gamma-inv-function-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad asociada con la distribución gamma.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
        },
    },
    GAMMALN: {
        description: 'Devuelve el logaritmo natural de la función gamma, Γ(x)',
        abstract: 'Devuelve el logaritmo natural de la función gamma, Γ(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gammaln-function-b838c48b-c65f-484f-9e1d-141c55470eb9',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea calcular GAMMALN.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Devuelve el logaritmo natural de la función gamma, Γ(x)',
        abstract: 'Devuelve el logaritmo natural de la función gamma, Γ(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gammaln-precise-function-5cdfe601-4e1e-4189-9d74-241ef1caa599',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea calcular GAMMALN.PRECISO.' },
        },
    },
    GAUSS: {
        description: 'Devuelve 0.5 menos que la distribución normal acumulativa estándar',
        abstract: 'Devuelve 0.5 menos que la distribución normal acumulativa estándar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/gauss-function-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor para el que desea la distribución.' },
        },
    },
    GEOMEAN: {
        description: 'Devuelve la media geométrica',
        abstract: 'Devuelve la media geométrica',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea la media geométrica.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea la media geométrica, hasta un máximo de 255.' },
        },
    },
    GROWTH: {
        description: 'Devuelve valores a lo largo de una tendencia exponencial',
        abstract: 'Devuelve valores a lo largo de una tendencia exponencial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/growth-function-541a91dc-3d5e-437d-b156-21324e68b80d',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'El conjunto de valores y que ya conoce en la relación y = b*m^x.' },
            knownXs: { name: 'conocido_x', detail: 'El conjunto de valores x que ya conoce en la relación y = b*m^x.' },
            newXs: { name: 'nuevo_x', detail: 'Son nuevos valores x para los que desea que CRECIMIENTO devuelva los valores y correspondientes.' },
            constb: { name: 'constante', detail: 'Un valor lógico que especifica si se debe forzar que la constante b sea igual a 1.' },
        },
    },
    HARMEAN: {
        description: 'Devuelve la media armónica',
        abstract: 'Devuelve la media armónica',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/harmean-function-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea la media armónica.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea la media armónica, hasta un máximo de 255.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Devuelve la distribución hipergeométrica',
        abstract: 'Devuelve la distribución hipergeométrica',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/hypgeom-dist-function-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
            },
        ],
        functionParameter: {
            sampleS: { name: 'muestra_éxito', detail: 'El número de éxitos en la muestra.' },
            numberSample: { name: 'núm_muestra', detail: 'El tamaño de la muestra.' },
            populationS: { name: 'población_éxito', detail: 'El número de éxitos en la población.' },
            numberPop: { name: 'núm_población', detail: 'El tamaño de la población.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.HIPERGEOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    INTERCEPT: {
        description: 'Devuelve la intersección de la línea de regresión lineal',
        abstract: 'Devuelve la intersección de la línea de regresión lineal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/intercept-function-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    KURT: {
        description: 'Devuelve la curtosis de un conjunto de datos',
        abstract: 'Devuelve la curtosis de un conjunto de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea la curtosis.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea la curtosis, hasta un máximo de 255.' },
        },
    },
    LARGE: {
        description: 'Devuelve el k-ésimo valor más grande de un conjunto de datos',
        abstract: 'Devuelve el k-ésimo valor más grande de un conjunto de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/large-function-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos para el que desea determinar el k-ésimo valor más grande.' },
            k: { name: 'k', detail: 'La posición (desde el más grande) en la matriz o rango de celdas de datos a devolver.' },
        },
    },
    LINEST: {
        description: 'Devuelve los parámetros de una tendencia lineal',
        abstract: 'Devuelve los parámetros de una tendencia lineal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/linest-function-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'El conjunto de valores y que ya conoce en la relación y = m*x+b.' },
            knownXs: { name: 'conocido_x', detail: 'El conjunto de valores x que ya conoce en la relación y = m*x+b.' },
            constb: { name: 'constante', detail: 'Un valor lógico que especifica si se debe forzar que la constante b sea igual a 0.' },
            stats: { name: 'estadísticas', detail: 'Un valor lógico que especifica si se deben devolver estadísticas de regresión adicionales.' },
        },
    },
    LOGEST: {
        description: 'Devuelve los parámetros de una tendencia exponencial',
        abstract: 'Devuelve los parámetros de una tendencia exponencial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/logest-function-f27462d8-3657-4030-866b-a272c1d18b4b',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'El conjunto de valores y que ya conoce en la relación y = b*m^x.' },
            knownXs: { name: 'conocido_x', detail: 'El conjunto de valores x que ya conoce en la relación y = b*m^x.' },
            constb: { name: 'constante', detail: 'Un valor lógico que especifica si se debe forzar que la constante b sea igual a 1.' },
            stats: { name: 'estadísticas', detail: 'Un valor lógico que especifica si se deben devolver estadísticas de regresión adicionales.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Devuelve la distribución logarítmico-normal acumulativa',
        abstract: 'Devuelve la distribución logarítmico-normal acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/lognorm-dist-function-eb60d00b-48a9-4217-be2b-6074aee6b070',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DIST.LOGNORM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    LOGNORM_INV: {
        description: 'Devuelve la inversa de la distribución logarítmico-normal acumulativa',
        abstract: 'Devuelve la inversa de la distribución logarítmico-normal acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/lognorm-inv-function-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución logarítmico-normal.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    MARGINOFERROR: {
        description: 'Calcula el margen de error a partir de un rango de valores y un nivel de confianza.',
        abstract: 'Calcula el margen de error a partir de un rango de valores y un nivel de confianza.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/12487850?hl=es&sjid=11250989209896695200-AP',
            },
        ],
        functionParameter: {
            range: { name: 'rango', detail: 'El rango de valores utilizado para calcular el margen de error.' },
            confidence: { name: 'confianza', detail: 'El nivel de confianza deseado entre (0, 1).' },
        },
    },
    MAX: {
        description: 'Devuelve el valor más grande de un conjunto de valores.',
        abstract: 'Devuelve el valor máximo en una lista de argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/max-function-e0012414-9ac8-4b34-9a47-73e662c08098',
            },
        ],
        functionParameter: {
            number1: {
                name: 'número1',
                detail: 'El primer número, referencia de celda o rango del que calcular el valor máximo.',
            },
            number2: {
                name: 'número2',
                detail: 'Números adicionales, referencias de celda o rangos de los que calcular el valor máximo, hasta un máximo de 255.',
            },
        },
    },
    MAXA: {
        description: 'Devuelve el valor máximo de una lista de argumentos, incluyendo números, texto y valores lógicos.',
        abstract: 'Devuelve el valor máximo de una lista de argumentos, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/maxa-function-814bda1e-3840-4bff-9365-2f59ac2ee62d',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argumento numérico para el que desea encontrar el valor más grande.' },
            value2: { name: 'valor2', detail: 'Argumentos numéricos de 2 a 255 para los que desea encontrar el valor más grande.' },
        },
    },
    MAXIFS: {
        description: 'Devuelve el valor máximo entre las celdas especificadas por un conjunto dado de condiciones o criterios.',
        abstract: 'Devuelve el valor máximo entre las celdas especificadas por un conjunto dado de condiciones o criterios',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883',
            },
        ],
        functionParameter: {
            maxRange: { name: 'rango_max', detail: 'El rango de celdas a maximizar.' },
            criteriaRange1: { name: 'rango_criterios1', detail: 'Es el conjunto de celdas a evaluar con el criterio.' },
            criteria1: { name: 'criterio1', detail: 'Es el criterio en forma de número, expresión o texto que define qué celdas se evaluarán como máximo.' },
            criteriaRange2: { name: 'rango_criterios2', detail: 'Rangos adicionales. Puede introducir hasta 127 rangos.' },
            criteria2: { name: 'criterio2', detail: 'Criterios adicionales asociados. Puede introducir hasta 127 criterios.' },
        },
    },
    MEDIAN: {
        description: 'Devuelve la mediana de los números dados',
        abstract: 'Devuelve la mediana de los números dados',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/median-function-d0916313-4753-414c-8537-ce85bdd967d2',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea los números dados.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea los números dados, hasta un máximo de 255.' },
        },
    },
    MIN: {
        description: 'Devuelve el número más pequeño de un conjunto de valores.',
        abstract: 'Devuelve el valor mínimo en una lista de argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152',
            },
        ],
        functionParameter: {
            number1: {
                name: 'número1',
                detail: 'El primer número, referencia de celda o rango del que calcular el valor mínimo.',
            },
            number2: {
                name: 'número2',
                detail: 'Números adicionales, referencias de celda o rangos de los que calcular el valor mínimo, hasta un máximo de 255.',
            },
        },
    },
    MINA: {
        description: 'Devuelve el valor más pequeño en una lista de argumentos, incluyendo números, texto y valores lógicos',
        abstract: 'Devuelve el valor más pequeño en una lista de argumentos, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/mina-function-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer número, referencia de celda o rango del que calcular el valor mínimo.' },
            value2: { name: 'valor2', detail: 'Números adicionales, referencias de celda o rangos de los que calcular el valor mínimo, hasta un máximo de 255.' },
        },
    },
    MINIFS: {
        description: 'Devuelve el valor mínimo entre las celdas especificadas por un conjunto dado de condiciones o criterios.',
        abstract: 'Devuelve el valor mínimo entre las celdas especificadas por un conjunto dado de condiciones o criterios',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/minifs-function-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
            },
        ],
        functionParameter: {
            minRange: { name: 'rango_min', detail: 'El rango real de celdas en el que se determinará el valor mínimo.' },
            criteriaRange1: { name: 'rango_criterios1', detail: 'Es el conjunto de celdas a evaluar con el criterio.' },
            criteria1: { name: 'criterio1', detail: 'Es el criterio en forma de número, expresión o texto que define qué celdas se evaluarán como mínimo. El mismo conjunto de criterios funciona para las funciones MAXIFS, SUMIFS y AVERAGEIFS.' },
            criteriaRange2: { name: 'rango_criterios2', detail: 'Rangos adicionales. Puede introducir hasta 127 rangos.' },
            criteria2: { name: 'criterio2', detail: 'Criterios adicionales asociados. Puede introducir hasta 127 criterios.' },
        },
    },
    MODE_MULT: {
        description: 'Devuelve una matriz vertical de los valores más frecuentes o repetitivos en una matriz o rango de datos',
        abstract: 'Devuelve una matriz vertical de los valores más frecuentes o repetitivos en una matriz o rango de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/mode-mult-function-50fd9464-b2ba-4191-b57a-39446689ae8c',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea calcular la moda.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea calcular la moda, hasta un máximo de 255.' },
        },
    },
    MODE_SNGL: {
        description: 'Devuelve el valor más común en un conjunto de datos',
        abstract: 'Devuelve el valor más común en un conjunto de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/mode-sngl-function-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea calcular la moda.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea calcular la moda, hasta un máximo de 255.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Devuelve la distribución binomial negativa',
        abstract: 'Devuelve la distribución binomial negativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/negbinom-dist-function-c8239f89-c2d0-45bd-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            numberF: { name: 'núm_fracasos', detail: 'El número de fracasos.' },
            numberS: { name: 'núm_éxitos', detail: 'El número umbral de éxitos.' },
            probabilityS: { name: 'prob_éxito', detail: 'La probabilidad de un éxito.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.NEGBINOM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    NORM_DIST: {
        description: 'Devuelve la distribución normal acumulativa',
        abstract: 'Devuelve la distribución normal acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/norm-dist-function-edb1cc14-a21c-4e53-839d-8082074c9f8d',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.NORM devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    NORM_INV: {
        description: 'Devuelve la inversa de la distribución normal acumulativa',
        abstract: 'Devuelve la inversa de la distribución normal acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/norm-inv-function-54b30935-fee7-493c-bedb-2278a9db7e13',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución normal.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    NORM_S_DIST: {
        description: 'Devuelve la distribución normal estándar acumulativa',
        abstract: 'Devuelve la distribución normal estándar acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/norm-s-dist-function-1e787282-3832-4520-a9ae-bd2a8d99ba88',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor para el que desea la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DISTR.NORM.S devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    NORM_S_INV: {
        description: 'Devuelve la inversa de la distribución normal estándar acumulativa',
        abstract: 'Devuelve la inversa de la distribución normal estándar acumulativa',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/norm-s-inv-function-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución normal.' },
        },
    },
    PEARSON: {
        description: 'Devuelve el coeficiente de correlación del producto momento de Pearson',
        abstract: 'Devuelve el coeficiente de correlación del producto momento de Pearson',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/pearson-function-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La matriz o rango de datos dependiente.' },
            array2: { name: 'matriz2', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (excluye 0 y 1).',
        abstract: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (excluye 0 y 1).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rango 0 y 1 (excluye 0 y 1).' },
        },
    },
    PERCENTILE_INC: {
        description: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (incluye 0 y 1)',
        abstract: 'Devuelve el k-ésimo percentil de los valores de un conjunto de datos (incluye 0 y 1)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rango 0 y 1 (incluye 0 y 1).' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Devuelve el rango porcentual de un valor en un conjunto de datos (excluye 0 y 1)',
        abstract: 'Devuelve el rango porcentual de un valor en un conjunto de datos (excluye 0 y 1)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/percentrank-exc-function-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            x: { name: 'x', detail: 'El valor cuyo rango desea conocer.' },
            significance: { name: 'cifras_significativas', detail: 'Un valor que identifica el número de dígitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.EXC usa tres dígitos (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1)',
        abstract: 'Devuelve el rango porcentual de un valor en un conjunto de datos (incluye 0 y 1)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos que define la posición relativa.' },
            x: { name: 'x', detail: 'El valor cuyo rango desea conocer.' },
            significance: { name: 'cifras_significativas', detail: 'Un valor que identifica el número de dígitos significativos para el valor de porcentaje devuelto. Si se omite, RANGO.PERCENTIL.INC usa tres dígitos (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Devuelve el número de permutaciones para un número dado de objetos',
        abstract: 'Devuelve el número de permutaciones para un número dado de objetos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/permut-function-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número de elementos.' },
            numberChosen: { name: 'número_elegido', detail: 'El número de elementos en cada permutación.' },
        },
    },
    PERMUTATIONA: {
        description: 'Devuelve el número de permutaciones para un número dado de objetos (con repeticiones) que pueden ser seleccionados del total de objetos',
        abstract: 'Devuelve el número de permutaciones para un número dado de objetos (con repeticiones) que pueden ser seleccionados del total de objetos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/permutationa-function-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número de elementos.' },
            numberChosen: { name: 'número_elegido', detail: 'El número de elementos en cada permutación.' },
        },
    },
    PHI: {
        description: 'Devuelve el valor de la función de densidad para una distribución normal estándar',
        abstract: 'Devuelve el valor de la función de densidad para una distribución normal estándar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/phi-function-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'X es el número para el que desea la densidad de la distribución normal estándar.' },
        },
    },
    POISSON_DIST: {
        description: 'Devuelve la distribución de Poisson',
        abstract: 'Devuelve la distribución de Poisson',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/poisson-dist-function-8fe148ff-39a2-46cb-abf3-7772695d9636',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, POISSON.DIST devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    PROB: {
        description: 'Devuelve la probabilidad de que los valores en un rango estén entre dos límites',
        abstract: 'Devuelve la probabilidad de que los valores en un rango estén entre dos límites',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/prob-function-9ac30561-c81c-4259-8253-34f0a238fc49',
            },
        ],
        functionParameter: {
            xRange: { name: 'rango_x', detail: 'El rango de valores numéricos de x con los que hay probabilidades asociadas.' },
            probRange: { name: 'rango_prob', detail: 'Un conjunto de probabilidades asociadas con los valores en rango_x.' },
            lowerLimit: { name: 'límite_inferior', detail: 'El límite inferior del valor para el que desea una probabilidad.' },
            upperLimit: { name: 'límite_superior', detail: 'El límite superior del valor para el que desea una probabilidad.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Devuelve el cuartil de un conjunto de datos (excluye 0 y 1)',
        abstract: 'Devuelve el cuartil de un conjunto de datos (excluye 0 y 1)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/quartile-exc-function-5a355b7a-840b-4a01-b0f1-f538c2864cad',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos para el que desea los valores de cuartil.' },
            quart: { name: 'cuartil', detail: 'El valor de cuartil a devolver.' },
        },
    },
    QUARTILE_INC: {
        description: 'Devuelve el cuartil de un conjunto de datos (incluye 0 y 1)',
        abstract: 'Devuelve el cuartil de un conjunto de datos (incluye 0 y 1)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/quartile-inc-function-1bbacc80-5075-42f1-aed6-47d735c4819d',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos para el que desea los valores de cuartil.' },
            quart: { name: 'cuartil', detail: 'El valor de cuartil a devolver.' },
        },
    },
    RANK_AVG: {
        description: 'Devuelve el rango de un número en una lista de números',
        abstract: 'Devuelve el rango de un número en una lista de números',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/rank-avg-function-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número cuyo rango desea encontrar.' },
            ref: { name: 'ref', detail: 'Una referencia a una lista de números. Los valores no numéricos en ref se ignoran.' },
            order: { name: 'orden', detail: 'Un número que especifica cómo clasificar el número. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden ascendente.' },
        },
    },
    RANK_EQ: {
        description: 'Devuelve el rango de un número en una lista de números',
        abstract: 'Devuelve el rango de un número en una lista de números',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/rank-eq-function-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número cuyo rango desea encontrar.' },
            ref: { name: 'ref', detail: 'Una referencia a una lista de números. Los valores no numéricos en ref se ignoran.' },
            order: { name: 'orden', detail: 'Un número que especifica cómo clasificar el número. Si el orden es 0 (cero) u se omite, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden descendente. Si el orden es cualquier valor distinto de cero, Microsoft Excel clasifica el número como si ref fuera una lista ordenada en orden ascendente.' },
        },
    },
    RSQ: {
        description: 'Devuelve el cuadrado del coeficiente de correlación del producto momento de Pearson',
        abstract: 'Devuelve el cuadrado del coeficiente de correlación del producto momento de Pearson',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/rsq-function-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La matriz o rango de datos dependiente.' },
            array2: { name: 'matriz2', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    SKEW: {
        description: 'Devuelve la asimetría de una distribución',
        abstract: 'Devuelve la asimetría de una distribución',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/skew-function-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea la asimetría.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea la asimetría, hasta un máximo de 255.' },
        },
    },
    SKEW_P: {
        description: 'Devuelve la asimetría de una distribución basada en una población',
        abstract: 'Devuelve la asimetría de una distribución basada en una población',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/skew-p-function-76530a5c-99b9-48a1-8392-26632d542fcb',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número, referencia de celda o rango para el que desea la asimetría.' },
            number2: { name: 'número2', detail: 'Números adicionales, referencias de celda o rangos para los que desea la asimetría, hasta un máximo de 255.' },
        },
    },
    SLOPE: {
        description: 'Devuelve la pendiente de la línea de regresión lineal',
        abstract: 'Devuelve la pendiente de la línea de regresión lineal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/slope-function-11fb8f97-3117-4813-98aa-61d7e01276b9',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    SMALL: {
        description: 'Devuelve el k-ésimo valor más pequeño de un conjunto de datos',
        abstract: 'Devuelve el k-ésimo valor más pequeño de un conjunto de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/small-function-17da8222-7c82-42b2-961b-14c45384df07',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de datos para el que desea determinar el k-ésimo valor más pequeño.' },
            k: { name: 'k', detail: 'La posición (desde el más pequeño) en la matriz o rango de celdas de datos a devolver.' },
        },
    },
    STANDARDIZE: {
        description: 'Devuelve un valor normalizado',
        abstract: 'Devuelve un valor normalizado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/standardize-function-81d66554-2d54-40ec-ba83-6437108ee775',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor que desea normalizar.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    STDEV_P: {
        description: 'Calcula la desviación estándar basada en toda la población dada como argumentos (ignora valores lógicos y texto).',
        abstract: 'Calcula la desviación estándar basada en toda la población',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/stdev-p-function-6e917c05-31a0-496f-ade7-4f4e7462f285',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 254 correspondientes a una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    STDEV_S: {
        description: 'Estima la desviación estándar basada en una muestra (ignora valores lógicos y texto en la muestra).',
        abstract: 'Estima la desviación estándar basada en una muestra',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/stdev-s-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una muestra de una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 254 correspondientes a una muestra de una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    STDEVA: {
        description: 'Estima la desviación estándar basada en una muestra, incluyendo números, texto y valores lógicos.',
        abstract: 'Estima la desviación estándar basada en una muestra, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/stdeva-function-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argumento de valor correspondiente a una muestra de una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
            value2: { name: 'valor2', detail: 'Argumentos de valor de 2 a 254 correspondientes a una muestra de una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    STDEVPA: {
        description: 'Calcula la desviación estándar basada en toda la población dada como argumentos, incluyendo texto y valores lógicos.',
        abstract: 'Calcula la desviación estándar basada en toda la población, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/stdevpa-function-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argumento de valor correspondiente a una población.' },
            value2: { name: 'valor2', detail: 'Argumentos de valor de 2 a 254 correspondientes a una población. También puede usar una sola matriz o una referencia a una matriz en lugar de argumentos separados por comas.' },
        },
    },
    STEYX: {
        description: 'Devuelve el error estándar del valor y predicho para cada x en la regresión',
        abstract: 'Devuelve el error estándar del valor y predicho para cada x en la regresión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/steyx-function-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    T_DIST: {
        description: 'Devuelve la probabilidad para la distribución t de Student',
        abstract: 'Devuelve la probabilidad para la distribución t de Student',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-dist-function-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numérico en el que evaluar la distribución' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, DIST.T devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    T_DIST_2T: {
        description: 'Devuelve la probabilidad para la distribución t de Student (dos colas)',
        abstract: 'Devuelve la probabilidad para la distribución t de Student (dos colas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-dist-2t-function-198e9340-e360-4230-bd21-f52f22ff5c28',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numérico en el que evaluar la distribución' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
        },
    },
    T_DIST_RT: {
        description: 'Devuelve la probabilidad para la distribución t de Student (cola derecha)',
        abstract: 'Devuelve la probabilidad para la distribución t de Student (cola derecha)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-dist-rt-function-20a30020-86f9-4b35-af1f-7ef6ae683eda',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numérico en el que evaluar la distribución' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
        },
    },
    T_INV: {
        description: 'Devuelve la inversa de la probabilidad para la distribución t de Student',
        abstract: 'Devuelve la inversa de la probabilidad para la distribución t de Student',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-inv-function-2908272b-4e61-4942-9df9-a25fec9b0e2e',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'La probabilidad asociada con la distribución t de Student.' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
        },
    },
    T_INV_2T: {
        description: 'Devuelve la inversa de la probabilidad para la distribución t de Student (dos colas)',
        abstract: 'Devuelve la inversa de la probabilidad para la distribución t de Student (dos colas)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-inv-2t-function-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'La probabilidad asociada con la distribución t de Student.' },
            degFreedom: { name: 'grados_libertad', detail: 'Un entero que indica el número de grados de libertad.' },
        },
    },
    T_TEST: {
        description: 'Devuelve la probabilidad asociada con una prueba t de Student',
        abstract: 'Devuelve la probabilidad asociada con una prueba t de Student',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/t-test-function-d4e08ec3-c545-485f-962e-276f7cbed055',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'La primera matriz o rango de datos.' },
            array2: { name: 'matriz2', detail: 'La segunda matriz o rango de datos.' },
            tails: { name: 'colas', detail: 'Especifica el número de colas de distribución. Si colas = 1, PRUEBA.T usa la distribución de una cola. Si colas = 2, PRUEBA.T usa la distribución de dos colas.' },
            type: { name: 'tipo', detail: 'El tipo de prueba t a realizar.' },
        },
    },
    TREND: {
        description: 'Devuelve valores a lo largo de una tendencia lineal',
        abstract: 'Devuelve valores a lo largo de una tendencia lineal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/trend-function-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'El conjunto de valores y que ya conoce en la relación y = m*x+b.' },
            knownXs: { name: 'conocido_x', detail: 'El conjunto de valores x que ya conoce en la relación y = m*x+b.' },
            newXs: { name: 'nuevo_x', detail: 'Son nuevos valores x para los que desea que TENDENCIA devuelva los valores y correspondientes.' },
            constb: { name: 'constante', detail: 'Un valor lógico que especifica si se debe forzar que la constante b sea igual a 0.' },
        },
    },
    TRIMMEAN: {
        description: 'Devuelve la media del interior de un conjunto de datos',
        abstract: 'Devuelve la media del interior de un conjunto de datos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o rango de valores a recortar y promediar.' },
            percent: { name: 'porcentaje', detail: 'El número fraccional de puntos de datos a excluir del cálculo.' },
        },
    },
    VAR_P: {
        description: 'Calcula la varianza basada en toda la población (ignora valores lógicos y texto en la población).',
        abstract: 'Calcula la varianza basada en toda la población',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/var-p-function-73d1285c-108c-4843-ba5d-a51f90656f3a',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 254 correspondientes a una población.' },
        },
    },
    VAR_S: {
        description: 'Estima la varianza basada en una muestra (ignora valores lógicos y texto en la muestra).',
        abstract: 'Estima la varianza basada en una muestra',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/var-s-function-913633de-136b-449d-813e-65a00b2b990b',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer argumento numérico correspondiente a una muestra de una población.' },
            number2: { name: 'número2', detail: 'Argumentos numéricos de 2 a 254 correspondientes a una muestra de una población.' },
        },
    },
    VARA: {
        description: 'Estima la varianza basada en una muestra, incluyendo números, texto y valores lógicos',
        abstract: 'Estima la varianza basada en una muestra, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/vara-function-3de77469-fa3a-47b4-85fd-81758a1e1d07',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argumento de valor correspondiente a una muestra de una población.' },
            value2: { name: 'valor2', detail: 'Argumentos de valor de 2 a 254 correspondientes a una muestra de una población.' },
        },
    },
    VARPA: {
        description: 'Calcula la varianza basada en toda la población, incluyendo números, texto y valores lógicos',
        abstract: 'Calcula la varianza basada en toda la población, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/varpa-function-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argumento de valor correspondiente a una población.' },
            value2: { name: 'valor2', detail: 'Argumentos de valor de 2 a 254 correspondientes a una población.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Devuelve la distribución de Weibull',
        abstract: 'Devuelve la distribución de Weibull',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/weibull-dist-function-4e783c39-9325-49be-bbc9-a83ef82b45db',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor para el que desea la distribución.' },
            alpha: { name: 'alfa', detail: 'Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Un parámetro de la distribución.' },
            cumulative: { name: 'acumulativo', detail: 'Un valor lógico que determina la forma de la función. Si es VERDADERO, WEIBULL.DIST devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    Z_TEST: {
        description: 'Devuelve el valor de probabilidad de una cola de una prueba z',
        abstract: 'Devuelve el valor de probabilidad de una cola de una prueba z',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/office/z-test-function-d633d5a3-2031-4614-a016-92180ad82bee',
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

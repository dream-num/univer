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
                url: 'https://support.microsoft.com/es-es/excel/functions/avedev-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/average-function',
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
        description: 'La función AVERAGE.WEIGHTED calcula la media ponderada de un conjunto de valores a partir de dichos valores y sus ponderaciones correspondientes.',
        abstract: 'La función AVERAGE.WEIGHTED calcula la media ponderada de un conjunto de valores a partir de dichos valores y sus ponderaciones correspondientes.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9084098?hl=es',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Valores de los que se va a calcular la media. Puede hacer referencia a un intervalo de celdas o incluir los propios valores.' },
            weights: { name: 'ponderaciones', detail: 'Lista correspondiente de pesos que se van a aplicar. Puede hacer referencia a un intervalo de celdas o incluir los propios pesos. Los pesos no pueden ser negativos, aunque pueden ser cero. Al menos uno de los pesos debe ser positivo. Si se usa un intervalo de celdas, este debe tener el mismo número de filas y columnas que el intervalo de valores.' },
            additionalValues: { name: 'valores_adicionales', detail: 'Otros valores con los que calcular la media. Los valores adicionales son opcionales.' },
            additionalWeights: { name: 'ponderaciones_adicionales', detail: 'Otros pesos que se pueden aplicar. Los pesos adicionales son opcionales, pero cada valor_adicional debe ir seguido exactamente de un peso_adicional .' },
        },
    },
    AVERAGEA: {
        description: 'Devuelve el promedio de sus argumentos, incluyendo números, texto y valores lógicos.',
        abstract: 'Devuelve el promedio de sus argumentos, incluyendo números, texto y valores lógicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/averagea-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/averageif-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/averageifs-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/beta-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/beta-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/binom-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/binom-dist-range-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/binom-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/chisq-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/chisq-dist-rt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/chisq-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/chisq-inv-rt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/chisq-test-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/confidence-norm-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/confidence-t-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/correl-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/count-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/counta-function',
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
    COUNTBLANK: {
        description: 'Cuenta el número de celdas en blanco dentro de un rango.',
        abstract: 'Cuenta el número de celdas en blanco dentro de un rango',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/countblank-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/use-the-countif-function-in-microsoft-excel',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/countifs-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/covariance-p-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/covariance-s-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/devsq-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/expon-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/f-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/f-dist-rt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/f-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/f-inv-rt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/f-test-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/fisher-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/fisherinv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-and-forecast-linear-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Fecha de destino', detail: 'El punto de datos para el que desea predecir un valor.' },
            values: { name: 'Valores', detail: 'Los valores históricos utilizados para la previsión.' },
            timeline: { name: 'Escala de tiempo', detail: 'Un rango o matriz independiente de fechas u horas numéricas con un paso constante.' },
            seasonality: { name: 'Estacionalidad', detail: 'Opcional. Longitud estacional; 1 para detección automática y 0 sin estacionalidad.' },
            dataCompletion: { name: 'Relleno de datos', detail: 'Opcional. Use 1 para interpolar los puntos que faltan o 0 para tratarlos como cero.' },
            aggregation: { name: 'Agregación', detail: 'Opcional. Un valor de 1 a 7 indica cómo agregar marcas de tiempo duplicadas.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Devuelve un intervalo de confianza para el valor de pronóstico en la fecha objetivo especificada',
        abstract: 'Devuelve un intervalo de confianza para el valor de pronóstico en la fecha objetivo especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Fecha de destino', detail: 'El punto de datos para el que desea predecir un valor.' },
            values: { name: 'Valores', detail: 'Los valores históricos utilizados para la previsión.' },
            timeline: { name: 'Escala de tiempo', detail: 'Un rango o matriz independiente de fechas u horas numéricas con un paso constante.' },
            confidenceLevel: { name: 'Nivel de confianza', detail: 'Opcional. Un número entre 0 y 1; el valor predeterminado es 0,95.' },
            seasonality: { name: 'Estacionalidad', detail: 'Opcional. Longitud estacional; 1 para detección automática y 0 sin estacionalidad.' },
            dataCompletion: { name: 'Relleno de datos', detail: 'Opcional. Use 1 para interpolar los puntos que faltan o 0 para tratarlos como cero.' },
            aggregation: { name: 'Agregación', detail: 'Opcional. Un valor de 1 a 7 indica cómo agregar marcas de tiempo duplicadas.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Devuelve la longitud del patrón repetitivo que Excel detecta para la serie temporal especificada',
        abstract: 'Devuelve la longitud del patrón repetitivo que Excel detecta para la serie temporal especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valores', detail: 'Los valores históricos utilizados para la previsión.' },
            timeline: { name: 'Escala de tiempo', detail: 'Un rango o matriz independiente de fechas u horas numéricas con un paso constante.' },
            dataCompletion: { name: 'Relleno de datos', detail: 'Opcional. Use 1 para interpolar los puntos que faltan o 0 para tratarlos como cero.' },
            aggregation: { name: 'Agregación', detail: 'Opcional. Un valor de 1 a 7 indica cómo agregar marcas de tiempo duplicadas.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Devuelve un valor estadístico como resultado de la previsión de series temporales',
        abstract: 'Devuelve un valor estadístico como resultado de la previsión de series temporales',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valores', detail: 'Los valores históricos utilizados para la previsión.' },
            timeline: { name: 'Escala de tiempo', detail: 'Un rango o matriz independiente de fechas u horas numéricas con un paso constante.' },
            statisticType: { name: 'Tipo de estadística', detail: 'Un valor de 1 a 8 indica la estadística de previsión que se devuelve.' },
            seasonality: { name: 'Estacionalidad', detail: 'Opcional. Longitud estacional; 1 para detección automática y 0 sin estacionalidad.' },
            dataCompletion: { name: 'Relleno de datos', detail: 'Opcional. Use 1 para interpolar los puntos que faltan o 0 para tratarlos como cero.' },
            aggregation: { name: 'Agregación', detail: 'Opcional. Un valor de 1 a 7 indica cómo agregar marcas de tiempo duplicadas.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Devuelve un valor futuro basado en valores existentes',
        abstract: 'Devuelve un valor futuro basado en valores existentes',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/forecast-and-forecast-linear-functions',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/frequency-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gamma-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gamma-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gamma-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gammaln-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gammaln-precise-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/gauss-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/geomean-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/growth-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/harmean-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/hypgeom-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/intercept-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/kurt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/large-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/linest-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/logest-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/lognorm-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Una probabilidad correspondiente a la distribución logarítmico-normal.' },
            mean: { name: 'media', detail: 'La media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'La desviación estándar de la distribución.' },
        },
    },
    MARGINOFERROR: {
        description: 'Esta función calcula el margen de error a partir de un intervalo de valores y un nivel de confianza.',
        abstract: 'Esta función calcula el margen de error a partir de un intervalo de valores y un nivel de confianza.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/12487850?hl=es',
            },
        ],
        functionParameter: {
            range: { name: 'rango', detail: 'MARGINOFERROR(A1:C3, 0.99)' },
            confidence: { name: 'confianza', detail: 'El nivel de confianza deseado entre (0, 1).' },
        },
    },
    MAX: {
        description: 'Devuelve el valor más grande de un conjunto de valores.',
        abstract: 'Devuelve el valor máximo en una lista de argumentos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/max-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/maxa-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/maxifs-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/median-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/min-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/mina-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/minifs-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/mode-mult-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/mode-sngl-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/negbinom-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/norm-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/norm-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/norm-s-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/norm-s-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/pearson-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/percentile-exc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/percentile-inc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/percentrank-exc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/percentrank-inc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/permut-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/permutationa-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/phi-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/poisson-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/prob-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/quartile-exc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/quartile-inc-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/rank-avg-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/rank-eq-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conocido_y', detail: 'La matriz o rango de datos dependiente.' },
            knownXs: { name: 'conocido_x', detail: 'La matriz o rango de datos independiente.' },
        },
    },
    SKEW: {
        description: 'Devuelve la asimetría de una distribución',
        abstract: 'Devuelve la asimetría de una distribución',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/skew-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/skew-p-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/slope-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/small-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/standardize-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/stdev-p-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/stdev-s-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/stdeva-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/stdevpa-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/steyx-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-dist-2t-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-dist-rt-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-inv-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-inv-2t-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/t-test-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/trend-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/trimmean-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/var-p-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/var-s-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/vara-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/varpa-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/weibull-dist-function',
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
                url: 'https://support.microsoft.com/es-es/excel/functions/z-test-function',
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

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
        description: 'Devuelve la probabilidad para una variable aleatoria continua siguiendo una función de densidad de probabilidad beta acumulativa. La distribución beta se usa generalmente para estudiar las variaciones, a través de varias muestras, de un porcentaje que representa algún fenómeno, por ejemplo, el tiempo diario que la gente dedica a mirar televisión.',
        abstract: 'Devuelve la probabilidad para una variable aleatoria continua siguiendo una función de densidad de probabilidad beta acumulativa. La distribución beta se usa generalmente para estudiar las variaciones, a través de varias muestras, de un porcentaje que representa algún fenómeno, por ejemplo, el tiempo diario que la gente dedica a mirar televisión.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Valor, comprendido entre A y B, con el que se debe evaluar la función.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Obligatorio. Un parámetro de la distribución.' },
            A: { name: 'A', detail: 'Opcional. Un límite inferior del intervalo de x.' },
            B: { name: 'B', detail: 'Opcional. Un límite superior del intervalo de x.' },
        },
    },
    BETAINV: {
        description: 'Devuelve la función inversa de la función de densidad de probabilidad beta acumulativa de una distribución beta especificada. Es decir, si el argumento probabilidad = DISTR.BETA(x;...), entonces DISTR.BETA.INV(probabilidad;...) = x. La distribución beta puede emplearse en la organización de proyectos para crear modelos con fechas de finalización probables, de acuerdo con un plazo de finalización y variabilidad esperados.',
        abstract: 'Devuelve la función inversa de la función de densidad de probabilidad beta acumulativa de una distribución beta especificada. Es decir, si el argumento probabilidad = DISTR.BETA(x;...), entonces DISTR.BETA.INV(probabilidad;...) = x. La distribución beta puede emplearse en la organización de proyectos para crear modelos con fechas de finalización probables, de acuerdo con un plazo de finalización y variabilidad esperados.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Una probabilidad asociada con la distribución beta.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. Un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Obligatorio. Un parámetro de la distribución.' },
            A: { name: 'A', detail: 'Opcional. Un límite inferior del intervalo de x.' },
            B: { name: 'B', detail: 'Opcional. Un límite superior del intervalo de x.' },
        },
    },
    BINOMDIST: {
        description: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial. Use DISTR.BINOM en problemas con un número fijo de pruebas o ensayos, cuando los resultados de un ensayo son solo éxito o fracaso, cuando los ensayos son independientes y cuando la probabilidad de éxito es constante durante todo el experimento. Por ejemplo, DISTR.BINOM puede calcular la probabilidad de que dos de los próximos tres bebés que nazcan sean hombres.',
        abstract: 'Devuelve la probabilidad de una variable aleatoria discreta siguiendo una distribución binomial. Use DISTR.BINOM en problemas con un número fijo de pruebas o ensayos, cuando los resultados de un ensayo son solo éxito o fracaso, cuando los ensayos son independientes y cuando la probabilidad de éxito es constante durante todo el experimento. Por ejemplo, DISTR.BINOM puede calcular la probabilidad de que dos de los próximos tres bebés que nazcan sean hombres.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'núm_éxito', detail: 'Obligatorio. El número de éxitos en los ensayos.' },
            trials: { name: 'ensayos', detail: 'Obligatorio. El número de ensayos independientes.' },
            probabilityS: { name: 'prob_éxito', detail: 'Obligatorio. La probabilidad de éxito en cada ensayo.' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Un valor lógico que determina la forma de la función. Si el argumento acumulado es VERDADERO, DISTR.BINOM devuelve la función de distribución acumulativa, que es la probabilidad de que exista el máximo número de éxitos; si es FALSO, devuelve la función de masa de probabilidad, que es la probabilidad de que un evento se reproduzca un número de veces igual al argumento núm_éxito.' },
        },
    },
    CHIDIST: {
        description: 'Devuelve la probabilidad de cola derecha de la distribución chi cuadrado. La distribución χ2 está asociada a una prueba χ2. Use la prueba χ2 para comparar los valores observados con los esperados. Por ejemplo, un experimento genético podría formular la hipótesis de que la próxima generación de plantas presentará un conjunto determinado de colores. Al comparar los resultados observados con los resultados esperados, puede decidir si su hipótesis original es válida.',
        abstract: 'Devuelve la probabilidad de cola derecha de la distribución chi cuadrado. La distribución χ2 está asociada a una prueba χ2. Use la prueba χ2 para comparar los valores observados con los esperados. Por ejemplo, un experimento genético podría formular la hipótesis de que la próxima generación de plantas presentará un conjunto determinado de colores. Al comparar los resultados observados con los resultados esperados, puede decidir si su hipótesis original es válida.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. El valor en el que se desea evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'Obligatorio. El número de grados de libertad.' },
        },
    },
    CHIINV: {
        description: 'Devuelve el inverso de una probabilidad dada, de una cola derecha, en una distribución chi cuadrado. Si la probabilidad = DISTR.CHI(x;...), PRUEBA.CHI.INV(probabilidad;...) = x. Use esta función para comparar los resultados observados con los esperados y determinar si la hipótesis original es válida.',
        abstract: 'Devuelve el inverso de una probabilidad dada, de una cola derecha, en una distribución chi cuadrado. Si la probabilidad = DISTR.CHI(x;...), PRUEBA.CHI.INV(probabilidad;...) = x. Use esta función para comparar los resultados observados con los esperados y determinar si la hipótesis original es válida.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Una probabilidad asociada con la distribución chi cuadrado.' },
            degFreedom: { name: 'grados_libertad', detail: 'Obligatorio. El número de grados de libertad.' },
        },
    },
    CHITEST: {
        description: 'Devuelve la prueba de independencia. PRUEBA.CHI devuelve el valor de la distribución chi cuadrado (χ2) para la estadística y los grados de libertad apropiados. Las pruebas χ2 pueden usarse para determinar si un experimento se ajusta a los resultados teóricos.',
        abstract: 'Devuelve la prueba de independencia. PRUEBA.CHI devuelve el valor de la distribución chi cuadrado (χ2) para la estadística y los grados de libertad apropiados. Las pruebas χ2 pueden usarse para determinar si un experimento se ajusta a los resultados teóricos.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'rango_real', detail: 'Obligatorio. El rango de datos que contiene las observaciones que se contrastarán con los valores esperados.' },
            expectedRange: { name: 'rango_esperado', detail: 'Obligatorio. El rango de datos que contiene la relación del producto de los totales de filas y columnas con el total global.' },
        },
    },
    CONFIDENCE: {
        description: 'Devuelve el intervalo de confianza para la media de una población con distribución normal.',
        abstract: 'Devuelve el intervalo de confianza para la media de una población con distribución normal.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'Obligatorio. El nivel de significación usado para calcular el nivel de confianza. El nivel de confianza es igual a 100*(1 - alfa)%, es decir, un alfa de 0,05 indica un nivel de confianza del 95%.' },
            standardDev: { name: 'desv_estándar', detail: 'Obligatorio. La desviación estándar de la población para el rango de datos; se presupone que es conocida.' },
            size: { name: 'tamaño', detail: 'Obligatorio. El tamaño de la muestra.' },
        },
    },
    COVAR: {
        description: 'Devuelve la covarianza, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.',
        abstract: 'Devuelve la covarianza, el promedio de los productos de las desviaciones para cada pareja de puntos de datos en dos conjuntos de datos.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Obligatorio. El primer rango de celdas de números enteros.' },
            array2: { name: 'matriz2', detail: 'Obligatorio. El segundo rango de celdas de números enteros.' },
        },
    },
    CRITBINOM: {
        description: 'Devuelve el menor valor cuya distribución binomial acumulativa es menor o igual que un valor de criterio. Use esta función en aplicaciones de control de calidad. Por ejemplo, use BINOM.CRIT para determinar el mayor número de piezas defectuosas que una cadena de montaje pueda producir sin tener por ello que rechazar todo el lote.',
        abstract: 'Devuelve el menor valor cuya distribución binomial acumulativa es menor o igual que un valor de criterio. Use esta función en aplicaciones de control de calidad. Por ejemplo, use BINOM.CRIT para determinar el mayor número de piezas defectuosas que una cadena de montaje pueda producir sin tener por ello que rechazar todo el lote.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'ensayos', detail: 'Obligatorio. El número de ensayos de Bernoulli.' },
            probabilityS: { name: 'prob_éxito', detail: 'Obligatorio. La probabilidad de éxito en cada ensayo.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. El valor del criterio.' },
        },
    },
    EXPONDIST: {
        description: 'Devuelve la distribución exponencial. Use DISTR.EXP para establecer el tiempo entre eventos, como el tiempo que tarda un cajero automático en entregar el efectivo. Por ejemplo, la función DISTR.EXP puede usarse para determinar la probabilidad de que el proceso tarde un minuto como máximo.',
        abstract: 'Devuelve la distribución exponencial. Use DISTR.EXP para establecer el tiempo entre eventos, como el tiempo que tarda un cajero automático en entregar el efectivo. Por ejemplo, la función DISTR.EXP puede usarse para determinar la probabilidad de que el proceso tarde un minuto como máximo.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el valor de la función.' },
            lambda: { name: 'lambda', detail: 'Obligatorio. Es el valor del parámetro.' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Es un valor lógico que indica la forma de la función exponencial que va a aplicar. Si el valor de acum es VERDADERO, DISTR.EXP devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    FDIST: {
        description: 'Devuelve la distribución de probabilidad F (grado de diversidad) (de cola derecha) de dos conjuntos de datos. Use esta función para determinar si dos conjuntos de datos tienen diferentes grados de diversidad. Por ejemplo, para examinar los resultados de los exámenes de acceso a la enseñanza secundaria de mujeres y hombres, y determinar si la variabilidad entre las mujeres es diferente de la de los hombres.',
        abstract: 'Devuelve la distribución de probabilidad F (grado de diversidad) (de cola derecha) de dos conjuntos de datos. Use esta función para determinar si dos conjuntos de datos tienen diferentes grados de diversidad. Por ejemplo, para examinar los resultados de los exámenes de acceso a la enseñanza secundaria de mujeres y hombres, y determinar si la variabilidad entre las mujeres es diferente de la de los hombres.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el valor en el que desea evaluar la función.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Obligatorio. Es el número de grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Obligatorio. Es el número de grados de libertad del denominador.' },
        },
    },
    FINV: {
        description: 'Devuelve el inverso de la distribución de probabilidad F (de cola derecha). Si p = DISTR.F(x,...), entonces DISTR.F.INV(p,...) = x.',
        abstract: 'Devuelve el inverso de la distribución de probabilidad F (de cola derecha). Si p = DISTR.F(x,...), entonces DISTR.F.INV(p,...) = x.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es una probabilidad asociada a la distribución acumulativa F.' },
            degFreedom1: { name: 'grados_libertad1', detail: 'Obligatorio. Es el número de grados de libertad del numerador.' },
            degFreedom2: { name: 'grados_libertad2', detail: 'Obligatorio. Es el número de grados de libertad del denominador.' },
        },
    },
    FTEST: {
        description: 'Devuelve el resultado de una prueba F. Una prueba F devuelve la probabilidad de dos colas de que las varianzas de matriz1 y matriz2 no sean significativamente diferentes. Use esta función para determinar si las varianzas de dos muestras son diferentes. Por ejemplo, dados los resultados de los exámenes de escuelas públicas y privadas, puede comprobar si estas escuelas tienen distintos niveles de diversidad en los resultados.',
        abstract: 'Devuelve el resultado de una prueba F. Una prueba F devuelve la probabilidad de dos colas de que las varianzas de matriz1 y matriz2 no sean significativamente diferentes. Use esta función para determinar si las varianzas de dos muestras son diferentes. Por ejemplo, dados los resultados de los exámenes de escuelas públicas y privadas, puede comprobar si estas escuelas tienen distintos niveles de diversidad en los resultados.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Obligatorio. Es la primera matriz o rango de datos.' },
            array2: { name: 'matriz2', detail: 'Obligatorio. Es la segunda matriz o rango de datos.' },
        },
    },
    GAMMADIST: {
        description: 'Devuelve la distribución gamma. Use esta función para estudiar variables cuya distribución podría ser sesgada. La distribución gamma es de uso corriente en análisis de las colas de espera.',
        abstract: 'Devuelve la distribución gamma. Use esta función para estudiar variables cuya distribución podría ser sesgada. La distribución gamma es de uso corriente en análisis de las colas de espera.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. El valor en el que se desea evaluar la distribución.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. Es un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Obligatorio. Es un parámetro de la distribución. Si beta = 1, DISTR.GAMMA devuelve la distribución gamma estándar.' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Es un valor lógico que determina la forma de la función. Si el argumento acumulado es VERDADERO, DISTR.GAMMA devuelve la función de distribución acumulativa; si es FALSO, devuelve la función de densidad de probabilidad.' },
        },
    },
    GAMMAINV: {
        description: 'Devuelve el inverso de la distribución gamma acumulativa. Si p = DISTR.GAMMA(x,...), entonces DISTR.GAMMA.INV(p,...) = x. Use esta función para estudiar variables cuya distribución puede ser sesgada.',
        abstract: 'Devuelve el inverso de la distribución gamma acumulativa. Si p = DISTR.GAMMA(x,...), entonces DISTR.GAMMA.INV(p,...) = x. Use esta función para estudiar variables cuya distribución puede ser sesgada.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es la probabilidad asociada con la distribución gamma.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. Es un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Obligatorio. Un parámetro de la distribución. Si beta = 1, DISTR.GAMMA.INV devuelve la distribución gamma estándar.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Devuelve la distribución hipergeométrica. La función DISTR.HIPERGEOM devuelve la probabilidad de obtener un número determinado de "éxitos" en una muestra, conocidos el tamaño de la muestra, el número de éxitos de la población y el tamaño de la población. Use DISTR.HIPERGEOM en problemas con una población finita, donde cada observación sea un éxito o un fracaso, y pueda elegir cada subconjunto de un tamaño determinado con la misma probabilidad.',
        abstract: 'Devuelve la distribución hipergeométrica. La función DISTR.HIPERGEOM devuelve la probabilidad de obtener un número determinado de "éxitos" en una muestra, conocidos el tamaño de la muestra, el número de éxitos de la población y el tamaño de la población. Use DISTR.HIPERGEOM en problemas con una población finita, donde cada observación sea un éxito o un fracaso, y pueda elegir cada subconjunto de un tamaño determinado con la misma probabilidad.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'muestra_éxito', detail: 'Obligatorio. Es el número de éxitos en la muestra.' },
            numberSample: { name: 'núm_muestra', detail: 'Obligatorio. Es el tamaño de la muestra.' },
            populationS: { name: 'población_éxito', detail: 'Obligatorio. Es el número de éxitos en la población.' },
            numberPop: { name: 'núm_población', detail: 'Obligatorio. Es el tamaño de la población.' },
        },
    },
    LOGINV: {
        description: 'Devuelve el inverso de la función de distribución logarítmico-normal acumulativa de x, donde ln(x) se distribuye normalmente con los parámetros media y desv_estándar. Si p = DISTR.LOG.NORM(x,...) entonces DISTR.LOG.INV(p,...) = x.',
        abstract: 'Devuelve el inverso de la función de distribución logarítmico-normal acumulativa de x, donde ln(x) se distribuye normalmente con los parámetros media y desv_estándar. Si p = DISTR.LOG.NORM(x,...) entonces DISTR.LOG.INV(p,...) = x.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es la probabilidad asociada con la distribución logarítmica normal.' },
            mean: { name: 'media', detail: 'Obligatorio. Es la media de In(x).' },
            standardDev: { name: 'desv_estándar', detail: 'Obligatorio. Es la desviación estándar de In(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Devuelve la distribución logarítmico-normal acumulativa de x, donde ln(x) se distribuye normalmente con los parámetros media y desv_estándar. Use esta función para analizar datos que se han transformado logarítmicamente.',
        abstract: 'Devuelve la distribución logarítmico-normal acumulativa de x, donde ln(x) se distribuye normalmente con los parámetros media y desv_estándar. Use esta función para analizar datos que se han transformado logarítmicamente.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el valor en el que desea evaluar la función.' },
            mean: { name: 'media', detail: 'Obligatorio. Es la media de In(x).' },
            standardDev: { name: 'desv_estándar', detail: 'Obligatorio. Es la desviación estándar de In(x).' },
        },
    },
    MODE: {
        description: 'Supongamos que desea conocer el número más común de especies de aves observadas en una muestra de recuentos de aves en un humedal crítico durante un período de tiempo de 30 años, o desea conocer el número de llamadas telefónicas que se producen con más frecuencia en un centro de soporte telefónico durante las horas de poca actividad. Para calcular el modo de un grupo de números, use la función MODA .',
        abstract: 'Supongamos que desea conocer el número más común de especies de aves observadas en una muestra de recuentos de aves en un humedal crítico durante un período de tiempo de 30 años, o desea conocer el número de llamadas telefónicas que se producen con más frecuencia en un centro de soporte telefónico durante las horas de poca actividad. Para calcular el modo de un grupo de números, use la función MODA .',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Obligatorio. Es el primer argumento numérico para el que desea calcular la moda.' },
            number2: { name: 'número2', detail: 'Opcional. De 2 a 255 argumentos numéricos cuya moda desea calcular. También puede usar una matriz única o una referencia de matriz en lugar de argumentos separados por comas.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Devuelve la distribución binomial negativa. NEGBINOMDIST devuelve la probabilidad de obtener un valor de núm_fracasos antes que de núm_éxitos, con una probabilidad constante de éxitos de prob_éxito. Esta función es similar a la distribución binomial, con la excepción de que el número de éxitos es fijo y el número de ensayos es variable. Al igual que la distribución binomial, se supone que los ensayos son independientes.',
        abstract: 'Devuelve la distribución binomial negativa. NEGBINOMDIST devuelve la probabilidad de obtener un valor de núm_fracasos antes que de núm_éxitos, con una probabilidad constante de éxitos de prob_éxito. Esta función es similar a la distribución binomial, con la excepción de que el número de éxitos es fijo y el número de ensayos es variable. Al igual que la distribución binomial, se supone que los ensayos son independientes.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'núm_fracasos', detail: 'Obligatorio. Es el número de fracasos.' },
            numberS: { name: 'núm_éxitos', detail: 'Obligatorio. Es el número límite de éxitos.' },
            probabilityS: { name: 'prob_éxito', detail: 'Obligatorio. Es la probabilidad de obtener un éxito.' },
        },
    },
    NORMDIST: {
        description: 'La función DISTR.NORM devuelve la distribución normal para la media y desviación estándar especificadas. Esta función tiene una amplia gama de aplicaciones en estadísticas, incluidas las pruebas de hipótesis.',
        abstract: 'La función DISTR.NORM devuelve la distribución normal para la media y desviación estándar especificadas. Esta función tiene una amplia gama de aplicaciones en estadísticas, incluidas las pruebas de hipótesis.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. El valor para el que desea la distribución' },
            mean: { name: 'media', detail: 'Obligatorio. La media aritmética de la distribución' },
            standardDev: { name: 'desv_estándar', detail: 'Obligatorio. La desviación estándar de la distribución' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Es un valor lógico que determina la forma de la función. Si el argumento acumulado es VERDADERO, DISTR.NORM devuelve la función de distribución acumulativa; si el argumento acumulado es FALSO, devuelve la función de masa de probabilidad.' },
        },
    },
    NORMINV: {
        description: 'Devuelve el inverso de la distribución normal acumulativa para la media y desviación estándar especificadas.',
        abstract: 'Devuelve el inverso de la distribución normal acumulativa para la media y desviación estándar especificadas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es una probabilidad correspondiente a la distribución normal.' },
            mean: { name: 'media', detail: 'Obligatorio. Es la media aritmética de la distribución.' },
            standardDev: { name: 'desv_estándar', detail: 'Obligatorio. Es la desviación estándar de la distribución.' },
        },
    },
    NORMSDIST: {
        description: 'Devuelve la función de distribución normal estándar acumulativa. La distribución tiene una media de 0 (cero) y una desviación estándar de uno. Use esta función en lugar de una tabla estándar de áreas de curvas normales.',
        abstract: 'Devuelve la función de distribución normal estándar acumulativa. La distribución tiene una media de 0 (cero) y una desviación estándar de uno. Use esta función en lugar de una tabla estándar de áreas de curvas normales.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obligatorio. Es el valor cuya distribución desea obtener.' },
        },
    },
    NORMSINV: {
        description: 'Devuelve el inverso de la distribución normal estándar acumulativa. La distribución tiene una media de cero y una desviación estándar de uno.',
        abstract: 'Devuelve el inverso de la distribución normal estándar acumulativa. La distribución tiene una media de cero y una desviación estándar de uno.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es una probabilidad correspondiente a la distribución normal.' },
        },
    },
    PERCENTILE: {
        description: 'Devuelve el k-ésimo percentil de los valores de un rango. Esta función permite establecer un umbral de aceptación. Por ejemplo, podrá examinar a los candidatos cuya calificación sea superior al nonagésimo percentil.',
        abstract: 'Devuelve el k-ésimo percentil de los valores de un rango. Esta función permite establecer un umbral de aceptación. Por ejemplo, podrá examinar a los candidatos cuya calificación sea superior al nonagésimo percentil.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Obligatorio. Es la matriz o el rango de datos que define la posición relativa.' },
            k: { name: 'k', detail: 'Obligatorio. Es el valor de percentil en el rango de 0 a 1, ambos incluidos.' },
        },
    },
    PERCENTRANK: {
        description: 'La función RANGO.PERCENTIL devuelve la jerarquía de un valor en un conjunto de datos como un porcentaje del conjunto de datos( básicamente, la posición relativa de un valor dentro de todo el conjunto de datos). Por ejemplo, puede usar RANGO.PERCENTIL para determinar la posición del resultado de una prueba individual entre el campo de todos los resultados de la misma prueba.',
        abstract: 'La función RANGO.PERCENTIL devuelve la jerarquía de un valor en un conjunto de datos como un porcentaje del conjunto de datos( básicamente, la posición relativa de un valor dentro de todo el conjunto de datos). Por ejemplo, puede usar RANGO.PERCENTIL para determinar la posición del resultado de una prueba individual entre el campo de todos los resultados de la misma prueba.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Obligatorio. El rango de datos (o matriz predefinida) de valores numéricos dentro del cual se determina el rango de porcentaje.' },
            x: { name: 'x', detail: 'Obligatorio. Es el valor cuyo rango dentro de la matriz desea conocer.' },
            significance: { name: 'cifras_significativas', detail: 'Opcional. Es un valor opcional que identifica el número de cifras significativas para el valor de porcentaje devuelto. Si omite este argumento, RANGO.PERCENTIL usa tres dígitos (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Devuelve la distribución de Poisson. Una de las aplicaciones comunes de la distribución de Poisson es la predicción del número de eventos en un determinado período de tiempo, como por ejemplo, el número de automóviles que se presenta a una zona de peaje en el intervalo de un minuto.',
        abstract: 'Devuelve la distribución de Poisson. Una de las aplicaciones comunes de la distribución de Poisson es la predicción del número de eventos en un determinado período de tiempo, como por ejemplo, el número de automóviles que se presenta a una zona de peaje en el intervalo de un minuto.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el número de eventos.' },
            mean: { name: 'media', detail: 'Obligatorio. Es el valor numérico esperado.' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Es un valor lógico que determina la forma de la distribución de probabilidad devuelta. Si el argumento acumulado es VERDADERO, POISSON devuelve la probabilidad de Poisson de que un evento aleatorio ocurra un número de veces comprendido entre 0 y x, ambos incluidos; si el argumento acumulado es FALSO, la función devuelve la probabilidad de Poisson de que un evento ocurra exactamente x veces.' },
        },
    },
    QUARTILE: {
        description: 'Devuelve el cuartil de un conjunto de datos. Los cuartiles se usan con frecuencia en los datos de ventas y encuestas para dividir las poblaciones en grupos. Por ejemplo, use la función CUARTIL para determinar el 25 por ciento de ingresos más altos en una población.',
        abstract: 'Devuelve el cuartil de un conjunto de datos. Los cuartiles se usan con frecuencia en los datos de ventas y encuestas para dividir las poblaciones en grupos. Por ejemplo, use la función CUARTIL para determinar el 25 por ciento de ingresos más altos en una población.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Obligatorio. Es la matriz o el rango de celdas de valores numéricos cuyo cuartil desea obtener.' },
            quart: { name: 'cuartil', detail: 'Obligatorio. Indica el valor que se devolverá.' },
        },
    },
    RANK: {
        description: 'Devuelve la jerarquía de un número en una lista de números. La jerarquía de un número es su tamaño en comparación con otros valores de la lista. (Si ordenara la lista, la jerarquía del número sería su posición.)',
        abstract: 'Devuelve la jerarquía de un número en una lista de números. La jerarquía de un número es su tamaño en comparación con otros valores de la lista. (Si ordenara la lista, la jerarquía del número sería su posición.)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Obligatorio. Es el número cuya jerarquía (clasificación) desea conocer.' },
            ref: { name: 'ref', detail: 'Obligatorio. Es una referencia a una lista de números. Los valores no numéricos se pasan por alto.' },
            order: { name: 'orden', detail: 'Opcional. Es un número que especifica cómo clasificar el argumento número. Si omite el argumento orden o es 0 (cero), Microsoft Excel determina la jerarquía de un número como si la lista definida por el argumento referencia se ordenara en forma descendente. Si el argumento orden es diferente de cero, Microsoft Excel determina la jerarquía de un número como si la lista definida por el argumento referencia se ordenara en forma ascendente.' },
        },
    },
    STDEV: {
        description: 'Calcula la desviación estándar de una muestra. La desviación estándar es la medida de la dispersión de los valores respecto a la media (valor promedio).',
        abstract: 'Calcula la desviación estándar de una muestra. La desviación estándar es la medida de la dispersión de los valores respecto a la media (valor promedio).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Obligatorio. Es el primer argumento numérico correspondiente a una muestra de una población.' },
            number2: { name: 'número2', detail: 'Opcional. De 2 a 255 argumentos numéricos correspondientes a una muestra de una población. También puede usar una matriz única o una referencia de matriz en lugar de argumentos separados por comas.' },
        },
    },
    STDEVP: {
        description: 'Calcula la desviación estándar de la población total determinada por los argumentos. La desviación estándar es la medida de la dispersión de los valores respecto a la media (valor promedio).',
        abstract: 'Calcula la desviación estándar de la población total determinada por los argumentos. La desviación estándar es la medida de la dispersión de los valores respecto a la media (valor promedio).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Obligatorio. Es el primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Opcional. De 2 a 255 argumentos numéricos correspondientes a una población. También puede usar una matriz única o una referencia de matriz en lugar de argumentos separados por comas.' },
        },
    },
    TDIST: {
        description: 'Devuelve los puntos porcentuales (probabilidad) de la distribución t de Student, donde un valor numérico (x) es un valor calculado de t para el que debe calcular los puntos porcentuales. Puede usar la distribución t de Student para comprobar pruebas de hipótesis cuando el tamaño de la muestra es pequeño. Use esta función en lugar de una tabla de valores críticos para la distribución t.',
        abstract: 'Devuelve los puntos porcentuales (probabilidad) de la distribución t de Student, donde un valor numérico (x) es un valor calculado de t para el que debe calcular los puntos porcentuales. Puede usar la distribución t de Student para comprobar pruebas de hipótesis cuando el tamaño de la muestra es pequeño. Use esta función en lugar de una tabla de valores críticos para la distribución t.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el valor numérico al que debe evaluar la distribución.' },
            degFreedom: { name: 'grados_libertad', detail: 'Obligatorio. Es un número entero que indica el número de grados de libertad.' },
            tails: { name: 'colas', detail: 'Obligatorio. Especifica el número de colas de la distribución que deben devolverse. Si colas = 1, DISTR.T devuelve la distribución de una cola. Si colas = 2, DISTR.T devuelve la distribución de dos colas.' },
        },
    },
    TINV: {
        description: 'Devuelve el inverso de la distribución t de Student de dos colas.',
        abstract: 'Devuelve el inverso de la distribución t de Student de dos colas.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilidad', detail: 'Obligatorio. Es la probabilidad asociada con la distribución t de Student de dos colas.' },
            degFreedom: { name: 'grados_libertad', detail: 'Obligatorio. Es el número de grados de libertad que caracteriza la distribución.' },
        },
    },
    TTEST: {
        description: 'Devuelve la probabilidad asociada con la prueba t de Student. Use PRUEBA.T para determinar la probabilidad de que dos muestras puedan proceder de dos poblaciones subyacentes con igual media.',
        abstract: 'Devuelve la probabilidad asociada con la prueba t de Student. Use PRUEBA.T para determinar la probabilidad de que dos muestras puedan proceder de dos poblaciones subyacentes con igual media.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Obligatorio. Es el primer conjunto de datos.' },
            array2: { name: 'matriz2', detail: 'Obligatorio. Es el segundo conjunto de datos.' },
            tails: { name: 'colas', detail: 'Obligatorio. Especifica el número de colas de la distribución. Si el argumento colas = 1, PRUEBA.T usa la distribución de una cola. Si colas = 2, PRUEBA.T usa la distribución de dos colas.' },
            type: { name: 'tipo', detail: 'Obligatorio. Es el tipo de prueba t realizada.' },
        },
    },
    VAR: {
        description: 'Calcula la varianza de una muestra.',
        abstract: 'Calcula la varianza de una muestra.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Obligatorio. Es el primer argumento numérico correspondiente a una muestra de una población.' },
            number2: { name: 'número2', detail: 'Opcional. De 2 a 255 argumentos numéricos correspondientes a una muestra de una población.' },
        },
    },
    VARP: {
        description: 'Calcula la varianza en función de toda la población.',
        abstract: 'Calcula la varianza en función de toda la población.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Obligatorio. Es el primer argumento numérico correspondiente a una población.' },
            number2: { name: 'número2', detail: 'Opcional. De 2 a 255 argumentos numéricos correspondientes a una población.' },
        },
    },
    WEIBULL: {
        description: 'Devuelve la distribución de Weibull. Use esta distribución en los análisis de confiabilidad para calcular, por ejemplo, el período medio de vida de un componente hasta que se produce un error.',
        abstract: 'Devuelve la distribución de Weibull. Use esta distribución en los análisis de confiabilidad para calcular, por ejemplo, el período medio de vida de un componente hasta que se produce un error.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obligatorio. Es el valor en el que desea evaluar la función.' },
            alpha: { name: 'alfa', detail: 'Obligatorio. Es un parámetro de la distribución.' },
            beta: { name: 'beta', detail: 'Obligatorio. Es un parámetro de la distribución.' },
            cumulative: { name: 'acumulado', detail: 'Obligatorio. Determina la forma de la función.' },
        },
    },
    ZTEST: {
        description: 'Devuelve el valor de probabilidad de una cola de una prueba z. En una hipótesis para una media de población, µ0, PRUEBA.Z devuelve la probabilidad de que la media de la muestra sea mayor que el promedio de las observaciones del conjunto (matriz) de datos (es decir, la medida observada de la muestra).',
        abstract: 'Devuelve el valor de probabilidad de una cola de una prueba z. En una hipótesis para una media de población, µ0, PRUEBA.Z devuelve la probabilidad de que la media de la muestra sea mayor que el promedio de las observaciones del conjunto (matriz) de datos (es decir, la medida observada de la muestra).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Obligatorio. Es la matriz o el rango de datos con que ha de comprobar x.' },
            x: { name: 'x', detail: 'Obligatorio. Es el valor que va a comprobar.' },
            sigma: { name: 'sigma', detail: 'Opcional. Es la desviación estándar (conocida) de la población. Si la omite, se usa la desviación estándar de la muestra.' },
        },
    },
};

export default locale;

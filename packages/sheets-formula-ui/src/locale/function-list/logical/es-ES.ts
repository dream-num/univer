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
    AND: {
        description: 'Devuelve VERDADERO si todos sus argumentos son VERDADERO',
        abstract: 'Devuelve VERDADERO si todos sus argumentos son VERDADERO',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/and-function-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            logical1: { name: 'lógico1', detail: 'La primera condición que se desea comprobar y que puede evaluarse como VERDADERO o FALSO.' },
            logical2: { name: 'lógico2', detail: 'Otras condiciones que se desean comprobar, hasta un máximo de 255, que pueden evaluarse como VERDADERO o FALSO.' },
        },
    },
    BYCOL: {
        description: 'Aplica una función LAMBDA a cada columna y devuelve una matriz de los resultados',
        abstract: 'Aplica una función LAMBDA a cada columna y devuelve una matriz de los resultados',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/bycol-function-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Matriz que se va a separar por columnas.' },
            lambda: { name: 'lambda', detail: 'Una función LAMBDA que toma una columna como un único parámetro y calcula un resultado. La función LAMBDA toma un único parámetro: una columna de la matriz.' },
        },
    },
    BYROW: {
        description: 'Aplica una función LAMBDA a cada fila y devuelve una matriz de los resultados',
        abstract: 'Aplica una función LAMBDA a cada fila y devuelve una matriz de los resultados',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/byrow-function-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Matriz que se va a separar por filas.' },
            lambda: { name: 'lambda', detail: 'Una función LAMBDA que toma una fila como un único parámetro y calcula un resultado. La función LAMBDA toma un único parámetro: una fila de la matriz.' },
        },
    },
    FALSE: {
        description: 'Devuelve el valor lógico FALSO.',
        abstract: 'Devuelve el valor lógico FALSO.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/false-function-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: 'Especifica una prueba lógica que realizar',
        abstract: 'Especifica una prueba lógica que realizar',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/if-function-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'prueba_lógica', detail: 'La condición que desea probar.' },
            valueIfTrue: {
                name: 'valor_si_verdadero',
                detail: 'El valor que desea que se devuelva si el resultado de la prueba_lógica es VERDADERO.',
            },
            valueIfFalse: {
                name: 'valor_si_falso',
                detail: 'El valor que desea que se devuelva si el resultado de la prueba_lógica es FALSO.',
            },
        },
    },
    IFERROR: {
        description: 'Devuelve un valor que se especifica si una fórmula se evalúa como un error; de lo contrario, devuelve el resultado de la fórmula',
        abstract: 'Devuelve un valor que se especifica si una fórmula se evalúa como un error; de lo contrario, devuelve el resultado de la fórmula',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/iferror-function-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El argumento que se comprueba en busca de un error.' },
            valueIfError: { name: 'valor_si_error', detail: 'El valor que se devolverá si la fórmula se evalúa como un error. Se evalúan los siguientes tipos de error: #N/A, #¡VALOR!, #¡REF!, #¡DIV/0!, #¡NUM!, #¿NOMBRE? o #¡NULO!.' },
        },
    },
    IFNA: {
        description: 'Devuelve el valor que se especifica si la expresión se resuelve en #N/A; de lo contrario, devuelve el resultado de la expresión',
        abstract: 'Devuelve el valor que se especifica si la expresión se resuelve en #N/A; de lo contrario, devuelve el resultado de la expresión',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/ifna-function-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El argumento en el que se busca el valor de error #N/A.' },
            valueIfNa: { name: 'valor_si_na', detail: 'El valor que se devolverá si la fórmula se evalúa con el valor de error #N/A.' },
        },
    },
    IFS: {
        description: 'Comprueba si se cumplen una o más condiciones y devuelve un valor que corresponde a la primera condición VERDADERA.',
        abstract: 'Comprueba si se cumplen una o más condiciones y devuelve un valor que corresponde a la primera condición VERDADERA.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/ifs-function-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'prueba_lógica1', detail: 'Condición que se evalúa como VERDADERO o FALSO.' },
            valueIfTrue1: { name: 'valor_si_verdadero1', detail: 'Resultado que se devolverá si prueba_lógica1 se evalúa como VERDADERO. Puede estar vacío.' },
            logicalTest2: { name: 'prueba_lógica2', detail: 'Condición que se evalúa como VERDADERO o FALSO.' },
            valueIfTrue2: { name: 'valor_si_verdadero2', detail: 'Resultado que se devolverá si prueba_lógicaN se evalúa como VERDADERO. Cada valor_si_verdaderoN se corresponde con una condición prueba_lógicaN. Puede estar vacío.' },
        },
    },
    LAMBDA: {
        description: 'Use una función LAMBDA para crear funciones personalizadas y reutilizables, y llámelas con un nombre descriptivo. La nueva función está disponible en todo el libro y se llama como las funciones nativas de Excel.',
        abstract: 'Crea funciones personalizadas y reutilizables y llámalas por un nombre descriptivo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/lambda-function-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'parámetro',
                detail: 'Un valor que desea pasar a la función, como una referencia de celda, una cadena o un número. Puede introducir hasta 253 parámetros. Este argumento es opcional.',
            },
            calculation: {
                name: 'cálculo',
                detail: 'La fórmula que desea ejecutar y devolver como resultado de la función. Debe ser el último argumento y debe devolver un resultado. Este argumento es obligatorio.',
            },
        },
    },
    LET: {
        description: 'Asigna nombres a los resultados de los cálculos',
        abstract: 'Asigna nombres a los resultados de los cálculos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: 'nombre1', detail: 'El primer nombre que se va a asignar. Debe empezar con una letra. No puede ser el resultado de una fórmula ni entrar en conflicto con la sintaxis de rango.' },
            nameValue1: { name: 'valor_nombre1', detail: 'El valor que se asigna a nombre1.' },
            calculationOrName2: { name: 'cálculo_o_nombre2', detail: 'Uno de los siguientes:\n1.Un cálculo que use todos los nombres de la función LET. Debe ser el último argumento de la función LET.\n2.Un segundo nombre para asignar a un segundo valor_nombre. Si se especifica un nombre, valor_nombre2 y cálculo_o_nombre3 son obligatorios.' },
            nameValue2: { name: 'valor_nombre2', detail: 'El valor que se asigna a cálculo_o_nombre2.' },
            calculationOrName3: { name: 'cálculo_o_nombre3', detail: 'Uno de los siguientes:\n1.Un cálculo que use todos los nombres de la función LET. El último argumento de la función LET debe ser un cálculo.\n2.Un tercer nombre para asignar a un tercer valor_nombre. Si se especifica un nombre, valor_nombre3 y cálculo_o_nombre4 son obligatorios.' },
        },
    },
    MAKEARRAY: {
        description: 'Devuelve una matriz calculada de un tamaño de fila y columna especificado, mediante la aplicación de una LAMBDA',
        abstract: 'Devuelve una matriz calculada de un tamaño de fila y columna especificado, mediante la aplicación de una LAMBDA',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/makearray-function-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: 'filas', detail: 'El número de filas de la matriz. Debe ser mayor que cero.' },
            number2: { name: 'columnas', detail: 'El número de columnas de la matriz. Debe ser mayor que cero.' },
            value3: {
                name: 'lambda',
                detail: 'Una función LAMBDA que se llama para crear la matriz. La función LAMBDA toma dos parámetros: fila (el índice de fila de la matriz), columna (el índice de columna de la matriz).',
            },
        },
    },
    MAP: {
        description: 'Devuelve una matriz formada al asignar cada valor de las matrices a un nuevo valor aplicando una LAMBDA para crear un nuevo valor.',
        abstract: 'Devuelve una matriz formada al asignar cada valor de las matrices a un nuevo valor aplicando una LAMBDA para crear un nuevo valor.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/map-function-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz1', detail: 'Una matriz1 que se va a asignar.' },
            array2: { name: 'matriz2', detail: 'Una matriz2 que se va a asignar.' },
            lambda: { name: 'lambda', detail: 'Una función LAMBDA que debe ser el último argumento y que debe tener un parámetro para cada matriz pasada.' },
        },
    },
    NOT: {
        description: 'Invierte el valor lógico de su argumento.',
        abstract: 'Invierte el valor lógico de su argumento.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/not-function-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            logical: { name: 'lógico', detail: 'La condición para la que desea invertir la lógica, que puede evaluarse como VERDADERO o FALSO.' },
        },
    },
    OR: {
        description: 'Devuelve VERDADERO si alguno de sus argumentos se evalúa como VERDADERO, y devuelve FALSO si todos sus argumentos se evalúan como FALSO.',
        abstract: 'Devuelve VERDADERO si algún argumento es VERDADERO',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/or-function-7d17ad14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            logical1: { name: 'lógico1', detail: 'La primera condición que se desea comprobar y que puede evaluarse como VERDADERO o FALSO.' },
            logical2: { name: 'lógico2', detail: 'Otras condiciones que se desean comprobar, hasta un máximo de 255, que pueden evaluarse como VERDADERO o FALSO.' },
        },
    },
    REDUCE: {
        description: 'Reduce una matriz a un valor acumulado aplicando una LAMBDA a cada valor y devolviendo el valor total en el acumulador.',
        abstract: 'Reduce una matriz a un valor acumulado aplicando una LAMBDA a cada valor y devolviendo el valor total en el acumulador.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/reduce-function-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            initialValue: { name: 'valor_inicial', detail: 'Establece el valor inicial para el acumulador.' },
            array: { name: 'matriz', detail: 'Una matriz que se va a reducir.' },
            lambda: { name: 'lambda', detail: 'Una función LAMBDA que se llama para reducir la matriz. La función LAMBDA toma tres parámetros: 1.El valor totalizado y devuelto como resultado final. 2.El valor actual de la matriz. 3.El cálculo aplicado a cada elemento de la matriz.' },
        },
    },
    SCAN: {
        description: 'Examina una matriz aplicando una LAMBDA a cada valor y devuelve una matriz que tiene cada valor intermedio.',
        abstract: 'Examina una matriz aplicando una LAMBDA a cada valor y devuelve una matriz que tiene cada valor intermedio.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/scan-function-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            initialValue: { name: 'valor_inicial', detail: 'Establece el valor inicial para el acumulador.' },
            array: { name: 'matriz', detail: 'Una matriz que se va a examinar.' },
            lambda: { name: 'lambda', detail: 'Una función LAMBDA que se llama para examinar la matriz. La función LAMBDA toma tres parámetros: 1.El valor totalizado y devuelto como resultado final. 2.El valor actual de la matriz. 3.El cálculo aplicado a cada elemento de la matriz.' },
        },
    },
    SWITCH: {
        description: 'Evalúa una expresión comparándola con una lista de valores y devuelve el resultado correspondiente al primer valor coincidente. Si no hay ninguna coincidencia, puede devolverse un valor predeterminado opcional.',
        abstract: 'Evalúa una expresión comparándola con una lista de valores y devuelve el resultado correspondiente al primer valor coincidente. Si no hay ninguna coincidencia, puede devolverse un valor predeterminado opcional.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/switch-function-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            expression: { name: 'expresión', detail: 'Expresión es el valor (como un número, fecha o texto) que se comparará con valor1...valor126.' },
            value1: { name: 'valor1', detail: 'ValorN es un valor que se comparará con la expresión.' },
            result1: { name: 'resultado1', detail: 'ResultadoN es el valor que se devolverá cuando el argumento valorN correspondiente coincida con la expresión. ResultadoN debe proporcionarse para cada argumento valorN correspondiente.' },
            defaultOrValue2: { name: 'predeterminado_o_valor2', detail: 'Predeterminado es el valor que se devolverá en caso de que no se encuentren coincidencias en las expresiones valorN. El argumento Predeterminado se identifica por no tener una expresión resultadoN correspondiente (consulte los ejemplos). Predeterminado debe ser el último argumento de la función.' },
            result2: { name: 'resultado2', detail: 'ResultadoN es el valor que se devolverá cuando el argumento valorN correspondiente coincida con la expresión. ResultadoN debe proporcionarse para cada argumento valorN correspondiente.' },
        },
    },
    TRUE: {
        description: 'Devuelve el valor lógico VERDADERO.',
        abstract: 'Devuelve el valor lógico VERDADERO.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/true-function-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: 'Devuelve VERDADERO si un número impar de sus argumentos se evalúa como VERDADERO, y FALSO si un número par de sus argumentos se evalúa como VERDADERO.',
        abstract: 'Devuelve VERDADERO si un número impar de argumentos son VERDADERO',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/xor-function-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: 'lógico1', detail: 'La primera condición que se desea comprobar y que puede evaluarse como VERDADERO o FALSO.' },
            logical2: { name: 'lógico2', detail: 'Otras condiciones que se desean comprobar, hasta un máximo de 255, que pueden evaluarse como VERDADERO o FALSO.' },
        },
    },
};

export default locale;

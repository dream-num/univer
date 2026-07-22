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
    ARRAY_CONSTRAIN: {
        description: 'Restringe un resultado de matriz a un tamaño especificado.',
        abstract: 'Restringe un resultado de matriz a un tamaño especificado.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/3267036?hl=es',
            },
        ],
        functionParameter: {
            inputRange: { name: 'rango_entrada', detail: 'ARRAY_CONSTRAIN(SORT(A1:F100, 1, TRUE), 10, 6)' },
            numRows: { name: 'num_filas', detail: 'El número de filas que debe contener el resultado.' },
            numCols: { name: 'num_columnas', detail: 'El número de columnas que debe contener el resultado' },
        },
    },
    FLATTEN: {
        description: 'Combina todos los valores de uno o varios intervalos en una sola columna.',
        abstract: 'Combina todos los valores de uno o varios intervalos en una sola columna.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/10307761?hl=es',
            },
        ],
        functionParameter: {
            range1: { name: 'rango1', detail: 'Es el primer intervalo que se va a combinar.' },
            range2: { name: 'rango2', detail: '[opcional] repetible Otros intervalos que se pueden combinar.' },
        },
    },
};

export default locale;

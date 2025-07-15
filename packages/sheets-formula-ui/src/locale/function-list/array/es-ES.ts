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
                url: 'https://support.google.com/docs/answer/3267036?hl=en&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'rango_entrada', detail: 'El rango a restringir.' },
            numRows: { name: 'num_filas', detail: 'El número de filas que debe contener el resultado.' },
            numCols: { name: 'num_columnas', detail: 'El número de columnas que debe contener el resultado' },
        },
    },
    FLATTEN: {
        description: 'Aplana todos los valores de uno o más rangos en una sola columna.',
        abstract: 'Aplana todos los valores de uno o más rangos en una sola columna.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'rango1', detail: 'El primer rango a aplanar.' },
            range2: { name: 'rango2', detail: 'Rangos adicionales a aplanar.' },
        },
    },
};

export default locale;

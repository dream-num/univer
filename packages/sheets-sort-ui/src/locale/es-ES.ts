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
    'sheets-sort': {
        general: {
            sort: 'Ordenar',
            'sort-asc': 'Ascendente',
            'sort-desc': 'Descendente',
            'sort-custom': 'Orden personalizado',
            'sort-asc-ext': 'Expandir ascendente',
            'sort-desc-ext': 'Expandir descendente',
            'sort-asc-cur': 'Ascendente',
            'sort-desc-cur': 'Descendente',
        },
        error: {
            'merge-size': 'El rango seleccionado contiene celdas combinadas de diferentes tamaños, que no se pueden ordenar.',
            empty: 'El rango seleccionado no tiene contenido y no se puede ordenar.',
            single: 'El rango seleccionado solo tiene una fila y no se puede ordenar.',
            'formula-array': 'El rango seleccionado tiene fórmulas de matriz y no se puede ordenar.',
        },
        dialog: {
            'sort-reminder': 'Recordatorio de ordenación',
            'sort-reminder-desc': '¿Extender el rango de ordenación o mantener el rango?',
            'sort-reminder-ext': 'Extender el rango de ordenación',
            'sort-reminder-no': 'Mantener el rango de ordenación',
            'first-row-check': 'La primera fila no participa en la ordenación',
            'add-condition': 'Agregar condición',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
    },
};

export default locale;

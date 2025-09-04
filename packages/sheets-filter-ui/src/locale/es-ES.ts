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
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Alternar filtro',
            'clear-filter-criteria': 'Borrar condiciones de filtro',
            're-calc-filter-conditions': 'Recalcular condiciones de filtro',
        },
        command: {
            'not-valid-filter-range': 'El rango seleccionado solo tiene una fila y no es válido para filtrar.',
        },
        shortcut: {
            'smart-toggle-filter': 'Alternar filtro',
        },
        panel: {
            'clear-filter': 'Borrar filtro',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            'by-values': 'Por valores',
            'by-colors': 'Por colores',
            'filter-by-cell-fill-color': 'Filtrar por color de relleno de celda',
            'filter-by-cell-text-color': 'Filtrar por color de texto de celda',
            'filter-by-color-none': 'La columna contiene solo un color',
            'by-conditions': 'Por condiciones',
            'filter-only': 'Solo filtrar',
            'search-placeholder': 'Usa espacio para separar palabras clave',
            'select-all': 'Seleccionar todo',
            'input-values-placeholder': 'Introducir valores',
            and: 'Y',
            or: 'O',
            empty: '(vacío)',
            '?': 'Usa “?” para representar un solo carácter.',
            '*': 'Usa “*” para representar varios caracteres.',
        },
        conditions: {
            none: 'Ninguno',
            empty: 'Está vacío',
            'not-empty': 'No está vacío',
            'text-contains': 'El texto contiene',
            'does-not-contain': 'El texto no contiene',
            'starts-with': 'El texto comienza con',
            'ends-with': 'El texto termina con',
            equals: 'El texto es igual a',
            'greater-than': 'Mayor que',
            'greater-than-or-equal': 'Mayor o igual que',
            'less-than': 'Menor que',
            'less-than-or-equal': 'Menor o igual que',
            equal: 'Igual',
            'not-equal': 'No igual',
            between: 'Entre',
            'not-between': 'No entre',
            custom: 'Personalizado',
        },
        msg: {
            'filter-header-forbidden': 'No puedes mover la fila de encabezado de un filtro.',
        },
        date: {
            1: 'Enero',
            2: 'Febrero',
            3: 'Marzo',
            4: 'Abril',
            5: 'Mayo',
            6: 'Junio',
            7: 'Julio',
            8: 'Agosto',
            9: 'Septiembre',
            10: 'Octubre',
            11: 'Noviembre',
            12: 'Diciembre',
        },
        sync: {
            title: 'El filtro es visible para todos',
            statusTips: {
                on: 'Una vez activado, todos los colaboradores verán los resultados del filtro',
                off: 'Una vez desactivado, solo tú verás los resultados del filtro',
            },
            switchTips: {
                on: '"El filtro es visible para todos" está activado, todos los colaboradores verán los resultados del filtro',
                off: '"El filtro es visible para todos" está desactivado, solo tú verás los resultados del filtro',
            },
        },
    },
};

export default locale;

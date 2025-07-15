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
    'find-replace': {
        toolbar: 'Buscar y reemplazar',
        shortcut: {
            'open-find-dialog': 'Abrir diálogo de búsqueda',
            'open-replace-dialog': 'Abrir diálogo de reemplazo',
            'close-dialog': 'Cerrar diálogo de buscar y reemplazar',
            'go-to-next-match': 'Ir a la siguiente coincidencia',
            'go-to-previous-match': 'Ir a la coincidencia anterior',
            'focus-selection': 'Enfocar selección',
        },
        dialog: {
            title: 'Buscar',
            find: 'Buscar',
            replace: 'Reemplazar',
            'replace-all': 'Reemplazar todo',
            'case-sensitive': 'Distinguir mayúsculas y minúsculas',
            'find-placeholder': 'Buscar en esta hoja',
            'advanced-finding': 'Búsqueda y reemplazo avanzados',
            'replace-placeholder': 'Introducir texto de reemplazo',
            'match-the-whole-cell': 'Coincidir toda la celda',
            'find-direction': {
                title: 'Dirección de búsqueda',
                row: 'Buscar por fila',
                column: 'Buscar por columna',
            },
            'find-scope': {
                title: 'Rango de búsqueda',
                'current-sheet': 'Hoja actual',
                workbook: 'Libro',
            },
            'find-by': {
                title: 'Buscar por',
                value: 'Buscar por valor',
                formula: 'Buscar fórmula',
            },
            'no-match': 'Búsqueda completada pero no se encontraron coincidencias.',
            'no-result': 'Sin resultados',
        },
        replace: {
            'all-success': 'Se reemplazaron las {0} coincidencias',
            'all-failure': 'Error al reemplazar',
            confirm: {
                title: '¿Está seguro de reemplazar todas las coincidencias?',
            },
        },
    },
    'find-replace-shortcuts': 'Buscar y reemplazar',
};

export default locale;

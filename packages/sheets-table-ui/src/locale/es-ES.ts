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
    'sheets-table': {
        title: 'Tabla',
        selectRange: 'Seleccionar rango de tabla',
        rename: 'Renombrar tabla',
        updateRange: 'Actualizar rango de tabla',
        tableRangeWithMergeError: 'El rango de la tabla no puede superponerse con celdas combinadas',
        tableRangeWithOtherTableError: 'El rango de la tabla no puede superponerse con otras tablas',
        tableRangeSingleRowError: 'El rango de la tabla no puede ser una sola fila',
        updateError: 'No se puede establecer el rango de la tabla en un área que no se superponga con la original y no esté en la misma fila',
        tableStyle: 'Estilo de tabla',
        defaultStyle: 'Estilo predeterminado',
        customStyle: 'Estilo personalizado',
        customTooMore: 'El número de temas personalizados excede el límite máximo, por favor, elimine algunos temas innecesarios y vuelva a añadirlos',
        setTheme: 'Establecer tema de tabla',
        removeTable: 'Eliminar tabla',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        header: 'Encabezado',
        footer: 'Pie de página',
        firstLine: 'Primera línea',
        secondLine: 'Segunda línea',
        columnPrefix: 'Columna',
        tablePrefix: 'Tabla',
        tableNameError: 'El nombre de la tabla no puede contener espacios, no puede comenzar con un número y no puede ser idéntico a un nombre de tabla existente',

        insert: {
            main: 'Insertar tabla',
            row: 'Insertar fila de tabla',
            col: 'Insertar columna de tabla',
        },

        remove: {
            main: 'Eliminar tabla',
            row: 'Eliminar fila de tabla',
            col: 'Eliminar columna de tabla',
        },
        condition: {
            string: 'Texto',
            number: 'Número',
            date: 'Fecha',

            empty: '(Vacío)',
        },
        string: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No es igual a',
                contains: 'Contiene',
                notContains: 'No contiene',
                startsWith: 'Empieza por',
                endsWith: 'Termina en',
            },
        },
        number: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No es igual a',
                greaterThan: 'Mayor que',
                greaterThanOrEqual: 'Mayor o igual que',
                lessThan: 'Menor que',
                lessThanOrEqual: 'Menor o igual que',
                between: 'Entre',
                notBetween: 'No está entre',
                above: 'Por encima',
                below: 'Por debajo',
                topN: '{0} superiores',
            },
        },
        date: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No es igual a',
                after: 'Después de',
                afterOrEqual: 'Después o igual a',
                before: 'Antes de',
                beforeOrEqual: 'Antes o igual a',
                between: 'Entre',
                notBetween: 'No está entre',
                today: 'Hoy',
                yesterday: 'Ayer',
                tomorrow: 'Mañana',
                thisWeek: 'Esta semana',
                lastWeek: 'La semana pasada',
                nextWeek: 'La próxima semana',
                thisMonth: 'Este mes',
                lastMonth: 'El mes pasado',
                nextMonth: 'El próximo mes',
                thisQuarter: 'Este trimestre',
                lastQuarter: 'El trimestre pasado',
                nextQuarter: 'El próximo trimestre',
                thisYear: 'Este año',
                nextYear: 'El próximo año',
                lastYear: 'El año pasado',
                quarter: 'Por trimestre',
                month: 'Por mes',
                q1: 'Primer trimestre',
                q2: 'Segundo trimestre',
                q3: 'Tercer trimestre',
                q4: 'Cuarto trimestre',
                m1: 'Enero',
                m2: 'Febrero',
                m3: 'Marzo',
                m4: 'Abril',
                m5: 'Mayo',
                m6: 'Junio',
                m7: 'Julio',
                m8: 'Agosto',
                m9: 'Septiembre',
                m10: 'Octubre',
                m11: 'Noviembre',
                m12: 'Diciembre',
            },
        },
    },
};

export default locale;

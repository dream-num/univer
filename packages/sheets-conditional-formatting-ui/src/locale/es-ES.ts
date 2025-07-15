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
    sheet: {
        cf: {
            title: 'Formato condicional',
            menu: {
                manageConditionalFormatting: 'Gestionar formato condicional',
                createConditionalFormatting: 'Crear formato condicional',
                clearRangeRules: 'Borrar reglas del rango seleccionado',
                clearWorkSheetRules: 'Borrar reglas de toda la hoja',
            },
            form: {
                lessThan: 'El valor debe ser menor que {0}',
                lessThanOrEqual: 'El valor debe ser menor o igual que {0}',
                greaterThan: 'El valor debe ser mayor que {0}',
                greaterThanOrEqual: 'El valor debe ser mayor o igual que {0}',
                rangeSelector: 'Selecciona un rango o introduce un valor',
            },
            iconSet: {
                direction: 'Dirección',
                shape: 'Forma',
                mark: 'Marca',
                rank: 'Rango',
                rule: 'Regla',
                icon: 'Icono',
                type: 'Tipo',
                value: 'Valor',
                reverseIconOrder: 'Invertir orden de iconos',
                and: 'Y',
                when: 'Cuando',
                onlyShowIcon: 'Mostrar solo icono',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Crear regla',
                clear: 'Borrar todas las reglas',
                range: 'Aplicar rango',
                styleType: 'Tipo de estilo',
                submit: 'Enviar',
                cancel: 'Cancelar',
                rankAndAverage: 'Superior/Inferior/Promedio',
                styleRule: 'Regla de estilo',
                isNotBottom: 'Superior',
                isBottom: 'Inferior',
                greaterThanAverage: 'Mayor que el promedio',
                lessThanAverage: 'Menor que el promedio',
                medianValue: 'Valor mediano',
                fillType: 'Tipo de relleno',
                pureColor: 'Color sólido',
                gradient: 'Gradiente',
                colorSet: 'Conjunto de colores',
                positive: 'Positivo',
                native: 'Negativo',
                workSheet: 'Toda la hoja',
                selectedRange: 'Rango seleccionado',
                managerRuleSelect: 'Gestionar reglas de {0}',
                onlyShowDataBar: 'Mostrar solo barras de datos',
            },
            preview: {
                describe: {
                    beginsWith: 'Empieza con {0}',
                    endsWith: 'Termina con {0}',
                    containsText: 'El texto contiene {0}',
                    notContainsText: 'El texto no contiene {0}',
                    equal: 'Igual a {0}',
                    notEqual: 'Distinto de {0}',
                    containsBlanks: 'Contiene espacios en blanco',
                    notContainsBlanks: 'No contiene espacios en blanco',
                    containsErrors: 'Contiene errores',
                    notContainsErrors: 'No contiene errores',
                    greaterThan: 'Mayor que {0}',
                    greaterThanOrEqual: 'Mayor o igual que {0}',
                    lessThan: 'Menor que {0}',
                    lessThanOrEqual: 'Menor o igual que {0}',
                    notBetween: 'No está entre {0} y {1}',
                    between: 'Entre {0} y {1}',
                    yesterday: 'Ayer',
                    tomorrow: 'Mañana',
                    last7Days: 'Últimos 7 días',
                    thisMonth: 'Este mes',
                    lastMonth: 'Mes pasado',
                    nextMonth: 'Mes siguiente',
                    thisWeek: 'Esta semana',
                    lastWeek: 'Semana pasada',
                    nextWeek: 'Semana siguiente',
                    today: 'Hoy',
                    topN: 'Top {0}',
                    bottomN: 'Inferior {0}',
                    topNPercent: 'Top {0}%',
                    bottomNPercent: 'Inferior {0}%',
                },
            },
            operator: {
                beginsWith: 'Empieza con',
                endsWith: 'Termina con',
                containsText: 'El texto contiene',
                notContainsText: 'El texto no contiene',
                equal: 'Igual a',
                notEqual: 'Distinto de',
                containsBlanks: 'Contiene espacios en blanco',
                notContainsBlanks: 'No contiene espacios en blanco',
                containsErrors: 'Contiene errores',
                notContainsErrors: 'No contiene errores',
                greaterThan: 'Mayor que',
                greaterThanOrEqual: 'Mayor o igual que',
                lessThan: 'Menor que',
                lessThanOrEqual: 'Menor o igual que',
                notBetween: 'No está entre',
                between: 'Entre',
                yesterday: 'Ayer',
                tomorrow: 'Mañana',
                last7Days: 'Últimos 7 días',
                thisMonth: 'Este mes',
                lastMonth: 'Mes pasado',
                nextMonth: 'Mes siguiente',
                thisWeek: 'Esta semana',
                lastWeek: 'Semana pasada',
                nextWeek: 'Semana siguiente',
                today: 'Hoy',
            },
            ruleType: {
                highlightCell: 'Resaltar celda',
                dataBar: 'Barra de datos',
                colorScale: 'Escala de colores',
                formula: 'Fórmula personalizada',
                iconSet: 'Conjunto de iconos',
                duplicateValues: 'Valores duplicados',
                uniqueValues: 'Valores únicos',
            },
            subRuleType: {
                uniqueValues: 'Valores únicos',
                duplicateValues: 'Valores duplicados',
                rank: 'Rango',
                text: 'Texto',
                timePeriod: 'Periodo de tiempo',
                number: 'Número',
                average: 'Promedio',
            },
            valueType: {
                num: 'Número',
                min: 'Mínimo',
                max: 'Máximo',
                percent: 'Porcentaje',
                percentile: 'Percentil',
                formula: 'Fórmula',
                none: 'Ninguno',
            },
            errorMessage: {
                notBlank: 'La condición no puede estar vacía',
                formulaError: 'Fórmula incorrecta',
                rangeError: 'Selección incorrecta',
            },
        },
    },
};

export default locale;

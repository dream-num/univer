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
            title: 'Format condicional',
            menu: {
                manageConditionalFormatting: 'Gestiona el format condicional',
                createConditionalFormatting: 'Crea format condicional',
                clearRangeRules: 'Esborra les regles del rang seleccionat',
                clearWorkSheetRules: 'Esborra les regles de tota la fulla',
            },
            form: {
                lessThan: 'El valor ha de ser menor que {0}',
                lessThanOrEqual: 'El valor ha de ser menor o igual que {0}',
                greaterThan: 'El valor ha de ser més gran que {0}',
                greaterThanOrEqual: 'El valor ha de ser més gran o igual que {0}',
                rangeSelector: 'Selecciona un rang o introdueix un valor',
            },
            iconSet: {
                direction: 'Direcció',
                shape: 'Forma',
                mark: 'Marca',
                rank: 'Rang',
                rule: 'Regla',
                icon: 'Icona',
                type: 'Tipus',
                value: 'Valor',
                reverseIconOrder: 'Inverteix l\'ordre de les icones',
                and: 'I',
                when: 'Quan',
                onlyShowIcon: 'Mostra només la icona',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Crea regla',
                clear: 'Esborra totes les regles',
                range: 'Aplica rang',
                styleType: 'Tipus d\'estil',
                submit: 'Envia',
                cancel: 'Cancel·la',
                rankAndAverage: 'Superior/Inferior/Mitjana',
                styleRule: 'Regla d\'estil',
                isNotBottom: 'Superior',
                isBottom: 'Inferior',
                greaterThanAverage: 'Més gran que la mitjana',
                lessThanAverage: 'Menys que la mitjana',
                medianValue: 'Valor mitjà',
                fillType: 'Tipus d\'emplenat',
                pureColor: 'Color sòlid',
                gradient: 'Gradient',
                colorSet: 'Conjunt de colors',
                positive: 'Positiu',
                native: 'Negatiu',
                workSheet: 'Tota la fulla',
                selectedRange: 'Rang seleccionat',
                managerRuleSelect: 'Gestiona les regles de {0}',
                onlyShowDataBar: 'Mostra només les barres de dades',
            },
            preview: {
                describe: {
                    beginsWith: 'Comença amb {0}',
                    endsWith: 'Acaba amb {0}',
                    containsText: 'El text conté {0}',
                    notContainsText: 'El text no conté {0}',
                    equal: 'Igual a {0}',
                    notEqual: 'Diferent de {0}',
                    containsBlanks: 'Conté espais en blanc',
                    notContainsBlanks: 'No conté espais en blanc',
                    containsErrors: 'Conté errors',
                    notContainsErrors: 'No conté errors',
                    greaterThan: 'Més gran que {0}',
                    greaterThanOrEqual: 'Més gran o igual que {0}',
                    lessThan: 'Menys que {0}',
                    lessThanOrEqual: 'Menys o igual que {0}',
                    notBetween: 'No està entre {0} i {1}',
                    between: 'Entre {0} i {1}',
                    yesterday: 'Ahir',
                    tomorrow: 'Demà',
                    last7Days: 'Últims 7 dies',
                    thisMonth: 'Aquest mes',
                    lastMonth: 'Mes passat',
                    nextMonth: 'Mes següent',
                    thisWeek: 'Aquesta setmana',
                    lastWeek: 'Setmana passada',
                    nextWeek: 'Setmana següent',
                    today: 'Avui',
                    topN: 'Superior {0}',
                    bottomN: 'Inferior {0}',
                    topNPercent: 'Superior {0}%',
                    bottomNPercent: 'Inferior {0}%',
                },
            },
            operator: {
                beginsWith: 'Comença amb',
                endsWith: 'Acaba amb',
                containsText: 'El text conté',
                notContainsText: 'El text no conté',
                equal: 'Igual a',
                notEqual: 'Diferent de',
                containsBlanks: 'Conté espais en blanc',
                notContainsBlanks: 'No conté espais en blanc',
                containsErrors: 'Conté errors',
                notContainsErrors: 'No conté errors',
                greaterThan: 'Més gran que',
                greaterThanOrEqual: 'Més gran o igual que',
                lessThan: 'Menys que',
                lessThanOrEqual: 'Menys o igual que',
                notBetween: 'No està entre',
                between: 'Entre',
                yesterday: 'Ahir',
                tomorrow: 'Demà',
                last7Days: 'Últims 7 dies',
                thisMonth: 'Aquest mes',
                lastMonth: 'Mes passat',
                nextMonth: 'Mes següent',
                thisWeek: 'Aquesta setmana',
                lastWeek: 'Setmana passada',
                nextWeek: 'Setmana següent',
                today: 'Avui',
            },
            ruleType: {
                highlightCell: 'Ressalta la cel·la',
                dataBar: 'Barra de dades',
                colorScale: 'Escala de colors',
                formula: 'Fórmula personalitzada',
                iconSet: 'Conjunt d\'icones',
                duplicateValues: 'Valors duplicats',
                uniqueValues: 'Valors únics',
            },
            subRuleType: {
                uniqueValues: 'Valors únics',
                duplicateValues: 'Valors duplicats',
                rank: 'Rang',
                text: 'Text',
                timePeriod: 'Període de temps',
                number: 'Número',
                average: 'Mitjana',
            },
            valueType: {
                num: 'Número',
                min: 'Mínim',
                max: 'Màxim',
                percent: 'Percentatge',
                percentile: 'Percentil',
                formula: 'Fórmula',
                none: 'Cap',
            },
            errorMessage: {
                notBlank: 'La condició no pot estar buida',
                formulaError: 'Fórmula incorrecta',
                rangeError: 'Selecció incorrecta',
            },
        },
    },
};

export default locale;

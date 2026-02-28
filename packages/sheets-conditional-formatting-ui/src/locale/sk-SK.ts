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
            title: 'Podmienené formátovanie',
            menu: {
                manageConditionalFormatting: 'Spravovať podmienené formátovanie',
                createConditionalFormatting: 'Vytvoriť podmienené formátovanie',
                clearRangeRules: 'Vymazať pravidlá pre vybraný rozsah',
                clearWorkSheetRules: 'Vymazať pravidlá pre celý hárok',

            },
            form: {
                lessThan: 'Hodnota musí byť menšia ako {0}',
                lessThanOrEqual: 'Hodnota musí byť menšia alebo rovná {0}',
                greaterThan: 'Hodnota musí byť väčšia ako {0}',
                greaterThanOrEqual: 'Hodnota musí byť väčšia alebo rovná {0}',
                rangeSelector: 'Vyberte rozsah alebo zadajte hodnotu',
            },
            iconSet: {
                direction: 'Smer',
                shape: 'Tvar',
                mark: 'Značka',
                rank: 'Poradie',
                rule: 'Pravidlo',
                icon: 'Ikona',
                type: 'Typ',
                value: 'Hodnota',
                reverseIconOrder: 'Obrátiť poradie ikon',
                and: 'A',
                when: 'Keď',
                onlyShowIcon: 'Zobraziť iba ikonu',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Vytvoriť pravidlo',
                clear: 'Vymazať všetky pravidlá',
                range: 'Rozsah použitia',
                styleType: 'Typ štýlu',
                submit: 'Použiť',
                cancel: 'Zrušiť',
                rankAndAverage: 'Horné/Dolné/Priemer',
                styleRule: 'Pravidlo štýlu',
                isNotBottom: 'Horné',
                isBottom: 'Dolné',
                greaterThanAverage: 'Nad priemerom',
                lessThanAverage: 'Pod priemerom',
                medianValue: 'Medián',
                fillType: 'Typ výplne',
                pureColor: 'Jednofarebné',
                gradient: 'Prechod',
                colorSet: 'Súprava farieb',
                positive: 'Pozitívne',
                native: 'Negatívne',
                workSheet: 'Celý hárok',
                selectedRange: 'Vybraný rozsah',
                managerRuleSelect: 'Spravovať {0} pravidiel',
                onlyShowDataBar: 'Zobraziť iba dátové pruhy',
            },
            preview: {
                describe: {
                    beginsWith: 'Začína s {0}',
                    endsWith: 'Končí na {0}',
                    containsText: 'Text obsahuje {0}',
                    notContainsText: 'Text neobsahuje {0}',
                    equal: 'Rovná sa {0}',
                    notEqual: 'Nerovná sa {0}',
                    containsBlanks: 'Obsahuje prázdne',
                    notContainsBlanks: 'Neobsahuje prázdne',
                    containsErrors: 'Obsahuje chyby',
                    notContainsErrors: 'Neobsahuje chyby',
                    greaterThan: 'Väčšie ako {0}',
                    greaterThanOrEqual: 'Väčšie alebo rovné {0}',
                    lessThan: 'Menšie ako {0}',
                    lessThanOrEqual: 'Menšie alebo rovné {0}',
                    notBetween: 'Nie medzi {0} a {1}',
                    between: 'Medzi {0} a {1}',
                    yesterday: 'Včera',
                    tomorrow: 'Zajtra',
                    last7Days: 'Posledných 7 dní',
                    thisMonth: 'Tento mesiac',
                    lastMonth: 'Minulý mesiac',
                    nextMonth: 'Budúci mesiac',
                    thisWeek: 'Tento týždeň',
                    lastWeek: 'Minulý týždeň',
                    nextWeek: 'Budúci týždeň',
                    today: 'Dnes',
                    topN: 'Horných {0}',
                    bottomN: 'Dolných {0}',
                    topNPercent: 'Horných {0}%',
                    bottomNPercent: 'Dolných {0}%',
                },
            },
            operator: {
                beginsWith: 'Začína s',
                endsWith: 'Končí na',
                containsText: 'Text obsahuje',
                notContainsText: 'Text neobsahuje',
                equal: 'Rovná sa',
                notEqual: 'Nerovná sa',
                containsBlanks: 'Obsahuje prázdne',
                notContainsBlanks: 'Neobsahuje prázdne',
                containsErrors: 'Obsahuje chyby',
                notContainsErrors: 'Neobsahuje chyby',
                greaterThan: 'Väčšie ako',
                greaterThanOrEqual: 'Väčšie alebo rovné',
                lessThan: 'Menšie ako',
                lessThanOrEqual: 'Menšie alebo rovné',
                notBetween: 'Nie medzi',
                between: 'Medzi',
                yesterday: 'Včera',
                tomorrow: 'Zajtra',
                last7Days: 'Posledných 7 dní',
                thisMonth: 'Tento mesiac',
                lastMonth: 'Minulý mesiac',
                nextMonth: 'Budúci mesiac',
                thisWeek: 'Tento týždeň',
                lastWeek: 'Minulý týždeň',
                nextWeek: 'Budúci týždeň',
                today: 'Dnes',
            },
            ruleType: {
                highlightCell: 'Zvýrazniť bunku',
                dataBar: 'Dátový pruh',
                colorScale: 'Farebná škála',
                formula: 'Vlastný vzorec',
                iconSet: 'Súprava ikon',
                duplicateValues: 'Duplicitné hodnoty',
                uniqueValues: 'Jedinečné hodnoty',
            },
            subRuleType: {
                uniqueValues: 'Jedinečné hodnoty',
                duplicateValues: 'Duplicitné hodnoty',
                rank: 'Poradie',
                text: 'Text',
                timePeriod: 'Časové obdobie',
                number: 'Číslo',
                average: 'Priemer',
            },
            valueType: {
                num: 'Číslo',
                min: 'Minimum',
                max: 'Maximum',
                percent: 'Percento',
                percentile: 'Percentil',
                formula: 'Vzorec',
                none: 'Žiadne',
            },
            errorMessage: {
                notBlank: 'Podmienka nemôže byť prázdna',
                formulaError: 'Nesprávny vzorec',
                rangeError: 'Nesprávny výber',
            },
        },
    },
};

export default locale;

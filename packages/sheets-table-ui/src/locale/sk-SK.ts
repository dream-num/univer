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
        title: 'Tabuľka',
        selectRange: 'Vyberte rozsah tabuľky',
        rename: 'Premenovať tabuľku',
        updateRange: 'Aktualizovať rozsah tabuľky',
        tableRangeWithMergeError: 'Rozsah tabuľky sa nemôže prekrývať so zlúčenými bunkami',
        tableRangeWithOtherTableError: 'Rozsah tabuľky sa nemôže prekrývať s inými tabuľkami',
        tableRangeSingleRowError: 'Rozsah tabuľky nemôže byť jeden riadok',
        updateError: 'Rozsah tabuľky nemožno nastaviť na oblasť, ktorá sa neprekrýva s pôvodnou a nie je v tom istom riadku',
        tableStyle: 'Štýl tabuľky',
        defaultStyle: 'Predvolený štýl',
        customStyle: 'Vlastný štýl',
        customTooMore: 'Počet vlastných tém presahuje maximálny limit, odstráňte niektoré nepotrebné témy a pridajte ich znova',
        setTheme: 'Nastaviť tému tabuľky',
        removeTable: 'Odstrániť tabuľku',
        cancel: 'Zrušiť',
        confirm: 'Potvrdiť',
        header: 'Hlavička',
        footer: 'Päta',
        firstLine: 'Prvý riadok',
        secondLine: 'Druhý riadok',
        columnPrefix: 'Stĺpec',
        tablePrefix: 'Tabuľka',
        tableNameError: 'Názov tabuľky nesmie obsahovať medzery, nesmie začínať číslom a nesmie byť zhodný s existujúcim názvom tabuľky',

        insert: {
            main: 'Vložiť tabuľku',
            row: 'Vložiť riadok tabuľky',
            col: 'Vložiť stĺpec tabuľky',
        },

        remove: {
            main: 'Odstrániť tabuľku',
            row: 'Odstrániť riadok tabuľky',
            col: 'Odstrániť stĺpec tabuľky',
        },
        condition: {
            string: 'Text',
            number: 'Číslo',
            date: 'Dátum',

            empty: '(Prázdne)',
        },
        string: {
            compare: {
                equal: 'Rovné',
                notEqual: 'Nerovné',
                contains: 'Obsahuje',
                notContains: 'Neobsahuje',
                startsWith: 'Začína na',
                endsWith: 'Končí na',
            },
        },
        number: {
            compare: {
                equal: 'Rovné',
                notEqual: 'Nerovné',
                greaterThan: 'Väčšie ako',
                greaterThanOrEqual: 'Väčšie alebo rovné',
                lessThan: 'Menšie ako',
                lessThanOrEqual: 'Menšie alebo rovné',
                between: 'Medzi',
                notBetween: 'Nie medzi',
                above: 'Nad',
                below: 'Pod',
                topN: 'Horných {0}',
            },
        },
        date: {
            compare: {
                equal: 'Rovné',
                notEqual: 'Nerovné',
                after: 'Po',
                afterOrEqual: 'Po alebo v',
                before: 'Pred',
                beforeOrEqual: 'Pred alebo v',
                between: 'Medzi',
                notBetween: 'Nie medzi',
                today: 'Dnes',
                yesterday: 'Včera',
                tomorrow: 'Zajtra',
                thisWeek: 'Tento týždeň',
                lastWeek: 'Minulý týždeň',
                nextWeek: 'Budúci týždeň',
                thisMonth: 'Tento mesiac',
                lastMonth: 'Minulý mesiac',
                nextMonth: 'Budúci mesiac',
                thisQuarter: 'Tento štvrťrok',
                lastQuarter: 'Minulý štvrťrok',
                nextQuarter: 'Budúci štvrťrok',
                thisYear: 'Tento rok',
                nextYear: 'Budúci rok',
                lastYear: 'Minulý rok',
                quarter: 'Podľa štvrťroka',
                month: 'Podľa mesiaca',
                q1: 'Prvý štvrťrok',
                q2: 'Druhý štvrťrok',
                q3: 'Tretí štvrťrok',
                q4: 'Štvrtý štvrťrok',
                m1: 'Január',
                m2: 'Február',
                m3: 'Marec',
                m4: 'Apríl',
                m5: 'Máj',
                m6: 'Jún',
                m7: 'Júl',
                m8: 'August',
                m9: 'September',
                m10: 'Október',
                m11: 'November',
                m12: 'December',
            },
        },
        filter: {
            'by-values': 'Podľa hodnôt',
            'by-conditions': 'Podľa podmienok',
            'clear-filter': 'Vymazať filter',
            cancel: 'Zrušiť',
            confirm: 'Potvrdiť',
            'search-placeholder': 'Použite medzeru na oddelenie kľúčových slov',
            'select-all': 'Vybrať všetko',
        },
    },
};

export default locale;

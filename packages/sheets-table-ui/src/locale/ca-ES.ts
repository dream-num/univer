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
        title: 'Taula',
        selectRange: 'Selecciona el rang de la taula',
        rename: 'Reanomena la taula',
        updateRange: 'Actualitza el rang de la taula',
        tableRangeWithMergeError: 'El rang de la taula no es pot superposar amb cel·les combinades',
        tableRangeWithOtherTableError: 'El rang de la taula no es pot superposar amb altres taules',
        tableRangeSingleRowError: 'El rang de la taula no pot ser una única fila',
        updateError: 'No es pot establir el rang de la taula en una àrea que no se superposi amb l\'original i no estigui a la mateixa fila',
        tableStyle: 'Estil de taula',
        defaultStyle: 'Estil per defecte',
        customStyle: 'Estil personalitzat',
        customTooMore: 'El nombre de temes personalitzats supera el límit màxim; si us plau, suprimiu alguns temes innecessaris i torneu-los a afegir',
        setTheme: 'Estableix el tema de la taula',
        removeTable: 'Elimina la taula',
        cancel: 'Cancel·lar',
        confirm: 'Confirmar',
        header: 'Capçalera',
        footer: 'Peu de pàgina',
        firstLine: 'Primera línia',
        secondLine: 'Segona línia',
        columnPrefix: 'Columna',
        tablePrefix: 'Taula',
        tableNameError: 'El nom de la taula no pot contenir espais, no pot començar amb un número i no pot ser idèntic a un nom de taula existent',

        insert: {
            main: 'Insereix una taula',
            row: 'Insereix una fila de taula',
            col: 'Insereix una columna de taula',
        },

        remove: {
            main: 'Elimina la taula',
            row: 'Elimina una fila de taula',
            col: 'Elimina una columna de taula',
        },
        condition: {
            string: 'Text',
            number: 'Nombre',
            date: 'Data',

            empty: '(Buit)',
        },
        string: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No és igual a',
                contains: 'Conté',
                notContains: 'No conté',
                startsWith: 'Comença per',
                endsWith: 'Acaba en',
            },
        },
        number: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No és igual a',
                greaterThan: 'Més gran que',
                greaterThanOrEqual: 'Més gran o igual que',
                lessThan: 'Més petit que',
                lessThanOrEqual: 'Més petit o igual que',
                between: 'Entre',
                notBetween: 'No està entre',
                above: 'Per sobre',
                below: 'Per sota',
                topN: '{0} superiors',
            },
        },
        date: {
            compare: {
                equal: 'Igual a',
                notEqual: 'No és igual a',
                after: 'Després de',
                afterOrEqual: 'Després o igual a',
                before: 'Abans de',
                beforeOrEqual: 'Abans o igual a',
                between: 'Entre',
                notBetween: 'No està entre',
                today: 'Avui',
                yesterday: 'Ahir',
                tomorrow: 'Demà',
                thisWeek: 'Aquesta setmana',
                lastWeek: 'La setmana passada',
                nextWeek: 'La setmana que ve',
                thisMonth: 'Aquest mes',
                lastMonth: 'El mes passat',
                nextMonth: 'El mes que ve',
                thisQuarter: 'Aquest trimestre',
                lastQuarter: 'L\'últim trimestre',
                nextQuarter: 'El proper trimestre',
                thisYear: 'Aquest any',
                nextYear: 'L\'any que ve',
                lastYear: 'L\'any passat',
                quarter: 'Per trimestre',
                month: 'Per mes',
                q1: 'Primer trimestre',
                q2: 'Segon trimestre',
                q3: 'Tercer trimestre',
                q4: 'Quart trimestre',
                m1: 'Gener',
                m2: 'Febrer',
                m3: 'Març',
                m4: 'Abril',
                m5: 'Maig',
                m6: 'Juny',
                m7: 'Juliol',
                m8: 'Agost',
                m9: 'Setembre',
                m10: 'Octubre',
                m11: 'Novembre',
                m12: 'Desembre',
            },
        },
    },
};

export default locale;

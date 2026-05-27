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
    'sheets-table-ui': {
        title: 'Tabella',
        selectRange: 'Seleziona Intervallo Tabella',
        rename: 'Rinomina Tabella',
        renamePlaceholder: 'Inserisci nome tabella',
        updateRange: 'Aggiorna Intervallo Tabella',
        tableRangeWithMergeError: 'L\'intervallo tabella non può sovrapporsi a celle unite',
        tableRangeWithOtherTableError: 'L\'intervallo tabella non può sovrapporsi ad altre tabelle',
        tableRangeSingleRowError: 'L\'intervallo tabella non può essere una singola riga',
        updateError: 'Impossibile impostare l\'intervallo tabella su un\'area che non si sovrappone all\'originale e non si trova nella stessa riga',
        tableStyle: 'Stile Tabella',
        defaultStyle: 'Stile Predefinito',
        customStyle: 'Stile Personalizzato',
        customTooMore: 'Il numero di temi personalizzati supera il limite massimo, elimina alcuni temi non necessari e aggiungili nuovamente',
        setTheme: 'Imposta Tema Tabella',
        removeTable: 'Rimuovi Tabella',
        cancel: 'Annulla',
        confirm: 'Conferma',
        header: 'Intestazione',
        footer: 'Piè di Pagina',
        firstLine: 'Prima Riga',
        secondLine: 'Seconda Riga',
        columnPrefix: 'Colonna',
        tablePrefix: 'Tabella',
        tableNameError: 'Il nome tabella non può contenere spazi, non può iniziare con un numero e non può essere identico a un nome tabella esistente',
        columnMenu: {
            'insert-left': 'Inserisci 1 colonna tabella a sinistra',
            'insert-right': 'Inserisci 1 colonna tabella a destra',
            delete: 'Elimina colonna tabella',
        },

        sort: {
            'sort-asc': 'Crescente',
            'sort-desc': 'Decrescente',
        },

        insert: {
            main: 'Inserisci Tabella',
            row: 'Inserisci Riga Tabella',
            col: 'Inserisci Colonna Tabella',
        },

        remove: {
            main: 'Rimuovi Tabella',
            row: 'Rimuovi Riga Tabella',
            col: 'Rimuovi Colonna Tabella',
        },
        condition: {
            string: 'Testo',
            number: 'Numero',
            date: 'Data',

            empty: '(Vuoto)',
        },
        string: {
            compare: {
                equal: 'Uguale a',
                notEqual: 'Diverso da',
                contains: 'Contiene',
                notContains: 'Non contiene',
                startsWith: 'Inizia con',
                endsWith: 'Termina con',
            },
        },
        number: {
            compare: {
                equal: 'Uguale a',
                notEqual: 'Diverso da',
                greaterThan: 'Maggiore di',
                greaterThanOrEqual: 'Maggiore o uguale a',
                lessThan: 'Minore di',
                lessThanOrEqual: 'Minore o uguale a',
                between: 'Compreso tra',
                notBetween: 'Non compreso tra',
                above: 'Sopra',
                below: 'Sotto',
                topN: 'Superiore {0}',
            },
        },
        date: {
            compare: {
                equal: 'Uguale a',
                notEqual: 'Diverso da',
                after: 'Dopo',
                afterOrEqual: 'Dopo o uguale a',
                before: 'Prima',
                beforeOrEqual: 'Prima o uguale a',
                between: 'Compreso tra',
                notBetween: 'Non compreso tra',
                today: 'Oggi',
                yesterday: 'Ieri',
                tomorrow: 'Domani',
                thisWeek: 'Questa settimana',
                lastWeek: 'Settimana scorsa',
                nextWeek: 'Settimana prossima',
                thisMonth: 'Questo mese',
                lastMonth: 'Mese scorso',
                nextMonth: 'Mese prossimo',
                thisQuarter: 'Questo trimestre',
                lastQuarter: 'Trimestre scorso',
                nextQuarter: 'Trimestre prossimo',
                thisYear: 'Questo anno',
                nextYear: 'Anno prossimo',
                lastYear: 'Anno scorso',
                quarter: 'Per trimestre',
                month: 'Per mese',
                q1: 'Primo trimestre',
                q2: 'Secondo trimestre',
                q3: 'Terzo trimestre',
                q4: 'Quarto trimestre',
                m1: 'Gennaio',
                m2: 'Febbraio',
                m3: 'Marzo',
                m4: 'Aprile',
                m5: 'Maggio',
                m6: 'Giugno',
                m7: 'Luglio',
                m8: 'Agosto',
                m9: 'Settembre',
                m10: 'Ottobre',
                m11: 'Novembre',
                m12: 'Dicembre',
            },
        },
        filter: {
            'by-values': 'Per Valori',
            'by-conditions': 'Per Condizioni',
            'clear-filter': 'Cancella Filtro',
            cancel: 'Annulla',
            confirm: 'Conferma',
            'search-placeholder': 'Usa lo spazio per separare le parole chiave',
            'select-all': 'Seleziona Tutto',
        },
    },
};

export default locale;

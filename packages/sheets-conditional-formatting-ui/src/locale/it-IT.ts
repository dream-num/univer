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
    'sheets-conditional-formatting-ui': {
        title: 'Formattazione Condizionale',
        menu: {
            manageConditionalFormatting: 'Gestisci Formattazione Condizionale',
            createConditionalFormatting: 'Crea Formattazione Condizionale',
            clearRangeRules: 'Cancella Regole per Intervallo Selezionato',
            clearWorkSheetRules: 'Cancella Regole per Intero Foglio',

        },
        form: {
            lessThan: 'Il valore deve essere minore di {0}',
            lessThanOrEqual: 'Il valore deve essere minore o uguale a {0}',
            greaterThan: 'Il valore deve essere maggiore di {0}',
            greaterThanOrEqual: 'Il valore deve essere maggiore o uguale a {0}',
            rangeSelector: 'Seleziona Intervallo o Inserisci Valore',
        },
        iconSet: {
            direction: 'Direzione',
            shape: 'Forma',
            mark: 'Marca',
            rank: 'Grado',
            rule: 'Regola',
            icon: 'Icona',
            type: 'Tipo',
            value: 'Valore',
            reverseIconOrder: 'Inverti Ordine Icone',
            and: 'E',
            when: 'Quando',
            onlyShowIcon: 'Mostra Solo Icona',
            noCellIcon: 'Nessuna icona cella',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'Crea Regola',
            clear: 'Cancella Tutte le Regole',
            range: 'Applica Intervallo',
            styleType: 'Tipo di Stile',
            submit: 'Invia',
            cancel: 'Annulla',
            rankAndAverage: 'Superiore/Inferiore/Media',
            styleRule: 'Regola di Stile',
            isNotBottom: 'Superiore',
            isBottom: 'Inferiore',
            greaterThanAverage: 'Maggiore della Media',
            lessThanAverage: 'Minore della Media',
            medianValue: 'Valore Mediano',
            fillType: 'Tipo di Riempimento',
            pureColor: 'Colore Solido',
            gradient: 'Gradiente',
            colorSet: 'Set di Colori',
            positive: 'Positivo',
            native: 'Negativo',
            workSheet: 'Intero Foglio',
            selectedRange: 'Intervallo Selezionato',
            managerRuleSelect: 'Gestisci {0} Regole',
            onlyShowDataBar: 'Mostra Solo Barre Dati',
        },
        preview: {
            describe: {
                beginsWith: 'Inizia con {0}',
                endsWith: 'Termina con {0}',
                containsText: 'Il testo contiene {0}',
                notContainsText: 'Il testo non contiene {0}',
                equal: 'Uguale a {0}',
                notEqual: 'Diverso da {0}',
                containsBlanks: 'Contiene Vuoti',
                notContainsBlanks: 'Non contiene Vuoti',
                containsErrors: 'Contiene Errori',
                notContainsErrors: 'Non contiene Errori',
                greaterThan: 'Maggiore di {0}',
                greaterThanOrEqual: 'Maggiore o uguale a {0}',
                lessThan: 'Minore di {0}',
                lessThanOrEqual: 'Minore o uguale a {0}',
                notBetween: 'Non compreso tra {0} e {1}',
                between: 'Compreso tra {0} e {1}',
                yesterday: 'Ieri',
                tomorrow: 'Domani',
                last7Days: 'Ultimi 7 Giorni',
                thisMonth: 'Questo Mese',
                lastMonth: 'Mese Scorso',
                nextMonth: 'Mese Prossimo',
                thisWeek: 'Questa Settimana',
                lastWeek: 'Settimana Scorso',
                nextWeek: 'Settimana Prossima',
                today: 'Oggi',
                topN: 'Superiore {0}',
                bottomN: 'Inferiore {0}',
                topNPercent: 'Superiore {0}%',
                bottomNPercent: 'Inferiore {0}%',
            },
        },
        operator: {
            beginsWith: 'Inizia con',
            endsWith: 'Termina con',
            containsText: 'Il testo contiene',
            notContainsText: 'Il testo non contiene',
            equal: 'Uguale a',
            notEqual: 'Diverso da',
            containsBlanks: 'Contiene Vuoti',
            notContainsBlanks: 'Non contiene Vuoti',
            containsErrors: 'Contiene Errori',
            notContainsErrors: 'Non contiene Errori',
            greaterThan: 'Maggiore di',
            greaterThanOrEqual: 'Maggiore o uguale a',
            lessThan: 'Minore di',
            lessThanOrEqual: 'Minore o uguale a',
            notBetween: 'Non compreso tra',
            between: 'Compreso tra',
            yesterday: 'Ieri',
            tomorrow: 'Domani',
            last7Days: 'Ultimi 7 Giorni',
            thisMonth: 'Questo Mese',
            lastMonth: 'Mese Scorso',
            nextMonth: 'Mese Prossimo',
            thisWeek: 'Questa Settimana',
            lastWeek: 'Settimana Scorso',
            nextWeek: 'Settimana Prossima',
            today: 'Oggi',
        },
        ruleType: {
            highlightCell: 'Evidenzia Cella',
            dataBar: 'Barra Dati',
            colorScale: 'Scala Colori',
            formula: 'Formula Personalizzata',
            iconSet: 'Set di Icone',
            duplicateValues: 'Valori Duplicati',
            uniqueValues: 'Valori Unici',
        },
        subRuleType: {
            uniqueValues: 'Valori Unici',
            duplicateValues: 'Valori Duplicati',
            rank: 'Grado',
            text: 'Testo',
            timePeriod: 'Periodo di Tempo',
            number: 'Numero',
            average: 'Media',
        },
        valueType: {
            num: 'Numero',
            min: 'Minimo',
            max: 'Massimo',
            percent: 'Percentuale',
            percentile: 'Percentile',
            formula: 'Formula',
            none: 'Nessuno',
        },
        errorMessage: {
            notBlank: 'La condizione non può essere vuota',
            formulaError: 'Formula errata',
            rangeError: 'Selezione non valida',
        },
        permission: {
            dialog: {
                setStyleErr: 'L\'intervallo è protetto e non hai l\'autorizzazione per impostare gli stili. Per impostare gli stili, contatta il creatore.',
            },
        },
    },
};

export default locale;

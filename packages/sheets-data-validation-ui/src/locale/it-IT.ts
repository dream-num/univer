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
    'sheets-data-validation-ui': {
        title: 'Convalida dati',
        operators: {
            legal: 'è un tipo valido',
        },
        validFail: {
            value: 'Inserisci un valore',
            common: 'Inserisci valore o formula',
            number: 'Inserisci numero o formula',
            formula: 'Inserisci formula',
            integer: 'Inserisci intero o formula',
            date: 'Inserisci data o formula',
            list: 'Inserisci opzioni',
            listInvalid: 'L\'origine elenco deve essere un elenco delimitato o un riferimento a una singola riga o colonna',
            checkboxEqual: 'Inserisci valori diversi per i contenuti delle celle selezionate e deselezionate.',
            formulaError: 'L\'intervallo di riferimento contiene dati invisibili, riadatta l\'intervallo',
            listIntersects: 'L\'intervallo selezionato non può intersecarsi con l\'ambito delle regole',
            primitive: 'Le formule non sono consentite per valori personalizzati selezionati e deselezionati.',
        },
        panel: {
            title: 'Gestione convalida dati',
            addTitle: 'Crea nuova convalida dati',
            removeAll: 'Rimuovi Tutto',
            add: 'Aggiungi Regola',
            range: 'Intervalli',
            type: 'Tipo',
            options: 'Opzioni avanzate',
            operator: 'Operatore',
            removeRule: 'Rimuovi',
            done: 'Fatto',
            formulaPlaceholder: 'Inserisci valore o formula',
            valuePlaceholder: 'Inserisci valore',
            formulaAnd: 'e',
            invalid: 'Non valido',
            showWarning: 'Mostra avviso',
            rejectInput: 'Rifiuta input',
            messageInfo: 'Messaggio di aiuto',
            showInfo: 'Mostra testo di aiuto per una cella selezionata',
            rangeError: 'Gli intervalli non sono validi',
            allowBlank: 'Consenti valori vuoti',
        },
        any: {
            title: 'Qualsiasi valore',
            error: 'Il contenuto di questa cella viola la regola di convalida',
        },
        date: {
            title: 'Data',
        },
        list: {
            title: 'Menu a discesa',
            name: 'Il valore contiene uno dall\'intervallo',
            error: 'L\'input deve rientrare nell\'intervallo specificato',
            emptyError: 'Inserisci un valore',
            add: 'Aggiungi',
            dropdown: 'Seleziona',
            options: 'Opzioni',
            customOptions: 'Personalizzato',
            refOptions: 'Da un intervallo',
            formulaError: 'L\'origine elenco deve essere un elenco delimitato di dati, o un riferimento a una singola riga o colonna.',
            edit: 'Modifica',
        },
        listMultiple: {
            title: 'Menu a discesa-Multiplo',
            dropdown: 'Selezione multipla',
        },
        textLength: {
            title: 'Lunghezza testo',
        },
        decimal: {
            title: 'Numero',
        },
        whole: {
            title: 'Intero',
        },
        checkbox: {
            title: 'Casella di controllo',
            error: 'Il contenuto di questa cella viola la sua regola di convalida',
            tips: 'Usa valori personalizzati all\'interno delle celle',
            checked: 'Valore selezionato',
            unchecked: 'Valore deselezionato',
        },
        custom: {
            title: 'Formula personalizzata',
            error: 'Il contenuto di questa cella viola la sua regola di convalida',
            validFail: 'Inserisci una formula valida',
        },
        alert: {
            title: 'Errore',
            ok: 'OK',
        },
        error: {
            title: 'Non valido:',
        },
        renderMode: {
            arrow: 'Freccia',
            chip: 'Chip',
            text: 'Testo semplice',
            label: 'Stile di visualizzazione',
        },
        showTime: {
            label: 'Mostra TimePicker',
        },
        permission: {
            dialog: {
                setStyleErr: 'L\'intervallo è protetto e non hai l\'autorizzazione per impostare gli stili. Per impostare gli stili, contatta il creatore.',
            },
        },
    },
};

export default locale;

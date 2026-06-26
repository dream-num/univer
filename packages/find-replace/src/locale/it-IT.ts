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
        toolbar: 'Trova e sostituisci',
        shortcut: {
            'open-find-dialog': 'Apri finestra Trova',
            'open-replace-dialog': 'Apri finestra Sostituisci',
            'close-dialog': 'Chiudi finestra Trova e sostituisci',
            'go-to-next-match': 'Vai alla corrispondenza successiva',
            'go-to-previous-match': 'Vai alla corrispondenza precedente',
            'focus-selection': 'Focus selezione',
            panel: 'Trova e sostituisci',
        },
        dialog: {
            title: 'Trova',
            find: 'Trova',
            replace: 'Sostituisci',
            'replace-all': 'Sostituisci tutto',
            'case-sensitive': 'Maiuscole/minuscole',
            'find-placeholder': 'Trova in questo foglio',
            'advanced-finding': 'Ricerca e sostituzione avanzate',
            'replace-placeholder': 'Inserisci stringa di sostituzione',
            'match-the-whole-cell': "Corrispondenza con l'intera cella",
            'find-direction': {
                title: 'Direzione ricerca',
                row: 'Cerca per riga',
                column: 'Cerca per colonna',
            },
            'find-scope': {
                title: 'Intervallo ricerca',
                'current-sheet': 'Foglio corrente',
                workbook: 'Cartella di lavoro',
            },
            'find-by': {
                title: 'Criterio ricerca',
                value: 'Trova per valore',
                formula: 'Trova formula',
            },
            'no-match': 'Ricerca completata ma nessuna corrispondenza trovata.',
            'no-result': 'Nessun risultato',
        },
        replace: {
            'all-success': 'Sostituite tutte le {0} corrispondenze',
            'partial-success': 'Sostituite {0} corrispondenze, {1} non sostituite',
            'all-failure': 'Sostituzione non riuscita',
            confirm: {
                title: 'Sei sicuro di voler sostituire tutte le corrispondenze?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Annulla',
        },
    },
};

export default locale;

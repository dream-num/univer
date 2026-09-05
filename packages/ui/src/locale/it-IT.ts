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
import emojiLocale from './emoji-locale/it-IT.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
        },
        featureSearch: {
            title: 'Cerca funzionalità',
            placeholder: 'Digita una funzionalità o il nome di un menu...',
            empty: 'Nessuna funzionalità disponibile trovata',
            ribbon: 'Barra multifunzione',
            contextMenu: 'Menu contestuale',
        },
        emojiPicker: {
            search: 'Cerca',
            random: 'Emoji casuale',
            recents: 'Recenti',
            emojis: 'Emoji',
            animals: 'Animali',
            food: 'Cibo',
            activities: 'Attività',
            places: 'Luoghi',
            objects: 'Oggetti',
            symbols: 'Simboli',
            searchResults: 'Risultati di ricerca',
            noResults: 'Nessun emoji trovato',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matematica',
            greek: 'Greco',
            common: 'Comuni',
        },
        toolbar: {
            heading: {
                normal: 'Normale',
                title: 'Titolo',
                subTitle: 'Sottotitolo',
                1: 'Intestazione 1',
                2: 'Intestazione 2',
                3: 'Intestazione 3',
                4: 'Intestazione 4',
                5: 'Intestazione 5',
            },
        },
        ribbon: {
            start: 'Inizio',
            startDesc: 'Avvia il foglio di lavoro e imposta i parametri di base.',
            insert: 'Inserisci',
            insertDesc: 'Inserisci righe, colonne, grafici e vari altri elementi.',
            formulas: 'Formule',
            formulasDesc: 'Utilizza funzioni e formule per i calcoli dei dati.',
            data: 'Dati',
            dataDesc: 'Gestisci i dati, inclusi importazione, ordinamento e filtro.',
            view: 'Visualizza',
            viewDesc: 'Cambia le modalità di visualizzazione e regola l\'effetto di visualizzazione.',
            others: 'Altri',
            othersDesc: 'Altre funzioni e impostazioni.',
            more: 'Altro',
        },
        fontFamily: {
            'not-supported': 'Carattere non trovato nel sistema, verrà utilizzato il carattere predefinito.',
        },
        'shortcut-panel': {
            title: 'Scorciatoie',
        },
        shortcut: {
            undo: 'Annulla',
            redo: 'Ripristina',
            cut: 'Taglia',
            copy: 'Copia',
            paste: 'Incolla',
            'shortcut-panel': 'Attiva/Disattiva Pannello Scorciatoie',
        },
        'common-edit': 'Scorciatoie di Modifica Comuni',
        'toggle-shortcut-panel': 'Attiva/Disattiva Pannello Scorciatoie',
        navigation: {
            back: 'Indietro',
            previous: 'Precedente',
            next: 'Successivo',
        },
        sidebar: {
            panel: 'Pannello laterale',
            resize: 'Ridimensiona il pannello laterale',
            close: 'Chiudi il pannello laterale',
        },
        beforeClose: {
            title: 'Alcune modifiche non sono state salvate',
        },
        clipboard: {
            authentication: {
                title: 'Autorizzazione Negata',
                content: 'Consenti a Univer di accedere alla tua clipboard.',
            },
        },
        rangeSelector: {
            cancel: 'Annulla',
        },
        'global-shortcut': 'Scorciatoia Globale',
        row: 'Riga',
        column: 'Colonna',
    },
};

export default locale;

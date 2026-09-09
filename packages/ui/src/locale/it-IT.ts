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
            operationDenied: 'Questo contenuto è protetto. Questa azione non è consentita.',
            remove: 'Rimuovi protezione',
            roleOwner: 'Proprietario del file',
            roleEditor: 'Editor del file',
            selectedCount: 'Selezionati: {0}',
            searchPeople: 'Cerca persone',
            noMatchingPeople: 'Nessuna persona corrispondente',
            loadMore: 'Carica altro',
            fileHint: 'La condivisione del file determina i membri. Queste impostazioni limitano le azioni di tali membri.',
            documentParent: 'Le restrizioni di modifica del documento si applicano anche a questa sezione.',
            paragraphParent: 'Le restrizioni di modifica del documento e della sezione che contiene questo paragrafo si applicano anche al paragrafo.',
            documentObjectParent: 'Il documento e le sezioni e i paragrafi che contengono o ancorano questo oggetto possono limitarne la modifica.',
            slideParent: 'Si applicano anche le restrizioni di modifica della presentazione.',
            slideObjectParent: 'Si applicano anche le restrizioni di modifica della presentazione e della diapositiva o dello schema che contiene questo oggetto.',
            baseParent: 'Si applicano anche le restrizioni di modifica di Base.',
            baseObjectParent: 'Si applicano anche le restrizioni di modifica di Base e della tabella che contiene questo oggetto.',
            recordParent: 'Le restrizioni di Base e della tabella restano valide. La modifica di un valore richiede anche l’autorizzazione per il relativo campo.',
            boardParent: 'Le restrizioni di modifica della lavagna si applicano anche a questo oggetto.',
            ownerInherit: 'Proprietario del file, accesso ereditato',
            peopleError: 'Impossibile caricare le persone. Riprova.',
            document: 'Documento',
            section: 'Sezione',
            paragraph: 'Paragrafo',
            entity: 'Oggetto',
            presentation: 'Presentazione',
            page: 'Diapositiva',
            master: 'Visualizzazione schema',
            base: 'Base',
            table: 'Tabella',
            field: 'Campo',
            record: 'Record',
            view: 'Visualizzazione',
            board: 'Lavagna',
            objectName: '{0}: {1}',

            search: 'Cerca oggetti',
            empty: 'Nessun oggetto corrispondente',
            more: 'Sono visualizzati i primi 100 oggetti. Usa la ricerca per restringere l’elenco.',
            title: 'Autorizzazioni',
            cancel: 'Annulla',
            save: 'Salva',
            saving: 'Salvataggio…',
            loading: 'Caricamento…',
            conflict: 'Le autorizzazioni sono cambiate. Ricarica prima di salvare.',
            error: 'Impossibile caricare o salvare le autorizzazioni. Le modifiche sono state conservate.',
            reload: 'Ricarica',
            denied: 'Non puoi gestire le autorizzazioni di questo oggetto.',
            edit: 'Chi può modificare',
            all: 'Tutti gli editor del file',
            owner: 'Solo il proprietario dell’oggetto',
            members: 'Membri selezionati',
            copy: 'Consenti agli editor di copiare',
            print: 'Consenti agli editor di stampare',
            export: 'Consenti agli editor di esportare',
            comment: 'Consenti agli editor di commentare',
            parentHint: 'Le restrizioni del file e dell’oggetto padre restano valide.',
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

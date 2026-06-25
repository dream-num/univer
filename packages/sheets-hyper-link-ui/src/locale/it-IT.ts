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
    'sheets-hyper-link-ui': {
        form: {
            editTitle: 'Modifica collegamento',
            addTitle: 'Inserisci collegamento',
            label: 'Etichetta',
            type: 'Tipo',
            link: 'Collegamento',
            linkPlaceholder: 'Inserisci collegamento',
            range: 'Intervallo',
            worksheet: 'Foglio di lavoro',
            definedName: 'Nome definito',
            ok: 'Conferma',
            cancel: 'Annulla',
            labelPlaceholder: 'Inserisci etichetta',
            inputError: 'Inserisci',
            selectError: 'Seleziona',
            linkError: 'Inserisci un collegamento valido',
        },
        menu: {
            add: 'Inserisci collegamento',
        },
        permission: {
            hyperLinkErr: 'Non hai l’autorizzazione per inserire un collegamento.',
        },
        message: {
            noSheet: 'Il foglio di destinazione è stato eliminato',
            refError: 'Intervallo non valido',
            hiddenSheet: 'Impossibile aprire il collegamento perché il foglio collegato è nascosto',
            coped: 'Collegamento copiato negli appunti',
        },
        popup: {
            copy: 'Copia collegamento',
            edit: 'Modifica collegamento',
            cancel: 'Annulla collegamento',
        },
    },
};

export default locale;

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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'Sommario',
            insertTitle: 'Sommario',
            automaticTitle: 'Sommario automatico',
            customTitle: 'Sommario personalizzato…',
            contentsTitle: 'Sommario',
            levels: 'Mostra livelli',
            showPageNumbers: 'Mostra numeri di pagina',
            rightAlignPageNumbers: 'Allinea i numeri di pagina a destra',
            tabLeader: 'Carattere di riempimento',
            leaderNone: 'Nessuno',
            leaderDots: 'Punti',
            leaderDashes: 'Trattini',
            leaderUnderline: 'Sottolineatura',
            format: 'Formati',
            formatFromTemplate: 'Da modello',
            formatClassic: 'Classico',
            formatModern: 'Moderno',
            formatSimple: 'Semplice',
            preview: 'Anteprima di stampa',
            previewHeading: 'Titolo',
            noHeadings: 'Nessun titolo trovato. Applica gli stili Titolo 1–3 o scegli i livelli corrispondenti.',
            updateTitle: 'Aggiorna sommario',
            removeTitle: 'Rimuovi sommario',
            updatePageNumbersOnly: 'Aggiorna solo i numeri di pagina',
            updateEntireTable: 'Aggiorna intero sommario',
            updateHint: 'Scegli come aggiornare questo sommario.',
        },
    },
};

export default locale;

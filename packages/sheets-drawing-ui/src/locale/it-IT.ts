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
    'sheets-drawing-ui': {
        title: 'Immagine',
        uploadLoading: {
            loading: 'Caricamento..., rimanente',
        },

        upload: {
            float: 'Immagine fluttuante',
            cell: 'Immagine cella',
        },

        panel: {
            title: 'Modifica immagine',
        },

        save: {
            title: 'Salva immagini celle',
            menuLabel: 'Salva immagini celle',
            imageCount: 'Numero immagini',
            fileNameConfig: 'Nome file',
            useRowCol: 'Usa indirizzo cella (A1, B2...)',
            useColumnValue: 'Usa valore colonna',
            selectColumn: 'Seleziona colonna',
            cancel: 'Annulla',
            confirm: 'Salva',
            saving: 'Salvataggio...',
            error: 'Salvataggio immagini celle non riuscito',
        },
        'image-popup': {
            replace: 'Sostituisci',
            delete: 'Elimina',
            edit: 'Modifica',
            crop: 'Ritaglia',
            reset: 'Reimposta dimensione',
            flipH: 'Capovolgi orizzontalmente',
            flipV: 'Capovolgi verticalmente',
        },
        'update-status': {
            exceedMaxSize: 'La dimensione dell\'immagine supera il limite, il limite è {0}M',
            invalidImageType: 'Tipo di immagine non valido',
            exceedMaxCount: 'È possibile caricare solo {0} immagini alla volta',
            invalidImage: 'Immagine non valida',
        },
        'drawing-anchor': {
            title: 'Proprietà ancoraggio',
            both: 'Sposta e ridimensiona con le celle',
            position: 'Sposta ma non ridimensionare con le celle',
            none: 'Non spostare né ridimensionare con le celle',
        },
        'cell-image': {
            pasteTitle: 'Incolla come immagine cella',
            pasteContent: "L'incollaggio di un'immagine cella sovrascriverà il contenuto esistente della cella, continuare con l'incollaggio",
            pasteError: 'Copia e incolla di immagine cella non supportato in questa unità',
        },
        permission: {
            dialog: {
                editErr: "L'intervallo è protetto e non hai l'autorizzazione di modifica. Per modificare, contatta il creatore.",
            },
        },
        shortcut: {
            'drawing-view': 'Vista disegno',
            'drawing-move-down': 'Sposta disegno in basso',
            'drawing-move-up': 'Sposta disegno in alto',
            'drawing-move-left': 'Sposta disegno a sinistra',
            'drawing-move-right': 'Sposta disegno a destra',
            'drawing-delete': 'Elimina disegno',
        },
    },
};

export default locale;

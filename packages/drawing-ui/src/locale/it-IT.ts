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
    'drawing-ui': {
        ole: {
            externalAttachment: 'Allegato collegato',
            externalHint: 'Il file originale di questo allegato non è incorporato nel documento. Anteprima e download non sono disponibili.',
            missingHint: 'I dati di questo allegato sono assenti dal documento. Anteprima e download non sono disponibili.',
            unavailableSummary: 'Questo documento contiene {0} allegati non disponibili. I segnaposto sono stati mantenuti. Passa il puntatore sull’icona di avviso per conoscere il motivo.',
            rename: 'Rinomina',
            saveName: 'Salva nome',
            cancel: 'Annulla',
            invalidName: 'Inserisci un nome file valido di massimo 255 caratteri.',
            renameFailed: 'Impossibile rinominare questo allegato. Riprova.',
            actions: 'Azioni dell’allegato',
            linkSaveFailed: 'Il file online è stato creato, ma non è stato possibile salvare il collegamento. Riprova a salvarlo.',
            conversionFailed: 'Impossibile convertire questo allegato. Riprova.',
            converted: 'Conversione completata. Puoi aprire il file online in una nuova scheda.',
            converting: 'Conversione in corso…',
            openSlide: 'Apri la presentazione online in una nuova scheda',
            openDoc: 'Apri il documento online in una nuova scheda',
            openSheet: 'Apri il foglio di calcolo online in una nuova scheda',
            convertSlide: 'Converti in presentazione online',
            convertDoc: 'Converti in documento online',
            convertSheet: 'Converti in foglio di calcolo online',
            nativePreviewHint: 'Se il browser non riesce a mostrare il file, scarica l’originale.',
            attachment: 'Allegato OLE',
            external: 'File esterno non disponibile',
            missing: 'Dati dell’allegato non disponibili',
            opaque: 'File binario OLE originale (download disponibile)',
            download: 'Scarica',
            preview: 'Anteprima',
            remove: 'Elimina',
            failed: 'Impossibile leggere l’allegato originale. Riprova.',
            unsupported: 'L’anteprima non è disponibile per questo file. Puoi scaricare l’originale.',
        },
        mobile: { close: 'Chiudi', more: 'Altro' },
        'image-cropper': {
            error: 'Impossibile ritagliare oggetti non immagine.',
        },
        objectListPanel: {
            title: 'Livelli',
            empty: 'Nessun oggetto',
            showAll: 'Mostra tutto',
            hideAll: 'Nascondi tutto',
            lockAll: 'Blocca tutto',
            unlockAll: 'Sblocca tutto',
            moveForward: 'Porta avanti',
            moveBackward: 'Manda indietro',
            close: 'Chiudi',
            show: 'Mostra',
            hide: 'Nascondi',
            lock: 'Blocca',
            unlock: 'Sblocca',
            lockHint: 'Blocca per evitare selezioni accidentali',
            unlockHint: 'Bloccato. Fai clic per sbloccare',
            name: 'Nome',
            nameInput: 'Nome oggetto',
            description: 'Descrizione',
            descriptionPlaceholder: 'Aggiungi descrizione',
            details: 'Dettagli',
            locate: 'Individua',
            expand: 'Espandi',
            collapse: 'Comprimi',
            dragToReorder: 'Trascina per riordinare',
            search: 'Cerca oggetti',
            filterAll: 'Tutti',
            filterHidden: 'Nascosti',
            filterLocked: 'Bloccati',
            sectionCanvas: 'Livello canvas',
            sectionFloating: 'Livello mobile',
            typeNames: {
                object: 'Oggetto',
                shape: 'Forma',
                connector: 'Connettore',
                image: 'Immagine',
                chart: 'Grafico',
                table: 'Tabella',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Gruppo',
                unit: 'Unità',
                dom: 'DOM',
                text: 'Testo',
                placeholder: 'Segnaposto',
                container: 'Contenitore',
            },
            noSelection: 'Seleziona un oggetto per modificarne i dettagli',
        },
        'image-panel': {
            arrange: {
                title: 'Disponi',
                forward: 'Porta avanti',
                backward: 'Porta indietro',
                front: 'Porta in primo piano',
                back: 'Porta in secondo piano',
            },
            transform: {
                title: 'Trasforma',
                rotate: 'Ruota (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Larghezza (px)',
                height: 'Altezza (px)',
                lock: 'Blocca proporzioni (%)',
            },
            crop: {
                cancel: 'Annulla',
                apply: 'Fine',
                title: 'Ritaglia',
                start: 'Inizia ritaglio',
                mode: 'Libero',
            },
            group: {
                title: 'Raggruppa',
                group: 'Raggruppa',
                unGroup: 'Separa',
            },
            align: {
                title: 'Allinea',
                default: 'Seleziona tipo allineamento',
                left: 'Allinea a sinistra',
                center: 'Allinea al centro',
                right: 'Allinea a destra',
                top: 'Allinea in alto',
                middle: 'Allinea al centro',
                bottom: 'Allinea in basso',
                horizon: 'Distribuisci orizzontalmente ',
                vertical: 'Distribuisci verticalmente ',
            },
            null: 'Nessun oggetto selezionato',
        },
        'image-text-wrap': {
            square: 'Quadrato',
            topAndBottom: 'Superiore e inferiore',
            inline: 'In linea con il testo',
            behindText: 'Dietro il testo',
            inFrontText: 'Davanti al testo',
        },
    },
};

export default locale;

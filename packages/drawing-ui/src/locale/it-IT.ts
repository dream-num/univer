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
        'image-cropper': {
            error: 'Impossibile ritagliare oggetti non immagine.',
        },
        objectListPanel: {
            title: 'Oggetti',
            empty: 'Nessun oggetto',
            showAll: 'Mostra tutto',
            hideAll: 'Nascondi tutto',
            moveForward: 'Porta avanti',
            moveBackward: 'Manda indietro',
            close: 'Chiudi',
            show: 'Mostra',
            hide: 'Nascondi',
            lock: 'Blocca',
            unlock: 'Sblocca',
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
            title: 'Testo a capo',
            wrappingStyle: 'Stile a capo',
            square: 'Quadrato',
            topAndBottom: 'Superiore e inferiore',
            inline: 'In linea con il testo',
            behindText: 'Dietro il testo',
            inFrontText: 'Davanti al testo',
            wrapText: 'Testo a capo',
            bothSide: 'Entrambi i lati',
            leftOnly: 'Solo sinistra',
            rightOnly: 'Solo destra',
            distanceFromText: 'Distanza dal testo',
            top: 'Superiore(px)',
            left: 'Sinistra(px)',
            bottom: 'Inferiore(px)',
            right: 'Destra(px)',
        },
        'image-popup': {
            replace: 'Sostituisci',
            delete: 'Elimina',
            edit: 'Modifica',
            crop: 'Ritaglia',
            reset: 'Reimposta dimensione',
        },
    },
};

export default locale;

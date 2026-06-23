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
    'docs-drawing-ui': {
        title: 'Immagine',
        upload: {
            float: 'Inserisci immagine',
        },
        shape: {
            insert: {
                title: 'Inserisci Forma',
                rectangle: 'Inserisci Rettangolo',
                ellipse: 'Inserisci Ellisse',
            },
        },
        panel: {
            title: 'Modifica immagine',
        },
        'image-popup': {
            replace: 'Sostituisci',
            delete: 'Elimina',
            edit: 'Modifica',
            crop: 'Ritaglia',
            reset: 'Reimposta dimensione',
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
        'image-position': {
            title: 'Posizione',
            horizontal: 'Orizzontale',
            vertical: 'Verticale',
            absolutePosition: 'Posizione assoluta(px)',
            relativePosition: 'Posizione relativa',
            toTheRightOf: 'a destra di',
            relativeTo: 'relativo a',
            bellow: 'sotto',
            options: 'Opzioni',
            moveObjectWithText: 'Sposta oggetto con il testo',
            column: 'Colonna',
            margin: 'Margine',
            page: 'Pagina',
            line: 'Riga',
            paragraph: 'Paragrafo',
        },
        'update-status': {
            exceedMaxSize: 'La dimensione dell\'immagine supera il limite, il limite è {0}M',
            invalidImageType: 'Tipo di immagine non valido',
            exceedMaxCount: 'È possibile caricare solo {0} immagini alla volta',
            invalidImage: 'Immagine non valida',
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

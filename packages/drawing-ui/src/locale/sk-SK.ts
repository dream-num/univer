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
            error: 'Nedá sa orezať neobrázkový objekt.',
        },
        objectListPanel: {
            title: 'Objekty',
            empty: 'Ziadne objekty',
            showAll: 'Zobrazit vsetko',
            hideAll: 'Skryt vsetko',
            moveForward: 'Presunut dopredu',
            moveBackward: 'Presunut dozadu',
            close: 'Zavriet',
            show: 'Zobrazit',
            hide: 'Skryt',
            lock: 'Zamknut',
            unlock: 'Odomknut',
            name: 'Nazov',
            nameInput: 'Nazov objektu',
            description: 'Popis',
            descriptionPlaceholder: 'Pridat popis',
            details: 'Podrobnosti',
            locate: 'Nájsť',
            expand: 'Rozbaliť',
            collapse: 'Zbaliť',
            dragToReorder: 'Potiahnutím zmeňte poradie',
            search: 'Hľadať objekty',
            filterAll: 'Všetky',
            filterHidden: 'Skryté',
            filterLocked: 'Zamknuté',
            sectionCanvas: 'Vrstva plátna',
            sectionFloating: 'Plávajúca vrstva',
            typeNames: {
                object: 'Objekt',
                shape: 'Tvar',
                connector: 'Spojnica',
                image: 'Obrázok',
                chart: 'Graf',
                table: 'Tabuľka',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Skupina',
                unit: 'Jednotka',
                dom: 'DOM',
                text: 'Text',
                placeholder: 'Zástupný symbol',
                container: 'Kontajner',
            },
            noSelection: 'Vyberte objekt na úpravu podrobností',
        },
        'image-panel': {
            arrange: {
                title: 'Usporiadať',
                forward: 'Posunúť dopredu',
                backward: 'Posunúť dozadu',
                front: 'Presunúť do popredia',
                back: 'Presunúť do pozadia',
            },
            transform: {
                title: 'Transformovať',
                rotate: 'Otočiť (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Šírka (px)',
                height: 'Výška (px)',
                lock: 'Uzamknúť pomer (%)',
            },
            crop: {
                title: 'Orezanie',
                start: 'Začať orezanie',
                mode: 'Voľne',
            },
            group: {
                title: 'Zoskupiť',
                group: 'Zoskupiť',
                unGroup: 'Zrušiť zoskupenie',
            },
            align: {
                title: 'Zarovnať',
                default: 'Vyberte typ zarovnania',
                left: 'Zarovnať doľava',
                center: 'Zarovnať na stred',
                right: 'Zarovnať doprava',
                top: 'Zarovnať hore',
                middle: 'Zarovnať na stred',
                bottom: 'Zarovnať dole',
                horizon: 'Rozložiť vodorovne',
                vertical: 'Rozložiť zvisle',
            },
            null: 'Nie je vybraný žiadny objekt',
        },
        'image-text-wrap': {
            title: 'Obtekanie textu',
            wrappingStyle: 'Štýl obtekania',
            square: 'Obdĺžnikové',
            topAndBottom: 'Hore a dole',
            inline: 'V riadku s textom',
            behindText: 'Za textom',
            inFrontText: 'Pred textom',
            wrapText: 'Obtekať text',
            bothSide: 'Obe strany',
            leftOnly: 'Len ľavá',
            rightOnly: 'Len pravá',
            distanceFromText: 'Vzdialenosť od textu',
            top: 'Hore (px)',
            left: 'Vľavo (px)',
            bottom: 'Dole (px)',
            right: 'Vpravo (px)',
        },
        'image-popup': {
            replace: 'Nahradiť',
            delete: 'Odstrániť',
            edit: 'Upraviť',
            crop: 'Orezať',
            reset: 'Obnoviť veľkosť',
        },
    },
};

export default locale;

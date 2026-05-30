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
            error: 'Nie można przyciąć obiektów innych niż obraz.',
        },
        'image-panel': {
            arrange: {
                title: 'Rozmieść',
                forward: 'Przesuń do przodu',
                backward: 'Przesuń do tyłu',
                front: 'Przesuń na wierzch',
                back: 'Przesuń na spód',
            },
            transform: {
                title: 'Przekształć',
                rotate: 'Obrót (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Szerokość (px)',
                height: 'Wysokość (px)',
                lock: 'Zablokuj proporcje (%)',
            },
            crop: {
                title: 'Przytnij',
                start: 'Rozpocznij przycinanie',
                mode: 'Dowolny',
            },
            group: {
                title: 'Grupa',
                group: 'Grupuj',
                unGroup: 'Rozgrupuj',
            },
            align: {
                title: 'Wyrównaj',
                default: 'Wybierz typ wyrównania',
                left: 'Wyrównaj do lewej',
                center: 'Wyrównaj do środka',
                right: 'Wyrównaj do prawej',
                top: 'Wyrównaj do góry',
                middle: 'Wyrównaj do środka w pionie',
                bottom: 'Wyrównaj do dołu',
                horizon: 'Rozłóż poziomo ',
                vertical: 'Rozłóż pionowo ',
            },
            null: 'Brak zaznaczonego obiektu',
        },
        'image-text-wrap': {
            title: 'Zawijanie tekstu',
            wrappingStyle: 'Styl zawijania',
            square: 'Kwadrat',
            topAndBottom: 'Góra i dół',
            inline: 'W linii z tekstem',
            behindText: 'Za tekstem',
            inFrontText: 'Przed tekstem',
            wrapText: 'Zawijaj tekst',
            bothSide: 'Obie strony',
            leftOnly: 'Tylko lewa',
            rightOnly: 'Tylko prawa',
            distanceFromText: 'Odległość od tekstu',
            top: 'Góra(px)',
            left: 'Lewo(px)',
            bottom: 'Dół(px)',
            right: 'Prawo(px)',
        },
        'image-popup': {
            replace: 'Zamień',
            delete: 'Usuń',
            edit: 'Edytuj',
            crop: 'Przytnij',
            reset: 'Resetuj rozmiar',
        },
    },
};

export default locale;

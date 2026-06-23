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
        title: 'Obraz',
        upload: {
            float: 'Wstaw obraz',
        },
        shape: {
            insert: {
                title: 'Wstaw kształt',
                rectangle: 'Wstaw prostokąt',
                ellipse: 'Wstaw elipsę',
            },
        },
        panel: {
            title: 'Edytuj obraz',
        },
        'image-popup': {
            replace: 'Zamień',
            delete: 'Usuń',
            edit: 'Edytuj',
            crop: 'Przytnij',
            reset: 'Resetuj rozmiar',
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
        'image-position': {
            title: 'Pozycja',
            horizontal: 'Pozioma',
            vertical: 'Pionowa',
            absolutePosition: 'Pozycja bezwzględna(px)',
            relativePosition: 'Pozycja względna',
            toTheRightOf: 'po prawej stronie',
            relativeTo: 'względem',
            bellow: 'poniżej',
            options: 'Opcje',
            moveObjectWithText: 'Przesuwaj obiekt razem z tekstem',
            column: 'Kolumna',
            margin: 'Margines',
            page: 'Strona',
            line: 'Wiersz',
            paragraph: 'Akapit',
        },
        'update-status': {
            exceedMaxSize: 'Rozmiar obrazu przekracza limit, limit wynosi {0}M',
            invalidImageType: 'Nieprawidłowy typ obrazu',
            exceedMaxCount: 'Jednocześnie można przesłać tylko {0} obrazów',
            invalidImage: 'Nieprawidłowy obraz',
        },
        shortcut: {
            'drawing-view': 'Widok rysunku',
            'drawing-move-down': 'Przesuń rysunek w dół',
            'drawing-move-up': 'Przesuń rysunek w górę',
            'drawing-move-left': 'Przesuń rysunek w lewo',
            'drawing-move-right': 'Przesuń rysunek w prawo',
            'drawing-delete': 'Usuń rysunek',
        },
    },
};

export default locale;

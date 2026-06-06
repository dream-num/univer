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
        title: 'Obraz',
        uploadLoading: {
            loading: 'Ładowanie..., pozostało',
        },

        upload: {
            float: 'Obraz swobodny',
            cell: 'Obraz w komórce',
        },

        panel: {
            title: 'Edytuj obraz',
        },

        save: {
            title: 'Zapisz obrazy w komórkach',
            menuLabel: 'Zapisz obrazy w komórkach',
            imageCount: 'Liczba obrazów',
            fileNameConfig: 'Nazwa pliku',
            useRowCol: 'Użyj adresu komórki (A1, B2...)',
            useColumnValue: 'Użyj wartości kolumny',
            selectColumn: 'Wybierz kolumnę',
            cancel: 'Anuluj',
            confirm: 'Zapisz',
            saving: 'Zapisywanie...',
            error: 'Nie udało się zapisać obrazów w komórkach',
        },
        'image-popup': {
            replace: 'Zamień',
            delete: 'Usuń',
            edit: 'Edytuj',
            crop: 'Przytnij',
            reset: 'Resetuj rozmiar',
            flipH: 'Przerzuć w poziomie',
            flipV: 'Przerzuć w pionie',
        },
        'update-status': {
            exceedMaxSize: 'Rozmiar obrazu przekracza limit, limit wynosi {0}M',
            invalidImageType: 'Nieprawidłowy typ obrazu',
            exceedMaxCount: 'Jednocześnie można przesłać tylko {0} obrazów',
            invalidImage: 'Nieprawidłowy obraz',
        },
        'drawing-anchor': {
            title: 'Właściwości kotwicy',
            both: 'Przesuwaj i zmieniaj rozmiar razem z komórkami',
            position: 'Przesuwaj, ale nie zmieniaj rozmiaru razem z komórkami',
            none: 'Nie przesuwaj ani nie zmieniaj rozmiaru razem z komórkami',
        },
        'cell-image': {
            pasteTitle: 'Wklej jako obraz w komórce',
            pasteContent: 'Wklejenie obrazu w komórce spowoduje zastąpienie istniejącej zawartości komórki, kontynuować wklejanie',
            pasteError: 'Kopiowanie i wklejanie obrazu w komórce arkusza nie jest obsługiwane w tej jednostce',
        },
        permission: {
            dialog: {
                editErr: 'Zakres jest chroniony i nie masz uprawnień do edycji. Aby edytować, skontaktuj się z twórcą.',
            },
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

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
import emojiLocale from './emoji-locale/pl-PL.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'Wyszukaj funkcje',
            placeholder: 'Wpisz nazwę funkcji lub menu...',
            empty: 'Nie znaleziono dostępnych funkcji',
            ribbon: 'Wstążka',
            contextMenu: 'Menu kontekstowe',
        },
        emojiPicker: {
            search: 'Szukaj',
            random: 'Losowe emoji',
            recents: 'Ostatnie',
            emojis: 'Emoji',
            animals: 'Zwierzęta',
            food: 'Jedzenie',
            activities: 'Aktywności',
            places: 'Miejsca',
            objects: 'Obiekty',
            symbols: 'Symbole',
            searchResults: 'Wyniki wyszukiwania',
            noResults: 'Nie znaleziono emoji',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matematyka',
            greek: 'Grecki',
            common: 'Ogólne',
        },
        toolbar: {
            heading: {
                normal: 'Normalny',
                title: 'Tytuł',
                subTitle: 'Podtytuł',
                1: 'Nagłówek 1',
                2: 'Nagłówek 2',
                3: 'Nagłówek 3',
                4: 'Nagłówek 4',
                5: 'Nagłówek 5',
            },
        },
        ribbon: {
            start: 'Start',
            startDesc: 'Zainicjuj arkusz i ustaw podstawowe parametry.',
            insert: 'Wstaw',
            insertDesc: 'Wstaw wiersze, kolumny, wykresy i inne elementy.',
            formulas: 'Formuły',
            formulasDesc: 'Użyj funkcji i formuł do obliczeń danych.',
            data: 'Dane',
            dataDesc: 'Zarządzaj danymi, w tym import, sortowanie i filtrowanie.',
            view: 'Widok',
            viewDesc: 'Przełączaj tryby widoku i dostosowuj efekt wyświetlania.',
            others: 'Inne',
            othersDesc: 'Inne funkcje i ustawienia.',
            more: 'Więcej',
        },
        fontFamily: {
            'not-supported': 'Nie znaleziono takiej czcionki w systemie, używana jest czcionka domyślna.',
        },
        'shortcut-panel': {
            title: 'Skróty klawiszowe',
        },
        shortcut: {
            undo: 'Cofnij',
            redo: 'Ponów',
            cut: 'Wytnij',
            copy: 'Kopiuj',
            paste: 'Wklej',
            'shortcut-panel': 'Przełącz panel skrótów',
        },
        'common-edit': 'Skróty do częstej edycji',
        'toggle-shortcut-panel': 'Przełącz panel skrótów',
        navigation: {
            back: 'Wstecz',
            previous: 'Poprzedni',
            next: 'Następny',
        },
        sidebar: {
            panel: 'Panel boczny',
            resize: 'Zmień rozmiar panelu bocznego',
            close: 'Zamknij panel boczny',
        },
        beforeClose: {
            title: 'Niektóre zmiany nie zostały zapisane',
        },
        clipboard: {
            authentication: {
                title: 'Brak uprawnień',
                content: 'Zezwól Univer na dostęp do schowka.',
            },
        },
        rangeSelector: {
            cancel: 'Anuluj',
        },
        'global-shortcut': 'Globalny skrót klawiszowy',
        row: 'Wiersz',
        column: 'Kolumna',
    },
};

export default locale;

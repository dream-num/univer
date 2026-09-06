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
        objectPermission: {
            operationDenied: 'Ta treść jest chroniona. Nie można wykonać tej czynności.',
            remove: 'Usuń ochronę',
            roleOwner: 'Właściciel pliku',
            roleEditor: 'Edytor pliku',
            selectedCount: 'Wybrano: {0}',
            searchPeople: 'Szukaj osób',
            noMatchingPeople: 'Brak pasujących osób',
            loadMore: 'Wczytaj więcej',
            fileHint: 'Udostępnianie pliku określa członkostwo. Te ustawienia ograniczają działania tych członków.',
            documentParent: 'Ograniczenia edycji dokumentu dotyczą również tej sekcji.',
            paragraphParent: 'Ograniczenia edycji dokumentu i sekcji zawierającej ten akapit dotyczą również tego akapitu.',
            documentObjectParent: 'Dokument oraz sekcje i akapity zawierające ten obiekt lub stanowiące jego zakotwiczenie również mogą ograniczać edycję.',
            slideParent: 'Ograniczenia edycji prezentacji również obowiązują.',
            slideObjectParent: 'Ograniczenia edycji prezentacji oraz slajdu lub wzorca zawierającego ten obiekt również obowiązują.',
            baseParent: 'Ograniczenia edycji Base również obowiązują.',
            baseObjectParent: 'Ograniczenia edycji Base i tabeli zawierającej ten obiekt również obowiązują.',
            recordParent: 'Ograniczenia Base i tabeli nadal obowiązują. Edycja wartości wymaga także uprawnienia do odpowiedniego pola.',
            boardParent: 'Ograniczenia edycji tablicy dotyczą również tego obiektu.',
            ownerInherit: 'Właściciel pliku, odziedziczony dostęp',
            peopleError: 'Nie udało się wczytać osób. Spróbuj ponownie.',
            document: 'Dokument',
            section: 'Sekcja',
            paragraph: 'Akapit',
            entity: 'Obiekt',
            presentation: 'Prezentacja',
            page: 'Slajd',
            master: 'Widok wzorca',
            base: 'Base',
            table: 'Tabela',
            field: 'Pole',
            record: 'Rekord',
            view: 'Widok',
            board: 'Tablica',
            objectName: '{0}: {1}',

            search: 'Szukaj obiektów',
            empty: 'Brak pasujących obiektów',
            more: 'Wyświetlono pierwszych 100 obiektów. Użyj wyszukiwania, aby zawęzić listę.',
            title: 'Uprawnienia',
            cancel: 'Anuluj',
            save: 'Zapisz',
            saving: 'Zapisywanie…',
            loading: 'Wczytywanie…',
            conflict: 'Uprawnienia uległy zmianie. Wczytaj ponownie przed zapisaniem.',
            error: 'Nie udało się wczytać lub zapisać uprawnień. Twoje zmiany zostały zachowane.',
            reload: 'Wczytaj ponownie',
            denied: 'Nie możesz zarządzać uprawnieniami tego obiektu.',
            edit: 'Kto może edytować',
            all: 'Wszyscy edytorzy pliku',
            owner: 'Tylko właściciel obiektu',
            members: 'Wybrani członkowie',
            copy: 'Zezwól edytorom na kopiowanie',
            print: 'Zezwól edytorom na drukowanie',
            export: 'Zezwól edytorom na eksportowanie',
            comment: 'Zezwól edytorom na komentowanie',
            parentHint: 'Ograniczenia pliku i obiektu nadrzędnego nadal obowiązują.',
        },
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

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
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            loadMore: 'Load more',
            fileHint: 'File sharing controls membership. These settings restrict actions within that membership.',
            documentParent: 'Document editing restrictions also apply to this section.',
            paragraphParent: 'Document and containing section editing restrictions also apply to this paragraph.',
            documentObjectParent: 'Document and the sections and paragraphs containing or anchoring this object may also restrict editing.',
            slideParent: 'Presentation editing restrictions also apply.',
            slideObjectParent: 'Presentation and the containing page or master editing restrictions also apply.',
            baseParent: 'Base editing restrictions also apply.',
            baseObjectParent: 'Base and containing table editing restrictions also apply.',
            recordParent: 'Base and table restrictions still apply. Editing a value also requires permission for its field.',
            boardParent: 'Board editing restrictions also apply to this object.',
            ownerInherit: 'File owner, inherited access',
            peopleError: 'Could not load people. Please retry.',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
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

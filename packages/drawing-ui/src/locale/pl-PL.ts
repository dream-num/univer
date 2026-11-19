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
            progressReading: 'Odczytywanie załącznika…',
            progressUploading: 'Przesyłanie załącznika…',
            progressCreating: 'Tworzenie pliku online…',
            progressSaving: 'Zapisywanie łącza…',
            externalAttachment: 'Załącznik połączony',
            externalHint: 'Plik źródłowy tego załącznika nie jest osadzony w dokumencie. Podgląd i pobieranie są niedostępne.',
            missingHint: 'W dokumencie brakuje danych tego załącznika. Podgląd i pobieranie są niedostępne.',
            unavailableSummary: 'Liczba niedostępnych załączników w dokumencie: {0}. Ich symbole zastępcze zachowano. Najedź na ikonę ostrzeżenia, aby poznać przyczynę.',
            rename: 'Zmień nazwę',
            saveName: 'Zapisz nazwę',
            cancel: 'Anuluj',
            invalidName: 'Wpisz prawidłową nazwę pliku zawierającą maksymalnie 255 znaków.',
            renameFailed: 'Nie można zmienić nazwy załącznika. Spróbuj ponownie.',
            actions: 'Działania załącznika',
            linkSaveFailed: 'Utworzono plik online, ale nie zapisano łącza. Spróbuj ponownie zapisać łącze.',
            conversionFailed: 'Nie można przekonwertować tego załącznika. Spróbuj ponownie.',
            converted: 'Konwersja zakończona',
            open: 'Otwórz',
            converting: 'Konwertowanie…',
            openSlide: 'Otwórz prezentację online w nowej karcie',
            openDoc: 'Otwórz dokument online w nowej karcie',
            openSheet: 'Otwórz arkusz online w nowej karcie',
            convertSlide: 'Konwertuj na prezentację online',
            convertDoc: 'Konwertuj na dokument online',
            convertSheet: 'Konwertuj na arkusz online',
            nativePreviewHint: 'Jeśli przeglądarka nie wyświetla pliku, pobierz oryginał.',
            attachment: 'Załącznik OLE',
            external: 'Plik zewnętrzny jest niedostępny',
            missing: 'Dane załącznika są niedostępne',
            opaque: 'Oryginalny plik binarny OLE (można pobrać)',
            download: 'Pobierz',
            preview: 'Podgląd',
            remove: 'Usuń',
            failed: 'Nie można odczytać oryginalnego załącznika. Spróbuj ponownie.',
            unsupported: 'Podgląd tego pliku jest niedostępny. Możesz pobrać oryginał.',
        },
        mobile: { close: 'Zamknij', more: 'Więcej' },
        'image-cropper': {
            error: 'Nie można przyciąć obiektów innych niż obraz.',
        },
        objectListPanel: {
            title: 'Warstwy',
            empty: 'Brak obiektow',
            showAll: 'Pokaz wszystko',
            hideAll: 'Ukryj wszystko',
            lockAll: 'Zablokuj wszystko',
            unlockAll: 'Odblokuj wszystko',
            moveForward: 'Przesun do przodu',
            moveBackward: 'Przesun do tylu',
            close: 'Zamknij',
            show: 'Pokaz',
            hide: 'Ukryj',
            lock: 'Zablokuj',
            unlock: 'Odblokuj',
            lockHint: 'Zablokuj, aby zapobiec przypadkowemu zaznaczeniu',
            unlockHint: 'Zablokowano. Kliknij, aby odblokować',
            name: 'Nazwa',
            nameInput: 'Nazwa obiektu',
            description: 'Opis',
            descriptionPlaceholder: 'Dodaj opis',
            details: 'Szczegoly',
            locate: 'Zlokalizuj',
            expand: 'Rozwiń',
            collapse: 'Zwiń',
            dragToReorder: 'Przeciągnij, aby zmienić kolejność',
            search: 'Szukaj obiektów',
            filterAll: 'Wszystkie',
            filterHidden: 'Ukryte',
            filterLocked: 'Zablokowane',
            sectionCanvas: 'Warstwa kanwy',
            sectionFloating: 'Warstwa pływająca',
            typeNames: {
                object: 'Obiekt',
                shape: 'Kształt',
                connector: 'Łącznik',
                image: 'Obraz',
                chart: 'Wykres',
                table: 'Tabela',
                smartArt: 'SmartArt',
                video: 'Wideo',
                group: 'Grupa',
                unit: 'Jednostka',
                dom: 'DOM',
                text: 'Tekst',
                placeholder: 'Symbol zastępczy',
                container: 'Kontener',
            },
            noSelection: 'Wybierz obiekt, aby edytować szczegóły',
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
                cancel: 'Anuluj',
                apply: 'Gotowe',
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
            square: 'Kwadrat',
            topAndBottom: 'Góra i dół',
            inline: 'W linii z tekstem',
            behindText: 'Za tekstem',
            inFrontText: 'Przed tekstem',
        },
    },
};

export default locale;

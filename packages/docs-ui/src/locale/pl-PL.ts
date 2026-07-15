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
    'docs-ui': {
        toolbar: {
            undo: 'Cofnij',
            redo: 'Ponów',
            font: 'Czcionka',
            fontSize: 'Rozmiar czcionki',
            bold: 'Pogrubienie',
            italic: 'Kursywa',
            strikethrough: 'Przekreślenie',
            subscript: 'Indeks dolny',
            superscript: 'Indeks górny',
            underline: 'Podkreślenie',
            textColor: {
                main: 'Kolor tekstu',
            },
            fillColor: {
                main: 'Kolor tła tekstu',
            },
            table: {
                main: 'Tabela',
                insert: 'Wstaw tabelę',
                colCount: 'Liczba kolumn',
                rowCount: 'Liczba wierszy',
            },
            resetColor: 'Resetuj',
            order: 'Lista numerowana',
            unorder: 'Lista punktowana',
            checklist: 'Lista zadań',
            documentFlavor: 'Tryb nowoczesny',
            alignLeft: 'Wyrównaj do lewej',
            alignCenter: 'Wyrównaj do środka',
            alignRight: 'Wyrównaj do prawej',
            alignJustify: 'Wyjustuj',
            horizontalLine: 'Linia pozioma',
            headerFooter: 'Nagłówek i stopka',
            pageSetup: 'Ustawienia strony',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'Wstaw',
            insertRowAbove: 'Wstaw wiersz powyżej',
            insertRowBelow: 'Wstaw wiersz poniżej',
            insertColumnLeft: 'Wstaw kolumnę z lewej',
            insertColumnRight: 'Wstaw kolumnę z prawej',
            delete: 'Usuń tabelę',
            deleteRows: 'Usuń wiersz',
            deleteColumns: 'Usuń kolumnę',
            deleteTable: 'Usuń tabelę',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Nagłówek',
            footer: 'Stopka',
            panel: 'Ustawienia nagłówka i stopki',
            firstPageCheckBox: 'Inna pierwsza strona',
            oddEvenCheckBox: 'Inne strony parzyste i nieparzyste',
            headerTopMargin: 'Górny margines nagłówka (px)',
            footerBottomMargin: 'Dolny margines stopki (px)',
            closeHeaderFooter: 'Zamknij nagłówek i stopkę',
            disableText: 'Ustawienia nagłówka i stopki są wyłączone',
        },
        placeholder: {
            heading1: 'Nagłówek 1',
            heading2: 'Nagłówek 2',
            heading3: 'Nagłówek 3',
            heading4: 'Nagłówek 4',
            heading5: 'Nagłówek 5',
            normalText: 'Wpisz tekst lub naciśnij „/”, aby wyświetlić polecenia',
            listItem: 'Element',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Przeciągnij blok',
            },

            menu: {
                paragraphSetting: 'Ustawienia akapitu',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Ustawienia akapitu',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Wyrównanie',
                indentation: 'Wcięcie',
                left: 'Lewe',
                right: 'Prawe',
                firstLine: 'Pierwszy wiersz',
                hanging: 'Wiszące',
                spacing: 'Odstępy',
                before: 'Przed',
                after: 'Po',
                lineSpace: 'Odstęp między wierszami',
                multiSpace: 'Wielokrotny odstęp',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Wartość stała (px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'Kopiuj',
            cut: 'Wytnij',
            paste: 'Wklej',
            delete: 'Usuń',
            bulletList: 'Lista punktowana',
            orderList: 'Lista numerowana',
            checkList: 'Lista zadań',
            insertBellow: 'Wstaw poniżej',
        },
        paragraphMenu: {
            alignAndIndent: 'Wyrównanie i wcięcie',
            align: 'Wyrównanie',
            indent: 'Wcięcie',
            color: 'Kolory',
            increase: 'Zwiększ',
            decrease: 'Zmniejsz',
            increaseIndent: 'Zwiększ wcięcie',
            decreaseIndent: 'Zmniejsz wcięcie',
            defaultTextColor: 'Domyślny kolor tekstu',
            noBackground: 'Brak tła',
        },
        'page-settings': {
            'document-setting': 'Ustawienia dokumentu',
            mode: 'Tryb',
            'modern-mode': 'Nowoczesny',
            'classic-mode': 'Klasyczny',
            'modern-width': 'Szerokość treści',
            'modern-width-narrow': 'Wąski',
            'modern-width-medium': 'Średni',
            'modern-width-wide': 'Szeroki',
            'paper-size': 'Rozmiar papieru',
            'page-size': {
                main: 'Rozmiar papieru',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Letter',
                legal: 'Legal',
                tabloid: 'Tabloid',
                statement: 'Statement',
                executive: 'Executive',
                folio: 'Folio',
            },
            orientation: 'Orientacja',
            portrait: 'Pionowa',
            landscape: 'Pozioma',
            'custom-paper-size': 'Niestandardowy rozmiar papieru',
            top: 'Góra',
            bottom: 'Dół',
            left: 'Lewo',
            right: 'Prawo',
            cancel: 'Anuluj',
            confirm: 'Potwierdź',
        },
    },
};

export default locale;

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
                1: 'Heading 1',
                2: 'Heading 2',
                3: 'Heading 3',
                4: 'Heading 4',
                5: 'Heading 5',
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
            heading1: 'Heading 1',
            heading2: 'Heading 2',
            heading3: 'Heading 3',
            heading4: 'Heading 4',
            heading5: 'Heading 5',
            normalText: 'Type text or press "/" for commands',
            listItem: 'Item',
        },
        doc: {
            menu: {
                paragraphSetting: 'Ustawienia akapitu',
            },
            slider: {
                paragraphSetting: 'Ustawienia akapitu',
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
            alignAndIndent: 'Align and indent',
            align: 'Align',
            indent: 'Indent',
            color: 'Colors',
            increase: 'Increase',
            decrease: 'Decrease',
            increaseIndent: 'Increase indent',
            decreaseIndent: 'Decrease indent',
            defaultTextColor: 'Default text color',
            noBackground: 'No background',
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

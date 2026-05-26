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
        'page-settings': {
            'document-setting': 'Ustawienia dokumentu',
            'paper-size': 'Rozmiar papieru',
            'page-size': {
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

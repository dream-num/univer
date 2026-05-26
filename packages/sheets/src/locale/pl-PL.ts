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
    sheets: {
        tabs: {
            sheetCopy: '(Kopia {0})',
            sheet: 'Arkusz',
        },
        info: {
            overlappingSelections: 'Nie można użyć tego polecenia na nakładających się zaznaczeniach',
            acrossMergedCell: 'Przez scaloną komórkę',
            partOfCell: 'Zaznaczono tylko część scalonej komórki',
            hideSheet: 'Po ukryciu tego arkusza nie będzie widocznych arkuszy',
        },
        definedName: {
            nameEmpty: 'Nazwa nie może być pusta',
            nameDuplicate: 'Nazwa już istnieje',
            nameInvalid: 'Nazwa jest nieprawidłowa',
            nameSheetConflict: 'Nazwa jest w konflikcie z nazwą arkusza',
            formulaOrRefStringEmpty: 'Formuła lub ciąg odwołania nie może być pusty',
            nameConflict: 'Nazwa jest w konflikcie z nazwą funkcji',
            defaultName: 'ZdefiniowanaNazwa',
        },
        permission: {
            dialog: {
                autoFillErr: 'Zakres jest chroniony i nie masz uprawnień do autowypełniania. Aby użyć autowypełniania, skontaktuj się z twórcą.',
                editErr: 'Zakres jest chroniony i nie masz uprawnień do edycji. Aby edytować, skontaktuj się z twórcą.',
                formulaErr: 'Zakres lub zakres odwołania jest chroniony i nie masz uprawnień do edycji. Aby edytować, skontaktuj się z twórcą.',
                insertOrDeleteMoveRangeErr: 'Wstawiony lub usunięty zakres przecina się z chronionym zakresem i ta operacja nie jest obecnie obsługiwana.',
                insertRowColErr: 'Zakres jest chroniony i nie masz uprawnień do wstawiania wierszy i kolumn. Aby wstawić wiersze i kolumny, skontaktuj się z twórcą.',
                moveRangeErr: 'Zakres jest chroniony i nie masz uprawnień do przenoszenia zaznaczenia. Aby przenieść zaznaczenie, skontaktuj się z twórcą.',
                moveRowColErr: 'Zakres jest chroniony i nie masz uprawnień do przenoszenia wierszy i kolumn. Aby przenieść wiersze i kolumny, skontaktuj się z twórcą.',
                operatorSheetErr: 'Arkusz jest chroniony i nie masz uprawnień do operowania na arkuszu. Aby operować na arkuszu, skontaktuj się z twórcą.',
                removeRowColErr: 'Zakres jest chroniony i nie masz uprawnień do usuwania wierszy i kolumn. Aby usunąć wiersze i kolumny, skontaktuj się z twórcą.',
                setRowColStyleErr: 'Zakres jest chroniony i nie masz uprawnień do ustawiania stylów wierszy i kolumn. Aby ustawić style wierszy i kolumn, skontaktuj się z twórcą.',
                setStyleErr: 'Zakres jest chroniony i nie masz uprawnień do ustawiania stylów. Aby ustawić style, skontaktuj się z twórcą.',
            },
        },
        autoFill: {
            copy: 'Kopiuj komórkę',
            series: 'Wypełnij serią',
            formatOnly: 'Tylko format',
            noFormat: 'Bez formatu',
        },
        merge: {
            confirm: {
                title: 'Kontynuowanie scalania spowoduje zachowanie tylko wartości komórki w lewym górnym rogu, pozostałe wartości zostaną odrzucone. Czy na pewno chcesz kontynuować?',
                cancel: 'Anuluj scalanie',
                confirm: 'Kontynuuj scalanie',
                warning: 'Ostrzeżenie',
                dismantleMergeCellWarning: 'Spowoduje to rozdzielenie niektórych scalonych komórek. Czy chcesz kontynuować?',
            },
        },
    },
};

export default locale;

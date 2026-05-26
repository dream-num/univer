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
            sheetCopy: '(Kopie{0})',
            sheet: 'Blatt',
        },
        info: {
            overlappingSelections: 'Dieser Befehl kann nicht für überlappende Auswahlen verwendet werden',
            acrossMergedCell: 'Über eine verbundene Zelle',
            partOfCell: 'Es ist nur ein Teil einer verbundenen Zelle ausgewählt',
            hideSheet: 'Nach dem Ausblenden ist kein Blatt mehr sichtbar',
        },
        definedName: {
            nameEmpty: 'Name darf nicht leer sein',
            nameDuplicate: 'Name existiert bereits',
            nameInvalid: 'Der Name ist ungültig',
            nameSheetConflict: 'Der Name steht im Konflikt mit dem Blattnamen',
            formulaOrRefStringEmpty: 'Formel oder Referenzzeichenfolge darf nicht leer sein',
            nameConflict: 'Der Name steht im Konflikt mit dem Funktionsnamen',
            defaultName: 'Definierter Name',
        },
        permission: {
            dialog: {
                autoFillErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung für das automatische Ausfüllen. Um das automatische Ausfüllen zu verwenden, wenden Sie sich bitte an den Ersteller.',
                editErr: 'Der Bereich ist geschützt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller.',
                formulaErr: 'Der Bereich oder der referenzierte Bereich ist geschützt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller.',
                insertOrDeleteMoveRangeErr: 'Der eingefügte oder gelöschte Bereich überschneidet sich mit dem geschützten Bereich, und dieser Vorgang wird derzeit nicht unterstützt.',
                insertRowColErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, Zeilen und Spalten einzufügen. Um Zeilen und Spalten einzufügen, wenden Sie sich bitte an den Ersteller.',
                moveRangeErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, die Auswahl zu verschieben. Um die Auswahl zu verschieben, wenden Sie sich bitte an den Ersteller.',
                moveRowColErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, Zeilen und Spalten zu verschieben. Um Zeilen und Spalten zu verschieben, wenden Sie sich bitte an den Ersteller.',
                operatorSheetErr: 'Das Arbeitsblatt ist geschützt, und Sie haben keine Berechtigung, das Arbeitsblatt zu bearbeiten. Um das Arbeitsblatt zu bearbeiten, wenden Sie sich bitte an den Ersteller.',
                removeRowColErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, Zeilen und Spalten zu löschen. Um Zeilen und Spalten zu löschen, wenden Sie sich bitte an den Ersteller.',
                setRowColStyleErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, Zeilen- und Spaltenstile festzulegen. Um Zeilen- und Spaltenstile festzulegen, wenden Sie sich bitte an den Ersteller.',
                setStyleErr: 'Der Bereich ist geschützt, und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller.',
            },
        },
        autoFill: {
            copy: 'Zelle kopieren',
            series: 'Reihe ausfüllen',
            formatOnly: 'Nur Format',
            noFormat: 'Kein Format',
        },
        merge: {
            confirm: {
                title: 'Beim Fortfahren mit dem Zusammenführen bleibt nur der Wert der oberen linken Zelle erhalten, andere Werte werden verworfen. Möchten Sie wirklich fortfahren?',
                cancel: 'Zusammenführen abbrechen',
                confirm: 'Zusammenführen fortsetzen',
                warning: 'Warnung',
                dismantleMergeCellWarning: 'Dadurch werden einige verbundene Zellen aufgeteilt. Möchten Sie fortfahren?',
            },
        },
    },
};

export default locale;

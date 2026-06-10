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
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            font: 'Schriftart',
            fontSize: 'Schriftgröße',
            bold: 'Fett',
            italic: 'Kursiv',
            strikethrough: 'Durchgestrichen',
            subscript: 'Tiefgestellt',
            superscript: 'Hochgestellt',
            underline: 'Unterstrichen',
            textColor: {
                main: 'Textfarbe',
            },
            fillColor: {
                main: 'Texthintergrundfarbe',
            },
            table: {
                main: 'Tabelle',
                insert: 'Tabelle einfügen',
                colCount: 'Spaltenanzahl',
                rowCount: 'Zeilenanzahl',
            },
            resetColor: 'Zurücksetzen',
            order: 'Nummerierte Liste',
            unorder: 'Aufzählungsliste',
            checklist: 'Aufgabenliste',
            documentFlavor: 'Moderner Modus',
            alignLeft: 'Linksbündig',
            alignCenter: 'Zentriert',
            alignRight: 'Rechtsbündig',
            alignJustify: 'Blocksatz',
            horizontalLine: 'Horizontale Linie',
            headerFooter: 'Kopf- und Fußzeile',
            pageSetup: 'Seite einrichten',
        },
        table: {
            insert: 'Einfügen',
            insertRowAbove: 'Zeile oben einfügen',
            insertRowBelow: 'Zeile unten einfügen',
            insertColumnLeft: 'Spalte links einfügen',
            insertColumnRight: 'Spalte rechts einfügen',
            delete: 'Löschen',
            deleteRows: 'Zeile löschen',
            deleteColumns: 'Spalte löschen',
            deleteTable: 'Tabelle löschen',
        },
        headerFooter: {
            header: 'Kopfzeile',
            footer: 'Fußzeile',
            panel: 'Kopf- und Fußzeileneinstellungen',
            firstPageCheckBox: 'Andere erste Seite',
            oddEvenCheckBox: 'Unterschiedliche ungerade und gerade Seiten',
            headerTopMargin: 'Kopfzeilenoberer Rand (px)',
            footerBottomMargin: 'Fußzeilenunterer Rand (px)',
            closeHeaderFooter: 'Kopf- und Fußzeile schließen',
            disableText: 'Kopf- und Fußzeileneinstellungen sind deaktiviert',
        },
        doc: {
            menu: {
                paragraphSetting: 'Absatzeinstellungen',
            },
            slider: {
                paragraphSetting: 'Absatzeinstellungen',
            },
            paragraphSetting: {
                alignment: 'Ausrichtung',
                indentation: 'Einzug',
                left: 'Links',
                right: 'Rechts',
                firstLine: 'Erste Zeile',
                hanging: 'Hängender Einzug',
                spacing: 'Abstand',
                before: 'Vor',
                after: 'Nach',
                lineSpace: 'Zeilenabstand',
                multiSpace: 'Mehrfacher Abstand',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Fester Wert (px)',
            },
        },
        rightClick: {
            copy: 'Kopieren',
            cut: 'Ausschneiden',
            paste: 'Einfügen',
            delete: 'Löschen',
            bulletList: 'Aufzählungsliste',
            orderList: 'Nummerierte Liste',
            checkList: 'Aufgabenliste',
            insertBellow: 'Unten einfügen',
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
            'document-setting': 'Dokumenteneinstellung',
            mode: 'Modus',
            'modern-mode': 'Modern',
            'classic-mode': 'Klassisch',
            'modern-width': 'Inhaltsbreite',
            'modern-width-narrow': 'Schmal',
            'modern-width-medium': 'Mittel',
            'modern-width-wide': 'Breit',
            'paper-size': 'Papierformat',
            'page-size': {
                main: 'Papierformat',
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
            orientation: 'Ausrichtung',
            portrait: 'Hochformat',
            landscape: 'Querformat',
            'custom-paper-size': 'Benutzerdefiniertes Papierformat',
            top: 'Oben',
            bottom: 'Unten',
            left: 'Links',
            right: 'Rechts',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
        },
    },
};

export default locale;

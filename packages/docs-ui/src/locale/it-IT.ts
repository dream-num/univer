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
            undo: 'Annulla',
            redo: 'Ripristina',
            font: 'Carattere',
            fontSize: 'Dimensione carattere',
            bold: 'Grassetto',
            italic: 'Corsivo',
            strikethrough: 'Barrato',
            subscript: 'Pedice',
            superscript: 'Apice',
            underline: 'Sottolineato',
            textColor: {
                main: 'Colore testo',
            },
            fillColor: {
                main: 'Colore sfondo testo',
            },
            table: {
                main: 'Tabella',
                insert: 'Inserisci Tabella',
                colCount: 'Numero colonne',
                rowCount: 'Numero righe',
            },
            resetColor: 'Reimposta',
            order: 'Elenco ordinato',
            unorder: 'Elenco puntato',
            checklist: 'Elenco attività',
            documentFlavor: 'Modalità Moderna',
            alignLeft: 'Allinea a Sinistra',
            alignCenter: 'Allinea al Centro',
            alignRight: 'Allinea a Destra',
            alignJustify: 'Giustifica',
            horizontalLine: 'Linea orizzontale',
            headerFooter: 'Intestazione e Piè di Pagina',
            pageSetup: 'Impostazione Pagina',
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
            insert: 'Inserisci',
            insertRowAbove: 'Inserisci riga sopra',
            insertRowBelow: 'Inserisci riga sotto',
            insertColumnLeft: 'Inserisci colonna a sinistra',
            insertColumnRight: 'Inserisci colonna a destra',
            delete: 'Elimina tabella',
            deleteRows: 'Elimina riga',
            deleteColumns: 'Elimina colonna',
            deleteTable: 'Elimina tabella',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Intestazione',
            footer: 'Piè di pagina',
            panel: 'Impostazioni Intestazione e Piè di Pagina',
            firstPageCheckBox: 'Prima pagina diversa',
            oddEvenCheckBox: 'Pagine pari e dispari diverse',
            headerTopMargin: 'Margine superiore intestazione (px)',
            footerBottomMargin: 'Margine inferiore piè di pagina (px)',
            closeHeaderFooter: 'Chiudi intestazione e piè di pagina',
            disableText: 'Le impostazioni di intestazione e piè di pagina sono disabilitate',
        },
        placeholder: {
            heading1: 'Titolo 1',
            heading2: 'Titolo 2',
            heading3: 'Titolo 3',
            heading4: 'Titolo 4',
            heading5: 'Titolo 5',
            normalText: 'Digita del testo o premi "/" per i comandi',
            listItem: 'Elemento',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Trascina blocco',
            },

            menu: {
                paragraphSetting: 'Impostazioni Paragrafo',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Impostazioni Paragrafo',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Allineamento',
                indentation: 'Rientro',
                left: 'Sinistra',
                right: 'Destra',
                firstLine: 'Prima riga',
                hanging: 'Rientro sporgente',
                spacing: 'Spaziatura',
                before: 'Prima',
                after: 'Dopo',
                lineSpace: 'Interlinea',
                multiSpace: 'Spaziatura multipla',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Valore fisso (px)',
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
            copy: 'Copia',
            cut: 'Taglia',
            paste: 'Incolla',
            delete: 'Elimina',
            bulletList: 'Elenco puntato',
            orderList: 'Elenco ordinato',
            checkList: 'Elenco attività',
            insertBellow: 'Inserisci sotto',
        },
        paragraphMenu: {
            alignAndIndent: 'Allineamento e rientro',
            align: 'Allineamento',
            indent: 'Rientro',
            color: 'Colori',
            increase: 'Aumenta',
            decrease: 'Riduci',
            increaseIndent: 'Aumenta rientro',
            decreaseIndent: 'Riduci rientro',
            defaultTextColor: 'Colore testo predefinito',
            noBackground: 'Nessuno sfondo',
        },
        'page-settings': {
            'document-setting': 'Impostazione Documento',
            mode: 'Modalità',
            'modern-mode': 'Moderna',
            'classic-mode': 'Classica',
            'modern-width': 'Larghezza contenuto',
            'modern-width-narrow': 'Stretta',
            'modern-width-medium': 'Media',
            'modern-width-wide': 'Ampia',
            'paper-size': 'Dimensione carta',
            'page-size': {
                main: 'Dimensione carta',
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
            orientation: 'Orientamento',
            portrait: 'Verticale',
            landscape: 'Orizzontale',
            'custom-paper-size': 'Dimensione carta personalizzata',
            top: 'Superiore',
            bottom: 'Inferiore',
            left: 'Sinistra',
            right: 'Destra',
            cancel: 'Annulla',
            confirm: 'Conferma',
        },
    },
};

export default locale;

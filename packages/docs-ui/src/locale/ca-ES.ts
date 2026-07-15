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
            undo: 'Desfer',
            redo: 'Refer',
            font: 'Tipus de lletra',
            fontSize: 'Mida de lletra',
            bold: 'Negreta',
            italic: 'Cursiva',
            strikethrough: 'Ratllat',
            subscript: 'Subíndex',
            superscript: 'Superíndex',
            underline: 'Subratllat',
            textColor: {
                main: 'Color del text',
            },
            fillColor: {
                main: 'Color de fons del text',
            },
            table: {
                main: 'Taula',
                insert: 'Insereix taula',
                colCount: 'Nombre de columnes',
                rowCount: 'Nombre de files',
            },
            resetColor: 'Restableix',
            order: 'Llista ordenada',
            unorder: 'Llista desordenada',
            checklist: 'Llista de tasques',
            documentFlavor: 'Mode modern',
            alignLeft: 'Alinea a l\'esquerra',
            alignCenter: 'Centra',
            alignRight: 'Alinea a la dreta',
            alignJustify: 'Justifica',
            horizontalLine: 'Línia horitzontal',
            headerFooter: 'Capçalera i peu de pàgina',
            pageSetup: 'Configuració de pàgina',
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
            insert: 'Insereix',
            insertRowAbove: 'Insereix fila a sobre',
            insertRowBelow: 'Insereix fila a sota',
            insertColumnLeft: 'Insereix columna a l\'esquerra',
            insertColumnRight: 'Insereix columna a la dreta',
            delete: 'Elimina taula',
            deleteRows: 'Elimina fila',
            deleteColumns: 'Elimina columna',
            deleteTable: 'Elimina taula',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Capçalera',
            footer: 'Peu de pàgina',
            panel: 'Configuració de capçalera i peu de pàgina',
            firstPageCheckBox: 'Primera pàgina diferent',
            oddEvenCheckBox: 'Pàgines senars i parells diferents',
            headerTopMargin: 'Marge superior de la capçalera (px)',
            footerBottomMargin: 'Marge inferior del peu de pàgina (px)',
            closeHeaderFooter: 'Tanca capçalera i peu de pàgina',
            disableText: 'La configuració de capçalera i peu de pàgina està desactivada',
        },
        placeholder: {
            heading1: 'Títol 1',
            heading2: 'Títol 2',
            heading3: 'Títol 3',
            heading4: 'Títol 4',
            heading5: 'Títol 5',
            normalText: 'Escriviu text o premeu "/" per a les ordres',
            listItem: 'Element',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Arrossega el bloc',
            },

            menu: {
                paragraphSetting: 'Configuració de paràgraf',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Configuració de paràgraf',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Alineació',
                indentation: 'Sagnat',
                left: 'Esquerra',
                right: 'Dreta',
                firstLine: 'Primera línia',
                hanging: 'Penjant',
                spacing: 'Espaiat',
                before: 'Abans',
                after: 'Després',
                lineSpace: 'Espai entre línies',
                multiSpace: 'Espai múltiple',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Valor fix (px)',
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
            cut: 'Retalla',
            paste: 'Enganxa',
            delete: 'Elimina',
            bulletList: 'Llista de pics',
            orderList: 'Llista ordenada',
            checkList: 'Llista de tasques',
            insertBellow: 'Insereix a sota',
        },
        paragraphMenu: {
            alignAndIndent: 'Alineació i sagnat',
            align: 'Alineació',
            indent: 'Sagnat',
            color: 'Colors',
            increase: 'Augmenta',
            decrease: 'Redueix',
            increaseIndent: 'Augmenta el sagnat',
            decreaseIndent: 'Redueix el sagnat',
            defaultTextColor: 'Color de text predeterminat',
            noBackground: 'Sense fons',
        },
        'page-settings': {
            'document-setting': 'Configuració de document',
            mode: 'Mode',
            'modern-mode': 'Modern',
            'classic-mode': 'Clàssic',
            'modern-width': 'Amplada del contingut',
            'modern-width-narrow': 'Estreta',
            'modern-width-medium': 'Mitjana',
            'modern-width-wide': 'Ampla',
            'paper-size': 'Mida del paper',
            'page-size': {
                main: 'Mida del paper',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Carta',
                legal: 'Legal',
                tabloid: 'Tabloide',
                statement: 'Declaració',
                executive: 'Executiu',
                folio: 'Foli',
            },
            orientation: 'Orientació',
            portrait: 'Vertical',
            landscape: 'Horitzontal',
            'custom-paper-size': 'Mida de paper personalitzada',
            top: 'Superior',
            bottom: 'Inferior',
            left: 'Esquerra',
            right: 'Dreta',
            cancel: 'Cancel·la',
            confirm: 'Confirma',
        },
    },
};

export default locale;

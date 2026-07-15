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
            undo: 'Späť',
            redo: 'Znova',
            font: 'Písmo',
            fontSize: 'Veľkosť písma',
            bold: 'Tučné',
            italic: 'Kurzíva',
            strikethrough: 'Prečiarknuté',
            subscript: 'Dolný index',
            superscript: 'Horný index',
            underline: 'Podčiarknutie',
            textColor: {
                main: 'Farba textu',
            },
            fillColor: {
                main: 'Farba pozadia textu',
            },
            table: {
                main: 'Tabuľka',
                insert: 'Vložiť tabuľku',
                colCount: 'Počet stĺpcov',
                rowCount: 'Počet riadkov',
            },
            resetColor: 'Obnoviť',
            order: 'Číslovaný zoznam',
            unorder: 'Odrážkový zoznam',
            checklist: 'Zoznam úloh',
            documentFlavor: 'Moderný režim',
            alignLeft: 'Zarovnať doľava',
            alignCenter: 'Zarovnať na stred',
            alignRight: 'Zarovnať doprava',
            alignJustify: 'Zarovnať do bloku',
            horizontalLine: 'Vodorovná čiara',
            headerFooter: 'Hlavička a päta',
            pageSetup: 'Nastavenie stránky',
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
            insert: 'Vložiť',
            insertRowAbove: 'Vložiť riadok nad',
            insertRowBelow: 'Vložiť riadok pod',
            insertColumnLeft: 'Vložiť stĺpec vľavo',
            insertColumnRight: 'Vložiť stĺpec vpravo',
            delete: 'Odstrániť tabuľku',
            deleteRows: 'Odstrániť riadok',
            deleteColumns: 'Odstrániť stĺpec',
            deleteTable: 'Odstrániť tabuľku',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Hlavička',
            footer: 'Päta',
            panel: 'Nastavenia hlavičky a päty',
            firstPageCheckBox: 'Iná prvá strana',
            oddEvenCheckBox: 'Iné párne a nepárne strany',
            headerTopMargin: 'Horný okraj hlavičky (px)',
            footerBottomMargin: 'Dolný okraj päty (px)',
            closeHeaderFooter: 'Zavrieť hlavičku a pätu',
            disableText: 'Nastavenia hlavičky a päty sú vypnuté',
        },
        placeholder: {
            heading1: 'Nadpis 1',
            heading2: 'Nadpis 2',
            heading3: 'Nadpis 3',
            heading4: 'Nadpis 4',
            heading5: 'Nadpis 5',
            normalText: 'Zadajte text alebo stlačte „/“ pre príkazy',
            listItem: 'Položka',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Potiahnuť blok',
            },

            menu: {
                paragraphSetting: 'Nastavenia odseku',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Nastavenia odseku',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Zarovnanie',
                indentation: 'Odsadenie',
                left: 'Vľavo',
                right: 'Vpravo',
                firstLine: 'Prvý riadok',
                hanging: 'Predsadenie',
                spacing: 'Medzery',
                before: 'Pred',
                after: 'Za',
                lineSpace: 'Riadkovanie',
                multiSpace: 'Viacnásobné',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Pevná hodnota (px)',
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
            copy: 'Kopírovať',
            cut: 'Vystrihnúť',
            paste: 'Prilepiť',
            delete: 'Odstrániť',
            bulletList: 'Odrážkový zoznam',
            orderList: 'Číslovaný zoznam',
            checkList: 'Zoznam úloh',
            insertBellow: 'Vložiť pod',
        },
        paragraphMenu: {
            alignAndIndent: 'Zarovnanie a odsadenie',
            align: 'Zarovnanie',
            indent: 'Odsadenie',
            color: 'Farby',
            increase: 'Zväčšiť',
            decrease: 'Zmenšiť',
            increaseIndent: 'Zväčšiť odsadenie',
            decreaseIndent: 'Zmenšiť odsadenie',
            defaultTextColor: 'Predvolená farba textu',
            noBackground: 'Bez pozadia',
        },
        'page-settings': {
            'document-setting': 'Nastavenia dokumentu',
            mode: 'Režim',
            'modern-mode': 'Moderný',
            'classic-mode': 'Klasický',
            'modern-width': 'Šírka obsahu',
            'modern-width-narrow': 'Úzka',
            'modern-width-medium': 'Stredná',
            'modern-width-wide': 'Široká',
            'paper-size': 'Veľkosť papiera',
            'page-size': {
                main: 'Veľkosť papiera',
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
            orientation: 'Orientácia',
            portrait: 'Na výšku',
            landscape: 'Na šírku',
            'custom-paper-size': 'Vlastná veľkosť papiera',
            top: 'Hore',
            bottom: 'Dole',
            left: 'Vľavo',
            right: 'Vpravo',
            cancel: 'Zrušiť',
            confirm: 'Potvrdiť',
        },
    },
};

export default locale;

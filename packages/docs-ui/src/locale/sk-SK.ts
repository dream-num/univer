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
            right: 'Vybrať farbu',
        },
        fillColor: {
            main: 'Farba pozadia textu',
            right: 'Vybrať farbu',
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
    doc: {
        menu: {
            paragraphSetting: 'Nastavenia odseku',
        },
        slider: {
            paragraphSetting: 'Nastavenia odseku',
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
            fixedValue: 'Pevná hodnota (px)',
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
    'page-settings': {
        'document-setting': 'Nastavenia dokumentu',
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
};

export default locale;

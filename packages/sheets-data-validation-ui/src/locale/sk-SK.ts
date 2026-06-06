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
    'sheets-data-validation-ui': {
        title: 'Overenie údajov',
        operators: {
            legal: 'je platný typ',
        },
        validFail: {
            value: 'Zadajte hodnotu',
            common: 'Zadajte hodnotu alebo vzorec',
            number: 'Zadajte číslo alebo vzorec',
            formula: 'Zadajte vzorec',
            integer: 'Zadajte celé číslo alebo vzorec',
            date: 'Zadajte dátum alebo vzorec',
            list: 'Zadajte možnosti',
            listInvalid: 'Zdroj zoznamu musí byť zoznam oddelený oddeľovačmi alebo odkaz na jeden riadok alebo stĺpec',
            checkboxEqual: 'Zadajte odlišné hodnoty pre označený a neoznačený obsah bunky.',
            formulaError: 'Referenčný rozsah obsahuje neviditeľné údaje, upravte rozsah',
            listIntersects: 'Vybraný rozsah sa nemôže prekrývať s rozsahom pravidiel',
            primitive: 'Vzorce nie sú povolené pre vlastné hodnoty označené/neoznačené.',
        },
        panel: {
            title: 'Správa overovania údajov',
            addTitle: 'Vytvoriť nové overenie údajov',
            removeAll: 'Odstrániť všetko',
            add: 'Pridať pravidlo',
            range: 'Rozsahy',
            type: 'Typ',
            options: 'Rozšírené možnosti',
            operator: 'Operátor',
            removeRule: 'Odstrániť',
            done: 'Hotovo',
            formulaPlaceholder: 'Zadajte hodnotu alebo vzorec',
            valuePlaceholder: 'Zadajte hodnotu',
            formulaAnd: 'a',
            invalid: 'Neplatné',
            showWarning: 'Zobraziť upozornenie',
            rejectInput: 'Odmietnuť vstup',
            messageInfo: 'Pomocná správa',
            showInfo: 'Zobraziť pomocný text pre vybranú bunku',
            rangeError: 'Rozsahy nie sú platné',
            allowBlank: 'Povoliť prázdne hodnoty',
        },
        any: {
            title: 'Ľubovoľná hodnota',
            error: 'Obsah tejto bunky porušuje pravidlo overenia',
        },
        date: {
            title: 'Dátum',
        },
        list: {
            title: 'Rozbaľovací zoznam',
            name: 'Hodnota obsahuje jednu z rozsahu',
            error: 'Vstup musí spadať do zadaného rozsahu',
            emptyError: 'Zadajte hodnotu',
            add: 'Pridať',
            dropdown: 'Vybrať',
            options: 'Možnosti',
            customOptions: 'Vlastné',
            refOptions: 'Z rozsahu',
            formulaError: 'Zdroj zoznamu musí byť zoznam oddelený oddeľovačmi alebo odkaz na jeden riadok alebo stĺpec.',
            edit: 'Upraviť',
        },
        listMultiple: {
            title: 'Rozbaľovací zoznam – viacnásobný',
            dropdown: 'Viacnásobný výber',
        },
        textLength: {
            title: 'Dĺžka textu',
        },
        decimal: {
            title: 'Číslo',
        },
        whole: {
            title: 'Celé číslo',
        },
        checkbox: {
            title: 'Začiarkavacie políčko',
            error: 'Obsah tejto bunky porušuje pravidlo overenia',
            tips: 'Použite vlastné hodnoty v bunkách',
            checked: 'Vybraná hodnota',
            unchecked: 'Nevybraná hodnota',
        },
        custom: {
            title: 'Vlastný vzorec',
            error: 'Obsah tejto bunky porušuje pravidlo overenia',
            validFail: 'Zadajte platný vzorec',
        },
        alert: {
            title: 'Chyba',
            ok: 'OK',
        },
        error: {
            title: 'Neplatné:',
        },
        renderMode: {
            arrow: 'Šípka',
            chip: 'Odznak',
            text: 'Čistý text',
            label: 'Štýl zobrazenia',
        },
        showTime: {
            label: 'Zobraziť výber času',
        },
        permission: {
            dialog: {
                setStyleErr: 'Rozsah je chránený a nemáte oprávnenie nastavovať štýly. Ak chcete nastavovať štýly, kontaktujte autora.',
            },
        },
    },
};

export default locale;

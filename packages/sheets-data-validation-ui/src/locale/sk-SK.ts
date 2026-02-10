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
    dataValidation: {
        title: 'Overenie údajov',
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
        operators: {
            between: 'medzi',
            greaterThan: 'väčšie ako',
            greaterThanOrEqual: 'väčšie alebo rovné',
            lessThan: 'menšie ako',
            lessThanOrEqual: 'menšie alebo rovné',
            equal: 'rovné',
            notEqual: 'nerovné',
            notBetween: 'nie medzi',
            legal: 'je platný typ',
        },
        ruleName: {
            between: 'Je medzi {FORMULA1} a {FORMULA2}',
            greaterThan: 'Je väčšie ako {FORMULA1}',
            greaterThanOrEqual: 'Je väčšie alebo rovné {FORMULA1}',
            lessThan: 'Je menšie ako {FORMULA1}',
            lessThanOrEqual: 'Je menšie alebo rovné {FORMULA1}',
            equal: 'Je rovné {FORMULA1}',
            notEqual: 'Nie je rovné {FORMULA1}',
            notBetween: 'Nie je medzi {FORMULA1} a {FORMULA2}',
            legal: 'Je platný {TYPE}',
        },
        errorMsg: {
            between: 'Hodnota musí byť medzi {FORMULA1} a {FORMULA2}',
            greaterThan: 'Hodnota musí byť väčšia ako {FORMULA1}',
            greaterThanOrEqual: 'Hodnota musí byť väčšia alebo rovná {FORMULA1}',
            lessThan: 'Hodnota musí byť menšia ako {FORMULA1}',
            lessThanOrEqual: 'Hodnota musí byť menšia alebo rovná {FORMULA1}',
            equal: 'Hodnota musí byť rovná {FORMULA1}',
            notEqual: 'Hodnota nesmie byť rovná {FORMULA1}',
            notBetween: 'Hodnota nesmie byť medzi {FORMULA1} a {FORMULA2}',
            legal: 'Hodnota musí byť platný {TYPE}',
        },
        any: {
            title: 'Ľubovoľná hodnota',
            error: 'Obsah tejto bunky porušuje pravidlo overenia',
        },
        date: {
            title: 'Dátum',
            operators: {
                between: 'medzi',
                greaterThan: 'po',
                greaterThanOrEqual: 'v alebo po',
                lessThan: 'pred',
                lessThanOrEqual: 'v alebo pred',
                equal: 'rovné',
                notEqual: 'nerovné',
                notBetween: 'nie medzi',
                legal: 'je platný dátum',
            },
            ruleName: {
                between: 'je medzi {FORMULA1} a {FORMULA2}',
                greaterThan: 'je po {FORMULA1}',
                greaterThanOrEqual: 'je v alebo po {FORMULA1}',
                lessThan: 'je pred {FORMULA1}',
                lessThanOrEqual: 'je v alebo pred {FORMULA1}',
                equal: 'je {FORMULA1}',
                notEqual: 'nie je {FORMULA1}',
                notBetween: 'nie je medzi {FORMULA1}',
                legal: 'je platný dátum',
            },
            errorMsg: {
                between: 'Hodnota musí byť platný dátum a medzi {FORMULA1} a {FORMULA2}',
                greaterThan: 'Hodnota musí byť platný dátum a po {FORMULA1}',
                greaterThanOrEqual: 'Hodnota musí byť platný dátum a v alebo po {FORMULA1}',
                lessThan: 'Hodnota musí byť platný dátum a pred {FORMULA1}',
                lessThanOrEqual: 'Hodnota musí byť platný dátum a v alebo pred {FORMULA1}',
                equal: 'Hodnota musí byť platný dátum a {FORMULA1}',
                notEqual: 'Hodnota musí byť platný dátum a nie {FORMULA1}',
                notBetween: 'Hodnota musí byť platný dátum a nie medzi {FORMULA1}',
                legal: 'Hodnota musí byť platný dátum',
            },
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
            errorMsg: {
                between: 'Dĺžka textu musí byť medzi {FORMULA1} a {FORMULA2}',
                greaterThan: 'Dĺžka textu musí byť po {FORMULA1}',
                greaterThanOrEqual: 'Dĺžka textu musí byť v alebo po {FORMULA1}',
                lessThan: 'Dĺžka textu musí byť pred {FORMULA1}',
                lessThanOrEqual: 'Dĺžka textu musí byť v alebo pred {FORMULA1}',
                equal: 'Dĺžka textu musí byť {FORMULA1}',
                notEqual: 'Dĺžka textu nesmie byť {FORMULA1}',
                notBetween: 'Dĺžka textu nesmie byť medzi {FORMULA1}',
            },
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
            ruleName: 'Vlastný vzorec je {FORMULA1}',
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
    },
};

export default locale;

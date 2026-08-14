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
        ribbon: {
            setCheckbox: 'Nastaviť začiarkavacie políčko',
            clearCheckbox: 'Vymazať začiarkavacie políčko',
            dropdownPresetTitle: 'Použiť predvoľbu:',
            editDropdown: 'Upraviť možnosti',
            clearDropdown: 'Vymazať rozbaľovací zoznam',
            dateTime: 'Dátum a čas',
            presets: {
                yes: 'Áno',
                no: 'Nie',
                notStarted: 'Nezačaté',
                inProgress: 'Prebieha',
                completed: 'Dokončené',
                option1: 'Možnosť 1',
                option2: 'Možnosť 2',
            },
        },
        operators: {
            legal: 'je platný typ',
        },
        validFail: {
            formulaError: 'Referenčný rozsah obsahuje neviditeľné údaje, upravte rozsah',
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
        date: {
            title: 'Dátum',
        },
        list: {
            title: 'Rozbaľovací zoznam',
            add: 'Pridať',
            options: 'Možnosti',
            customOptions: 'Vlastné',
            refOptions: 'Z rozsahu',
            edit: 'Upraviť',
        },
        checkbox: {
            title: 'Začiarkavacie políčko',
            tips: 'Použite vlastné hodnoty v bunkách',
            checked: 'Vybraná hodnota',
            unchecked: 'Nevybraná hodnota',
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

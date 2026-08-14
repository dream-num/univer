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
import emojiLocale from './emoji-locale/sk-SK.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'Vyhľadať funkcie',
            placeholder: 'Zadajte názov funkcie alebo ponuky...',
            empty: 'Nenašli sa žiadne dostupné funkcie',
            ribbon: 'Pás s nástrojmi',
            contextMenu: 'Kontextová ponuka',
        },
        emojiPicker: {
            search: 'Hľadať',
            random: 'Náhodné emoji',
            recents: 'Nedávne',
            emojis: 'Emoji',
            animals: 'Zvieratá',
            food: 'Jedlo',
            activities: 'Aktivity',
            places: 'Miesta',
            objects: 'Objekty',
            symbols: 'Symboly',
            searchResults: 'Výsledky vyhľadávania',
            noResults: 'Nenašli sa žiadne emoji',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matematika',
            greek: 'Grécke písmená',
            common: 'Bežné',
        },
        toolbar: {
            heading: {
                normal: 'Normálne',
                title: 'Nadpis',
                subTitle: 'Podnadpis',
                1: 'Nadpis 1',
                2: 'Nadpis 2',
                3: 'Nadpis 3',
                4: 'Nadpis 4',
                5: 'Nadpis 5',
            },
        },
        ribbon: {
            start: 'Začiatok',
            startDesc: 'Inicializujte hárok a nastavte základné parametre.',
            insert: 'Vložiť',
            insertDesc: 'Vložte riadky, stĺpce, grafy a ďalšie prvky.',
            formulas: 'Vzorce',
            formulasDesc: 'Používajte funkcie a vzorce na výpočty údajov.',
            data: 'Údaje',
            dataDesc: 'Spravujte údaje vrátane importu, triedenia a filtrovania.',
            view: 'Zobrazenie',
            viewDesc: 'Prepínajte režimy zobrazenia a upravte efekt zobrazenia.',
            others: 'Ostatné',
            othersDesc: 'Ďalšie funkcie a nastavenia.',
            more: 'Viac',
        },
        fontFamily: {
            'not-supported': 'Toto písmo sa v systéme nenašlo, používa sa predvolené písmo.',
        },
        'shortcut-panel': {
            title: 'Skratky',
        },
        shortcut: {
            undo: 'Späť',
            redo: 'Znova',
            cut: 'Vystrihnúť',
            copy: 'Kopírovať',
            paste: 'Prilepiť',
            'shortcut-panel': 'Prepnúť panel skratiek',
        },
        'common-edit': 'Bežné úpravové skratky',
        'toggle-shortcut-panel': 'Prepnúť panel skratiek',
        navigation: {
            back: 'Späť',
            previous: 'Predchádzajúce',
            next: 'Ďalšie',
        },
        sidebar: {
            panel: 'Bočný panel',
            resize: 'Zmeniť veľkosť bočného panela',
            close: 'Zavrieť bočný panel',
        },
        beforeClose: {
            title: 'Niektoré zmeny neboli uložené',
        },
        clipboard: {
            authentication: {
                title: 'Povolenie zamietnuté',
                content: 'Povoľte Univeru prístup k schránke.',
            },
        },
        rangeSelector: {
            cancel: 'Zrušiť',
        },
        'global-shortcut': 'Globálna skratka',
        row: 'Riadok',
        column: 'Stĺpec',
    },
};

export default locale;

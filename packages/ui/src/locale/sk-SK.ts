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
        objectPermission: {
            operationDenied: 'Tento obsah je chránený. Túto akciu nemožno vykonať.',
            remove: 'Odstrániť ochranu',
            roleOwner: 'Vlastník súboru',
            roleEditor: 'Editor súboru',
            selectedCount: 'Vybrané: {0}',
            searchPeople: 'Hľadať osoby',
            noMatchingPeople: 'Žiadne zodpovedajúce osoby',
            loadMore: 'Načítať viac',
            fileHint: 'Zdieľanie súboru určuje členstvo. Tieto nastavenia obmedzujú činnosti týchto členov.',
            documentParent: 'Obmedzenia úprav dokumentu sa vzťahujú aj na túto sekciu.',
            paragraphParent: 'Obmedzenia úprav dokumentu a sekcie obsahujúcej tento odsek sa vzťahujú aj na tento odsek.',
            documentObjectParent: 'Dokument a sekcie či odseky, ktoré obsahujú alebo ukotvujú tento objekt, môžu tiež obmedzovať úpravy.',
            slideParent: 'Platia aj obmedzenia úprav prezentácie.',
            slideObjectParent: 'Platia aj obmedzenia úprav prezentácie a snímky alebo predlohy obsahujúcej tento objekt.',
            baseParent: 'Platia aj obmedzenia úprav Base.',
            baseObjectParent: 'Platia aj obmedzenia úprav Base a tabuľky obsahujúcej tento objekt.',
            recordParent: 'Obmedzenia Base a tabuľky naďalej platia. Úprava hodnoty vyžaduje aj oprávnenie pre príslušné pole.',
            boardParent: 'Obmedzenia úprav tabule sa vzťahujú aj na tento objekt.',
            ownerInherit: 'Vlastník súboru, zdedený prístup',
            peopleError: 'Osoby sa nepodarilo načítať. Skúste to znova.',
            document: 'Dokument',
            section: 'Sekcia',
            paragraph: 'Odsek',
            entity: 'Objekt',
            presentation: 'Prezentácia',
            page: 'Snímka',
            master: 'Zobrazenie predlohy',
            base: 'Base',
            table: 'Tabuľka',
            field: 'Pole',
            record: 'Záznam',
            view: 'Zobrazenie',
            board: 'Tabuľa',
            objectName: '{0}: {1}',

            search: 'Hľadať objekty',
            empty: 'Žiadne zodpovedajúce objekty',
            more: 'Zobrazuje sa prvých 100 objektov. Pomocou vyhľadávania zúžte zoznam.',
            title: 'Oprávnenia',
            cancel: 'Zrušiť',
            save: 'Uložiť',
            saving: 'Ukladá sa…',
            loading: 'Načítava sa…',
            conflict: 'Oprávnenia sa zmenili. Pred uložením ich znova načítajte.',
            error: 'Oprávnenia sa nepodarilo načítať alebo uložiť. Vaše zmeny zostali zachované.',
            reload: 'Znova načítať',
            denied: 'Nemôžete spravovať oprávnenia tohto objektu.',
            edit: 'Kto môže upravovať',
            all: 'Všetci editori súboru',
            owner: 'Iba vlastník objektu',
            members: 'Vybraní členovia',
            copy: 'Povoliť editorom kopírovanie',
            print: 'Povoliť editorom tlač',
            export: 'Povoliť editorom export',
            comment: 'Povoliť editorom komentovanie',
            parentHint: 'Obmedzenia súboru a nadradeného objektu naďalej platia.',
        },
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

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
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            loadMore: 'Load more',
            fileHint: 'File sharing controls membership. These settings restrict actions within that membership.',
            documentParent: 'Document editing restrictions also apply to this section.',
            paragraphParent: 'Document and containing section editing restrictions also apply to this paragraph.',
            documentObjectParent: 'Document and the sections and paragraphs containing or anchoring this object may also restrict editing.',
            slideParent: 'Presentation editing restrictions also apply.',
            slideObjectParent: 'Presentation and the containing page or master editing restrictions also apply.',
            baseParent: 'Base editing restrictions also apply.',
            baseObjectParent: 'Base and containing table editing restrictions also apply.',
            recordParent: 'Base and table restrictions still apply. Editing a value also requires permission for its field.',
            boardParent: 'Board editing restrictions also apply to this object.',
            ownerInherit: 'File owner, inherited access',
            peopleError: 'Could not load people. Please retry.',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
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

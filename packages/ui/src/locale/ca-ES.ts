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
import emojiLocale from './emoji-locale/ca-ES.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'Cerca funcions',
            placeholder: 'Escriviu una funció o un nom de menú...',
            empty: 'No s\'han trobat funcions disponibles',
            ribbon: 'Cinta',
            contextMenu: 'Menú contextual',
        },
        emojiPicker: {
            search: 'Cerca',
            random: 'Emoji aleatori',
            recents: 'Recents',
            emojis: 'Emojis',
            animals: 'Animals',
            food: 'Menjar',
            activities: 'Activitats',
            places: 'Llocs',
            objects: 'Objectes',
            symbols: 'Símbols',
            searchResults: 'Resultats de cerca',
            noResults: 'No s’ha trobat cap emoji',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matemàtiques',
            greek: 'Grec',
            common: 'Comuns',
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Títol',
                subTitle: 'Subtítol',
                1: 'Encapçalament 1',
                2: 'Encapçalament 2',
                3: 'Encapçalament 3',
                4: 'Encapçalament 4',
                5: 'Encapçalament 5',
            },
        },
        ribbon: {
            start: 'Inici',
            startDesc: 'Inicia el full de càlcul i estableix els paràmetres bàsics.',
            insert: 'Insereix',
            insertDesc: 'Insereix files, columnes, gràfics i altres elements.',
            formulas: 'Fórmules',
            formulasDesc: 'Utilitza funcions i fórmules per a càlculs de dades.',
            data: 'Dades',
            dataDesc: 'Gestiona les dades, incloent importació, ordenació i filtratge.',
            view: 'Vista',
            viewDesc: 'Canvia els modes de vista i ajusta l\'efecte de visualització.',
            others: 'Altres',
            othersDesc: 'Altres funcions i configuracions.',
            more: 'Més',
        },
        fontFamily: {
            'not-supported': 'No s\'ha trobat aquesta font al sistema, s\'utilitza la font per defecte.',
        },
        'shortcut-panel': {
            title: 'Dreceres',
        },
        shortcut: {
            undo: 'Desfer',
            redo: 'Refer',
            cut: 'Retalla',
            copy: 'Copia',
            paste: 'Enganxa',
            'shortcut-panel': 'Alterna el panell de dreceres',
        },
        'common-edit': 'Dreceres d\'edició comunes',
        'toggle-shortcut-panel': 'Alterna el panell de dreceres',
        navigation: {
            back: 'Enrere',
            previous: 'Anterior',
            next: 'Següent',
        },
        sidebar: {
            panel: 'Panell lateral',
            resize: 'Canvia la mida del panell lateral',
            close: 'Tanca el panell lateral',
        },
        beforeClose: {
            title: 'Alguns canvis no s\'han desat',
        },
        clipboard: {
            authentication: {
                title: 'Permís denegat',
                content: 'Si us plau, permet que Univer accedeixi al teu porta-retalls.',
            },
        },
        rangeSelector: {
            cancel: 'Cancel·la',
        },
        'global-shortcut': 'Drecera global',
        row: 'Fila',
        column: 'Columna',
    },
};

export default locale;

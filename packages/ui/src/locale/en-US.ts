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

import emojiLocale from './emoji-locale/en-US.generated';

const locale = {
    ui: {
        featureSearch: {
            title: 'Search features',
            placeholder: 'Type a feature or menu name...',
            empty: 'No available features found',
            ribbon: 'Ribbon',
            contextMenu: 'Context menu',
        },
        emojiPicker: {
            search: 'Search',
            random: 'Random emoji',
            recents: 'Recents',
            emojis: 'Emojis',
            animals: 'Animals',
            food: 'Food',
            activities: 'Activities',
            places: 'Places',
            objects: 'Objects',
            symbols: 'Symbols',
            searchResults: 'Search results',
            noResults: 'No emoji found',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Mathematics',
            greek: 'Greek',
            common: 'Common',
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Title',
                subTitle: 'Sub Title',
                1: 'Heading 1',
                2: 'Heading 2',
                3: 'Heading 3',
                4: 'Heading 4',
                5: 'Heading 5',
            },
        },
        ribbon: {
            start: 'Start',
            startDesc: 'Initiate the worksheet and set basic parameters.',
            insert: 'Insert',
            insertDesc: 'Insert rows, columns, charts and various other elements.',
            formulas: 'Formulas',
            formulasDesc: 'Use functions and formulas for data calculations.',
            data: 'Data',
            dataDesc: 'Manage data, including import, sorting and filtering.',
            view: 'View',
            viewDesc: 'Switch view modes and adjust the display effect.',
            others: 'Others',
            othersDesc: 'Other functions and settings.',
            more: 'More',
        },
        fontFamily: {
            'not-supported': 'No such font found in the system, using default font.',
        },
        'shortcut-panel': {
            title: 'Shortcuts',
        },
        shortcut: {
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            'shortcut-panel': 'Toggle Shortcut Panel',
        },
        'common-edit': 'Common Editing Shortcuts',
        'toggle-shortcut-panel': 'Toggle Shortcut Panel',
        navigation: {
            back: 'Back',
            previous: 'Previous',
            next: 'Next',
        },
        sidebar: {
            panel: 'Sidebar panel',
            resize: 'Resize sidebar',
            close: 'Close sidebar',
        },
        beforeClose: {
            title: 'Some changes are not saved',
        },
        clipboard: {
            authentication: {
                title: 'Permission Denied',
                content: 'Please allow Univer to access your clipboard.',
            },
        },
        rangeSelector: {
            cancel: 'Cancel',
        },
        'global-shortcut': 'Global Shortcut',
        row: 'Row',
        column: 'Column',
    },
};

export default locale;

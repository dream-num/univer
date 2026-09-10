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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'Spis treści',
            insertTitle: 'Spis treści',
            automaticTitle: 'Automatyczny spis treści',
            customTitle: 'Niestandardowy spis treści…',
            contentsTitle: 'Spis treści',
            levels: 'Pokaż poziomy',
            showPageNumbers: 'Pokaż numery stron',
            rightAlignPageNumbers: 'Wyrównaj numery stron do prawej',
            tabLeader: 'Znak wiodący',
            leaderNone: 'Brak',
            leaderDots: 'Kropki',
            leaderDashes: 'Kreski',
            leaderUnderline: 'Podkreślenie',
            format: 'Formaty',
            formatFromTemplate: 'Z szablonu',
            formatClassic: 'Klasyczny',
            formatModern: 'Nowoczesny',
            formatSimple: 'Prosty',
            preview: 'Podgląd wydruku',
            previewHeading: 'Nagłówek',
            noHeadings: 'Nie znaleziono nagłówków. Zastosuj style Nagłówek 1–3 lub wybierz odpowiednie poziomy.',
            updateTitle: 'Aktualizuj spis treści',
            removeTitle: 'Usuń spis treści',
            updatePageNumbersOnly: 'Aktualizuj tylko numery stron',
            updateEntireTable: 'Aktualizuj cały spis',
            updateHint: 'Wybierz sposób aktualizacji tego spisu treści.',
        },
    },
};

export default locale;

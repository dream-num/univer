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
            title: 'Obsah',
            insertTitle: 'Obsah',
            automaticTitle: 'Automatický obsah',
            customTitle: 'Vlastný obsah…',
            contentsTitle: 'Obsah',
            levels: 'Zobraziť úrovne',
            showPageNumbers: 'Zobraziť čísla strán',
            rightAlignPageNumbers: 'Zarovnať čísla strán doprava',
            tabLeader: 'Vodiaci znak',
            leaderNone: 'Žiadny',
            leaderDots: 'Bodky',
            leaderDashes: 'Pomlčky',
            leaderUnderline: 'Podčiarknutie',
            format: 'Formáty',
            formatFromTemplate: 'Zo šablóny',
            formatClassic: 'Klasický',
            formatModern: 'Moderný',
            formatSimple: 'Jednoduchý',
            preview: 'Ukážka pred tlačou',
            previewHeading: 'Nadpis',
            noHeadings: 'Nenašli sa žiadne nadpisy. Použite štýly Nadpis 1–3 alebo vyberte zodpovedajúce úrovne.',
            updateTitle: 'Aktualizovať obsah',
            removeTitle: 'Odstrániť obsah',
            updatePageNumbersOnly: 'Aktualizovať iba čísla strán',
            updateEntireTable: 'Aktualizovať celý obsah',
            updateHint: 'Vyberte spôsob aktualizácie tohto obsahu.',
        },
    },
};

export default locale;

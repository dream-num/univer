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
            title: 'Taula de continguts',
            insertTitle: 'Taula de continguts',
            automaticTitle: 'Taula automàtica',
            customTitle: 'Taula de continguts personalitzada…',
            contentsTitle: 'Continguts',
            levels: 'Mostra els nivells',
            showPageNumbers: 'Mostra els números de pàgina',
            rightAlignPageNumbers: 'Alinea els números de pàgina a la dreta',
            tabLeader: 'Caràcter de farciment',
            leaderNone: 'Cap',
            leaderDots: 'Punts',
            leaderDashes: 'Guions',
            leaderUnderline: 'Subratllat',
            format: 'Formats',
            formatFromTemplate: 'De la plantilla',
            formatClassic: 'Clàssic',
            formatModern: 'Modern',
            formatSimple: 'Simple',
            preview: 'Visualització prèvia d\'impressió',
            previewHeading: 'Títol',
            noHeadings: 'No s\'ha trobat cap títol. Apliqueu els estils Títol 1–3 o trieu els nivells corresponents.',
            updateTitle: 'Actualitza la taula de continguts',
            removeTitle: 'Elimina la taula de continguts',
            updatePageNumbersOnly: 'Actualitza només els números de pàgina',
            updateEntireTable: 'Actualitza tota la taula',
            updateHint: 'Trieu com voleu actualitzar aquesta taula de continguts.',
        },
    },
};

export default locale;

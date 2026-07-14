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
    ENCODEURL: {
        description: 'La fonction ENCODEURL retourne une chaîne encodée en URL, en remplaçant certains caractères non alphanumériques par le symbole de pourcentage (%) et un nombre hexadécimal.',
        abstract: 'La fonction ENCODEURL retourne une chaîne encodée en URL, en remplaçant certains caractères non alphanumériques par le symbole de pourcentage (%) et un nombre hexadécimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Chaîne à encoder au format URL.' },
        },
    },
    FILTERXML: {
        description: 'La fonction FILTERXML retourne des données spécifiques à partir de contenu XML à l’aide du xpath spécifié.',
        abstract: 'La fonction FILTERXML retourne des données spécifiques à partir de contenu XML à l’aide du xpath spécifié.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'Chaîne au format XML valide.' },
            xpath: { name: 'xpath', detail: 'Chaîne au format XPath standard.' },
        },
    },
    WEBSERVICE: {
        description: 'La fonction WEBSERVICE retourne des données à partir d’un service web sur Internet ou intranet.',
        abstract: 'La fonction WEBSERVICE retourne des données à partir d’un service web sur Internet ou intranet.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'L’URL du service web.' },
        },
    },
};

export default locale;

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
            title: 'Table des matières',
            insertTitle: 'Table des matières',
            automaticTitle: 'Table automatique',
            customTitle: 'Table des matières personnalisée…',
            contentsTitle: 'Sommaire',
            levels: 'Afficher les niveaux',
            showPageNumbers: 'Afficher les numéros de page',
            rightAlignPageNumbers: 'Aligner les numéros de page à droite',
            tabLeader: 'Caractères de suite',
            leaderNone: 'Aucun',
            leaderDots: 'Points',
            leaderDashes: 'Tirets',
            leaderUnderline: 'Soulignement',
            format: 'Formats',
            formatFromTemplate: 'Depuis le modèle',
            formatClassic: 'Classique',
            formatModern: 'Moderne',
            formatSimple: 'Simple',
            preview: 'Aperçu avant impression',
            previewHeading: 'Titre',
            noHeadings: 'Aucun titre trouvé. Appliquez les styles Titre 1–3 ou choisissez les niveaux correspondants.',
            updateTitle: 'Mettre à jour la table des matières',
            removeTitle: 'Supprimer la table des matières',
            updatePageNumbersOnly: 'Mettre à jour uniquement les numéros de page',
            updateEntireTable: 'Mettre à jour toute la table',
            updateHint: 'Choisissez comment mettre à jour cette table des matières.',
        },
    },
};

export default locale;

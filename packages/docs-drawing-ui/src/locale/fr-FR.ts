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
    docImage: {
        title: 'Image',

        upload: {
            float: 'Insérer une image',
        },

        panel: {
            title: 'Modifier l\'image',
        },
    },
    'image-popup': {
        replace: 'Remplacer',
        delete: 'Supprimer',
        edit: 'Modifier',
        crop: 'Rogner',
        reset: 'Réinitialiser la taille',
    },
    'image-text-wrap': {
        title: 'Habillage du texte',
        wrappingStyle: 'Style d\'habillage',
        square: 'Carré',
        topAndBottom: 'Haut et bas',
        inline: 'Aligné avec le texte',
        behindText: 'Derrière le texte',
        inFrontText: 'Devant le texte',
        wrapText: 'Habiller le texte',
        bothSide: 'Des deux côtés',
        leftOnly: 'Seulement à gauche',
        rightOnly: 'Seulement à droite',
        distanceFromText: 'Distance du texte',
        top: 'Haut(px)',
        left: 'Gauche(px)',
        bottom: 'Bas(px)',
        right: 'Droite(px)',
    },
    'image-position': {
        title: 'Position',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        absolutePosition: 'Position absolue(px)',
        relativePosition: 'Position relative',
        toTheRightOf: 'à droite de',
        relativeTo: 'par rapport à',
        bellow: 'en dessous',
        options: 'Options',
        moveObjectWithText: 'Déplacer l\'objet avec le texte',
        column: 'Colonne',
        margin: 'Marge',
        page: 'Page',
        line: 'Ligne',
        paragraph: 'Paragraphe',
    },
    'update-status': {
        exceedMaxSize: 'La taille de l\'image dépasse la limite, la limite est de {0}M',
        invalidImageType: 'Type d\'image invalide',
        exceedMaxCount: 'Seulement {0} images peuvent être téléchargées à la fois',
        invalidImage: 'Image invalide',
    },
};

export default locale;

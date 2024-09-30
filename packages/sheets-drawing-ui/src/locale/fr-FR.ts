/**
 * Copyright 2023-present DreamNum Inc.
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
    sheetImage: {
        title: 'Image',

        upload: {
            float: 'Image flottante',
            cell: 'Image de cellule',
        },

        panel: {
            title: 'Modifier l\'image',
        },
    },
    'image-popup': {
        replace: 'Remplacer',
        delete: 'Supprimer',
        edit: 'Éditer',
        crop: 'Rogner',
        reset: 'Réinitialiser la taille',
    },
    'drawing-anchor': {
        title: 'Propriétés de l\'ancre',
        both: 'Déplacer et redimensionner avec les cellules',
        position: 'Déplacer mais ne pas redimensionner avec les cellules',
        none: 'Ne pas déplacer ni redimensionner avec les cellules',
    },
    'update-status': {
        exceedMaxSize: 'La taille de l\'image dépasse la limite, la limite est de {0}M',
        invalidImageType: 'Type d\'image invalide',
        exceedMaxCount: 'Seulement {0} images peuvent être téléchargées à la fois',
        invalidImage: 'Image invalide',
    },
    'sheet-drawing-view': 'Dessin',
    shortcut: {
        sheet: {
            'drawing-move-down': 'Déplacer le dessin vers le bas',
            'drawing-move-up': 'Déplacer le dessin vers le haut',
            'drawing-move-left': 'Déplacer le dessin vers la gauche',
            'drawing-move-right': 'Déplacer le dessin vers la droite',
            'drawing-delete': 'Supprimer le dessin',
        },
    },
};

export default locale;

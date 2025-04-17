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
    'cell-image': {
        pasteTitle: 'Coller comme image de cellule',
        pasteContent: 'Coller une image de cellule écrasera le contenu existant de la cellule, continuer le collage',
        pasteError: 'Le copier-coller d\'image de cellule n\'est pas pris en charge dans cette unité',
    },
};

export default locale;

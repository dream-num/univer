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
    'image-popup': {
        replace: 'Remplacer',
        delete: 'Supprimer',
        edit: 'Modifier',
        crop: 'Rogner',
        reset: 'Réinitialiser la taille',
    },
    'image-cropper': {
        error: 'Impossible de rogner des objets non image.',
    },
    'image-panel': {
        arrange: {
            title: 'Arranger',
            forward: 'Avancer',
            backward: 'Reculer',
            front: 'Mettre au premier plan',
            back: 'Mettre à l\'arrière-plan',
        },
        transform: {
            title: 'Transformer',
            rotate: 'Pivoter (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Largeur (px)',
            height: 'Hauteur (px)',
            lock: 'Verrouiller le ratio (%)',
        },
        crop: {
            title: 'Rogner',
            start: 'Commencer à rogner',
            mode: 'Libre',
        },
        group: {
            title: 'Grouper',
            group: 'Grouper',
            reGroup: 'Regrouper',
            unGroup: 'Dégrouper',
        },
        align: {
            title: 'Aligner',
            default: 'Sélectionner le type d\'alignement',
            left: 'Aligner à gauche',
            center: 'Aligner au centre',
            right: 'Aligner à droite',
            top: 'Aligner en haut',
            middle: 'Aligner au milieu',
            bottom: 'Aligner en bas',
            horizon: 'Distribuer horizontalement',
            vertical: 'Distribuer verticalement',
        },
        null: 'Aucune sélection d\'objet',
    },
    'drawing-view': 'Dessin',
    shortcut: {
        'drawing-move-down': 'Déplacer le dessin vers le bas',
        'drawing-move-up': 'Déplacer le dessin vers le haut',
        'drawing-move-left': 'Déplacer le dessin vers la gauche',
        'drawing-move-right': 'Déplacer le dessin vers la droite',
        'drawing-delete': 'Supprimer le dessin',
    },
};

export default locale;

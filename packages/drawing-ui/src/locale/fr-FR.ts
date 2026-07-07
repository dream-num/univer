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
    'drawing-ui': {
        'image-cropper': {
            error: 'Impossible de rogner des objets non image.',
        },
        objectListPanel: {
            title: 'Objets',
            empty: 'Aucun objet',
            showAll: 'Tout afficher',
            hideAll: 'Tout masquer',
            moveForward: 'Avancer',
            moveBackward: 'Reculer',
            close: 'Fermer',
            show: 'Afficher',
            hide: 'Masquer',
            lock: 'Verrouiller',
            unlock: 'Deverrouiller',
            name: 'Nom',
            nameInput: 'Nom de l\'objet',
            description: 'Description',
            descriptionPlaceholder: 'Ajouter une description',
            details: 'Details',
            locate: 'Localiser',
            expand: 'Développer',
            collapse: 'Réduire',
            dragToReorder: 'Faire glisser pour réorganiser',
            search: 'Rechercher des objets',
            filterAll: 'Tous',
            filterHidden: 'Masqués',
            filterLocked: 'Verrouillés',
            sectionCanvas: 'Calque du canevas',
            sectionFloating: 'Calque flottant',
            typeNames: {
                object: 'Objet',
                shape: 'Forme',
                connector: 'Connecteur',
                image: 'Image',
                chart: 'Graphique',
                table: 'Tableau',
                smartArt: 'SmartArt',
                video: 'Vidéo',
                group: 'Groupe',
                unit: 'Unité',
                dom: 'DOM',
                text: 'Texte',
                placeholder: 'Espace réservé',
                container: 'Conteneur',
            },
            noSelection: 'Sélectionnez un objet pour modifier ses détails',
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
        'image-popup': {
            replace: 'Remplacer',
            delete: 'Supprimer',
            edit: 'Modifier',
            crop: 'Rogner',
            reset: 'Réinitialiser la taille',
        },
    },
};

export default locale;

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
        ole: {
            externalAttachment: 'Pièce jointe liée',
            externalHint: 'Le fichier source de cette pièce jointe n’est pas intégré au document. L’aperçu et le téléchargement sont indisponibles.',
            missingHint: 'Les données de cette pièce jointe sont absentes du document. L’aperçu et le téléchargement sont indisponibles.',
            unavailableSummary: 'Ce document contient {0} pièces jointes indisponibles. Leurs emplacements sont conservés. Survolez l’icône d’avertissement pour en connaître la raison.',
            rename: 'Renommer',
            saveName: 'Enregistrer le nom',
            cancel: 'Annuler',
            invalidName: 'Saisissez un nom de fichier valide de 255 caractères maximum.',
            renameFailed: 'Impossible de renommer cette pièce jointe. Réessayez.',
            actions: 'Actions de la pièce jointe',
            linkSaveFailed: 'Le fichier en ligne a été créé, mais son lien n’a pas pu être enregistré. Réessayez pour enregistrer le lien.',
            conversionFailed: 'Impossible de convertir cette pièce jointe. Réessayez.',
            converted: 'Conversion terminée. Vous pouvez ouvrir le fichier en ligne dans un nouvel onglet.',
            converting: 'Conversion en cours…',
            openSlide: 'Ouvrir la présentation en ligne dans un nouvel onglet',
            openDoc: 'Ouvrir le document en ligne dans un nouvel onglet',
            openSheet: 'Ouvrir la feuille de calcul en ligne dans un nouvel onglet',
            convertSlide: 'Convertir en présentation en ligne',
            convertDoc: 'Convertir en document en ligne',
            convertSheet: 'Convertir en feuille de calcul en ligne',
            nativePreviewHint: 'Si le navigateur ne peut pas afficher le fichier, téléchargez l’original.',
            attachment: 'Pièce jointe OLE',
            external: 'Fichier externe indisponible',
            missing: 'Données de la pièce jointe indisponibles',
            opaque: 'Fichier binaire OLE original (téléchargement disponible)',
            download: 'Télécharger',
            preview: 'Aperçu',
            remove: 'Supprimer',
            failed: 'Impossible de lire la pièce jointe originale. Veuillez réessayer.',
            unsupported: 'L’aperçu de ce fichier est indisponible. Vous pouvez télécharger l’original.',
        },
        mobile: { close: 'Fermer', more: 'Plus' },
        'image-cropper': {
            error: 'Impossible de rogner des objets non image.',
        },
        objectListPanel: {
            title: 'Calques',
            empty: 'Aucun objet',
            showAll: 'Tout afficher',
            hideAll: 'Tout masquer',
            lockAll: 'Tout verrouiller',
            unlockAll: 'Tout déverrouiller',
            moveForward: 'Avancer',
            moveBackward: 'Reculer',
            close: 'Fermer',
            show: 'Afficher',
            hide: 'Masquer',
            lock: 'Verrouiller',
            unlock: 'Deverrouiller',
            lockHint: 'Verrouiller pour éviter une sélection accidentelle',
            unlockHint: 'Verrouillé. Cliquer pour déverrouiller',
            name: 'Nom',
            nameInput: 'Nom de l\'objet',
            description: 'Description',
            descriptionPlaceholder: 'Ajouter une description',
            details: 'Détails',
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
                cancel: 'Annuler',
                apply: 'Terminé',
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
            square: 'Carré',
            topAndBottom: 'Haut et bas',
            inline: 'Aligné avec le texte',
            behindText: 'Derrière le texte',
            inFrontText: 'Devant le texte',
        },
    },
};

export default locale;

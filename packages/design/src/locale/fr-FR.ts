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
    design: {
        Accessibility: {
            closeBadge: 'Fermer le badge',
            close: 'Fermer',
            previous: 'Précédent',
            next: 'Suivant',
            imageGallery: 'Galerie d’images',
            image: 'Image {0} sur {1}',
            zoomIn: 'Zoom avant',
            zoomOut: 'Zoom arrière',
            resetZoom: 'Réinitialiser le zoom',
            increment: 'Augmenter',
            decrement: 'Diminuer',
        },
        Confirm: {
            cancel: 'annuler',
            confirm: 'OK',
        },
        CascaderList: {
            empty: 'Aucun',
        },
        Calendar: {
            year: 'Année',
            weekDays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            months: [
                'Janvier',
                'Février',
                'Mars',
                'Avril',
                'Mai',
                'Juin',
                'Juillet',
                'Août',
                'Septembre',
                'Octobre',
                'Novembre',
                'Décembre',
            ],
            ariaLabels: {
                previousMonth: 'Mois précédent',
                nextMonth: 'Mois suivant',
                selectYear: 'Sélectionner l\'année',
                selectMonth: 'Sélectionner le mois',
            },
        },
        ColorPicker: {
            more: 'Plus de couleurs',
            cancel: 'annuler',
            confirm: 'OK',
        },
        GradientColorPicker: {
            linear: 'Linéaire',
            radial: 'Radial',
            angular: 'Angulaire',
            diamond: 'Diamant',
            offset: 'Décalage',
            angle: 'Angle',
            delete: 'Supprimer',
            transparency: 'Transparence',
        },
    },
};

export default locale;

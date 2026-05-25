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
    sheets: {
        tabs: {
            sheetCopy: '(Copie{0})',
            sheet: 'Feuille',
        },
        info: {
            overlappingSelections: 'Impossible d\'utiliser cette commande sur des sélections qui se chevauchent',
            acrossMergedCell: 'À travers une cellule fusionnée',
            partOfCell: 'Seule une partie d\'une cellule fusionnée est sélectionnée',
            hideSheet: 'Aucune feuille visible après avoir masqué celle-ci',
        },
        definedName: {
            nameEmpty: 'Le nom ne peut pas être vide',
            nameDuplicate: 'Le nom existe déjà',
            nameInvalid: 'Le nom est invalide',
            nameSheetConflict: 'Le nom entre en conflit avec le nom de la feuille',
            formulaOrRefStringEmpty: 'La formule ou la chaîne de référence ne peut pas être vide',
            nameConflict: 'Le nom entre en conflit avec le nom de la fonction',
            defaultName: 'NomDéfini',
        },
        permission: {
            dialog: {
                autoFillErr: 'La plage est protégée, et vous n\'avez pas la permission pour le remplissage automatique. Pour utiliser le remplissage automatique, veuillez contacter le créateur.',
                editErr: 'La plage est protégée, et vous n\'avez pas la permission de modifier. Pour modifier, veuillez contacter le créateur.',
                formulaErr: 'La plage ou la plage référencée est protégée, et vous n\'avez pas la permission de modifier. Pour modifier, veuillez contacter le créateur.',
                insertOrDeleteMoveRangeErr: 'La plage insérée ou supprimée intersecte la plage protégée, et cette opération n\'est pas supportée pour le moment.',
                insertRowColErr: 'La plage est protégée, et vous n\'avez pas la permission d\'insérer des lignes et des colonnes. Pour insérer des lignes et des colonnes, veuillez contacter le créateur.',
                moveRangeErr: 'La plage est protégée, et vous n\'avez pas la permission de déplacer la sélection. Pour déplacer la sélection, veuillez contacter le créateur.',
                moveRowColErr: 'La plage est protégée, et vous n\'avez pas la permission de déplacer les lignes et les colonnes. Pour déplacer les lignes et les colonnes, veuillez contacter le créateur.',
                operatorSheetErr: 'La feuille de calcul est protégée, et vous n\'avez pas la permission de travailler sur la feuille de calcul. Pour travailler sur la feuille de calcul, veuillez contacter le créateur.',
                removeRowColErr: 'La plage est protégée, et vous n\'avez pas la permission de supprimer les lignes et les colonnes. Pour supprimer les lignes et les colonnes, veuillez contacter le créateur.',
                setRowColStyleErr: 'La plage est protégée, et vous n\'avez pas la permission de définir les styles de ligne et de colonne. Pour définir les styles de ligne et de colonne, veuillez contacter le créateur.',
                setStyleErr: 'La plage est protégée, et vous n\'avez pas la permission de définir les styles. Pour définir les styles, veuillez contacter le créateur.',
            },
        },

        autoFill: {
            copy: 'Copier la cellule',
            series: 'Remplir la série',
            formatOnly: 'Format uniquement',
            noFormat: 'Aucun format',
        },
        merge: {
            confirm: {
                title: 'Continuer la fusion ne conservera que la valeur de la cellule en haut à gauche, en supprimant les autres valeurs. Êtes-vous sûr de vouloir continuer ?',
                cancel: 'Annuler la fusion',
                confirm: 'Continuer la fusion',
                warning: 'Avertissement',
                dismantleMergeCellWarning: 'Cela divisera certaines cellules fusionnées. Voulez-vous continuer ?',
            },
        },
    },
};

export default locale;

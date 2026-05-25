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
        },
        autoFill: {
            copy: 'Copier la cellule',
            series: 'Remplir la série',
            formatOnly: 'Format uniquement',
            noFormat: 'Aucun format',
        },
    },
};

export default locale;

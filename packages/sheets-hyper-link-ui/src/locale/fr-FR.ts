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

import type zhCN from './zh-CN';

const enUS: typeof zhCN = {
    hyperLink: {
        form: {
            editTitle: 'Modifier le lien',
            addTitle: 'Insérer un lien',
            label: 'Titre',
            type: 'Type',
            link: 'Lien',
            linkPlaceholder: 'Entrez le lien',
            range: 'Plage',
            worksheet: 'Feuille de calcul',
            definedName: 'Nom défini',
            ok: 'Confirmer',
            cancel: 'Annuler',
            labelPlaceholder: 'Entrez le titre',
            inputError: 'Veuillez entrer',
            selectError: 'Veuillez sélectionner',
            linkError: 'Veuillez entrer un lien valide',
        },
        menu: {
            add: 'Insérer un lien',
        },
        message: {
            noSheet: 'La feuille cible a été supprimée',
            refError: 'Plage invalide',
            hiddenSheet: 'Impossible d\'ouvrir le lien car la feuille liée est masquée',
            coped: 'Lien copié dans le presse-papiers',
        },
        popup: {
            copy: 'Copier le lien',
            edit: 'Modifier le lien',
            cancel: 'Annuler le lien',
        },
    },
};

export default enUS;

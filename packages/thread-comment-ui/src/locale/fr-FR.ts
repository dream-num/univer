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
    threadCommentUI: {
        panel: {
            title: 'Gestion des commentaires',
            empty: 'Pas encore de commentaires',
            filterEmpty: 'Aucun résultat correspondant',
            reset: 'Réinitialiser le filtre',
            addComment: 'Ajouter un commentaire',
            solved: 'Résolu',
        },
        editor: {
            placeholder: 'Répondre ou ajouter d\'autres avec @',
            reply: 'Commenter',
            cancel: 'Annuler',
            save: 'Enregistrer',
        },
        item: {
            edit: 'Modifier',
            delete: 'Supprimer ce commentaire',
        },
        filter: {
            sheet: {
                all: 'Toutes les feuilles',
                current: 'Feuille actuelle',
            },
            status: {
                all: 'Tous les commentaires',
                resolved: 'Résolu',
                unsolved: 'Non résolu',
                concernMe: 'Me concerne',
            },
        },
    },
};

export default enUS;

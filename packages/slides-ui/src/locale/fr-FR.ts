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
    slide: {
        append: 'Ajouter une diapositive',

        text: {
            insert: {
                title: 'Insérer du texte',
            },
        },

        shape: {
            insert: {
                title: 'Insérer une forme',
                rectangle: 'Insérer un rectangle',
            },
        },

        image: {
            insert: {
                title: 'Insérer une image',
                float: 'Insérer une image flottante',
            },
        },

        popup: {
            edit: 'Éditer',
            delete: 'Supprimer',
        },

        sidebar: {
            text: 'Éditer le texte',
            shape: 'Éditer la forme',
            image: 'Éditer l\'image',
        },

        panel: {
            fill: {
                title: 'Couleur de remplissage',
            },
        },
    },
};

export default locale;

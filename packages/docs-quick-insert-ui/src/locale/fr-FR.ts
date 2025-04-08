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
    docQuickInsert: {
        menu: {
            numberedList: 'Liste numérotée',
            bulletedList: 'Liste à puces',
            divider: 'Ligne de séparation',
            text: 'Texte',
            table: 'Tableau',
            image: 'Image',
        },
        group: {
            basics: 'Basiques',
        },
        placeholder: 'Aucun résultat',
        keywordInputPlaceholder: 'Entrez des mots clés',
    },
};

export default locale;

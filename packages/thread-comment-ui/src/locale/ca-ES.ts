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
    threadCommentUI: {
        panel: {
            title: 'Gestió de comentaris',
            empty: 'Encara no hi ha comentaris',
            filterEmpty: 'Cap resultat coincident',
            reset: 'Restableix el filtre',
            addComment: 'Afegeix un comentari',
            solved: 'Resolut',
        },
        editor: {
            placeholder: 'Respon o afegeix altres amb @',
            reply: 'Comenta',
            cancel: 'Cancel·la',
            save: 'Desa',
        },
        item: {
            edit: 'Edita',
            delete: 'Elimina aquest comentari',
        },
        filter: {
            sheet: {
                all: 'Tots els fulls',
                current: 'Full actual',
            },
            status: {
                all: 'Tots els comentaris',
                resolved: 'Resolts',
                unsolved: 'No resolts',
                concernMe: 'Em concerneix',
            },
        },
    },
};

export default locale;

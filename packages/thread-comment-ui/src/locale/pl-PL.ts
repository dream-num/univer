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
    'thread-comment-ui': {
        panel: {
            title: 'Zarządzanie komentarzami',
            empty: 'Brak komentarzy',
            filterEmpty: 'Brak wyników',
            reset: 'Resetuj filtr',
            addComment: 'Dodaj komentarz',
            solved: 'Rozwiązane',
        },
        editor: {
            placeholder: 'Odpowiedz lub dodaj innych za pomocą @',
            reply: 'Komentarz',
            cancel: 'Anuluj',
            save: 'Zapisz',
        },
        item: {
            edit: 'Edytuj',
            delete: 'Usuń ten komentarz',
        },
        filter: {
            sheet: {
                all: 'Wszystkie arkusze',
                current: 'Bieżący arkusz',
            },
            status: {
                all: 'Wszystkie komentarze',
                resolved: 'Rozwiązane',
                unsolved: 'Nierozwiązane',
                concernMe: 'Dotyczące mnie',
            },
        },
    },
};

export default locale;

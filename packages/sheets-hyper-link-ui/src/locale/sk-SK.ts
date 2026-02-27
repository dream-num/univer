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
    hyperLink: {
        form: {
            editTitle: 'Upraviť odkaz',
            addTitle: 'Vložiť odkaz',
            label: 'Popisok',
            type: 'Typ',
            link: 'Odkaz',
            linkPlaceholder: 'Zadajte odkaz',
            range: 'Rozsah',
            worksheet: 'Hárok',
            definedName: 'Definovaný názov',
            ok: 'Potvrdiť',
            cancel: 'Zrušiť',
            labelPlaceholder: 'Zadajte popisok',
            inputError: 'Zadajte hodnotu',
            selectError: 'Vyberte',
            linkError: 'Zadajte platný odkaz',
        },
        menu: {
            add: 'Vložiť odkaz',
        },
        message: {
            noSheet: 'Cieľový hárok bol odstránený',
            refError: 'Neplatný rozsah',
            hiddenSheet: 'Odkaz nie je možné otvoriť, pretože prepojený hárok je skrytý',
            coped: 'Odkaz skopírovaný do schránky',
        },
        popup: {
            copy: 'Kopírovať odkaz',
            edit: 'Upraviť odkaz',
            cancel: 'Zrušiť odkaz',
        },
    },
};

export default locale;

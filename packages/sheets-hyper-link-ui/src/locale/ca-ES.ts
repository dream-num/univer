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
            editTitle: 'Edita l\'enllaç',
            addTitle: 'Insereix enllaç',
            label: 'Etiqueta',
            type: 'Tipus',
            link: 'Enllaç',
            linkPlaceholder: 'Introdueix l\'enllaç',
            range: 'Interval',
            worksheet: 'Full de càlcul',
            definedName: 'Nom definit',
            ok: 'Confirmar',
            cancel: 'Cancel·lar',
            labelPlaceholder: 'Introdueix l\'etiqueta',
            inputError: 'Si us plau, introdueix',
            selectError: 'Si us plau, selecciona',
            linkError: 'Si us plau, introdueix un enllaç vàlid',
        },
        menu: {
            add: 'Insereix enllaç',
        },
        message: {
            noSheet: 'El full de destinació ha estat eliminat',
            refError: 'Interval no vàlid',
            hiddenSheet: 'No es pot obrir l\'enllaç perquè el full enllaçat està amagat',
            coped: 'Enllaç copiat al porta-retalls',
        },
        popup: {
            copy: 'Copia l\'enllaç',
            edit: 'Edita l\'enllaç',
            cancel: 'Cancel·la l\'enllaç',
        },
    },
};

export default locale;

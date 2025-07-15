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
    sheetImage: {
        title: 'Imatge',

        upload: {
            float: 'Imatge flotant',
            cell: 'Imatge de cel·la',
        },

        panel: {
            title: 'Edita la imatge',
        },
    },
    'image-popup': {
        replace: 'Reemplaça',
        delete: 'Elimina',
        edit: 'Edita',
        crop: 'Retalla',
        reset: 'Restableix la mida',
    },
    'drawing-anchor': {
        title: 'Propietats d’ancoratge',
        both: 'Mou i canvia la mida amb les cel·les',
        position: 'Mou però no canviïs la mida amb les cel·les',
        none: 'No moguis ni canviïs la mida amb les cel·les',
    },
    'update-status': {
        exceedMaxSize: 'La mida de la imatge supera el límit, el límit és {0}M',
        invalidImageType: 'Tipus d’imatge no vàlid',
        exceedMaxCount: 'Només es poden pujar {0} imatges alhora',
        invalidImage: 'Imatge no vàlida',
    },
    'cell-image': {
        pasteTitle: 'Enganxa com a imatge de cel·la',
        pasteContent: 'Enganxar una imatge de cel·la sobreescriurà el contingut existent de la cel·la, continuar enganxant',
        pasteError: 'La còpia i enganxat d’imatges de cel·la de full no està suportada en aquesta unitat',
    },
};

export default locale;

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
    'image-popup': {
        replace: 'Reemplaçar',
        delete: 'Eliminar',
        edit: 'Editar',
        crop: 'Retalla',
        reset: 'Restableix la mida',
    },
    'image-cropper': {
        error: 'No es poden retallar objectes que no siguin imatges.',
    },
    'image-panel': {
        arrange: {
            title: 'Organitza',
            forward: 'Porta endavant',
            backward: 'Envia enrere',
            front: 'Porta al davant',
            back: 'Envia al fons',
        },
        transform: {
            title: 'Transforma',
            rotate: 'Gira (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Amplada (px)',
            height: 'Alçada (px)',
            lock: 'Bloca proporció (%)',
        },
        crop: {
            title: 'Retalla',
            start: 'Inicia retallada',
            mode: 'Lliure',
        },
        group: {
            title: 'Agrupa',
            group: 'Agrupa',
            reGroup: 'Reagrupa',
            unGroup: 'Desagrupa',
        },
        align: {
            title: 'Alinea',
            default: 'Selecciona tipus d’alineació',
            left: 'Alinea a l’esquerra',
            center: 'Alinea al centre',
            right: 'Alinea a la dreta',
            top: 'Alinea a dalt',
            middle: 'Alinea al mig',
            bottom: 'Alinea a baix',
            horizon: 'Distribueix horitzontalment',
            vertical: 'Distribueix verticalment',
        },
        null: 'Cap objecte seleccionat',
    },
    'drawing-view': 'Dibuix',
    shortcut: {
        'drawing-move-down': 'Mou el dibuix cap avall',
        'drawing-move-up': 'Mou el dibuix cap amunt',
        'drawing-move-left': 'Mou el dibuix a l’esquerra',
        'drawing-move-right': 'Mou el dibuix a la dreta',
        'drawing-delete': 'Elimina el dibuix',
    },
};

export default locale;

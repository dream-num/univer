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
        replace: 'Nahradiť',
        delete: 'Odstrániť',
        edit: 'Upraviť',
        crop: 'Orezať',
        reset: 'Obnoviť veľkosť',
    },
    'image-cropper': {
        error: 'Nedá sa orezať neobrázkový objekt.',
    },
    'image-panel': {
        arrange: {
            title: 'Usporiadať',
            forward: 'Posunúť dopredu',
            backward: 'Posunúť dozadu',
            front: 'Presunúť do popredia',
            back: 'Presunúť do pozadia',
        },
        transform: {
            title: 'Transformovať',
            rotate: 'Otočiť (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Šírka (px)',
            height: 'Výška (px)',
            lock: 'Uzamknúť pomer (%)',
        },
        crop: {
            title: 'Orezanie',
            start: 'Začať orezanie',
            mode: 'Voľne',
        },
        group: {
            title: 'Zoskupiť',
            group: 'Zoskupiť',
            reGroup: 'Znovu zoskupiť',
            unGroup: 'Zrušiť zoskupenie',
        },
        align: {
            title: 'Zarovnať',
            default: 'Vyberte typ zarovnania',
            left: 'Zarovnať doľava',
            center: 'Zarovnať na stred',
            right: 'Zarovnať doprava',
            top: 'Zarovnať hore',
            middle: 'Zarovnať na stred',
            bottom: 'Zarovnať dole',
            horizon: 'Rozložiť vodorovne',
            vertical: 'Rozložiť zvisle',
        },
        null: 'Nie je vybraný žiadny objekt',
    },
    'drawing-view': 'Kresba',
    shortcut: {
        'drawing-move-down': 'Posunúť kresbu nadol',
        'drawing-move-up': 'Posunúť kresbu nahor',
        'drawing-move-left': 'Posunúť kresbu doľava',
        'drawing-move-right': 'Posunúť kresbu doprava',
        'drawing-delete': 'Odstrániť kresbu',
    },
};

export default locale;

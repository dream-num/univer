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
    'sheets-drawing-ui': {
        title: 'Obrázok',
        uploadLoading: {
            loading: 'Načítava sa..., zostáva',
        },

        upload: {
            float: 'Plávajúci obrázok',
            cell: 'Obrázok v bunke',
        },

        panel: {
            title: 'Upraviť obrázok',
        },

        save: {
            title: 'Uložiť obrázky buniek',
            menuLabel: 'Uložiť obrázky buniek',
            imageCount: 'Počet obrázkov',
            fileNameConfig: 'Názov súboru',
            useRowCol: 'Použiť adresu bunky (A1, B2...)',
            useColumnValue: 'Použiť hodnotu stĺpca',
            selectColumn: 'Vybrať stĺpec',
            cancel: 'Zrušiť',
            confirm: 'Uložiť',
            saving: 'Ukladá sa...',
            error: 'Nepodarilo sa uložiť obrázky buniek',
        },
        'image-popup': {
            replace: 'Nahradiť',
            delete: 'Odstrániť',
            edit: 'Upraviť',
            crop: 'Orezať',
            reset: 'Obnoviť veľkosť',
            flipH: 'Prevrátiť vodorovne',
            flipV: 'Prevrátiť zvisle',
        },
        'update-status': {
            exceedMaxSize: 'Veľkosť obrázka prekračuje limit, limit je {0}M',
            invalidImageType: 'Neplatný typ obrázka',
            exceedMaxCount: 'Naraz možno nahrať iba {0} obrázkov',
            invalidImage: 'Neplatný obrázok',
        },
        'drawing-anchor': {
            title: 'Vlastnosti ukotvenia',
            both: 'Presúvať a meniť veľkosť s bunkami',
            position: 'Presúvať, ale nemeniť veľkosť s bunkami',
            none: 'Nepresúvať ani nemeniť veľkosť s bunkami',
        },
        'cell-image': {
            pasteTitle: 'Prilepiť ako obrázok bunky',
            pasteContent: 'Prilepením obrázka bunky sa prepíše existujúci obsah bunky, pokračovať',
            pasteError: 'Kopírovanie a prilepovanie obrázkov buniek v tomto module nie je podporované',
        },
        permission: {
            dialog: {
                editErr: 'Rozsah je chránený a nemáte oprávnenie na úpravy. Ak chcete upravovať, kontaktujte autora.',
            },
        },
        shortcut: {
            'drawing-view': 'Zobrazenie kresby',
            'drawing-move-down': 'Posunúť kresbu nadol',
            'drawing-move-up': 'Posunúť kresbu nahor',
            'drawing-move-left': 'Posunúť kresbu doľava',
            'drawing-move-right': 'Posunúť kresbu doprava',
            'drawing-delete': 'Odstrániť kresbu',
        },
    },
};

export default locale;

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
    docImage: {
        title: 'Obrázok',

        upload: {
            float: 'Vložiť obrázok',
        },

        panel: {
            title: 'Upraviť obrázok',
        },
    },
    'image-popup': {
        replace: 'Nahradiť',
        delete: 'Odstrániť',
        edit: 'Upraviť',
        crop: 'Orezať',
        reset: 'Obnoviť veľkosť',
    },
    'image-text-wrap': {
        title: 'Obtekanie textu',
        wrappingStyle: 'Štýl obtekania',
        square: 'Obdĺžnikové',
        topAndBottom: 'Hore a dole',
        inline: 'V riadku s textom',
        behindText: 'Za textom',
        inFrontText: 'Pred textom',
        wrapText: 'Obtekať text',
        bothSide: 'Obe strany',
        leftOnly: 'Len ľavá',
        rightOnly: 'Len pravá',
        distanceFromText: 'Vzdialenosť od textu',
        top: 'Hore (px)',
        left: 'Vľavo (px)',
        bottom: 'Dole (px)',
        right: 'Vpravo (px)',
    },
    'image-position': {
        title: 'Pozícia',
        horizontal: 'Vodorovne',
        vertical: 'Zvisle',
        absolutePosition: 'Absolútna pozícia (px)',
        relativePosition: 'Relatívna pozícia',
        toTheRightOf: 'vpravo od',
        relativeTo: 'vzhľadom na',
        bellow: 'pod',
        options: 'Možnosti',
        moveObjectWithText: 'Presunúť objekt s textom',
        column: 'Stĺpec',
        margin: 'Okraj',
        page: 'Strana',
        line: 'Riadok',
        paragraph: 'Odsek',
    },
    'update-status': {
        exceedMaxSize: 'Veľkosť obrázka prekračuje limit, limit je {0}M',
        invalidImageType: 'Neplatný typ obrázka',
        exceedMaxCount: 'Naraz možno nahrať iba {0} obrázkov',
        invalidImage: 'Neplatný obrázok',
    },
};

export default locale;

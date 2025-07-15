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
        title: 'Imatge',

        upload: {
            float: 'Insereix imatge',
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
    'image-text-wrap': {
        title: 'Ajust del text',
        wrappingStyle: 'Estil d\'ajust',
        square: 'Quadrat',
        topAndBottom: 'A dalt i a baix',
        inline: 'En línia amb el text',
        behindText: 'Darrere del text',
        inFrontText: 'Davant del text',
        wrapText: 'Ajusta el text',
        bothSide: 'Ambdós costats',
        leftOnly: 'Només esquerra',
        rightOnly: 'Només dreta',
        distanceFromText: 'Distància del text',
        top: 'A dalt(px)',
        left: 'Esquerra(px)',
        bottom: 'A baix(px)',
        right: 'Dreta(px)',
    },
    'image-position': {
        title: 'Posició',
        horizontal: 'Horitzontal',
        vertical: 'Vertical',
        absolutePosition: 'Posició absoluta(px)',
        relativePosition: 'Posició relativa',
        toTheRightOf: 'a la dreta de',
        relativeTo: 'relatiu a',
        bellow: 'a sota',
        options: 'Opcions',
        moveObjectWithText: 'Mou l\'objecte amb el text',
        column: 'Columna',
        margin: 'Marge',
        page: 'Pàgina',
        line: 'Línia',
        paragraph: 'Paràgraf',
    },
    'update-status': {
        exceedMaxSize: 'La mida de la imatge supera el límit, el límit és {0}M',
        invalidImageType: 'Tipus d\'imatge no vàlid',
        exceedMaxCount: 'Només es poden pujar {0} imatges alhora',
        invalidImage: 'Imatge no vàlida',
    },
};

export default locale;

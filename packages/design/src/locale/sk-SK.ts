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
    design: {
        Accessibility: {
            closeBadge: 'Zavrieť odznak',
            imageGallery: 'Galéria obrázkov',
            image: 'Obrázok {0} z {1}',
            zoomIn: 'Priblížiť',
            zoomOut: 'Oddialiť',
            resetZoom: 'Obnoviť priblíženie',
            increment: 'Zvýšiť',
            decrement: 'Znížiť',
        },
        Confirm: {
            cancel: 'zrušiť',
            confirm: 'ok',
        },
        CascaderList: {
            empty: 'Žiadne',
        },
        Calendar: {
            year: '',
            weekDays: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'],
            months: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'Máj',
                'Jún',
                'Júl',
                'Aug',
                'Sep',
                'Okt',
                'Nov',
                'Dec',
            ],
            ariaLabels: {
                previousMonth: 'Predchádzajúci mesiac',
                nextMonth: 'Nasledujúci mesiac',
                selectYear: 'Vybrať rok',
                selectMonth: 'Vybrať mesiac',
            },
        },
        Select: {
            empty: 'Žiadne',
        },
        ColorPicker: {
            more: 'Viac farieb',
            cancel: 'zrušiť',
            confirm: 'ok',
        },
        GradientColorPicker: {
            linear: 'Lineárny',
            radial: 'Radiálny',
            angular: 'Uhlový',
            diamond: 'Diamantový',
            offset: 'Posun',
            angle: 'Uhol',
            flip: 'Prevrátiť',
            delete: 'Odstrániť',
            transparency: 'Priehľadnosť',
        },
    },
};

export default locale;

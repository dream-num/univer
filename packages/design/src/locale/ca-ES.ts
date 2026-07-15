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
            closeBadge: 'Tanca la insígnia',
            imageGallery: 'Galeria d’imatges',
            image: 'Imatge {0} de {1}',
            zoomIn: 'Apropa',
            zoomOut: 'Allunya',
            resetZoom: 'Restableix el zoom',
            increment: 'Incrementa',
            decrement: 'Disminueix',
        },
        Confirm: {
            cancel: 'cancel·la',
            confirm: 'ok',
        },
        CascaderList: {
            empty: 'Cap',
        },
        Calendar: {
            year: '',
            weekDays: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
            months: [
                'gener',
                'febrer',
                'març',
                'abril',
                'maig',
                'juny',
                'juliol',
                'agost',
                'setembre',
                'octubre',
                'novembre',
                'desembre',
            ],
            ariaLabels: {
                previousMonth: 'Mes anterior',
                nextMonth: 'Mes següent',
                selectYear: 'Selecciona l\'any',
                selectMonth: 'Selecciona el mes',
            },
        },
        Select: {
            empty: 'Cap',
        },
        ColorPicker: {
            more: 'Més colors',
            cancel: 'cancel·la',
            confirm: 'ok',
        },
        GradientColorPicker: {
            linear: 'Lineal',
            radial: 'Radial',
            angular: 'Angular',
            diamond: 'Diamant',
            offset: 'Desplaçament',
            angle: 'Angle',
            flip: 'Girar',
            delete: 'Eliminar',
            transparency: 'Transparència',
        },
    },
};

export default locale;

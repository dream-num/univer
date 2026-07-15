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
            closeBadge: 'Cerrar insignia',
            imageGallery: 'Galería de imágenes',
            image: 'Imagen {0} de {1}',
            zoomIn: 'Acercar',
            zoomOut: 'Alejar',
            resetZoom: 'Restablecer zoom',
            increment: 'Incrementar',
            decrement: 'Disminuir',
        },
        Confirm: {
            cancel: 'Cancelar',
            confirm: 'Aceptar',
        },
        CascaderList: {
            empty: 'Cap',
        },
        Calendar: {
            year: '',
            weekDays: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
            months: [
                'Gener',
                'Febrer',
                'Març',
                'Abril',
                'Maig',
                'Juny',
                'Juliol',
                'Agost',
                'Setembre',
                'Octubre',
                'Novembre',
                'Desembre',
            ],
            ariaLabels: {
                previousMonth: 'Mes anterior',
                nextMonth: 'Mes siguiente',
                selectYear: 'Seleccionar año',
                selectMonth: 'Seleccionar mes',
            },
        },
        Select: {
            empty: 'Cap',
        },
        ColorPicker: {
            more: 'Más colores',
            cancel: 'Cancelar',
            confirm: 'Aceptar',
        },
        GradientColorPicker: {
            linear: 'Lineal',
            radial: 'Radial',
            angular: 'Angular',
            diamond: 'Diamante',
            offset: 'Desplazamiento',
            angle: 'Ángulo',
            flip: 'Invertir',
            delete: 'Eliminar',
            transparency: 'Transparencia',
        },
    },
};

export default locale;

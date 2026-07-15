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
            closeBadge: 'Badge schließen',
            imageGallery: 'Bildergalerie',
            image: 'Bild {0} von {1}',
            zoomIn: 'Vergrößern',
            zoomOut: 'Verkleinern',
            resetZoom: 'Zoom zurücksetzen',
            increment: 'Erhöhen',
            decrement: 'Verringern',
        },
        Confirm: {
            cancel: 'Abbrechen',
            confirm: 'OK',
        },
        CascaderList: {
            empty: 'Keine',
        },
        Calendar: {
            year: '',
            weekDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            months: [
                'Jan',
                'Feb',
                'Mär',
                'Apr',
                'Mai',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Okt',
                'Nov',
                'Dez',
            ],
            ariaLabels: {
                previousMonth: 'Vorheriger Monat',
                nextMonth: 'Nächster Monat',
                selectYear: 'Jahr auswählen',
                selectMonth: 'Monat auswählen',
            },
        },
        Select: {
            empty: 'Keine',
        },
        ColorPicker: {
            more: 'Mehr Farben',
            cancel: 'Abbrechen',
            confirm: 'OK',
        },
        GradientColorPicker: {
            linear: 'Linear',
            radial: 'Radial',
            angular: 'Winkel',
            diamond: 'Diamant',
            offset: 'Versatz',
            angle: 'Winkel',
            flip: 'Umkehren',
            delete: 'Löschen',
            transparency: 'Transparenz',
        },
    },
};

export default locale;

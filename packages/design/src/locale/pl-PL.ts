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
            closeBadge: 'Zamknij plakietkę',
            close: 'Zamknij',
            previous: 'Poprzedni',
            next: 'Następny',
            imageGallery: 'Galeria obrazów',
            image: 'Obraz {0} z {1}',
            zoomIn: 'Powiększ',
            zoomOut: 'Pomniejsz',
            resetZoom: 'Resetuj powiększenie',
            increment: 'Zwiększ',
            decrement: 'Zmniejsz',
        },
        Confirm: {
            cancel: 'anuluj',
            confirm: 'OK',
        },
        CascaderList: {
            empty: 'Brak',
        },
        Calendar: {
            year: 'Rok',
            weekDays: ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'so'],
            months: [
                'sty',
                'lut',
                'mar',
                'kwi',
                'maj',
                'cze',
                'lip',
                'sie',
                'wrz',
                'paź',
                'lis',
                'gru',
            ],
            ariaLabels: {
                previousMonth: 'Poprzedni miesiąc',
                nextMonth: 'Następny miesiąc',
                selectYear: 'Wybierz rok',
                selectMonth: 'Wybierz miesiąc',
            },
        },
        ColorPicker: {
            more: 'Więcej kolorów',
            cancel: 'anuluj',
            confirm: 'OK',
        },
        GradientColorPicker: {
            linear: 'Liniowy',
            radial: 'Radialny',
            angular: 'Kątowy',
            diamond: 'Diamentowy',
            offset: 'Przesunięcie',
            angle: 'Kąt',
            delete: 'Usuń',
            transparency: 'Przezroczystość',
        },
    },
};

export default locale;

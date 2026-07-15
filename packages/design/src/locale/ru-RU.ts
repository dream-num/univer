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
            closeBadge: 'Закрыть метку',
            imageGallery: 'Галерея изображений',
            image: 'Изображение {0} из {1}',
            zoomIn: 'Увеличить',
            zoomOut: 'Уменьшить',
            resetZoom: 'Сбросить масштаб',
            increment: 'Увеличить значение',
            decrement: 'Уменьшить значение',
        },
        Confirm: {
            cancel: 'отмена',
            confirm: 'ок',
        },
        CascaderList: {
            empty: 'Нет',
        },
        Select: {
            empty: 'Нет',
        },
        Calendar: {
            year: '',
            weekDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            months: [
                'Январь',
                'Февраль',
                'Март',
                'Апрель',
                'Май',
                'Июнь',
                'Июль',
                'Август',
                'Сентябрь',
                'Октябрь',
                'Ноябрь',
                'Декабрь',
            ],
            ariaLabels: {
                previousMonth: 'Предыдущий месяц',
                nextMonth: 'Следующий месяц',
                selectYear: 'Выбрать год',
                selectMonth: 'Выбрать месяц',
            },
        },
        ColorPicker: {
            more: 'Больше цветов',
            cancel: 'отмена',
            confirm: 'ок',
        },
        GradientColorPicker: {
            linear: 'линейный',
            radial: 'радиальный',
            angular: 'угловой',
            diamond: 'ромбовидный',
            offset: 'смещение',
            angle: 'угол',
            flip: 'перевернуть',
            delete: 'удалить',
            transparency: 'прозрачность',
        },
    },
};

export default locale;

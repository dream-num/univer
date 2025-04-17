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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'image-popup': {
        replace: 'Заменить',
        delete: 'Удалить',
        edit: 'Редактировать',
        crop: 'Обрезать',
        reset: 'Сбросить размер',
    },
    'image-cropper': {
        error: 'Невозможно обрезать не изображения.',
    },
    'image-panel': {
        arrange: {
            title: 'Расположение',
            forward: 'Переместить вперёд',
            backward: 'Переместить назад',
            front: 'На передний план',
            back: 'На задний план',
        },
        transform: {
            title: 'Трансформация',
            rotate: 'Повернуть (°)',
            x: 'X (пкс)',
            y: 'Y (пкс)',
            width: 'Ширина (пкс)',
            height: 'Высота (пкс)',
            lock: 'Заблокировать пропорции (%)',
        },
        crop: {
            title: 'Обрезка',
            start: 'Начать обрезку',
            mode: 'Свободный',
        },
        group: {
            title: 'Группировка',
            group: 'Сгруппировать',
            reGroup: 'Перегруппировать',
            unGroup: 'Разгруппировать',
        },
        align: {
            title: 'Выравнивание',
            default: 'Выберите тип выравнивания',
            left: 'Выровнять по левому краю',
            center: 'Выровнять по центру',
            right: 'Выровнять по правому краю',
            top: 'Выровнять по верхнему краю',
            middle: 'Выровнять посередине',
            bottom: 'Выровнять по нижнему краю',
            horizon: 'Распределить горизонтально',
            vertical: 'Распределить вертикально',
        },
        null: 'Нет выбранных объектов',
    },
    'drawing-view': 'Drawing',
    shortcut: {
        'drawing-move-down': 'Move Drawing down',
        'drawing-move-up': 'Move Drawing up',
        'drawing-move-left': 'Move Drawing left',
        'drawing-move-right': 'Move Drawing right',
        'drawing-delete': 'Delete Drawing',
    },
};

export default locale;

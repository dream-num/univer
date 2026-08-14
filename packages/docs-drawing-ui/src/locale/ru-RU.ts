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
    'docs-drawing-ui': {
        title: 'Изображение',
        upload: {
            float: 'Вставить изображение',
        },
        shape: {
            insert: {
                title: 'Вставить фигуру',
                rectangle: 'Вставить прямоугольник',
                ellipse: 'Вставить эллипс',
            },
        },
        panel: {
            title: 'Редактировать изображение',
        },
        'image-popup': {
            delete: 'Удалить',
            edit: 'Редактировать',
            crop: 'Обрезать',
            reset: 'Сбросить размер',
        },
        'image-text-wrap': {
            title: 'Обтекание текстом',
            wrappingStyle: 'Стиль обтекания',
            square: 'Квадрат',
            topAndBottom: 'Сверху и снизу',
            inline: 'В тексте',
            behindText: 'За текстом',
            inFrontText: 'Перед текстом',
            wrapText: 'Обтекание текстом',
            bothSide: 'С обеих сторон',
            leftOnly: 'Только слева',
            rightOnly: 'Только справа',
            distanceFromText: 'Расстояние от текста',
            top: 'Сверху (px)',
            left: 'Слева (px)',
            bottom: 'Снизу (px)',
            right: 'Справа (px)',
        },
        'image-position': {
            title: 'Положение',
            horizontal: 'По горизонтали',
            vertical: 'По вертикали',
            absolutePosition: 'Абсолютное положение (px)',
            toTheRightOf: 'справа от',
            bellow: 'снизу',
            options: 'Параметры',
            moveObjectWithText: 'Перемещать объект с текстом',
            column: 'Колонка',
            margin: 'Поле',
            page: 'Страница',
            line: 'Строка',
            paragraph: 'Абзац',
        },
        'update-status': {
            exceedMaxSize: 'Размер изображения превышает лимит, лимит составляет {0}М',
            invalidImageType: 'Недопустимый тип изображения',
            exceedMaxCount: 'За один раз можно загрузить только {0} изображений',
            invalidImage: 'Недопустимое изображение',
        },
        shortcut: {
            'drawing-view': 'Вид изображения',
            'drawing-move-down': 'Переместить изображение вниз',
            'drawing-move-up': 'Переместить изображение вверх',
            'drawing-move-left': 'Переместить изображение влево',
            'drawing-move-right': 'Переместить изображение вправо',
            'drawing-delete': 'Удалить изображение',
        },
    },
};

export default locale;

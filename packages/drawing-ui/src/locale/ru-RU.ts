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
    'drawing-ui': {
        'image-cropper': {
            error: 'Невозможно обрезать не изображения.',
        },
        objectListPanel: {
            title: 'Объекты',
            empty: 'Нет объектов',
            showAll: 'Показать все',
            hideAll: 'Скрыть все',
            moveForward: 'Переместить вперед',
            moveBackward: 'Переместить назад',
            close: 'Закрыть',
            show: 'Показать',
            hide: 'Скрыть',
            lock: 'Заблокировать',
            unlock: 'Разблокировать',
            name: 'Имя',
            nameInput: 'Имя объекта',
            description: 'Описание',
            descriptionPlaceholder: 'Добавить описание',
            details: 'Сведения',
            locate: 'Найти',
            expand: 'Развернуть',
            collapse: 'Свернуть',
            dragToReorder: 'Перетащите, чтобы изменить порядок',
            search: 'Поиск объектов',
            filterAll: 'Все',
            filterHidden: 'Скрытые',
            filterLocked: 'Заблокированные',
            sectionCanvas: 'Слой холста',
            sectionFloating: 'Плавающий слой',
            typeNames: {
                object: 'Объект',
                shape: 'Фигура',
                connector: 'Соединитель',
                image: 'Изображение',
                chart: 'Диаграмма',
                table: 'Таблица',
                smartArt: 'SmartArt',
                video: 'Видео',
                group: 'Группа',
                unit: 'Единица',
                dom: 'DOM',
                text: 'Текст',
                placeholder: 'Заполнитель',
                container: 'Контейнер',
            },
            noSelection: 'Выберите объект, чтобы изменить сведения',
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
        'image-text-wrap': {
            title: 'Text Wrapping',
            wrappingStyle: 'Wrapping Style',
            square: 'Square',
            topAndBottom: 'Top and Bottom',
            inline: 'In line with text',
            behindText: 'Behind text',
            inFrontText: 'In front of text',
            wrapText: 'Wrap text',
            bothSide: 'Both sides',
            leftOnly: 'Left only',
            rightOnly: 'Right only',
            distanceFromText: 'Distance from text',
            top: 'Top(px)',
            left: 'Left(px)',
            bottom: 'Bottom(px)',
            right: 'Right(px)',
        },
        'image-popup': {
            replace: 'Заменить',
            delete: 'Удалить',
            edit: 'Редактировать',
            crop: 'Обрезать',
            reset: 'Сбросить размер',
        },
    },
};

export default locale;

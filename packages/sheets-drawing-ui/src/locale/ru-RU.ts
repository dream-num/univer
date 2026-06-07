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
    'sheets-drawing-ui': {
        title: 'Изображение',
        uploadLoading: {
            loading: 'Загрузка...',
        },

        upload: {
            float: 'Плавающее изображение',
            cell: 'Изображение в ячейке',
        },

        panel: {
            title: 'Редактировать изображение',
        },

        save: {
            title: 'Сохранить изображения ячеек',
            menuLabel: 'Сохранить изображения ячеек',
            imageCount: 'Количество изображений',
            fileNameConfig: 'Имя файла',
            useRowCol: 'Использовать адрес ячейки (A1, B2...)',
            useColumnValue: 'Использовать значение столбца',
            selectColumn: 'Выбрать столбец',
            cancel: 'Отмена',
            confirm: 'Сохранить',
            saving: 'Сохранение...',
            error: 'Не удалось сохранить изображения ячеек',
        },
        'image-popup': {
            replace: 'Заменить',
            delete: 'Удалить',
            edit: 'Редактировать',
            crop: 'Обрезать',
            reset: 'Сбросить размер',
            flipH: 'Отразить по горизонтали',
            flipV: 'Отразить по вертикали',
        },
        'update-status': {
            exceedMaxSize: 'Размер изображения превышает лимит, лимит составляет {0}М',
            invalidImageType: 'Недопустимый тип изображения',
            exceedMaxCount: 'За один раз можно загрузить только {0} изображений',
            invalidImage: 'Недопустимое изображение',
        },
        'drawing-anchor': {
            title: 'Свойства привязки',
            both: 'Перемещать и изменять размер с ячейками',
            position: 'Перемещать, но не изменять размер с ячейками',
            none: 'Не перемещать и не изменять размер с ячейками',
        },
        'cell-image': {
            pasteTitle: 'Вставить как изображение ячейки',
            pasteContent: 'Вставка изображения ячейки перезапишет существующее содержимое ячейки, продолжить вставку',
            pasteError: 'Копирование и вставка изображения ячейки не поддерживается в этом блоке',
        },
        permission: {
            dialog: {
                editErr: 'Диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
            },
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

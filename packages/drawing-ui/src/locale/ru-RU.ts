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
        ole: {
            progressReading: 'Чтение вложения…',
            progressUploading: 'Загрузка вложения…',
            progressCreating: 'Создание онлайн-файла…',
            progressSaving: 'Сохранение ссылки…',
            externalAttachment: 'Связанное вложение',
            externalHint: 'Исходный файл этого вложения не встроен в документ. Просмотр и скачивание недоступны.',
            missingHint: 'В документе отсутствуют данные этого вложения. Просмотр и скачивание недоступны.',
            unavailableSummary: 'В документе есть недоступные вложения: {0}. Их места сохранены. Наведите указатель на значок предупреждения, чтобы узнать причину.',
            rename: 'Переименовать',
            saveName: 'Сохранить имя',
            cancel: 'Отмена',
            invalidName: 'Введите допустимое имя файла длиной до 255 символов.',
            renameFailed: 'Не удалось переименовать вложение. Повторите попытку.',
            actions: 'Действия с вложением',
            linkSaveFailed: 'Онлайн-файл создан, но ссылка не сохранена. Повторите сохранение ссылки.',
            conversionFailed: 'Не удалось преобразовать вложение. Повторите попытку.',
            converted: 'Преобразование завершено. Онлайн-файл можно открыть в новой вкладке.',
            converting: 'Преобразование…',
            openSlide: 'Открыть онлайн-презентацию в новой вкладке',
            openDoc: 'Открыть онлайн-документ в новой вкладке',
            openSheet: 'Открыть онлайн-таблицу в новой вкладке',
            convertSlide: 'Преобразовать в онлайн-презентацию',
            convertDoc: 'Преобразовать в онлайн-документ',
            convertSheet: 'Преобразовать в онлайн-таблицу',
            nativePreviewHint: 'Если браузер не может отобразить файл, скачайте оригинал.',
            attachment: 'Вложение OLE',
            external: 'Внешний файл недоступен',
            missing: 'Данные вложения недоступны',
            opaque: 'Исходный двоичный файл OLE (доступен для скачивания)',
            download: 'Скачать',
            preview: 'Предпросмотр',
            remove: 'Удалить',
            failed: 'Не удалось прочитать исходное вложение. Повторите попытку.',
            unsupported: 'Предпросмотр этого файла недоступен. Вы можете скачать оригинал.',
        },
        mobile: { close: 'Закрыть', more: 'Больше' },
        'image-cropper': {
            error: 'Невозможно обрезать не изображения.',
        },
        objectListPanel: {
            title: 'Слои',
            empty: 'Нет объектов',
            showAll: 'Показать все',
            hideAll: 'Скрыть все',
            lockAll: 'Заблокировать всё',
            unlockAll: 'Разблокировать всё',
            moveForward: 'Переместить вперед',
            moveBackward: 'Переместить назад',
            close: 'Закрыть',
            show: 'Показать',
            hide: 'Скрыть',
            lock: 'Заблокировать',
            unlock: 'Разблокировать',
            lockHint: 'Заблокировать для защиты от случайного выбора',
            unlockHint: 'Заблокировано. Нажмите, чтобы разблокировать',
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
                cancel: 'Отмена',
                apply: 'Готово',
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
            square: 'Вокруг рамки',
            topAndBottom: 'Сверху и снизу',
            inline: 'В тексте',
            behindText: 'За текстом',
            inFrontText: 'Перед текстом',
        },
    },
};

export default locale;

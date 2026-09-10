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
    'docs-toc-ui': {
        tableOfContents: {
            title: 'Оглавление',
            insertTitle: 'Оглавление',
            automaticTitle: 'Автособираемое оглавление',
            customTitle: 'Настраиваемое оглавление…',
            contentsTitle: 'Содержание',
            levels: 'Показать уровни',
            showPageNumbers: 'Показать номера страниц',
            rightAlignPageNumbers: 'Номера страниц по правому краю',
            tabLeader: 'Заполнитель',
            leaderNone: 'Нет',
            leaderDots: 'Точки',
            leaderDashes: 'Тире',
            leaderUnderline: 'Подчёркивание',
            format: 'Форматы',
            formatFromTemplate: 'Из шаблона',
            formatClassic: 'Классический',
            formatModern: 'Современный',
            formatSimple: 'Простой',
            preview: 'Предварительный просмотр',
            previewHeading: 'Заголовок',
            noHeadings: 'Заголовки не найдены. Примените стили «Заголовок 1–3» или выберите соответствующие уровни.',
            updateTitle: 'Обновить оглавление',
            removeTitle: 'Удалить оглавление',
            updatePageNumbersOnly: 'Обновить только номера страниц',
            updateEntireTable: 'Обновить целиком',
            updateHint: 'Выберите способ обновления оглавления.',
        },
    },
};

export default locale;

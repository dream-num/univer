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
    'univer-watermark': {
        title: 'Водяной знак',
        type: 'Тип',
        text: 'Текст',
        image: 'Изображение',
        uploadImage: 'Загрузить изображение',
        replaceImage: 'Заменить изображение',
        keepRatio: 'Сохранить пропорции',
        width: 'Ширина',
        height: 'Высота',
        style: 'Настройки стиля',
        content: 'Содержание',
        textPlaceholder: 'Введите текст',
        fontSize: 'Размер шрифта',
        direction: 'Направление',
        ltr: 'Слева направо',
        rtl: 'Справа налево',
        inherits: 'Наследовать',
        opacity: 'Прозрачность',
        layout: 'Настройки макета',
        rotate: 'Поворот',
        repeat: 'Повтор',
        spacingX: 'Горизонтальный интервал',
        spacingY: 'Вертикальный интервал',
        startX: 'Горизонтальная начальная позиция',
        startY: 'Вертикальная начальная позиция',

        cancel: 'Отменить водяной знак',
        close: 'Закрыть панель',
        copy: 'Копировать конфигурацию',
    },
};

export default locale;

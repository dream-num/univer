/**
 * Copyright 2023-present DreamNum Inc.
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
    docImage: {
        title: 'Изображение',

        upload: {
            float: 'Вставить изображение',
        },

        panel: {
            title: 'Редактировать изображение',
        },
    },
    'image-popup': {
        replace: 'Заменить',
        delete: 'Удалить',
        edit: 'Редактировать',
        crop: 'Обрезать',
        reset: 'Сбросить размер',
    },
    'update-status': {
        exceedMaxSize: 'Размер изображения превышает лимит, лимит составляет {0}М',
        invalidImageType: 'Недопустимый тип изображения',
        exceedMaxCount: 'За один раз можно загрузить только {0} изображений',
        invalidImage: 'Недопустимое изображение',
    },
};

export default locale;

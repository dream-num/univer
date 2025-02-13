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

const enUS: typeof zhCN = {
    hyperLink: {
        form: {
            editTitle: 'Редактировать ссылку',
            addTitle: 'Вставить ссылку',
            label: 'Метка',
            type: 'Тип',
            link: 'Ссылка',
            linkPlaceholder: 'Введите ссылку',
            range: 'Диапазон',
            worksheet: 'Лист',
            definedName: 'Определенное имя',
            ok: 'ОК',
            cancel: 'Отмена',
            labelPlaceholder: 'Введите метку',
            inputError: 'Пожалуйста, введите',
            selectError: 'Пожалуйста, выберите',
            linkError: 'Пожалуйста, введите корректную ссылку',
        },
        menu: {
            add: 'Вставить ссылку',
        },
        message: {
            noSheet: 'Целевой лист был удален',
            refError: 'Недопустимый диапазон',
            hiddenSheet: 'Невозможно открыть ссылку, так как связанный лист скрыт',
            coped: 'Ссылка скопирована в буфер обмена',
        },
        popup: {
            copy: 'Копировать ссылку',
            edit: 'Редактировать ссылку',
            cancel: 'Отменить ссылку',
        },
    },
};

export default enUS;

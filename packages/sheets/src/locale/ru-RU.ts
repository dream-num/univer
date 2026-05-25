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
    sheets: {
        tabs: {
            sheetCopy: '(Копия{0})',
            sheet: 'Лист',
        },
        info: {
            overlappingSelections: 'Невозможно использовать эту команду на пересекающихся выделениях',
            acrossMergedCell: 'Через объединенную ячейку',
            partOfCell: 'Выделена только часть объединенной ячейки',
            hideSheet: 'После скрытия этого листа не будет видно ни одного листа',
        },
        definedName: {
            nameEmpty: 'Имя не может быть пустым',
            nameDuplicate: 'Имя уже существует',
            nameInvalid: 'Недопустимое имя',
            nameSheetConflict: 'Имя конфликтует с именем листа',
            formulaOrRefStringEmpty: 'Формула или ссылочная строка не может быть пустой',
            nameConflict: 'Имя конфликтует с именем функции',
        },
        autoFill: {
            copy: 'Копировать ячейку',
            series: 'Заполнить ряд',
            formatOnly: 'Только формат',
            noFormat: 'Без формата',
        },
    },
};

export default locale;

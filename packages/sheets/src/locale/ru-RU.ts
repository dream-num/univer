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
            defaultName: 'ОпределенноеИмя',
        },
        permission: {
            dialog: {
                autoFillErr: 'Диапазон защищен, и у вас нет разрешения на автозаполнение. Для использования автозаполнения свяжитесь с создателем.',
                editErr: 'Диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
                formulaErr: 'Диапазон или ссылочный диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
                insertOrDeleteMoveRangeErr: 'Вставленный или удаленный диапазон пересекается с защищенным диапазоном, и эта операция в настоящее время не поддерживается.',
                insertRowColErr: 'Диапазон защищен, и у вас нет разрешения на вставку строк и столбцов. Для вставки строк и столбцов свяжитесь с создателем.',
                moveRangeErr: 'Диапазон защищен, и у вас нет разрешения на перемещение выделения. Для перемещения выделения свяжитесь с создателем.',
                moveRowColErr: 'Диапазон защищен, и у вас нет разрешения на перемещение строк и столбцов. Для перемещения строк и столбцов свяжитесь с создателем.',
                operatorSheetErr: 'Лист защищен, и у вас нет разрешения на операции с листом. Для операций с листом свяжитесь с создателем.',
                removeRowColErr: 'Диапазон защищен, и у вас нет разрешения на удаление строк и столбцов. Для удаления строк и столбцов свяжитесь с создателем.',
                setRowColStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей строк и столбцов. Для установки стилей строк и столбцов свяжитесь с создателем.',
                setStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей. Для установки стилей свяжитесь с создателем.',
            },
        },
        autoFill: {
            copy: 'Копировать ячейку',
            series: 'Заполнить ряд',
            formatOnly: 'Только формат',
            noFormat: 'Без формата',
        },
        merge: {
            confirm: {
                title: 'Продолжение объединения сохранит только значение верхней левой ячейки, остальные значения будут удалены. Вы уверены, что хотите продолжить?',
                cancel: 'Отменить объединение',
                confirm: 'Продолжить объединение',
                warning: 'Предупреждение',
                dismantleMergeCellWarning: 'Это приведет к разделению некоторых объединенных ячеек. Вы хотите продолжить?',
            },
        },
    },
};

export default locale;

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

const locale = {
    permission: {
        toolbarMenu: 'Защита',
        panel: {
            title: 'Защита строк и столбцов',
            name: 'Имя',
            protectedRange: 'Защищенный диапазон',
            permissionDirection: 'Описание разрешения',
            permissionDirectionPlaceholder: 'Введите описание разрешения',
            editPermission: 'Редактировать разрешения',
            onlyICanEdit: 'Только я могу редактировать',
            designedUserCanEdit: 'Назначенные пользователи могут редактировать',
            viewPermission: 'Просмотр разрешений',
            othersCanView: 'Другие могут просматривать',
            noOneElseCanView: 'Никто другой не может просматривать',
            designedPerson: 'Назначенные лица',
            addPerson: 'Добавить человека',
            canEdit: 'Может редактировать',
            canView: 'Может просматривать',
            delete: 'Удалить',
            currentSheet: 'Текущий лист',
            allSheet: 'Все листы',
            edit: 'Редактировать',
            Print: 'Печать',
            Comment: 'Комментировать',
            Copy: 'Копировать',
            SetCellStyle: 'Установить стиль ячейки',
            SetCellValue: 'Установить значение ячейки',
            SetHyperLink: 'Установить гиперссылку',
            Sort: 'Сортировать',
            Filter: 'Фильтровать',
            PivotTable: 'Сводная таблица',
            FloatImage: 'Плавающее изображение',
            RowHeightColWidth: 'Высота строки и ширина столбца',
            RowHeightColWidthReadonly: 'Только для чтения высота строки и ширина столбца',
            FilterReadonly: 'Только для чтения фильтр',
            nameError: 'Имя не может быть пустым',
            created: 'Создано',
            iCanEdit: 'Я могу редактировать',
            iCanNotEdit: 'Я не могу редактировать',
            iCanView: 'Я могу просматривать',
            iCanNotView: 'Я не могу просматривать',
            emptyRangeError: 'Диапазон не может быть пустым',
            rangeOverlapError: 'Диапазон не может пересекаться',
            rangeOverlapOverPermissionError: 'Диапазон не может пересекаться с диапазоном, имеющим те же разрешения',
            InsertHyperlink: 'Вставить гиперссылку',
            SetRowStyle: 'Установить стиль строки',
            SetColumnStyle: 'Установить стиль столбца',
            InsertColumn: 'Вставить столбец',
            InsertRow: 'Вставить строку',
            DeleteRow: 'Удалить строку',
            DeleteColumn: 'Удалить столбец',
            EditExtraObject: 'Редактировать дополнительный объект',
        },
        dialog: {
            allowUserToEdit: 'Разрешить пользователю редактировать',
            allowedPermissionType: 'Допустимые типы разрешений',
            setCellValue: 'Установить значение ячейки',
            setCellStyle: 'Установить стиль ячейки',
            copy: 'Копировать',
            alert: 'Предупреждение',
            alertContent: 'Этот диапазон защищен и в настоящее время недоступен для редактирования. Если вам нужно редактировать, пожалуйста, свяжитесь с создателем.',
            userEmpty: 'нет назначенных лиц, поделитесь ссылкой, чтобы пригласить конкретных людей.',
            listEmpty: 'Вы не установили ни одного защищенного диапазона или листа.',
            commonErr: 'Диапазон защищен, и у вас нет разрешения на выполнение этой операции. Для редактирования свяжитесь с создателем.',
            editErr: 'Диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
            pasteErr: 'Диапазон защищен, и у вас нет разрешения на вставку. Для вставки свяжитесь с создателем.',
            setStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей. Для установки стилей свяжитесь с создателем.',
            copyErr: 'Диапазон защищен, и у вас нет разрешения на копирование. Для копирования свяжитесь с создателем.',
            setRowColStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей строк и столбцов. Для установки стилей строк и столбцов свяжитесь с создателем.',
            moveRowColErr: 'Диапазон защищен, и у вас нет разрешения на перемещение строк и столбцов. Для перемещения строк и столбцов свяжитесь с создателем.',
            moveRangeErr: 'Диапазон защищен, и у вас нет разрешения на перемещение выделения. Для перемещения выделения свяжитесь с создателем.',
            autoFillErr: 'Диапазон защищен, и у вас нет разрешения на автозаполнение. Для использования автозаполнения свяжитесь с создателем.',
            filterErr: 'Диапазон защищен, и у вас нет разрешения на фильтрацию. Для фильтрации свяжитесь с создателем.',
            operatorSheetErr: 'Лист защищен, и у вас нет разрешения на операции с листом. Для операций с листом свяжитесь с создателем.',
            insertOrDeleteMoveRangeErr: 'Вставленный или удаленный диапазон пересекается с защищенным диапазоном, и эта операция в настоящее время не поддерживается.',
            printErr: 'Лист защищен, и у вас нет разрешения на печать. Для печати свяжитесь с создателем.',
            formulaErr: 'Диапазон или ссылочный диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
        },
        button: {
            confirm: 'Подтвердить',
            cancel: 'Отменить',
            addNewPermission: 'Добавить новое разрешение',
        },
    },
};

export default locale;

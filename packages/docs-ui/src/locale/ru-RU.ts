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
    toolbar: {
        undo: 'Отменить',
        redo: 'Повторить',
        font: 'Шрифт',
        fontSize: 'Размер шрифта',
        bold: 'Полужирный',
        italic: 'Курсив',
        strikethrough: 'Зачеркнутый',
        subscript: 'Нижний индекс',
        superscript: 'Верхний индекс',
        underline: 'Подчеркнутый',
        textColor: {
            main: 'Цвет текста',
            right: 'Выбрать цвет',
        },
        fillColor: {
            main: 'Цвет фона текста',
            right: 'Выбрать цвет',
        },
        table: {
            main: 'Table',
            insert: 'Insert Table',
            colCount: 'Column count',
            rowCount: 'Row count',
        },
        resetColor: 'Сбросить',
        order: 'Упорядоченный список',
        unorder: 'Неупорядоченный список',
        alignLeft: 'Выровнять по левому краю',
        alignCenter: 'Выровнять по центру',
        alignRight: 'Выровнять по правому краю',
        alignJustify: 'Выровнять по ширине',
        headerFooter: 'Header & Footer',
        checklist: 'Task list',
        documentFlavor: 'Modern Mode',
    },
    table: {
        insert: 'Insert',
        insertRowAbove: 'Insert row above',
        insertRowBelow: 'Insert row below',
        insertColumnLeft: 'Insert column left',
        insertColumnRight: 'Insert column right',
        delete: 'Table delete',
        deleteRows: 'Delete row',
        deleteColumns: 'Delete column',
        deleteTable: 'Delete table',
    },
    headerFooter: {
        header: 'Header',
        footer: 'Footer',
        panel: 'Header & Footer Settings',
        firstPageCheckBox: 'Different first page',
        oddEvenCheckBox: 'Different odd and even pages',
        headerTopMargin: 'Header top margin(px)',
        footerBottomMargin: 'Footer bottom margin(px)',
        closeHeaderFooter: 'Close header & footer',
        disableText: 'Header & footer settings are disabled',
    },
    doc: {
        menu: {
            paragraphSetting: 'Paragraph Setting',
        },
        slider: {
            paragraphSetting: 'Paragraph Setting',
        },
        paragraphSetting: {
            alignment: 'Alignment',
            indentation: 'Indentation',
            left: 'Left',
            right: 'Right',
            firstLine: 'First Line',
            hanging: 'Hanging',
            spacing: 'Spacing',
            before: 'Before',
            after: 'After',
            lineSpace: 'Line Space',
            multiSpace: 'Multi Space',
            fixedValue: 'Fixed Value(px)',
        },
    },
};

export default locale;

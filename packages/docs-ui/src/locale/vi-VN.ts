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
        undo: 'Hoàn tác',
        redo: 'Làm lại',
        font: 'Phông chữ',
        fontSize: 'Cỡ chữ',
        bold: 'In đậm',
        italic: 'In nghiêng',
        strikethrough: 'Gạch ngang',
        subscript: 'Chỉ số dưới',
        superscript: 'Chỉ số trên',
        underline: 'Gạch chân',
        textColor: {
            main: 'Màu chữ',
            right: 'Chọn màu',
        },
        fillColor: {
            main: 'Màu nền văn bản',
            right: 'Chọn màu nền',
        },
        table: {
            main: 'Table',
            insert: 'Insert Table',
            colCount: 'Column count',
            rowCount: 'Row count',
        },
        resetColor: 'Đặt lại màu',
        order: 'Danh sách có thứ tự',
        unorder: 'Danh sách không thứ tự',
        alignLeft: 'Căn trái',
        alignCenter: 'Căn giữa',
        alignRight: 'Căn phải',
        alignJustify: 'Căn đều hai bên',
        headerFooter: 'Đầu trang và chân trang',
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
        header: 'Đầu trang',
        footer: 'Chân trang',
        panel: 'Cài đặt đầu trang và chân trang',
        firstPageCheckBox: 'Trang đầu khác biệt',
        oddEvenCheckBox: 'Trang lẻ chẵn khác biệt',
        headerTopMargin: 'Khoảng cách đầu trang từ trên cùng (px)',
        footerBottomMargin: 'Khoảng cách chân trang từ dưới cùng (px)',
        closeHeaderFooter: 'Đóng đầu trang và chân trang',
        disableText: 'Cài đặt đầu trang và chân trang không khả dụng',
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

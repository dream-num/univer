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
    'docs-ui': {
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
            },
            fillColor: {
                main: 'Màu nền văn bản',
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
            checklist: 'Task list',
            documentFlavor: 'Modern Mode',
            alignLeft: 'Căn trái',
            alignCenter: 'Căn giữa',
            alignRight: 'Căn phải',
            alignJustify: 'Căn đều hai bên',
            horizontalLine: 'Horizontal line',
            headerFooter: 'Đầu trang và chân trang',
            pageSetup: 'Cài đặt trang',
        },
        table: {
            insert: 'Chèn',
            insertRowAbove: 'Chèn hàng phía trên',
            insertRowBelow: 'Chèn hàng phía dưới',
            insertColumnLeft: 'Chèn cột bên trái',
            insertColumnRight: 'Chèn cột bên phải',
            delete: 'Xóa bảng',
            deleteRows: 'Xóa hàng',
            deleteColumns: 'Xóa cột',
            deleteTable: 'Xóa bảng',
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
        placeholder: {
            heading1: 'Heading 1',
            heading2: 'Heading 2',
            heading3: 'Heading 3',
            heading4: 'Heading 4',
            heading5: 'Heading 5',
            normalText: 'Type text or press "/" for commands',
            listItem: 'Item',
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
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Fixed Value(px)',
            },
        },
        rightClick: {
            copy: 'Sao chép',
            cut: 'Cắt',
            paste: 'Dán',
            delete: 'Xóa',
            bulletList: 'Danh sách không thứ tự',
            orderList: 'Danh sách có thứ tự',
            checkList: 'Danh sách công việc',
            insertBellow: 'Chèn dưới',
        },
        paragraphMenu: {
            alignAndIndent: 'Align and indent',
            align: 'Align',
            indent: 'Indent',
            color: 'Colors',
            increase: 'Increase',
            decrease: 'Decrease',
            increaseIndent: 'Increase indent',
            decreaseIndent: 'Decrease indent',
            defaultTextColor: 'Default text color',
            noBackground: 'No background',
        },
        'page-settings': {
            'document-setting': 'Cài đặt tài liệu',
            mode: 'Chế độ',
            'modern-mode': 'Hiện đại',
            'classic-mode': 'Cổ điển',
            'modern-width': 'Độ rộng nội dung',
            'modern-width-narrow': 'Hẹp',
            'modern-width-medium': 'Vừa',
            'modern-width-wide': 'Rộng',
            'paper-size': 'Kích thước giấy',
            'page-size': {
                main: 'Kích thước giấy',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Giấy thư Mỹ',
                legal: 'Giấy pháp lý Mỹ',
                tabloid: 'Khổ báo',
                statement: 'Giấy tuyên bố',
                executive: 'Giấy hành chính',
                folio: 'Giấy folio',
            },
            orientation: 'Hướng',
            portrait: 'Dọc',
            landscape: 'Ngang',
            'custom-paper-size': 'Kích thước giấy tùy chỉnh',
            top: 'Trên',
            bottom: 'Dưới',
            left: 'Trái',
            right: 'Phải',
            cancel: 'Hủy',
            confirm: 'Xác nhận',
        },
    },
};

export default locale;

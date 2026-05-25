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
            sheetCopy: '（Bản sao {0}）',
            sheet: 'Bảng tính',
        },
        info: {
            overlappingSelections: 'Không thể sử dụng lệnh này trên các vùng chọn chồng chéo nhau',
            acrossMergedCell: 'Không thể vượt qua các ô đã hợp nhất',
            partOfCell: 'Chỉ chọn một phần của ô đã hợp nhất',
            hideSheet: 'Không có bảng tính nào hiển thị sau khi ẩn',
        },
        definedName: {
            nameEmpty: 'Tên không được để trống',
            nameDuplicate: 'Tên đã tồn tại',
            nameInvalid: 'Tên không hợp lệ',
            nameSheetConflict: 'Tên xung đột với tên trang tính',
            formulaOrRefStringEmpty: 'Công thức hoặc chuỗi tham chiếu không được để trống',
            nameConflict: 'Tên xung đột với tên hàm',
            defaultName: 'Tên xác định',
        },
        permission: {
            dialog: {
                autoFillErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền tự động điền. Nếu cần tự động điền, vui lòng liên hệ với người tạo.',
                editErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền chỉnh sửa. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
                formulaErr: 'Phạm vi hoặc phạm vi tham chiếu này đã được bảo vệ, hiện không có quyền chỉnh sửa. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
                insertOrDeleteMoveRangeErr: 'Chèn, xóa vùng chọn trùng với phạm vi bảo vệ, tạm thời không hỗ trợ thao tác này.',
                insertRowColErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền chèn hàng cột. Nếu cần chèn hàng cột, vui lòng liên hệ với người tạo.',
                moveRangeErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền di chuyển vùng chọn. Nếu cần di chuyển vùng chọn, vui lòng liên hệ với người tạo.',
                moveRowColErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền di chuyển hàng cột. Nếu cần di chuyển hàng cột, vui lòng liên hệ với người tạo.',
                operatorSheetErr: 'Trang bảng này đã được bảo vệ, hiện không có quyền thao tác trên trang bảng. Nếu cần thao tác trên trang bảng, vui lòng liên hệ với người tạo.',
                removeRowColErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền xóa hàng cột. Nếu cần xóa hàng cột, vui lòng liên hệ với người tạo.',
                setRowColStyleErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập kiểu hàng cột. Nếu cần thiết lập kiểu hàng cột, vui lòng liên hệ với người tạo.',
                setStyleErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập kiểu. Nếu cần thiết lập kiểu, vui lòng liên hệ với người tạo.',
            },
        },
        autoFill: {
            copy: 'Sao chép ô',
            series: 'Điền chuỗi',
            formatOnly: 'Chỉ định dạng',
            noFormat: 'Không định dạng',
        },
        merge: {
            confirm: {
                title: 'Tiếp tục hợp nhất chỉ giữ lại giá trị của ô trên cùng bên trái, loại bỏ các giá trị khác. Bạn có chắc chắn muốn tiếp tục không?',
                cancel: 'Hủy hợp nhất',
                confirm: 'Tiếp tục hợp nhất',
                warning: 'Cảnh báo',
                dismantleMergeCellWarning: 'Điều này sẽ khiến một số ô đã hợp nhất bị tách ra. Bạn có muốn tiếp tục không?',
            },
        },
    },
};

export default locale;

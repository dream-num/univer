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
        },
        autoFill: {
            copy: 'Sao chép ô',
            series: 'Điền chuỗi',
            formatOnly: 'Chỉ định dạng',
            noFormat: 'Không định dạng',
        },
    },
};

export default locale;

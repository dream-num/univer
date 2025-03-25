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

const locale: typeof zhCN = {
    toolbar: {
        heading: {
            normal: 'Văn bản',
            title: 'Tiêu đề',
            subTitle: 'Tiêu đề phụ',
            1: 'Tiêu đề 1',
            2: 'Tiêu đề 2',
            3: 'Tiêu đề 3',
            4: 'Tiêu đề 4',
            5: 'Tiêu đề 5',
            6: 'Tiêu đề 6',
            tooltip: 'Đặt tiêu đề',
        },
    },
    ribbon: {
        start: 'Bắt đầu',
        insert: 'Chèn',
        formulas: 'Công thức',
        data: 'Dữ liệu',
        view: 'Xem',
        others: 'Khác',
        more: 'Thêm',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'Bảng phím tắt',
    },
    shortcut: {
        undo: 'Hoàn tác',
        redo: 'Làm lại',
        cut: 'Cắt',
        copy: 'Sao chép',
        paste: 'Dán',
        'shortcut-panel': 'Mở/Đóng bảng phím tắt',
    },
    'common-edit': 'Chỉnh sửa thường dùng',
    'toggle-shortcut-panel': 'Mở/Đóng bảng phím tắt',
    clipboard: {
        authentication: {
            title: 'Không thể truy cập vào bảng nhớ tạm',
            content: 'Vui lòng cho phép Univer truy cập vào bảng nhớ tạm của bạn.',
        },
    },
    textEditor: {
        formulaError: 'Vui lòng nhập công thức hợp lệ, ví dụ =SUM(A1)',
        rangeError: 'Vui lòng nhập phạm vi hợp lệ, ví dụ A1:B10',
    },
    rangeSelector: {
        title: 'Chọn một phạm vi dữ liệu',
        addAnotherRange: 'Thêm phạm vi',
        buttonTooltip: 'Chọn phạm vi dữ liệu',
        placeHolder: 'Chọn phạm vi hoặc nhập',
        confirm: 'Xác nhận',
        cancel: 'Hủy',
    },
    'global-shortcut': 'Phím tắt toàn cầu',
    'zoom-slider': {
        resetTo: 'Khôi phục đến',
    },
};

export default locale;

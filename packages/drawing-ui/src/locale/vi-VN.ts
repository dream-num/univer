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
    'drawing-ui': {
        ole: {
            progressReading: 'Đang đọc tệp đính kèm…',
            progressUploading: 'Đang tải tệp đính kèm lên…',
            progressCreating: 'Đang tạo tệp trực tuyến…',
            progressSaving: 'Đang lưu liên kết…',
            externalAttachment: 'Tệp đính kèm được liên kết',
            externalHint: 'Tệp gốc mà tệp đính kèm này tham chiếu chưa được nhúng vào tài liệu. Không thể xem trước hoặc tải xuống.',
            missingHint: 'Tài liệu thiếu dữ liệu của tệp đính kèm này. Không thể xem trước hoặc tải xuống.',
            unavailableSummary: 'Tài liệu có {0} tệp đính kèm không khả dụng. Các vị trí của chúng được giữ lại. Di chuột lên biểu tượng cảnh báo để xem lý do.',
            rename: 'Đổi tên',
            saveName: 'Lưu tên',
            cancel: 'Hủy',
            invalidName: 'Nhập tên tệp hợp lệ có tối đa 255 ký tự.',
            renameFailed: 'Không thể đổi tên tệp đính kèm. Hãy thử lại.',
            actions: 'Thao tác với tệp đính kèm',
            linkSaveFailed: 'Đã tạo tệp trực tuyến nhưng không lưu được liên kết. Hãy thử lưu lại liên kết.',
            conversionFailed: 'Không thể chuyển đổi tệp đính kèm. Vui lòng thử lại.',
            converted: 'Chuyển đổi hoàn tất',
            open: 'Mở',
            converting: 'Đang chuyển đổi…',
            openSlide: 'Mở bản trình chiếu trực tuyến trong thẻ mới',
            openDoc: 'Mở tài liệu trực tuyến trong thẻ mới',
            openSheet: 'Mở bảng tính trực tuyến trong thẻ mới',
            convertSlide: 'Chuyển thành bản trình chiếu trực tuyến',
            convertDoc: 'Chuyển thành tài liệu trực tuyến',
            convertSheet: 'Chuyển thành bảng tính trực tuyến',
            nativePreviewHint: 'Nếu trình duyệt không thể hiển thị tệp, hãy tải bản gốc xuống.',
            attachment: 'Tệp đính kèm OLE',
            external: 'Tệp bên ngoài không khả dụng',
            missing: 'Dữ liệu tệp đính kèm không khả dụng',
            opaque: 'Tệp nhị phân OLE gốc (có thể tải xuống)',
            download: 'Tải xuống',
            preview: 'Xem trước',
            remove: 'Xóa',
            failed: 'Không thể đọc tệp đính kèm gốc. Vui lòng thử lại.',
            unsupported: 'Không có bản xem trước cho tệp này. Bạn có thể tải bản gốc xuống.',
        },
        mobile: { close: 'Đóng', more: 'Thêm' },
        'image-cropper': {
            error: 'Không thể cắt phần tử không phải hình ảnh',
        },
        objectListPanel: {
            title: 'Lớp',
            empty: 'Khong co doi tuong',
            showAll: 'Hien thi tat ca',
            hideAll: 'An tat ca',
            lockAll: 'Khóa tất cả',
            unlockAll: 'Mở khóa tất cả',
            moveForward: 'Dua len truoc',
            moveBackward: 'Dua ra sau',
            close: 'Dong',
            show: 'Hien thi',
            hide: 'An',
            lock: 'Khoa',
            unlock: 'Mo khoa',
            lockHint: 'Khóa để tránh chọn nhầm',
            unlockHint: 'Đã khóa. Nhấp để mở khóa',
            name: 'Ten',
            nameInput: 'Ten doi tuong',
            description: 'Mo ta',
            descriptionPlaceholder: 'Them mo ta',
            details: 'Chi tiet',
            locate: 'Định vị',
            expand: 'Mở rộng',
            collapse: 'Thu gọn',
            dragToReorder: 'Kéo để sắp xếp lại',
            search: 'Tìm đối tượng',
            filterAll: 'Tất cả',
            filterHidden: 'Đã ẩn',
            filterLocked: 'Đã khóa',
            sectionCanvas: 'Lớp canvas',
            sectionFloating: 'Lớp nổi',
            typeNames: {
                object: 'Đối tượng',
                shape: 'Hình dạng',
                connector: 'Đường nối',
                image: 'Hình ảnh',
                chart: 'Biểu đồ',
                table: 'Bảng',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Nhóm',
                unit: 'Đơn vị',
                dom: 'DOM',
                text: 'Văn bản',
                placeholder: 'Chỗ dành sẵn',
                container: 'Vùng chứa',
            },
            noSelection: 'Chọn một đối tượng để chỉnh sửa chi tiết',
        },
        'image-panel': {
            arrange: {
                title: 'Sắp xếp',
                forward: 'Di chuyển lên một lớp',
                backward: 'Di chuyển xuống một lớp',
                front: 'Đưa lên trên cùng',
                back: 'Đưa xuống dưới cùng',
            },
            transform: {
                title: 'Biến đổi',
                rotate: 'Xoay (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Chiều rộng (px)',
                height: 'Chiều cao (px)',
                lock: 'Khóa tỷ lệ (%)',
            },
            crop: {
                cancel: 'Hủy',
                apply: 'Xong',
                title: 'Cắt',
                start: 'Bắt đầu cắt',
                mode: 'Cắt tự do tỷ lệ',
            },
            group: {
                title: 'Nhóm',
                group: 'Nhóm',
                unGroup: 'Hủy nhóm',
            },
            align: {
                title: 'Căn chỉnh',
                default: 'Chọn cách căn chỉnh',
                left: 'Căn trái',
                center: 'Căn giữa theo chiều ngang',
                right: 'Căn phải',
                top: 'Căn trên',
                middle: 'Căn giữa theo chiều dọc',
                bottom: 'Căn dưới',
                horizon: 'Phân phối theo chiều ngang',
                vertical: 'Phân phối theo chiều dọc',
            },
            null: 'Không có đối tượng nào được chọn',
        },
        'image-text-wrap': {
            square: 'Vuông',
            topAndBottom: 'Trên và dưới',
            inline: 'Cùng dòng với văn bản',
            behindText: 'Phía sau văn bản',
            inFrontText: 'Phía trước văn bản',
        },
    },
};

export default locale;

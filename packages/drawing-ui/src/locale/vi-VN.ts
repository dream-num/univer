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
        'image-cropper': {
            error: 'Không thể cắt phần tử không phải hình ảnh',
        },
        objectListPanel: {
            title: 'Doi tuong',
            empty: 'Khong co doi tuong',
            showAll: 'Hien thi tat ca',
            hideAll: 'An tat ca',
            moveForward: 'Dua len truoc',
            moveBackward: 'Dua ra sau',
            close: 'Dong',
            show: 'Hien thi',
            hide: 'An',
            lock: 'Khoa',
            unlock: 'Mo khoa',
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
            title: 'Text Wrapping',
            wrappingStyle: 'Wrapping Style',
            square: 'Square',
            topAndBottom: 'Top and Bottom',
            inline: 'In line with text',
            behindText: 'Behind text',
            inFrontText: 'In front of text',
            wrapText: 'Wrap text',
            bothSide: 'Both sides',
            leftOnly: 'Left only',
            rightOnly: 'Right only',
            distanceFromText: 'Distance from text',
            top: 'Top(px)',
            left: 'Left(px)',
            bottom: 'Bottom(px)',
            right: 'Right(px)',
        },
        'image-popup': {
            replace: 'Thay thế',
            delete: 'Xóa',
            edit: 'Chỉnh sửa',
            crop: 'Cắt',
            reset: 'Đặt lại kích thước',
        },
    },
};

export default locale;
